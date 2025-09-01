/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `Quiz` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Quiz" DROP CONSTRAINT "Quiz_studentId_fkey";

-- AlterTable
ALTER TABLE "public"."Quiz" DROP COLUMN "createdAt",
DROP COLUMN "studentId",
ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Quiz" ADD CONSTRAINT "Quiz_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
