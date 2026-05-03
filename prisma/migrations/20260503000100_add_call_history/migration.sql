-- CreateEnum
CREATE TYPE "CallStatusEnum" AS ENUM ('initiated', 'ringing', 'active', 'ended', 'rejected', 'missed', 'failed', 'cancelled', 'busy');

-- CreateTable
CREATE TABLE "Call" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT,
    "callerUserId" TEXT NOT NULL,
    "receiverUserId" TEXT NOT NULL,
    "callerParticipantId" TEXT NOT NULL,
    "receiverParticipantId" TEXT NOT NULL,
    "status" "CallStatusEnum" NOT NULL DEFAULT 'initiated',
    "endReason" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "durationSec" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Call_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Call_conversationId_created_at_idx" ON "Call"("conversationId", "created_at");

-- CreateIndex
CREATE INDEX "Call_callerUserId_created_at_idx" ON "Call"("callerUserId", "created_at");

-- CreateIndex
CREATE INDEX "Call_receiverUserId_created_at_idx" ON "Call"("receiverUserId", "created_at");

-- CreateIndex
CREATE INDEX "Call_callerParticipantId_created_at_idx" ON "Call"("callerParticipantId", "created_at");

-- CreateIndex
CREATE INDEX "Call_receiverParticipantId_created_at_idx" ON "Call"("receiverParticipantId", "created_at");

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_callerUserId_fkey" FOREIGN KEY ("callerUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_receiverUserId_fkey" FOREIGN KEY ("receiverUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_callerParticipantId_fkey" FOREIGN KEY ("callerParticipantId") REFERENCES "ConversationParticipants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_receiverParticipantId_fkey" FOREIGN KEY ("receiverParticipantId") REFERENCES "ConversationParticipants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
