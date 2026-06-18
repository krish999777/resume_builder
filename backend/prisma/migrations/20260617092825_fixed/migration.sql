/*
  Warnings:

  - You are about to drop the column `EndDate` on the `education` table. All the data in the column will be lost.
  - You are about to drop the column `StartDate` on the `education` table. All the data in the column will be lost.
  - Added the required column `startDate` to the `education` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "education" DROP COLUMN "EndDate",
DROP COLUMN "StartDate",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;
