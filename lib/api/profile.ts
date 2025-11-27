import { createClient } from '@/lib/supabase/client'
import { Tables } from '@/model/supabase'

export type UserProfile = Tables<'User'>

/**
 * 특정 사용자의 프로필 정보를 조회합니다.
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('User')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

/**
 * 현재 로그인한 사용자의 프로필 정보를 조회합니다.
 */
export async function getCurrentUserProfile(): Promise<UserProfile> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError
  if (!user) throw new Error('로그인이 필요합니다.')

  return getUserProfile(user.id)
}

/**
 * 닉네임 중복 여부를 체크합니다.
 */
export async function checkNicknameExists(nickname: string): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('User')
    .select('id')
    .eq('nickname', nickname)
    .maybeSingle()

  if (error) throw error
  return data !== null
}

/**
 * 닉네임을 변경합니다.
 */
export async function updateNickname(nickname: string): Promise<void> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError
  if (!user) throw new Error('로그인이 필요합니다.')

  // 닉네임 중복 체크
  const exists = await checkNicknameExists(nickname)
  if (exists) {
    throw new Error('이미 존재하는 닉네임입니다.')
  }

  const { error } = await supabase
    .from('User')
    .update({ nickname })
    .eq('id', user.id)

  if (error) throw error
}

/**
 * 프로필 이미지 URL을 업데이트합니다.
 */
export async function updateProfileImage(imageUrl: string): Promise<void> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError
  if (!user) throw new Error('로그인이 필요합니다.')

  const { error } = await supabase
    .from('User')
    .update({ profile_image_url: imageUrl })
    .eq('id', user.id)

  if (error) throw error
}

/**
 * 프로필 이미지 파일을 Storage에 업로드하고 URL을 반환합니다.
 */
export async function uploadProfileImage(file: File): Promise<string> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError
  if (!user) throw new Error('로그인이 필요합니다.')

  // 파일 확장자 추출
  const fileExt = file.name.split('.').pop()
  // 고유한 파일명 생성 (profile-타임스탬프)
  const fileName = `profile-${Date.now()}.${fileExt}`
  // 사용자별 폴더 구조: custom/userId/fileName
  const filePath = `custom/${user.id}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('profile-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) throw uploadError

  // Public URL 생성
  const {
    data: { publicUrl },
  } = supabase.storage.from('profile-images').getPublicUrl(filePath)

  return publicUrl
}
