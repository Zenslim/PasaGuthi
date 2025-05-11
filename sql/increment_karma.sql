
create or replace function increment_karma(user_key text)
returns void as $$
begin
  update users set karma = coalesce(karma, 0) + 1 where "guthiKey" = user_key;
end;
$$ language plpgsql;
