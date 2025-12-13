import { PlaceResult } from "@/components/features/running/PlaceSearch";
import { createClient } from "@/lib/supabase/client";
import { GpxData } from "@/lib/utils/gpx-parser";

export interface ContentType {
  id: number;
  name: string;
}

export interface Location {
  id: number;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  kakaoPlaceId: string | null;
}

// ============================================
// Supabase 관계 쿼리 결과 타입 정의
// Supabase TypeScript는 FK 관계를 항상 배열로 추론하지만,
// 실제 many-to-one 관계에서는 단일 객체가 반환됩니다.
// 따라서 as unknown as 패턴으로 올바른 타입을 단언합니다.
// ============================================

/** Location 테이블 원시 데이터 */
interface LocationRow {
  id: number;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  kakao_place_id: string | null;
}

/** ContentLocation + Location 조인 결과 */
interface ContentLocationWithLocation {
  type: string;
  Location: LocationRow | null;
}

/** ContentType 조인 결과 */
interface ContentTypeRow {
  name: string;
}

/** User 조인 결과 */
interface UserRow {
  id: string;
  nickname: string;
}

export interface FeedContent {
  id: string;
  title: string;
  totalDistance: number;
  pace: number;
  imageUrl?: string;
  typeName: string;
  locationName: string;
}

export interface ContentDetail {
  id: string;
  title: string;
  comment: string | null;
  gpxData: GpxData;
  imageUrls: string[];
  totalDistance: number;
  pace: number;
  startTime: Date | null;
  endTime: Date | null;
  typeId: number;
  typeName: string;
  mainLocation: Location;
  startLocation: Location | null;
  endLocation: Location | null;
  user: {
    id: string;
    nickname: string;
  };
  createdAt: Date;
}

export interface CreateContentParams {
  userId: string;
  title: string;
  typeId: number;
  mainLocation: PlaceResult;
  startLocation: PlaceResult | null;
  endLocation: PlaceResult | null;
  gpxData: GpxData;
  imageUrls: string[];
  comment: string;
}

/**
 * 특정 부모 타입의 하위 콘텐츠 타입 목록을 가져옵니다.
 * @param parentId 부모 타입 ID (1: 러닝)
 */
export async function getContentTypesByParentId(
  parentId: number
): Promise<ContentType[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("ContentType")
    .select("id, name")
    .eq("parent_id", parentId)
    .order("id");

  if (error) throw error;
  return data || [];
}

/**
 * Location 테이블에 장소를 upsert하고 ID를 반환합니다.
 * kakao_place_id가 있으면 해당 값으로, 없으면 name으로 중복 체크합니다.
 */
