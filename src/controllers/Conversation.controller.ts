import { Request, Response } from "express";
import AsyncHandler from "../middlewares/AsyncHandler";
import { AuthUser, IConversation, SearchChatsContactsType } from "../custom-types";
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
    if (participants) {
        const processedResults = await Promise.allSettled(
            participants.map(async (val) => {
                try {
                    val.image = val?.image ? await getPresigned(val.image) : val.image;
                } catch (e) {
                    console.error("Failed to get presigned URL", e);
                }
                return val;
            })
        );
        let result: IConversation[] = [];
        // Extract successful results only
        for (const resultItem of processedResults) {
            if (resultItem.status === 'fulfilled') {
                const val = resultItem.value;
                if (val.conversation !== null) {
                    result.push(val);
                }
            }
        }

    }
    return res.json({ success: true, message: "Participants fetched successfully.", data: participants })


})










export default {
    getAllConv
}