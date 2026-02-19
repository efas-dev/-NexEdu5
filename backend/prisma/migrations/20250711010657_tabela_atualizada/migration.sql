/*
  Warnings:

  - You are about to drop the column `SubjectId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `Subject` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_SubjectId_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "SubjectId";

-- DropTable
DROP TABLE "Subject";
