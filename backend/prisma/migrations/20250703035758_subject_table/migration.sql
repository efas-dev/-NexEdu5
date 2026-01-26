/*
  Warnings:

  - Added the required column `SubjectId` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "SubjectId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Subject" (
    "id" SERIAL NOT NULL,
    "Subject" TEXT NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_SubjectId_fkey" FOREIGN KEY ("SubjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
