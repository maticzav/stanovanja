/*
  Warnings:

  - Added the required column `zaznamek_id` to the `Oglas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Oglas" ADD COLUMN     "zaznamek_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Oglas" ADD FOREIGN KEY("zaznamek_id")REFERENCES "Zaznamek"("db_id") ON DELETE CASCADE ON UPDATE CASCADE;
