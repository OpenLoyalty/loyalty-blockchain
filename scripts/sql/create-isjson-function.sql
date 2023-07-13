CREATE FUNCTION is_json(varchar) RETURNS boolean AS $$
  DECLARE
    x json;
  BEGIN
    BEGIN
      x := $1;
    EXCEPTION WHEN others THEN
      RETURN FALSE;
    END;

    RETURN TRUE;
  END;
$$ LANGUAGE plpgsql IMMUTABLE;
