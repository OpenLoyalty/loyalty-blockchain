-- condition: in order to create mentioned views, there must be at least one transaction
--   already present on the blockchain so we can pull the json structure from there.

DO $$
DECLARE gift_card_tmp1_keys text;
DECLARE gift_card_tmp2_keys text;
DECLARE gift_card_tmp3_keys text;
BEGIN
  drop view if exists gift_card_activecards;
  drop view if exists gift_card_removedcards;
  drop view if exists gift_card_cards cascade;
  drop view if exists gift_card_txview cascade;
  drop view if exists gift_card_tmpview2 cascade;
  drop view if exists gift_card_tmpview1 cascade;
  select string_agg(distinct format('arr_elements ->> %L as %I',akey, akey), ', ')
     into gift_card_tmp1_keys
  from transactions, json_array_elements(regexp_replace(write_set::text, '\\u0000', '#', 'g')::json) as t(arr_elements), json_object_keys(t.arr_elements) as a(akey)
  where json_typeof(write_set) ='array';
  execute 'create view gift_card_tmpview1 as select createdt, txhash, blockid, '||gift_card_tmp1_keys||' from transactions, json_array_elements(regexp_replace(write_set::text, ''\\u0000'', ''#'', ''g'')::json) as t(arr_elements) where transactions.chaincodename=''gift-card-contract'' and json_typeof(write_set) =''array''';

  select string_agg(distinct format('arr_elements ->> %L as %I',akey, akey), ', ')
   into gift_card_tmp2_keys
  from gift_card_tmpview1, json_array_elements(set::json) as t(arr_elements), json_object_keys(t.arr_elements) as a(akey)
  where json_typeof(set::json) ='array';

  execute 'create view gift_card_tmpview2 as select distinct on (txhash) createdt, txhash, blockid, '||gift_card_tmp2_keys||' from gift_card_tmpview1, json_array_elements(set::json) as t(arr_elements), json_object_keys(t.arr_elements) as a(akey) where gift_card_tmpview1.chaincode=''gift-card-contract'' and json_typeof(set::json) =''array''';

  select string_agg(distinct format('value::json ->> %L as %I',akey, akey), ', ')
    into gift_card_tmp3_keys
  from gift_card_tmpview2, json_object_keys(value::json) as t(akey)
  where is_json(value)=True;

   execute 'create view gift_card_txview as select distinct on (txhash) createdt::timestamp, txhash, blockid, is_delete::bool as isdelete, split_part(key::text, ''#'', 3) as asset_id, '||gift_card_tmp3_keys||' from gift_card_tmpview2, json_object_keys(value::json) as t(akey) where is_json(value)=True';
   execute 'create view gift_card_cards as select * from gift_card_txview where blockid in (select max(blockid) from gift_card_txview group by asset_id)';
   execute 'create view gift_card_removedcards as select * from gift_card_cards where isdelete::bool = True';
   execute 'create view gift_card_activecards as select * from gift_card_cards where asset_id not in (select asset_id from gift_card_removedcards)';

END$$;
