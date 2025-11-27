-- 1. User 테이블에 profile_image_url 컬럼 추가
ALTER TABLE public."User"
  ADD COLUMN profile_image_url TEXT NULL;

-- 2. profile-images Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png']
) ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS 정책: 모든 사용자가 프로필 이미지 조회 가능
CREATE POLICY "Public read access for profile images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-images');

-- 4. Storage RLS 정책: 인증된 사용자는 자신의 폴더에만 업로드 가능
-- preset 폴더는 제외 (관리자만 업로드 가능)
CREATE POLICY "Profile images: users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND (storage.foldername(name))[1] != 'preset'
  );

-- 5. Storage RLS 정책: 인증된 사용자는 자신의 프로필 이미지만 수정 가능
CREATE POLICY "Profile images: users can update own files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 6. Storage RLS 정책: 인증된 사용자는 자신의 프로필 이미지만 삭제 가능
CREATE POLICY "Profile images: users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
