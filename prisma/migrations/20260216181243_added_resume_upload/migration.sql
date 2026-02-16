/*
  Warnings:

  - Added the required column `description` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "link" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "salary" TEXT,
ALTER COLUMN "status" SET DEFAULT 'APPLIED';

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeParsedData" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "keywords" TEXT[],
    "skills" TEXT[],
    "experience" JSONB NOT NULL,
    "education" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResumeParsedData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeEvaluations" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "matchScore" DOUBLE PRECISION NOT NULL,
    "summary" TEXT NOT NULL,
    "strengths" TEXT[],
    "gaps" TEXT[],
    "modelUsed" TEXT NOT NULL,
    "promptHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResumeEvaluations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Resume_userId_idx" ON "Resume"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeParsedData_resumeId_key" ON "ResumeParsedData"("resumeId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeEvaluations_resumeId_jobId_key" ON "ResumeEvaluations"("resumeId", "jobId");

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeParsedData" ADD CONSTRAINT "ResumeParsedData_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeEvaluations" ADD CONSTRAINT "ResumeEvaluations_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeEvaluations" ADD CONSTRAINT "ResumeEvaluations_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
