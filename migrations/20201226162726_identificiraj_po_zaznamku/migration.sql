/*
  Warnings:

  - The migration will change the primary key for the `Oglas` table. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `db_id` on the `Oglas` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Oglas` table. All the data in the column will be lost.
  - You are about to drop the column `posredovanje` on the `Oglas` table. All the data in the column will be lost.
  - The migration will add a unique constraint covering the columns `[id]` on the table `Zaznamek`. If there are existing duplicate values, the migration will fail.

*/
-- AlterTable
ALTER TABLE "Oglas" DROP CONSTRAINT "Oglas_pkey",
DROP COLUMN "db_id",
DROP COLUMN "url",
DROP COLUMN "posredovanje",
ADD PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Zaznamek.id_unique" ON "Zaznamek"("id");
