-- AlterTable
ALTER TABLE "Oglas" ADD COLUMN     "cena_na_m2" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Zaznamek" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "aktiven" BOOLEAN NOT NULL DEFAULT false;
