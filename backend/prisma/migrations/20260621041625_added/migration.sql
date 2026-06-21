-- DropForeignKey
ALTER TABLE "achievements" DROP CONSTRAINT "achievements_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "education" DROP CONSTRAINT "education_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "experience" DROP CONSTRAINT "experience_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_resumeId_fkey";

-- AddForeignKey
ALTER TABLE "education" ADD CONSTRAINT "education_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience" ADD CONSTRAINT "experience_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
