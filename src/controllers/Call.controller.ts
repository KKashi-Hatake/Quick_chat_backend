import { Request, Response } from "express";
import AsyncHandler from "../middlewares/AsyncHandler";
import prisma from "../config/db.config";
import { AuthUser } from "../custom-types";
import { getPresigned } from "../utils/getPresigned";

const getCallHistory = AsyncHandler(async (req: Request, res: Response) => {
    const user = req.user as AuthUser;
    const conversationId = (req.query.conversationId as string) || "";
    const limit = Math.min(50, Number(req.query.limit || 20));
    const cursor = (req.query.cursor as string) || "";

    const whereClause = {
        AND: [
            {
                OR: [
                    { callerUserId: user.id },
                    { receiverUserId: user.id },
                ],
            },
            conversationId ? { conversationId } : {},
            cursor ? { created_at: { lt: new Date(cursor) } } : {},
        ],
    };

    const calls = await prisma.call.findMany({
        where: whereClause,
        orderBy: { created_at: "desc" },
        take: limit,
        include: {
            caller: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    image: true,
                },
            },
            receiver: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    image: true,
                },
            },
            callerParticipant: {
                select: {
                    first_name: true,
                    last_name: true,
                },
            },
            receiverParticipant: {
                select: {
                    first_name: true,
                    last_name: true,
                },
            },
        },
    });

    const processedCalls = await Promise.all(
        calls.map(async (call) => {
            let callerImage = call.caller?.image || null;
            let receiverImage = call.receiver?.image || null;

            if (callerImage) {
                try {
                    callerImage = await getPresigned(callerImage);
                } catch (error) {
                    console.error("Failed to generate caller image presigned URL", error);
                }
            }

            if (receiverImage) {
                try {
                    receiverImage = await getPresigned(receiverImage);
                } catch (error) {
                    console.error("Failed to generate receiver image presigned URL", error);
                }
            }

            return {
                ...call,
                caller: call.caller
                    ? {
                        ...call.caller,
                        image: callerImage,
                    }
                    : call.caller,
                receiver: call.receiver
                    ? {
                        ...call.receiver,
                        image: receiverImage,
                    }
                    : call.receiver,
            };
        })
    );

    return res.status(200).json({
        success: true,
        message: "Call history fetched successfully.",
        data: processedCalls,
    });
});

export default {
    getCallHistory,
};
