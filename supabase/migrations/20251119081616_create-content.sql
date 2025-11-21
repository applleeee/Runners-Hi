-- 계층형 콘텐츠 타입 테이블 (러닝 > 공원런, 자전거 > 산악바이킹 등)
CREATE TABLE public."ContentType" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id UUID NULL REFERENCES public."ContentType"(id) ON DELETE CASCADE,
  depth INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL
) TABLESPACE pg_default;

CREATE INDEX idx_content_type_parent_id ON public."ContentType"(parent_id);

-- 콘텐츠 테이블
CREATE TABLE public."Content" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type_id UUID NOT NULL REFERENCES public."ContentType"(id) ON DELETE RESTRICT,
  main_location TEXT NOT NULL,
  gpx_data JSONB NOT NULL,
  start_location TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_location TEXT NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  total_distance DECIMAL(10, 2) NOT NULL,
  image_url TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL
) TABLESPACE pg_default;

CREATE INDEX idx_content_type_id ON public."Content"(type_id);