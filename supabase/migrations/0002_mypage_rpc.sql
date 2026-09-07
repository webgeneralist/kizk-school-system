-- ============================================================================
-- 保護者マイページ用: トークン一致時のみ該当生徒1件を返すRPC関数
-- ============================================================================
-- students テーブルへの匿名(anon)アクセスをRLSで丸ごと許可すると全生徒の
-- 個人情報が公開されてしまうため、SECURITY DEFINER 関数でトークン一致行だけ
-- 返す形にする。RLSはこれまで通り authenticated のみを許可したままでよい。

create or replace function get_student_by_mypage_token(p_token text)
returns table (
  id integer,
  department text,
  name text,
  name_kana text,
  school_grade text,
  school_class text,
  homeroom_teacher text
)
language sql
security definer
set search_path = public
as $$
  select id, department, name, name_kana, school_grade, school_class, homeroom_teacher
  from students
  where mypage_token = p_token
$$;

grant execute on function get_student_by_mypage_token(text) to anon, authenticated;
