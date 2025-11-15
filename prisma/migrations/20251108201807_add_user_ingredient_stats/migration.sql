-- CreateTable
CREATE TABLE "UserIngredientStat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "ingredient" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserIngredientStat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "UserIngredientStat_userId_ingredient_idx" ON "UserIngredientStat"("userId", "ingredient");

-- CreateIndex
CREATE UNIQUE INDEX "UserIngredientStat_userId_ingredient_key" ON "UserIngredientStat"("userId", "ingredient");
