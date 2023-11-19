/*
  Warnings:

  - The `hashtag` column on the `references` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "references" DROP COLUMN "hashtag",
ADD COLUMN     "hashtag" TEXT[];
