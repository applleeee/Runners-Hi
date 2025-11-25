-- 계층형 콘텐츠 타입 테이블 (러닝 > 공원런, 자전거 > 산악바이킹 등)
CREATE TABLE public."ContentType" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id INTEGER NULL REFERENCES public."ContentType"(id) ON DELETE CASCADE,
  depth INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL
) TABLESPACE pg_default;

CREATE INDEX idx_content_type_parent_id ON public."ContentType"(parent_id);

-- 장소 테이블 (카카오맵 장소 정보 저장)
CREATE TABLE public."Location" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,                    -- 장소명 (place_name), 유니크 제약
  address TEXT NULL,                            -- 도로명 주소 (road_address_name) 또는 지번 주소 (address_name)
  lat DECIMAL(10, 7) NULL,                      -- 위도 (y)
  lng DECIMAL(10, 7) NULL,                      -- 경도 (x)
  kakao_place_id TEXT NULL UNIQUE,              -- 카카오 장소 ID, 유니크 제약
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL
) TABLESPACE pg_default;

CREATE INDEX idx_location_name ON public."Location"(name);

-- Location RLS 활성화
ALTER TABLE public."Location" ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 장소를 볼 수 있음
CREATE POLICY "Locations are viewable by everyone"
  ON public."Location" FOR SELECT
  USING (true);

-- RLS 정책: 인증된 사용자는 장소를 추가할 수 있음
CREATE POLICY "Authenticated users can insert locations"
  ON public."Location" FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 콘텐츠 테이블
CREATE TABLE public."Content" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public."User"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type_id INTEGER NOT NULL REFERENCES public."ContentType"(id) ON DELETE RESTRICT,
  gpx_data JSONB NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  total_distance DECIMAL(10, 2) NOT NULL,
  pace DECIMAL(5, 2) NOT NULL,                    -- 페이스 (min/km), 예: 6.30 = 6분 30초/km
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  comment TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL
) TABLESPACE pg_default;

CREATE INDEX idx_content_user_id ON public."Content"(user_id);

-- RLS 활성화
ALTER TABLE public."Content" ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 콘텐츠를 볼 수 있음
CREATE POLICY "Contents are viewable by everyone"
  ON public."Content" FOR SELECT
  USING (true);

-- RLS 정책: 사용자는 자신의 콘텐츠만 생성 가능
CREATE POLICY "Users can insert own content"
  ON public."Content" FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 콘텐츠만 수정 가능
CREATE POLICY "Users can update own content"
  ON public."Content" FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 콘텐츠만 삭제 가능
CREATE POLICY "Users can delete own content"
  ON public."Content" FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER on_content_updated
  BEFORE UPDATE ON public."Content"
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Content-Location 중간 테이블 (콘텐츠와 장소 연결)
CREATE TABLE public."ContentLocation" (
  id SERIAL PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public."Content"(id) ON DELETE CASCADE,
  location_id INTEGER NOT NULL REFERENCES public."Location"(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('main', 'start', 'end')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(content_id, type)  -- 콘텐츠당 타입별 1개만 허용
) TABLESPACE pg_default;

CREATE INDEX idx_content_location_content_id ON public."ContentLocation"(content_id);
CREATE INDEX idx_content_location_location_id ON public."ContentLocation"(location_id);
CREATE INDEX idx_content_location_type ON public."ContentLocation"(type);

-- ContentLocation RLS 활성화
ALTER TABLE public."ContentLocation" ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 ContentLocation을 볼 수 있음
CREATE POLICY "ContentLocations are viewable by everyone"
  ON public."ContentLocation" FOR SELECT
  USING (true);

-- RLS 정책: Content 소유자만 ContentLocation 생성 가능
CREATE POLICY "Users can insert own content locations"
  ON public."ContentLocation" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."Content" c
      WHERE c.id = content_id AND c.user_id = auth.uid()
    )
  );

-- RLS 정책: Content 소유자만 ContentLocation 삭제 가능
CREATE POLICY "Users can delete own content locations"
  ON public."ContentLocation" FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public."Content" c
      WHERE c.id = content_id AND c.user_id = auth.uid()
    )
  );

-- 초기 콘텐츠 타입 데이터 삽입
-- 1단계: 부모 타입 (러닝)
INSERT INTO public."ContentType" (name, parent_id, depth) VALUES
  ('러닝', NULL, 0);

-- 2단계: 하위 타입 (러닝의 세부 유형)
INSERT INTO public."ContentType" (name, parent_id, depth) VALUES
  ('공원런', 1, 1),
  ('트랙런', 1, 1),
  ('시티런', 1, 1),
  ('트레일런', 1, 1);