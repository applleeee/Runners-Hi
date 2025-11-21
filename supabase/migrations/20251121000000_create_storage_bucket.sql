-- content-images 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content-images',
  'content-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png']
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS 정책: 모든 사용자가 이미지 조회 가능
CREATE POLICY "Public read access for content images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'content-images');

-- Storage RLS 정책: 인증된 사용자는 자신의 폴더에만 업로드 가능
CREATE POLICY "Authenticated users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'content-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage RLS 정책: 인증된 사용자는 자신의 파일만 수정 가능
CREATE POLICY "Users can update own files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'content-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage RLS 정책: 인증된 사용자는 자신의 파일만 삭제 가능
CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'content-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
