/*
  Warnings:

  - You are about to drop the column `questionId` on the `Feedback` table. All the data in the column will be lost.
  - Added the required column `sessionQuestionId` to the `Feedback` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_questionId_fkey";

-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_sessionId_questionId_fkey";

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "questionId",
ADD COLUMN     "sessionQuestionId" INTEGER NOT NULL,
ALTER COLUMN "userAnswer" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_sessionQuestionId_fkey" FOREIGN KEY ("sessionQuestionId") REFERENCES "SessionQuestion"("sessionQuestionId") ON DELETE CASCADE ON UPDATE CASCADE;