async function upsertLocation(place: PlaceResult): Promise<number> {
  const supabase = createClient();

  // 1. 먼저 kakao_place_id로 기존 데이터 조회
  if (place.kakaoPlaceId) {
    const { data: existing } = await supabase
      .from("Location")
      .select("id")
      .eq("kakao_place_id", place.kakaoPlaceId)
      .single();

    if (existing) return existing.id;
  }

  // 2. kakao_place_id가 없거나 못 찾은 경우, name으로 조회
  const { data: existingByName } = await supabase
    .from("Location")
    .select("id")
    .eq("name", place.placeName)
    .single();

  if (existingByName) return existingByName.id;

  // 3. 새로운 Location 생성
  const { data, error } = await supabase
    .from("Location")
    .insert({
      name: place.placeName,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      kakao_place_id: place.kakaoPlaceId,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * ContentLocation 중간 테이블에 장소를 연결합니다.
 */
async function createContentLocation(
  contentId: string,
  locationId: number,
  type: "main" | "start" | "end"
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("ContentLocation").insert({
    content_id: contentId,
    location_id: locationId,
    type,
  });

  if (error) throw error;
}

/**
 * 새로운 콘텐츠를 생성합니다.
 */
export async function createContent(
  params: CreateContentParams
): Promise<string> {
  const supabase = createClient();

  const {
    userId,
    title,
    typeId,
    mainLocation,
    startLocation,
    endLocation,
    gpxData,
    imageUrls,
    comment,
  } = params;

  // 1. Location upsert 후 ID 획득
  const mainLocationId = await upsertLocation(mainLocation);
  const startLocationId = startLocation
    ? await upsertLocation(startLocation)
    : null;
  const endLocationId = endLocation ? await upsertLocation(endLocation) : null;

  // 2. Content 생성
  const { data, error } = await supabase
    .from("Content")
    .insert({
      user_id: userId,
      title,
      type_id: typeId,
      gpx_data: gpxData,
      start_time: gpxData.startTime?.toISOString() || new Date().toISOString(),
      end_time: gpxData.endTime?.toISOString() || new Date().toISOString(),
      total_distance: gpxData.totalDistance,
      pace: gpxData.pace,
      image_urls: imageUrls,
      comment: comment || null,
    })
    .select("id")
    .single();

  if (error) throw error;

  const contentId = data.id;

  // 3. ContentLocation 중간 테이블에 연결
  await createContentLocation(contentId, mainLocationId, "main");

  if (startLocationId) {
    await createContentLocation(contentId, startLocationId, "start");
  }

  if (endLocationId) {
    await createContentLocation(contentId, endLocationId, "end");
  }

  return contentId;
}

/**
 * main 타입으로 등록된 Location 목록을 가나다순으로 가져옵니다.
 * (드롭다운 필터용)
 */
export async function getMainLocations(): Promise<Location[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("ContentLocation")
    .select(
      `
      Location (
        id,
        name,
        address,
        lat,
        lng,
        kakao_place_id
      )
    `
    )
    .eq("type", "main");

  if (error) throw error;

  // 중복 제거 및 Location 형태로 변환
  const locationMap = new Map<number, Location>();

  for (const item of data || []) {
    // many-to-one 관계이므로 단일 객체로 타입 단언
    const loc = item.Location as unknown as LocationRow | null;

    if (loc && !locationMap.has(loc.id)) {
      locationMap.set(loc.id, {
        id: loc.id,
        name: loc.name,
        address: loc.address,
        lat: loc.lat,
        lng: loc.lng,
        kakaoPlaceId: loc.kakao_place_id,
      });
    }
  }

  // 가나다순 정렬
  return Array.from(locationMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "ko")
  );
}

export interface GetContentsParams {
  locationId?: number | null;
  typeIds?: number[];
  distanceMin?: number | null;
  distanceMax?: number | null;
  limit: number;
  offset: number;
}

/**
 * 콘텐츠 목록을 필터링하여 가져옵니다.
 * (무한 스크롤용)
 */
export async function getContents(
  params: GetContentsParams
): Promise<FeedContent[]> {
  const supabase = createClient();

  const { locationId, typeIds, distanceMin, distanceMax, limit, offset } =
    params;

  // 기본 쿼리: Content + ContentType 조인
  let query = supabase
    .from("Content")
    .select(
      `
      id,
      title,
      total_distance,
      pace,
      image_urls,
      ContentType (
        name
      ),
      ContentLocation!inner (
        type,
        Location (
          name
        )
      )
    `
    )
    .eq("ContentLocation.type", "main");

  // locationId 필터
  if (locationId) {
    query = query.eq("ContentLocation.location_id", locationId);
  }

  // typeIds 필터
  if (typeIds && typeIds.length > 0) {
    query = query.in("type_id", typeIds);
  }

  // 거리 필터
  if (distanceMin !== null && distanceMin !== undefined) {
    query = query.gte("total_distance", distanceMin);
  }
  if (distanceMax !== null && distanceMax !== undefined) {
    query = query.lte("total_distance", distanceMax);
  }

  // 페이지네이션 및 정렬
  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) throw error;

  // FeedContent 형태로 변환
  return (data || []).map((item) => {
    // many-to-one 관계이므로 단일 객체로 타입 단언
    const contentType = item.ContentType as unknown as ContentTypeRow | null;
    const contentLocations =
      item.ContentLocation as unknown as ContentLocationWithLocation[];

    // main 타입의 location 찾기
    const mainLocation = contentLocations?.find((cl) => cl.type === "main");

    return {
      id: item.id,
      title: item.title,
      totalDistance: item.total_distance ?? 0,
      pace: item.pace ?? 0,
      imageUrl: item.image_urls?.[0] ?? undefined,
      typeName: contentType?.name ?? "",
      locationName: mainLocation?.Location?.name ?? "",
    };
  });
}

export interface UserStats {
  totalDistance: number; // 총 거리 (km)
  totalDuration: number; // 총 시간 (분)
  totalCount: number; // 총 러닝 횟수
}

/**
 * 특정 사용자의 누적 통계를 가져옵니다.
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("Content")
    .select("total_distance, start_time, end_time")
    .eq("user_id", userId);

  if (error) throw error;

  // 클라이언트에서 집계
  const totalDistance = data.reduce(
    (sum, item) => sum + (item.total_distance ?? 0),
    0
  );

  const totalDuration = data.reduce((sum, item) => {
    if (item.start_time && item.end_time) {
      const start = new Date(item.start_time).getTime();
      const end = new Date(item.end_time).getTime();
      const durationMinutes = (end - start) / (1000 * 60);
      return sum + durationMinutes;
    }
    return sum;
  }, 0);

  const totalCount = data.length;

  return {
    totalDistance: Math.round(totalDistance * 100) / 100, // 소수점 2자리
    totalDuration: Math.round(totalDuration), // 정수 (분)
    totalCount,
  };
}

export interface GetUserContentsParams {
  userId: string;
  locationId?: number | null;
  typeIds?: number[];
  distanceMin?: number | null;
  distanceMax?: number | null;
  limit: number;
  offset: number;
}

/**
 * 특정 사용자의 콘텐츠 목록을 필터링하여 가져옵니다.
 */
export async function getUserContents(
  params: GetUserContentsParams
): Promise<FeedContent[]> {
  const supabase = createClient();

  const {
    userId,
    locationId,
    typeIds,
    distanceMin,
    distanceMax,
    limit,
    offset,
  } = params;

  // 기본 쿼리: Content + ContentType 조인
  let query = supabase
    .from("Content")
    .select(
      `
      id,
      title,
      total_distance,
      pace,
      image_urls,
      ContentType (
        name
      ),
      ContentLocation!inner (
        type,
        Location (
          name
        )
      )
    `
    )
    .eq("user_id", userId)
    .eq("ContentLocation.type", "main");

  // locationId 필터
  if (locationId) {
    query = query.eq("ContentLocation.location_id", locationId);
  }

  // typeIds 필터
  if (typeIds && typeIds.length > 0) {
    query = query.in("type_id", typeIds);
  }

  // 거리 필터
  if (distanceMin !== null && distanceMin !== undefined) {
    query = query.gte("total_distance", distanceMin);
  }
  if (distanceMax !== null && distanceMax !== undefined) {
    query = query.lte("total_distance", distanceMax);
  }

  // 페이지네이션 및 정렬
  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) throw error;

  // FeedContent 형태로 변환
  return (data || []).map((item) => {
    // many-to-one 관계이므로 단일 객체로 타입 단언
    const contentType = item.ContentType as unknown as ContentTypeRow | null;
    const contentLocations =
      item.ContentLocation as unknown as ContentLocationWithLocation[];

    // main 타입의 location 찾기
    const mainLocation = contentLocations?.find((cl) => cl.type === "main");

    return {
      id: item.id,
      title: item.title,
      totalDistance: item.total_distance ?? 0,
      pace: item.pace ?? 0,
      imageUrl: item.image_urls?.[0] ?? undefined,
      typeName: contentType?.name ?? "",
      locationName: mainLocation?.Location?.name ?? "",
    };
  });
}

