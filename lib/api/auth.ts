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

export async function signIn(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) throw error
}
