import { createClient } from '@/lib/supabase/client'

export async function signUp(email: string, password: string, nickname: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname, // 메타데이터에 저장 -> 트리거에서 User 테이블에 자동 생성
      },
    },
  })

  if (error) throw error
  return data
}
