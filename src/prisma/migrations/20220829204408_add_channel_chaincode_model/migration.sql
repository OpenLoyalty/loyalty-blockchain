/*
  Warnings:

  - You are about to drop the `Channels` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `CA` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Peer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Channels" DROP CONSTRAINT "Channels_orgId_fkey";

-- DropTable
DROP TABLE "Channels";

-- CreateTable
CREATE TABLE "Chaincode" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "channelId" INTEGER,

    CONSTRAINT "Chaincode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "orgId" INTEGER,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Channel_name_key" ON "Channel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CA_name_key" ON "CA"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Peer_name_key" ON "Peer"("name");

-- AddForeignKey
ALTER TABLE "Chaincode" ADD CONSTRAINT "Chaincode_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE;
