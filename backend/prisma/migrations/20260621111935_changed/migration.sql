-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profilePublicId" TEXT,
ADD COLUMN     "profileUrl" TEXT NOT NULL DEFAULT 'https://res.cloudinary.com/dls73n4ig/image/upload/v1782037910/resume_builder/profile/default.jpg';
