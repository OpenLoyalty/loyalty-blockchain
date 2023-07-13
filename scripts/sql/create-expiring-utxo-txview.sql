-- condition: in order to create mentioned views, there must be at least one transaction
--   already present on the blockchain so we can pull the json structure from there.

DO $$
DECLARE tmp1_keys text;
DECLARE tmp2_keys text;
DECLARE tmp3_keys text;
BEGIN
  drop view if exists activeassets;
  drop view if exists removedassets;
  drop view if exists assets cascade;
  drop view if exists txview cascade;
  drop view if exists tmpview3 cascade;
  drop view if exists tmpview2 cascade;
  drop view if exists tmpview1 cascade;
  select string_agg(distinct format('arr_elements ->> %L as %I',akey, akey), ', ')
     into tmp1_keys
  from transactions, json_array_elements(regexp_replace(write_set::text, '\\u0000', '#', 'g')::json) as t(arr_elements), json_object_keys(t.arr_elements) as a(akey)
  where json_typeof(write_set) ='array';
  execute 'create view tmpview1 as select createdt, txhash, blockid, '||tmp1_keys||' from transactions, json_array_elements(regexp_replace(write_set::text, ''\\u0000'', ''#'', ''g'')::json) as t(arr_elements) where transactions.chaincodename=''expiring-utxo-contract'' and json_typeof(write_set) =''array''';

  select string_agg(distinct format('arr_elements ->> %L as %I',akey, akey), ', ')
   into tmp2_keys
  from tmpview1, json_array_elements(set::json) as t(arr_elements), json_object_keys(t.arr_elements) as a(akey)
  where json_typeof(set::json) ='array';

  execute 'create view tmpview2 as select createdt, txhash, blockid, '||tmp2_keys||' from tmpview1, json_array_elements(set::json) as t(arr_elements), json_object_keys(t.arr_elements) as a(akey) where json_typeof(set::json) =''array''';

  select string_agg(distinct format('value::json ->> %L as %I',akey, akey), ', ')
    into tmp3_keys
  from tmpview2, json_object_keys(value::json) as t(akey)
  where is_json(value)=True;

   execute 'create view tmpview3 as select createdt::timestamp, txhash, blockid, is_delete::bool as isdelete, split_part(key::text, ''#'', 3) as asset_id, '||tmp3_keys||' from tmpview2, json_object_keys(value::json) as t(akey) where is_json(value)=True';
   execute 'create view assets as select distinct on (split_part(key::text, ''#'', 3))  createdt::timestamp, txhash, split_part(key::text, ''#'', 3) as asset_id, '||tmp3_keys||' from tmpview2, json_object_keys(value::json) as t(akey) where is_json(value)=True';
   execute 'create view removedassets as select distinct on (split_part(key::text, ''#'', 3))  createdt::timestamp as removedt, txhash, split_part(key::text, ''#'', 3) as asset_id from tmpview2 where is_delete::bool = True';
   execute 'create view activeassets as select distinct on (split_part(key::text, ''#'', 3))  createdt::timestamp, txhash, split_part(key::text, ''#'', 3) as asset_id, '||tmp3_keys||' from tmpview2, json_object_keys(value::json) as t(akey) where split_part(key::text, ''#'', 3) not in (select asset_id from removedassets) and is_json(value) = True';
   execute 'create view txview as select createdt, txhash, blockid, isdelete, asset_id from tmpview3 union select createdt, txhash, blockid, is_delete::bool as isdelete, split_part(key::text, ''#'', 3) as asset_id from tmpview2 where is_delete::bool=True';
--    execute 'create view assets as select * from gift_card_txview where blockid in (select max(blockid) from gift_card_txview group by asset_id)';
--    execute 'create view removedassets as select * from assets where isdelete::bool = True';
--    execute 'create view activeassets as select * from assets where asset_id not in (select asset_id from removedassets)';

END$$;

-- -- getPoints
-- select sum(activeassets.amount::int) from txview
--     join activeassets on txview.asset_id = activeassets.asset_id
--     join "User" as usr on activeassets.owner=usr."userUuid"
--     where usr.username='two-day-byword8';

-- -- get tx history
-- select txview.txhash, txview.createdt, txview.isdelete, assets.amount, assets."expirationDate", assets."enforcementDate", assets.owner
-- from txview
--     join assets on txview.asset_id = assets.asset_id
--     join "User" as usr on assets.owner=usr."userUuid"
--     where txview.txhash in (select txview.txhash
--                             from txview
--                                 join assets on txview.asset_id = assets.asset_id
--                                 join "User" as usr on assets.owner=usr."userUuid"
--                                     where usr.username='two-day-byword8' order by txview.txhash);

