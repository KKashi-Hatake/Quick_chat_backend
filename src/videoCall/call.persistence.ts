import { CallStatusEnum } from "@prisma/client";
import prisma from "../config/db.config";

type CreateCallInput = {
    callId: string;
    callerUserId: string;
    receiverUserId: string;
    callerParticipantId: string;
    receiverParticipantId: string;
    conversationId?: string;
};

export const callPersistence = {
    async createOrGetCall(input: CreateCallInput) {
        const existing = await prisma.call.findUnique({
            where: { id: input.callId },
        });
        if (existing) return existing;
        return prisma.call.create({
            data: {
                id: input.callId,
                caller: {
                    connect: { id: input.callerUserId },
                },
                receiver: {
                    connect: { id: input.receiverUserId },
                },
                callerParticipant: {
                    connect: { id: input.callerParticipantId },
                },
                receiverParticipant: {
                    connect: { id: input.receiverParticipantId },
                },
                conversation: input.conversationId
                    ? {
                        connect: { id: input.conversationId },
                    }
                    : undefined,
                status: CallStatusEnum.initiated,
            },
        });
    },

    async markRinging(callId: string) {
        return prisma.call.update({
            where: { id: callId },
            data: { status: CallStatusEnum.ringing },
        });
    },

    async markActive(callId: string) {
        return prisma.call.update({
            where: { id: callId },
            data: {
                status: CallStatusEnum.active,
                startedAt: new Date(),
            },
        });
    },

    async markTerminal(callId: string, status: CallStatusEnum, endReason?: string) {
        const current = await prisma.call.findUnique({
            where: { id: callId },
            select: { startedAt: true },
        });
        const endedAt = new Date();
        const durationSec = current?.startedAt
            ? Math.max(0, Math.floor((endedAt.getTime() - current.startedAt.getTime()) / 1000))
            : null;

        return prisma.call.update({
            where: { id: callId },
            data: {
                status,
                endReason: endReason || null,
                endedAt,
                durationSec,
            },
        });
    },
};
