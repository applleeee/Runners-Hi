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

-- 콘텐츠 테이블
CREATE TABLE public."Content" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES public."User"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type_id INTEGER NOT NULL REFERENCES public."ContentType"(id) ON DELETE RESTRICT,
  main_location TEXT NOT NULL,
  start_location TEXT NULL,
  end_location TEXT NULL,
  gpx_data JSONB NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  total_distance DECIMAL(10, 2) NOT NULL,
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