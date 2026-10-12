-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "category" TEXT,
ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "hasCertificate" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "learningObjectives" TEXT,
ADD COLUMN     "prerequisites" TEXT,
ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "skills" TEXT,
ADD COLUMN     "targetAudience" TEXT;

-- AlterTable
ALTER TABLE "modules" ADD COLUMN     "estimatedDurationMinutes" INTEGER;
