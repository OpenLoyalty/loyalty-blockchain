-- condition: in order to create mentioned views, there must be at least one transaction
--   already present on the blockchain so we can pull the json structure from there.

DO $$
DECLARE voucher_tmp1_keys text;
DECLARE voucher_tmp2_keys text;
DECLARE voucher_tmp3_keys text;
BEGIN
  drop view if exists voucher_activecards;
  drop view if exists voucher_removedcards;
  drop view if exists voucher_cards cascade;
  drop view if exists voucher_txview cascade;
  drop view if exists voucher_tmpview2 cascade;
  drop view if exists voucher_tmpview1 cascade;
  select string_agg(distinct format('arr_elements ->> %L as %I',akey, akey), ', ')
     into voucher_tmp1_keys
  from transactions, json_array_elements(regexp_replace(write_set::text, '\\u0000', '#', 'g')::json) as t(arr_elements), json_object_keys(t.arr_elements) as a(akey)
  where json_typeof(write_set) ='array';
  execute 'create view voucher_tmpview1 as select createdt, txhash, blockid, '||voucher_tmp1_keys||' from transactions, json_array_elements(regexp_replace(write_set::text, ''\\u0000'', ''#'', ''g'')::json) as t(arr_elements) where transactions.chaincodename=''voucher-contract'' and json_typeof(write_set) =''array''';

  select string_agg(distinct format('arr_elements ->> %L as %I',akey, akey), ', ')
   into voucher_tmp2_keys
  from voucher_tmpview1, json_array_elements(set::json) as t(arr_elements), json_object_keys(t.arr_elements) as a(akey)
  where json_typeof(set::json) ='array';

  execute 'create view voucher_tmpview2 as select distinct on (txhash) createdt, txhash, blockid, '||voucher_tmp2_keys||' from voucher_tmpview1, json_array_elements(set::json) as t(arr_elements), json_object_keys(t.arr_elements) as a(akey) where voucher_tmpview1.chaincode=''voucher-contract'' and json_typeof(set::json) =''array''';

  select string_agg(distinct format('value::json ->> %L as %I',akey, akey), ', ')
    into voucher_tmp3_keys
  from voucher_tmpview2, json_object_keys(value::json) as t(akey)
  where is_json(value)=True;

   execute 'create view voucher_txview as select distinct on (txhash) createdt::timestamp, txhash, blockid, is_delete::bool as isdelete, split_part(key::text, ''#'', 3) as asset_id, '||voucher_tmp3_keys||' from voucher_tmpview2, json_object_keys(value::json) as t(akey) where is_json(value)=True';
   execute 'create view voucher_cards as select * from voucher_txview where blockid in (select max(blockid) from voucher_txview group by asset_id)';
   execute 'create view voucher_removedcards as select * from voucher_cards where isdelete::bool = True';
   execute 'create view voucher_activecards as select * from voucher_cards where asset_id not in (select asset_id from voucher_removedcards)';

END$$;

-- -- getPoints
-- select sum(voucher_activecards.amount::int) from voucher_txview
--     join voucher_activecards on voucher_txview.asset_id = voucher_activecards.asset_id
--     join "User" as usr on voucher_activecards.owner=usr."userUuid"
--     where usr.username='two-day-byword8';

-- -- get tx history
-- select voucher_txview.txhash, voucher_txview.createdt, voucher_txview.isdelete, voucher_cards.amount, voucher_cards."expirationDate", voucher_cards."enforcementDate", voucher_cards.owner
-- from voucher_txview
--     join voucher_cards on voucher_txview.asset_id = voucher_cards.asset_id
--     join "User" as usr on voucher_cards.owner=usr."userUuid"
--     where voucher_txview.txhash in (select voucher_txview.txhash
--                             from voucher_txview
--                                 join voucher_cards on voucher_txview.asset_id = voucher_cards.asset_id
--                                 join "User" as usr on voucher_cards.owner=usr."userUuid"
--                                     where usr.username='two-day-byword8' order by voucher_txview.txhash);

select * from voucher_txview
