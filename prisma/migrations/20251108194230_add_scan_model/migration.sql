/*
  Warnings:

  - You are about to drop the column `ingredients` on the `Scan` table. All the data in the column will be lost.
  - Added the required column `cacheKey` to the `Scan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ingredientsCSV` to the `Scan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ingredientsJSON` to the `Scan` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Scan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "ingredientsCSV" TEXT NOT NULL,
    "ingredientsJSON" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Scan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Scan" ("createdAt", "id", "imageUrl", "userId") SELECT "createdAt", "id", "imageUrl", "userId" FROM "Scan";
DROP TABLE "Scan";
ALTER TABLE "new_Scan" RENAME TO "Scan";
CREATE INDEX "Scan_userId_createdAt_idx" ON "Scan"("userId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
