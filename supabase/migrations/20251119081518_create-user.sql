-- 1. User 테이블 (사용자 프로필)
-- Supabase Auth의 users 테이블과 연결
CREATE TABLE public."User" (
  id UUID NOT NULL DEFAULT auth.uid(),
  nickname TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL,
  CONSTRAINT User_pkey PRIMARY KEY (id),
  CONSTRAINT User_nickname_key UNIQUE (nickname),
  CONSTRAINT User_id_key UNIQUE (id),
  CONSTRAINT User_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON UPDATE CASCADE ON DELETE CASCADE
) TABLESPACE pg_default;

-- 2. 닉네임 제약 조건 추가
-- 닉네임 길이: 2~20자
-- 허용 문자: 한글, 영문, 숫자, 언더스코어(_), 하이픈(-)
ALTER TABLE public."User"
  ADD CONSTRAINT nickname_length CHECK (char_length(nickname) >= 2 AND char_length(nickname) <= 20),
  ADD CONSTRAINT nickname_format CHECK (nickname ~ '^[가-힣a-zA-Z0-9_-]+$');

-- 3. Row Level Security (RLS) 활성화
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 설정
-- 모든 사용자는 다른 사용자의 프로필을 읽을 수 있음
CREATE POLICY "Public users are viewable by everyone"
  ON public."User" FOR SELECT
  USING (true);

-- 사용자는 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile"
  ON public."User" FOR UPDATE
  USING (auth.uid() = id);

-- 사용자는 자신의 프로필만 삽입 가능
CREATE POLICY "Users can insert own profile"
  ON public."User" FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 5. 트리거: 새 사용자가 회원가입하면 자동으로 프로필 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."User" (id, nickname)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', 'user_' || substring(NEW.id::text, 1, 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 등록
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_updated
  BEFORE UPDATE ON public."User"
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. 인덱스 생성 (성능 최적화)
CREATE INDEX idx_user_nickname ON public."User"(nickname);
