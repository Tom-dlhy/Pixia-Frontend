-- CreateTable
CREATE TABLE "DeepCourse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ownerEmail" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    CONSTRAINT "DeepCourse_ownerEmail_fkey" FOREIGN KEY ("ownerEmail") REFERENCES "User" ("email") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeepCourseChapter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "illustrationBase64" TEXT,
    "courseId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "position" INTEGER,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    CONSTRAINT "DeepCourseChapter_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "DeepCourse" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DeepCourseChapter_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "DeepExercise" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeepExercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "itemsJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userEmail" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "score" INTEGER,
    "completedAt" DATETIME,
    "durationMs" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    CONSTRAINT "Evaluation_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User" ("email") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Evaluation_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "DeepExercise" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Evaluation_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "DeepCourseChapter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "email" TEXT NOT NULL PRIMARY KEY,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("email", "password") SELECT "email", "password" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "DeepCourse_ownerEmail_idx" ON "DeepCourse"("ownerEmail");

-- CreateIndex
CREATE INDEX "DeepCourseChapter_courseId_idx" ON "DeepCourseChapter"("courseId");

-- CreateIndex
CREATE INDEX "DeepCourseChapter_exerciseId_idx" ON "DeepCourseChapter"("exerciseId");

-- CreateIndex
CREATE INDEX "Evaluation_userEmail_idx" ON "Evaluation"("userEmail");

-- CreateIndex
CREATE INDEX "Evaluation_exerciseId_idx" ON "Evaluation"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_chapterId_userEmail_key" ON "Evaluation"("chapterId", "userEmail");
