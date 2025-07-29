import { Request, Response } from "express";
import AsyncHandler from "../middlewares/AsyncHandler";
import { AuthUser, IConversation, MessageStatusType, SearchChatsContactsType } from "../custom-types";
import prisma from "../config/db.config";
import { getPresigned } from "../utils/getPresigned";





const getAllConv = AsyncHandler(async (req: Request, res: Response) => {
    const user = req?.user as AuthUser;
    const participants = await prisma.conversationParticipants.findMany({
        where: {
            created_by: user.id,
            conversationId: {
                not: null
            }
        },
        select: {
            conversation: {
                include: {
                    messages: {
                        orderBy: { created_at: 'desc' },
                        take: 1,
                        include: {
                            MessageStatus: true,
                            sender: true
                        }
                    },
                },
            },
            first_name: true,
            last_name: true,
            image: true,
            userId: true,
            id: true,
        },
    });
    let conversationParticipants: IConversation[] = [];
    participants.forEach((val) => {
        if (val.conversation !== null) {
            conversationParticipants.push(val);
        }
    })
    let result: IConversation[] = [];
    let unreadCountsPromise: Promise<MessageStatusType[]>[] = [];
    if (conversationParticipants.length > 0) {
        const processedParticipantsPromise = conversationParticipants.map(async (val) => {
            unreadCountsPromise.push(prisma.messageStatus.findMany({
                where: {
                    status: {
                        not: 'read',
                    },
                    message: {
                        is: { senderId: val.id },
                    },
                },
                include: {
                    message: {
                        select: {
                            conversationId: true,
                        },
                    },
                },
            }))
            return val?.image ? await getPresigned(val.image) : val.image;
        })

        const [processedParticipants, unreadCounts] = await Promise.all([
            Promise.allSettled(processedParticipantsPromise),
            Promise.allSettled(unreadCountsPromise)
        ]);

        const grouped: { [key: string]: number } = {};
        if (unreadCounts[0].status === 'fulfilled') {
            for (const msgStatus of unreadCounts[0].value) {
                const convId = msgStatus.message.conversationId;
                if (!convId) continue;
                if (!grouped[convId]) grouped[convId] = 0;
                grouped[convId]++;
            }
        }

        // Extract successful results only
        result = conversationParticipants.map((record, index) => ({
            ...record,
            unreadCount: record?.conversation?.id ? grouped[record.conversation.id] : 0,
            image:
                processedParticipants[index].status === "fulfilled"
                    ? processedParticipants[index].value
                    : null, // or a fallback placeholder
        }));

    }
    return res.json({ success: true, message: "Participants fetched successfully.", data: result })
})








export default {
    getAllConv
}