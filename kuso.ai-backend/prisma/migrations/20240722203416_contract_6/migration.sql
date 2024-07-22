/*
  Warnings:

  - Made the column `score` on table `Feedback` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Feedback" ALTER COLUMN "score" SET NOT NULL;
