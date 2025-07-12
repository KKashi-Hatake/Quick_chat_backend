import { Request, Response } from "express";
import prisma from "../config/db.config";
import AsyncHandler from "../middlewares/AsyncHandler";
import { MessageStatusEnum, MessageTypeEnum } from '@prisma/client'
import { MessagePayloadType } from "../custom-types";
import { getReceiverSocketId } from "../socket";
import { io } from "..";



const sendMsg = AsyncHandler(async (req: Request, res: Response) => {
    const { userId, msg, convType = "normal", partiId, mediaUrl, type }: MessagePayloadType = req.body;
    const user = req.user
    if (!userId || !msg) return res.status(400).json({ error: "convId and msg are required" }); ////////Need to add joi for schema validation
    let convParti = await prisma.conversationParticipants.findFirst({
        where: {
            userId: user!.id,
            created_by: userId
        }
    })

    const receiverSocketId = getReceiverSocketId(userId);
    let conversation;
    let message;
    if (convParti) {
        // finding conversation between two users
        conversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    {
                        participants: {
                            some: {
                                userId: userId,
                            },
                        },
                    },
                    {
                        participants: {
                            some: {
                                userId: user!.id,
                            },
                        },
                    },
                ],
            },
            include: {
                participants: true,
            },
        });
        if (conversation) {
            message = await prisma.message.create({
                data: {
                    content: msg,
                    senderId: convParti.id,
                    receiverId: partiId,
                    conversationId: conversation.id,
                    messageType: type || 'text',
                    mediaUrl: type !== 'text' ? mediaUrl : null,
                    MessageStatus: {
                        create: {
                            status: 'sent'
                        }
                    }
                },
                include: {
                    MessageStatus: true,
                    sender: {
                        select: {
                            userId: true
                        }
                    }
                }
            });
            await prisma.conversation.update({
                where: { id: conversation.id },
                data: { updated_at: new Date() }
            });
            if (receiverSocketId) {
                console.log('here')
                io.to(receiverSocketId).emit("message", { convParti, message });
            }
            return res.json({ success: true, message: "Message Sent Successfully", msg: message });

        } else {
            conversation = await prisma.conversation.create({
                data: {
                    created_by: user!.id,
                    type: convType,
                    messages: {
                        create: {
                            content: msg,
                            receiverId: partiId,
                            senderId: convParti.id,
                            messageType: type || 'text',
                            mediaUrl: type !== 'text' ? mediaUrl : null,
                            MessageStatus: {
                                create: {
                                    status: 'sent'
                                }
                            }
                        }
                    }
                },
                include: {
                    messages: {
                        include: {
                            MessageStatus: true // if you also want status info
                        }
                    }
                }
            })
            await prisma.conversationParticipants.updateMany({
                where: {
                    OR: [
                        { id: partiId },
                        { id: convParti.id },
                    ],
                },
                data: {
                    conversationId: conversation.id,
                },
            });
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newMessage", { convParti, message: conversation.messages[0] });
            }
            return res.json({ success: true, message: "Message Sent Successfully", msg: conversation.messages[0] });
        }
    } else {
        const { newMsg, updatedConvParti, conversation, convParti } = await prisma.$transaction(async (tx) => {
            const conversation = await tx.conversation.create({
                data: {
                    created_by: user!.id,
                    type: convType,
                }
            });

            const convParti = await tx.conversationParticipants.create({
                data: {
                    userId: user!.id,
                    created_by: userId,
                    first_name: user?.phone,
                    last_name: "",
                    image: user?.image,
                    about: user?.about || "",
                    conversationId: conversation.id
                }
            });

            const newMsg = await tx.message.create({
                data: {
                    content: msg as string,
                    messageType: type || MessageTypeEnum.text,
                    mediaUrl: type !== 'text' ? mediaUrl : null,
                    senderId: convParti.id,
                    receiverId: partiId,
                    conversationId: conversation.id,
                    MessageStatus: {
                        create: {
                            status: MessageStatusEnum.sent,
                        }
                    }
                },
                include: {
                    MessageStatus: true
                }
            });

            const updatedConvParti = await tx.conversationParticipants.update({
                where: {
                    id: partiId
                },
                data: {
                    conversationId: conversation.id
                }
            });

            // return anything you need here
            return { newMsg, updatedConvParti, conversation, convParti };
        });
        if (!newMsg || !updatedConvParti || !conversation || !convParti) {
            return res.status(400).json({ success: false, message: "Message Not Sent, Someting went wrong!" })
        }
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newConv", { convParti, message: newMsg });
        }
        return res.json({ success: true, message: "Message Sent Successfully", msg: newMsg });
    }
})


const getAllMessages = AsyncHandler(async (req: Request, res: Response) => {
    const convId = req.params.id || "";
    const limit = parseInt(req.query.limit as string || '10'); // default limit to 10 if not provided
    const cursor = req.query.cursor as string || ''; // default limit to 10 if not provided

    if (!convId) return res.status(400).json({ error: "convId is required" });
    const messages = await prisma.message.findMany({
        where: {
            conversationId: convId,
            ...(cursor ? { created_at: { lt: new Date(cursor as string) } } : {}) // get older than cursor
        },
        include: {
            MessageStatus: true,
            sender: {
                select: {
                    userId: true
                }
            }
        },
        take: Number(limit),
        orderBy: {
            created_at: 'desc'
        }
    })

    return res.json({ success: true, message: "Messages fetched successfully.", data: messages });
})



export default {
    sendMsg,
    getAllMessages
};