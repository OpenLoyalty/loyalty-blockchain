#!/bin/bash

FABLO_EXECUTABLE=fablo.sh

cd scripts/fablo
# Check if fablo executable exists
if [ ! -f "$FABLO_EXECUTABLE" ]; then
    echo "fablo executable not found. Downloading..."
    wget https://github.com/hyperledger-labs/fablo/releases/download/1.1.0/fablo.sh -P .
    chmod +x "$FABLO_EXECUTABLE"
    echo "fablo executable downloaded successfully."
fi

echo "cloning Loyalty Blockchain contracts"

git clone git@github.com:OpenLoyalty/loyalty-blockchain-contracts.git
# git clone https://github.com/OpenLoyalty/loyalty-blockchain-contracts.git fablo/loyalty-blockchain-contracts

echo "starting Hyperledger Fabric Network using Fablo"
./fablo.sh up 2peer-1channel.json

echo "creating network configuration file"
cd init
yarn install
SOURCE_FILE=../fablo-target/fabric-config/connection-profiles/connection-profile-org1.yaml
DEST_FILE=../fablo-target/network-config.yaml
CHAINCODES_DIR=../loyalty-blockchain-contracts
yarn run generate-network-config -- $SOURCE_FILE $DEST_FILE $CHAINCODES_DIR

rm -rf ../loyalty-blockchain-contracts

cd ../../..

echo "starting Loyalty Blockchain API"
yarn docker:dev-daemon

echo "Waiting an additional 20 seconds for any post-startup initialization..."
sleep 20

echo "Initializing ledger"
cd scripts/fablo/init
yarn run init-ledger
cd ../../..
sleep 10

echo "Running SQL mapping scripts..."
docker exec -i db psql -U opuser -d openpay < scripts/sql/create-isjson-function.sql
docker exec -i db psql -U opuser -d openpay < scripts/sql/create-expiring-utxo-txview.sql
docker exec -i db psql -U opuser -d openpay < scripts/sql/create-gift-card-txview.sql
docker exec -i db psql -U opuser -d openpay < scripts/sql/create-prepaid-card-txview.sql
docker exec -i db psql -U opuser -d openpay < scripts/sql/create-utility-token-txview.sql
docker exec -i db psql -U opuser -d openpay < scripts/sql/create-voucher-txview.sql

sleep 5

docker-compose down

echo "Initialization complete!"
echo "Execute yarn docker:dev to start your journey"
