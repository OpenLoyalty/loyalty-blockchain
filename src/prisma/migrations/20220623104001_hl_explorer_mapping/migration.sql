-- CreateTable
CREATE TABLE "blocks" (
    "id" SERIAL NOT NULL,
    "blocknum" INTEGER,
    "datahash" TEXT,
    "prehash" TEXT,
    "txcount" INTEGER,
    "createdt" TIMESTAMP(3),
    "prev_blockhash" TEXT,
    "blockhash" TEXT,
    "channel_genesis_hash" TEXT,
    "blksize" INTEGER,
    "network_name" TEXT,

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chaincodes" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "version" TEXT,
    "path" TEXT,
    "channel_genesis_hash" TEXT,
    "txcount" INTEGER,
    "createdt" TIMESTAMP(3),
    "network_name" TEXT,

    CONSTRAINT "chaincodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peer_ref_chaincode" (
    "id" SERIAL NOT NULL,
    "peerid" TEXT,
    "chaincodeid" TEXT,
    "cc_version" TEXT,
    "channelid" TEXT,
    "createdt" TIMESTAMP(3),
    "network_name" TEXT,

    CONSTRAINT "peer_ref_chaincode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "blocks" INTEGER,
    "trans" INTEGER,
    "createdt" TIMESTAMP(3),
    "channel_genesis_hash" TEXT,
    "channel_hash" TEXT,
    "channel_version" TEXT,
    "network_name" TEXT,

    CONSTRAINT "channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peer" (
    "id" SERIAL NOT NULL,
    "org" INTEGER,
    "channel_genesis_hash" TEXT,
    "mspid" TEXT,
    "requests" TEXT,
    "events" TEXT,
    "server_hostname" TEXT,
    "createdt" TIMESTAMP(3),
    "peer_type" TEXT,
    "network_name" TEXT,

    CONSTRAINT "peer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peer_ref_channel" (
    "id" SERIAL NOT NULL,
    "peerid" TEXT,
    "channelid" TEXT,
    "peer_type" TEXT,
    "network_name" TEXT,

    CONSTRAINT "peer_ref_channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orderer" (
    "id" SERIAL NOT NULL,
    "requests" TEXT,
    "server_hostname" TEXT,
    "createdt" TIMESTAMP(3),
    "network_name" TEXT,

    CONSTRAINT "orderer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "blockid" INTEGER,
    "txhash" TEXT,
    "createdt" TIMESTAMP(3),
    "chaincodename" TEXT,
    "status" INTEGER,
    "creator_msp_id" TEXT,
    "endorser_msp_id" TEXT,
    "chaincode_id" TEXT,
    "type" TEXT,
    "read_set" JSON,
    "write_set" JSON,
    "channel_genesis_hash" TEXT,
    "validation_code" TEXT,
    "envelope_signature" TEXT,
    "payload_extension" TEXT,
    "creator_id_bytes" TEXT,
    "creator_nonce" TEXT,
    "chaincode_proposal_input" TEXT,
    "tx_response" TEXT,
    "payload_proposal_hash" TEXT,
    "endorser_id_bytes" TEXT,
    "endorser_signature" TEXT,
    "network_name" TEXT,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "networkName" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "password" TEXT,
    "roles" TEXT,
    "salt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
