-- AlterEnum
ALTER TYPE "Formality" ADD VALUE 'NEUTRAL';

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "languageStyle" TEXT NOT NULL DEFAULT 'Ngoko',
ADD COLUMN     "level" TEXT NOT NULL DEFAULT 'A1';

-- AlterTable
ALTER TABLE "Quiz" ALTER COLUMN "lessonId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Vocabulary" ADD COLUMN     "level" TEXT DEFAULT 'A1';
