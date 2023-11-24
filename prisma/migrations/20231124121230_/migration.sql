-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "refreshToken" TEXT,
    "login" TEXT NOT NULL,
    "brushes" INTEGER[],
    "references" INTEGER[],
    "tutorials" INTEGER[],
    "programs" INTEGER[],

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brushes" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "brushes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "references" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "hashtag" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutorials" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "tutorials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "systems" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "pluses" TEXT NOT NULL,
    "minuses" TEXT NOT NULL,
    "examples" TEXT NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_brushes_key" ON "users"("brushes");

-- CreateIndex
CREATE UNIQUE INDEX "users_references_key" ON "users"("references");

-- CreateIndex
CREATE UNIQUE INDEX "users_tutorials_key" ON "users"("tutorials");

-- CreateIndex
CREATE UNIQUE INDEX "users_programs_key" ON "users"("programs");

-- CreateIndex
CREATE UNIQUE INDEX "brushes_title_key" ON "brushes"("title");

-- CreateIndex
CREATE UNIQUE INDEX "references_title_key" ON "references"("title");

-- CreateIndex
CREATE UNIQUE INDEX "tutorials_title_key" ON "tutorials"("title");

-- CreateIndex
CREATE UNIQUE INDEX "programs_name_key" ON "programs"("name");
