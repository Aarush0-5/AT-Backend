/*
  Warnings:

  - A unique constraint covering the columns `[studentId]` on the table `Score` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `score` on the `Score` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Score" DROP COLUMN "score",
ADD COLUMN     "score" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Score_studentId_key" ON "Score"("studentId");
