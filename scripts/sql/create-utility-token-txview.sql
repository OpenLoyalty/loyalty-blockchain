-- condition: in order to create mentioned views, there must be at least one transaction
--   already present on the blockchain so we can pull the json structure from there.

DO $$
DECLARE utility_token_tmp1_keys text;
DECLARE utility_token_tmp2_keys text;
DECLARE utility_token_tmp3_keys text;
BEGIN
  drop view if exists utility_token_activecards;
  drop view if exists utility_token_removedcards;
  drop view if exists utility_token_cards cascade;
  drop view if exists utility_token_txview cascade;
  drop view if exists utility_token_tmpview2 cascade;
  drop view if exists utility_token_tmpview1 cascade;
  select string_agg(distinct format('arr_elements ->> %L as %I',akey, akey), ', ')
     into utility_token_tmp1_keys
  from transactions, json_array_elements(regexp_replace(write_set::text, '\\u0000', '#', 'g')::json) as t(arr_elements), json_object_keys(t.arr_elements) as a(akey)
  where json_typeof(write_set) ='array';
  execute 'create view utility_token_tmpview1 as select createdt, txhash, blockid, '||utility_token_tmp1_keys||' from transactions, json_array_elements(regexp_replace(write_set::text, ''\\u0000'', ''#'', ''g'')::json) as t(arr_elements) where transactions.chaincodename=''utility-token-contract'' and json_typeof(write_set) =''array''';

  select string_agg(distinct format('arr_elements ->> %L as %I',akey, akey), ', ')
   into utility_token_tmp2_keys
  from utility_token_tmpview1, json_array_elements(set::json) as t(arr_elements), json_object_keys(t.arr_elements) as a(akey)
  where json_typeof(set::json) ='array';

  execute 'create view utility_token_tmpview2 as select distinct on (txhash) createdt, txhash, blockid, '||utility_token_tmp2_keys||' from utility_token_tmpview1, json_array_elements(set::json) as t(arr_elements), json_object_keys(t.arr_elements) as a(akey) where utility_token_tmpview1.chaincode=''utility-token-contract'' and json_typeof(set::json) =''array''';

  select string_agg(distinct format('value::json ->> %L as %I',akey, akey), ', ')
    into utility_token_tmp3_keys
  from utility_token_tmpview2, json_object_keys(value::json) as t(akey)
  where is_json(value)=True;

   execute 'create view utility_token_txview as select distinct on (txhash) createdt::timestamp, txhash, blockid, is_delete::bool as isdelete, split_part(key::text, ''#'', 3) as asset_id, '||utility_token_tmp3_keys||' from utility_token_tmpview2, json_object_keys(value::json) as t(akey) where is_json(value)=True';
   execute 'create view utility_token_cards as select * from utility_token_txview where blockid in (select max(blockid) from utility_token_txview group by asset_id)';
   execute 'create view utility_token_removedcards as select * from utility_token_cards where isdelete::bool = True';
   execute 'create view utility_token_activecards as select * from utility_token_cards where asset_id not in (select asset_id from utility_token_removedcards)';

END$$;

-- -- getPoints
-- select sum(utility_token_activecards.amount::int) from utility_token_txview
--     join utility_token_activecards on utility_token_txview.asset_id = utility_token_activecards.asset_id
--     join "User" as usr on utility_token_activecards.owner=usr."userUuid"
--     where usr.username='two-day-byword8';

-- -- get tx history
-- select utility_token_txview.txhash, utility_token_txview.createdt, utility_token_txview.isdelete, utility_token_cards.amount, utility_token_cards."expirationDate", utility_token_cards."enforcementDate", utility_token_cards.owner
-- from utility_token_txview
--     join utility_token_cards on utility_token_txview.asset_id = utility_token_cards.asset_id
--     join "User" as usr on utility_token_cards.owner=usr."userUuid"
--     where utility_token_txview.txhash in (select utility_token_txview.txhash
--                             from utility_token_txview
--                                 join utility_token_cards on utility_token_txview.asset_id = utility_token_cards.asset_id
--                                 join "User" as usr on utility_token_cards.owner=usr."userUuid"
--                                     where usr.username='two-day-byword8' order by utility_token_txview.txhash);

select * from utility_token_txview
