import { PlaceResult } from "@/components/features/running/PlaceSearch";
import { GpxData } from "@/lib/utils/gpx-parser";
import { createClient } from "@/lib/supabase/client";

export interface ContentType {
  id: number;
  name: string;
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

  const { data, error } = await supabase
    .from("Content")
    .insert({
      user_id: userId,
      title,
      type_id: typeId,
      main_location: mainLocation.placeName,
      start_location: startLocation?.placeName || null,
      end_location: endLocation?.placeName || null,
      gpx_data: gpxData,
      start_time: gpxData.startTime?.toISOString() || new Date().toISOString(),
      end_time: gpxData.endTime?.toISOString() || new Date().toISOString(),
      total_distance: gpxData.totalDistance,
      image_urls: imageUrls,
      comment: comment || null,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}
