-- 기존 RLS 정책 삭제
DROP POLICY IF EXISTS "Profile images: users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Profile images: users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Profile images: users can delete own files" ON storage.objects;

-- 수정된 RLS 정책: 인증된 사용자는 custom/userId 폴더에 업로드 가능
-- 폴더 구조: custom/userId/fileName
CREATE POLICY "Profile images: users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = 'custom'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

-- 수정된 RLS 정책: 인증된 사용자는 자신의 프로필 이미지만 수정 가능
CREATE POLICY "Profile images: users can update own files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = 'custom'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

-- 수정된 RLS 정책: 인증된 사용자는 자신의 프로필 이미지만 삭제 가능
CREATE POLICY "Profile images: users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = 'custom'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

