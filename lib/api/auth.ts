import { createClient } from "@/lib/supabase/client";

export async function signUp(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // nickname 없이 가입하면 트리거가 자동으로 'user_' + UUID 형식으로 생성
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}

/**
 * 현재 로그인한 사용자 정보를 가져옵니다.
 */
export async function getCurrentUser() {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return user;
}

/**
 * 비밀번호 재설정 이메일을 발송합니다.
 */
export async function sendPasswordResetEmail(email: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
}
