-- condition: in order to create mentioned views, there must be at least one transaction
--   already present on the blockchain so we can pull the json structure from there.

DO $$
DECLARE prepaid_card_tmp1_keys text;
DECLARE prepaid_card_tmp2_keys text;
DECLARE prepaid_card_tmp3_keys text;
BEGIN
  drop view if exists prepaid_card_activecards;
  drop view if exists prepaid_card_removedcards;
  drop view if exists prepaid_card_cards cascade;
  drop view if exists prepaid_card_txview cascade;
  drop view if exists prepaid_card_tmpview2 cascade;
  drop view if exists prepaid_card_tmpview1 cascade;
  select string_agg(distinct format('arr_elements ->> %L as %I',akey, akey), ', ')
     into prepaid_card_tmp1_keys
  from transactions, json_array_elements(regexp_replace(write_set::text, '\\u0000', '#', 'g')::json) as t(arr_elements), json_object_keys(t.arr_elements) as a(akey)
  where json_typeof(write_set) ='array';
  execute 'create view prepaid_card_tmpview1 as select createdt, txhash, blockid, '||prepaid_card_tmp1_keys||' from transactions, json_array_elements(regexp_replace(write_set::text, ''\\u0000'', ''#'', ''g'')::json) as t(arr_elements) where transactions.chaincodename=''prepaid-card-contract'' and json_typeof(write_set) =''array''';

  select string_agg(distinct format('arr_elements ->> %L as %I',akey, akey), ', ')
   into prepaid_card_tmp2_keys
  from prepaid_card_tmpview1, json_array_elements(set::json) as t(arr_elements), json_object_keys(t.arr_elements) as a(akey)
  where json_typeof(set::json) ='array';

  execute 'create view prepaid_card_tmpview2 as select distinct on (txhash) createdt, txhash, blockid, '||prepaid_card_tmp2_keys||' from prepaid_card_tmpview1, json_array_elements(set::json) as t(arr_elements), json_object_keys(t.arr_elements) as a(akey) where prepaid_card_tmpview1.chaincode=''prepaid-card-contract'' and json_typeof(set::json) =''array''';

  select string_agg(distinct format('value::json ->> %L as %I',akey, akey), ', ')
    into prepaid_card_tmp3_keys
  from prepaid_card_tmpview2, json_object_keys(value::json) as t(akey)
  where is_json(value)=True;

   execute 'create view prepaid_card_txview as select distinct on (txhash) createdt::timestamp, txhash, blockid, is_delete::bool as isdelete, split_part(key::text, ''#'', 3) as asset_id, '||prepaid_card_tmp3_keys||' from prepaid_card_tmpview2, json_object_keys(value::json) as t(akey) where is_json(value)=True';
   execute 'create view prepaid_card_cards as select * from prepaid_card_txview where blockid in (select max(blockid) from prepaid_card_txview group by asset_id)';
   execute 'create view prepaid_card_removedcards as select * from prepaid_card_cards where isdelete::bool = True';
   execute 'create view prepaid_card_activecards as select * from prepaid_card_cards where asset_id not in (select asset_id from prepaid_card_removedcards)';

END$$;

-- -- getPoints
-- select sum(prepaid_card_activecards.amount::int) from prepaid_card_txview
--     join prepaid_card_activecards on prepaid_card_txview.asset_id = prepaid_card_activecards.asset_id
--     join "User" as usr on prepaid_card_activecards.owner=usr."userUuid"
--     where usr.username='two-day-byword8';

-- -- get tx history
-- select prepaid_card_txview.txhash, prepaid_card_txview.createdt, prepaid_card_txview.isdelete, prepaid_card_cards.amount, prepaid_card_cards."expirationDate", prepaid_card_cards."enforcementDate", prepaid_card_cards.owner
-- from prepaid_card_txview
--     join prepaid_card_cards on prepaid_card_txview.asset_id = prepaid_card_cards.asset_id
--     join "User" as usr on prepaid_card_cards.owner=usr."userUuid"
--     where prepaid_card_txview.txhash in (select prepaid_card_txview.txhash
--                             from prepaid_card_txview
--                                 join prepaid_card_cards on prepaid_card_txview.asset_id = prepaid_card_cards.asset_id
--                                 join "User" as usr on prepaid_card_cards.owner=usr."userUuid"
--                                     where usr.username='two-day-byword8' order by prepaid_card_txview.txhash);

select * from prepaid_card_txview
