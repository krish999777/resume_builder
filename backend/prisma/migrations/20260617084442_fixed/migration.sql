/*
  Warnings:

  - You are about to drop the column `DeployedLink` on the `projects` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "projects" DROP COLUMN "DeployedLink",
ADD COLUMN     "deployedLink" TEXT;
