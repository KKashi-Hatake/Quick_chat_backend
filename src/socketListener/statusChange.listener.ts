import { Socket } from "socket.io";
import prisma from "../config/db.config";
import { getReceiverSocketId } from "../socket";
import { io } from "..";

type statusChangedToReadType = {
    userId?: string,
    receiverId?: string,
    conversation?: string,
    receiver?: string
}

type statusChangedToDeliveredType = {
    receiverId?: string,
    conversation?: string,
    receiver?: string
}



export const statusChanged = (socket: Socket) => {
    const statusChangedToRead = async (data: statusChangedToReadType) => {
        if (!data?.conversation ||
            !data?.receiver ||
            !data?.userId ||
            !data?.receiverId) {
            console.error('Something went wrong while marking all the unread messages as read.')
            return;
        }
        const readerSocketId = getReceiverSocketId(data.userId); //who is reading the message
        const senderSocketId = getReceiverSocketId(data.receiverId); //who has send these messages
        const messages = await prisma.messageStatus.updateMany({
            where: {
                message: {
                    conversationId: data.conversation,
                    senderId: data.receiver, // the one reading it
                },
                status: {
                    not: 'read',
                },
            },
            data: {
                status: 'read',
                updated_at: new Date(),
            },
        });
        if (senderSocketId) {
            io.to(senderSocketId).emit('ack:message:read:batch', { convId: data.conversation })
        }
        if (readerSocketId) {
            io.to(readerSocketId).emit('message:read:confirmation', { convId: data.conversation })
        }
    }

    const statusChangedToDelivered = async (data: statusChangedToDeliveredType) => {
        if (!data?.conversation ||
            !data?.receiver ||
            !data?.receiverId) {
            console.error('Something went wrong while marking all the unread messages as delivered.')
            return;
        }
        const senderSocketId = getReceiverSocketId(data.receiverId); // sender's socket id to emit an event to him/her that the latest msg is delivered
        const message = await prisma.messageStatus.updateMany({
            where: {
                message: {
                    conversationId: data.conversation,
                    senderId: data.receiver, // the one reading it
                },
                status: 'sent',
            },
            data: {
                status: 'delivered',
                updated_at: new Date(),
            },
        });
        
        if (senderSocketId) {
            io.to(senderSocketId).emit('ack:message:delivered', { convId: data.conversation })
        }
    }












    socket.on('message:read', statusChangedToRead)
    socket.on('message:delivered', statusChangedToDelivered)
}