/**
 * ID로 특정 콘텐츠의 상세 정보를 가져옵니다.
 */
export async function getContentById(id: string): Promise<ContentDetail> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("Content")
    .select(
      `
      id,
      title,
      comment,
      gpx_data,
      image_urls,
      total_distance,
      pace,
      start_time,
      end_time,
      type_id,
      created_at,
      ContentType!inner (
        name
      ),
      User!inner (
        id,
        nickname
      ),
      ContentLocation!inner (
        type,
        Location!inner (
          id,
          name,
          address,
          lat,
          lng,
          kakao_place_id
        )
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  if (!data) throw new Error("Content not found");

  // many-to-one 관계이므로 단일 객체로 타입 단언
  const contentLocations = data.ContentLocation as unknown as Array<{
    type: string;
    Location: LocationRow;
  }>;

  const mainLocationData = contentLocations?.find(
    (cl) => cl.type === "main"
  )?.Location;
  const startLocationData = contentLocations?.find(
    (cl) => cl.type === "start"
  )?.Location;
  const endLocationData = contentLocations?.find(
    (cl) => cl.type === "end"
  )?.Location;

  if (!mainLocationData) {
    throw new Error("Main location not found");
  }

  const contentType = data.ContentType as unknown as ContentTypeRow;
  const user = data.User as unknown as UserRow;

  // gpxData 내부 날짜 필드 파싱
  const rawGpxData = data.gpx_data as {
    startTime?: string | null;
    endTime?: string | null;
    points?: Array<{ lat: number; lng: number; time?: string; elevation?: number }>;
    totalDistance: number;
    duration: number;
    pace: number;
  };

  const parsedGpxData: GpxData = {
    ...rawGpxData,
    startTime: rawGpxData.startTime ? new Date(rawGpxData.startTime) : null,
    endTime: rawGpxData.endTime ? new Date(rawGpxData.endTime) : null,
    points: (rawGpxData.points || []).map((p) => ({
      ...p,
      time: p.time ? new Date(p.time) : undefined,
    })),
  };

  return {
    id: data.id,
    title: data.title,
    comment: data.comment,
    gpxData: parsedGpxData,
    imageUrls: data.image_urls || [],
    totalDistance: data.total_distance,
    pace: data.pace,
    startTime: data.start_time ? new Date(data.start_time) : null,
    endTime: data.end_time ? new Date(data.end_time) : null,
    typeId: data.type_id,
    typeName: contentType.name,
    mainLocation: {
      id: mainLocationData.id,
      name: mainLocationData.name,
      address: mainLocationData.address,
      lat: mainLocationData.lat,
      lng: mainLocationData.lng,
      kakaoPlaceId: mainLocationData.kakao_place_id,
    },
    startLocation: startLocationData
      ? {
          id: startLocationData.id,
          name: startLocationData.name,
          address: startLocationData.address,
          lat: startLocationData.lat,
          lng: startLocationData.lng,
          kakaoPlaceId: startLocationData.kakao_place_id,
        }
      : null,
    endLocation: endLocationData
      ? {
          id: endLocationData.id,
          name: endLocationData.name,
          address: endLocationData.address,
          lat: endLocationData.lat,
          lng: endLocationData.lng,
          kakaoPlaceId: endLocationData.kakao_place_id,
        }
      : null,
    user: {
      id: user.id,
      nickname: user.nickname,
    },
    createdAt: new Date(data.created_at),
  };
}

/**
 * 콘텐츠를 삭제합니다.
 * ContentLocation을 먼저 삭제한 후 Content를 삭제합니다.
 */
export async function deleteContent(contentId: string): Promise<void> {
  const supabase = createClient();

  // 1. ContentLocation 먼저 삭제 (FK 제약)
  const { error: locationError } = await supabase
    .from("ContentLocation")
    .delete()
    .eq("content_id", contentId);

  if (locationError) throw locationError;

  // 2. Content 삭제
  const { error: contentError } = await supabase
    .from("Content")
    .delete()
    .eq("id", contentId);

  if (contentError) throw contentError;
}

export interface UpdateContentParams {
  contentId: string;
  title: string;
  typeId: number;
  mainLocation: PlaceResult;
  startLocation: PlaceResult | null;
  endLocation: PlaceResult | null;
  imageUrls: string[];
  comment: string;
}

/**
 * 콘텐츠를 수정합니다.
 * ContentLocation을 삭제 후 재생성하고, Content를 업데이트합니다.
 */
export async function updateContent(
  params: UpdateContentParams
): Promise<void> {
  const supabase = createClient();

  const {
    contentId,
    title,
    typeId,
    mainLocation,
    startLocation,
    endLocation,
    imageUrls,
    comment,
  } = params;

  // 1. Location upsert 후 ID 획득
  const mainLocationId = await upsertLocation(mainLocation);
  const startLocationId = startLocation
    ? await upsertLocation(startLocation)
    : null;
  const endLocationId = endLocation ? await upsertLocation(endLocation) : null;

  // 2. 기존 ContentLocation 삭제
  const { error: deleteLocationError } = await supabase
    .from("ContentLocation")
    .delete()
    .eq("content_id", contentId);

  if (deleteLocationError) throw deleteLocationError;

  // 3. Content 업데이트
  const { error: updateError } = await supabase
    .from("Content")
    .update({
      title,
      type_id: typeId,
      image_urls: imageUrls,
      comment: comment || null,
    })
    .eq("id", contentId);

  if (updateError) throw updateError;

  // 4. ContentLocation 재생성
  await createContentLocation(contentId, mainLocationId, "main");

  if (startLocationId) {
    await createContentLocation(contentId, startLocationId, "start");
  }

  if (endLocationId) {
    await createContentLocation(contentId, endLocationId, "end");
  }
}
