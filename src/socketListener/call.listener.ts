import { CallStatusEnum } from "@prisma/client";
import { Socket } from "socket.io";
import { io } from "..";
import prisma from "../config/db.config";
import { getReceiverSocketId } from "../socket";
import {
    CallAcceptPayload,
    CallBusyPayload,
    CallCancelPayload,
    CallEndPayload,
    CallErrorPayload,
    CallInvitePayload,
    CallRejectPayload,
    CallTimeoutPayload,
    IceCandidatePayload,
    SessionDescriptionPayload,
    VIDEO_CALL_EVENTS,
} from "../videoCall/contract";
import { callPersistence } from "../videoCall/call.persistence";

const activeCallsByUser = new Map<string, string>();

const emitToUser = (userId: string, eventName: string, payload: unknown) => {
    const socketIds = getReceiverSocketId(userId);
    if (!socketIds) return;
    for (const socketId of socketIds) {
        io.to(socketId).emit(eventName, payload);
    }
};

const emitError = (targetUserId: string, payload: CallErrorPayload) => {
    emitToUser(targetUserId, VIDEO_CALL_EVENTS.ERROR, payload);
};

const resolveParticipants = async (fromUserId: string, toUserId: string, callId: string) => {
    const [callerParti, receiverParti, callerUser] = await Promise.all([
        prisma.conversationParticipants.findFirst({
            where: {
                userId: fromUserId,
                created_by: toUserId,
            },
            select: {
                id: true,
                conversationId: true,
            },
        }),
        prisma.conversationParticipants.findFirst({
            where: {
                userId: toUserId,
                created_by: fromUserId,
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
            },
        }),
        prisma.user.findUnique({
            where: { id: fromUserId },
            select: {
                phone: true,
                image: true,
            },
        }),
    ]);

    if (!callerParti || !receiverParti) {
        throw new Error(`Unable to resolve participants for call ${callId}`);
    }

    const participantName = `${receiverParti.first_name || ""} ${receiverParti.last_name || ""}`.trim();

    return {
        callerParticipantId: callerParti.id,
        receiverParticipantId: receiverParti.id,
        conversationId: callerParti.conversationId || undefined,
        callerDisplayName: participantName || callerUser?.phone || "Unknown caller",
        callerPhone: callerUser?.phone || "",
        callerImage: callerUser?.image || null,
    };
};

