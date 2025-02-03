-- CreateTable
CREATE TABLE "Mark" (
    "id" SERIAL NOT NULL,
    "subject" TEXT NOT NULL,
    "mark" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,

    CONSTRAINT "Mark_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
