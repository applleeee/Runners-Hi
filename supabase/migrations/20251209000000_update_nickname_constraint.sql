-- 닉네임 제약 조건 변경: 스페이스 및 특수문자 허용
-- 기존: 한글, 영문, 숫자, _, - 만 허용
-- 변경: 모든 문자 허용 (앞뒤 공백은 클라이언트에서 trim 처리)

-- 기존 nickname_format 제약 조건 삭제
ALTER TABLE public."User" DROP CONSTRAINT nickname_format;

-- 새 제약 조건: 최소 1글자 이상 (공백만으로 이루어진 닉네임 방지를 위해 trim 후 체크)
-- 실제 공백/특수문자 허용, 단 완전히 비어있는 값만 차단
ALTER TABLE public."User"
  ADD CONSTRAINT nickname_format CHECK (char_length(trim(nickname)) >= 1);
