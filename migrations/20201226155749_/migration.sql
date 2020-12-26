-- CreateEnum
CREATE TYPE "Posredovanje" AS ENUM ('NAJEM', 'ODDAJA', 'NAKUP', 'PRODAJA');

-- CreateTable
CREATE TABLE "Oglas" (
    "db_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "naslov" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "posredovanje" "Posredovanje" NOT NULL,
    "kratek_opis" TEXT NOT NULL,
    "dolg_opis" TEXT NOT NULL,
    "vrsta" TEXT,
    "regija" TEXT,
    "upravna_enota" TEXT,
    "obcina" TEXT,
    "velikost" DECIMAL(65,30),
    "cena" DECIMAL(65,30),
    "leto" INTEGER,
    "st_sob" DECIMAL(65,30),
    "slike" TEXT[],

    PRIMARY KEY ("db_id")
);

-- CreateTable
CREATE TABLE "Zaznamek" (
    "db_id" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "posredovanje" "Posredovanje" NOT NULL,

    PRIMARY KEY ("db_id")
);
