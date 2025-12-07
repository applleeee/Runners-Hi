import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function useVerifyRecoveryToken() {
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasVerified = useRef(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyToken = async () => {
      const supabase = createClient();
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (token_hash && type === "recovery") {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash,
          type: "recovery",
        });

        if (verifyError) {
          setError("링크가 만료되었거나 유효하지 않습니다.");
        } else {
          setIsVerified(true);
        }
      } else {
        setError("유효하지 않은 접근입니다.");
      }

      setIsVerifying(false);
    };

    verifyToken();
  }, [searchParams]);

  return { isVerified, isVerifying, error };
}