export const callListener = (socket: Socket) => {
    const handleInvite = async (payload: CallInvitePayload) => {
        if ((process.env.ENABLE_VIDEO_CALLS || "true").toLowerCase() !== "true") return;
        if (!payload?.callId || !payload?.fromUserId || !payload?.toUserId) return;
        if (payload.fromUserId === payload.toUserId) {
            emitError(payload.fromUserId, {
                ...payload,
                error: "Cannot initiate a call to yourself.",
            });
            return;
        }
        if (activeCallsByUser.has(payload.toUserId)) {
            const busyPayload: CallBusyPayload = {
                ...payload,
            };
            emitToUser(payload.fromUserId, VIDEO_CALL_EVENTS.BUSY, busyPayload);
            await callPersistence
                .createOrGetCall({
                    callId: payload.callId,
                    callerUserId: payload.fromUserId,
                    receiverUserId: payload.toUserId,
                    ...(await resolveParticipants(payload.fromUserId, payload.toUserId, payload.callId)),
                    conversationId: payload.conversationId,
                })
                .catch(() => undefined);
            await callPersistence.markTerminal(payload.callId, CallStatusEnum.busy, "busy").catch(() => undefined);
            return;
        }

        try {
            const resolved = await resolveParticipants(payload.fromUserId, payload.toUserId, payload.callId);
            await callPersistence.createOrGetCall({
                callId: payload.callId,
                callerUserId: payload.fromUserId,
                receiverUserId: payload.toUserId,
                ...resolved,
                conversationId: payload.conversationId || resolved.conversationId,
            });
            await callPersistence.markRinging(payload.callId);
            payload.callerName = resolved.callerDisplayName;
            payload.callerPhone = resolved.callerPhone;
            payload.callerImage = resolved.callerImage;
        } catch (error) {
            emitError(payload.fromUserId, {
                ...payload,
                error: "Failed to initialize call.",
            });
            return;
        }

        emitToUser(payload.toUserId, VIDEO_CALL_EVENTS.INVITE, payload);
    };

    const handleAccept = async (payload: CallAcceptPayload) => {
        if (!payload?.callId || !payload?.fromUserId || !payload?.toUserId) return;
        activeCallsByUser.set(payload.fromUserId, payload.callId);
        activeCallsByUser.set(payload.toUserId, payload.callId);
        await callPersistence.markActive(payload.callId).catch(() => undefined);
        emitToUser(payload.toUserId, VIDEO_CALL_EVENTS.ACCEPT, payload);
    };

    const handleReject = async (payload: CallRejectPayload) => {
        if (!payload?.callId || !payload?.fromUserId || !payload?.toUserId) return;
        activeCallsByUser.delete(payload.fromUserId);
        activeCallsByUser.delete(payload.toUserId);
        await callPersistence
            .markTerminal(payload.callId, CallStatusEnum.rejected, payload.reason || "rejected")
            .catch(() => undefined);
        emitToUser(payload.toUserId, VIDEO_CALL_EVENTS.REJECT, payload);
    };

    const handleCancel = async (payload: CallCancelPayload) => {
        if (!payload?.callId || !payload?.fromUserId || !payload?.toUserId) return;
        activeCallsByUser.delete(payload.fromUserId);
        activeCallsByUser.delete(payload.toUserId);
        await callPersistence.markTerminal(payload.callId, CallStatusEnum.cancelled, "cancelled").catch(() => undefined);
        emitToUser(payload.toUserId, VIDEO_CALL_EVENTS.CANCEL, payload);
    };

    const handleEnd = async (payload: CallEndPayload) => {
        if (!payload?.callId || !payload?.fromUserId || !payload?.toUserId) return;
        activeCallsByUser.delete(payload.fromUserId);
        activeCallsByUser.delete(payload.toUserId);
        await callPersistence
            .markTerminal(payload.callId, CallStatusEnum.ended, payload.reason || "ended")
            .catch(() => undefined);
        emitToUser(payload.toUserId, VIDEO_CALL_EVENTS.END, payload);
    };

    const handleTimeout = async (payload: CallTimeoutPayload) => {
        if (!payload?.callId || !payload?.fromUserId || !payload?.toUserId) return;
        activeCallsByUser.delete(payload.fromUserId);
        activeCallsByUser.delete(payload.toUserId);
        await callPersistence.markTerminal(payload.callId, CallStatusEnum.missed, "timeout").catch(() => undefined);
        emitToUser(payload.toUserId, VIDEO_CALL_EVENTS.TIMEOUT, payload);
    };

    const handleOffer = (payload: SessionDescriptionPayload) => {
        if (!payload?.callId || !payload?.toUserId) return;
        emitToUser(payload.toUserId, VIDEO_CALL_EVENTS.OFFER, payload);
    };

    const handleAnswer = (payload: SessionDescriptionPayload) => {
        if (!payload?.callId || !payload?.toUserId) return;
        emitToUser(payload.toUserId, VIDEO_CALL_EVENTS.ANSWER, payload);
    };

    const handleIceCandidate = (payload: IceCandidatePayload) => {
        if (!payload?.callId || !payload?.toUserId) return;
        emitToUser(payload.toUserId, VIDEO_CALL_EVENTS.ICE_CANDIDATE, payload);
    };

    socket.on(VIDEO_CALL_EVENTS.INVITE, handleInvite);
    socket.on(VIDEO_CALL_EVENTS.ACCEPT, handleAccept);
    socket.on(VIDEO_CALL_EVENTS.REJECT, handleReject);
    socket.on(VIDEO_CALL_EVENTS.CANCEL, handleCancel);
    socket.on(VIDEO_CALL_EVENTS.END, handleEnd);
    socket.on(VIDEO_CALL_EVENTS.TIMEOUT, handleTimeout);
    socket.on(VIDEO_CALL_EVENTS.OFFER, handleOffer);
    socket.on(VIDEO_CALL_EVENTS.ANSWER, handleAnswer);
    socket.on(VIDEO_CALL_EVENTS.ICE_CANDIDATE, handleIceCandidate);
};
