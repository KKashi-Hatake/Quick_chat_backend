import prisma from "../config/db.config";
import { Request, Response } from "express";
import AsyncHandler from "../middlewares/AsyncHandler";
import { AuthUser, SearchChatsContactsType } from "../custom-types";
import { User } from "@prisma/client";
import { getPresigned } from "../utils/getPresigned";




const searchUser = AsyncHandler(async (req: Request, res: Response) => {
    const search = req.query.search || '';
    if (!search) {
        return res.status(400).json({ success: false, message: "Invalid Mobie Number." })
    }
    const user = await prisma.user.findUnique({
        where: { phone: search as string }
    })
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found." })
    }
    return res.status(200).json({ success: true, message: "User fetched successfully", user: user.id })
})



const createConversationParticipant = AsyncHandler(async (req: Request, res: Response) => {
    const { id, firstName, lastName } = req.body;
    const user = req?.user as User;
    if (!id || !(firstName || lastName)) {
        return res.status(400).json({ success: false, message: "Invalid payload." })
    }

    let convPartiPromise = prisma.conversationParticipants.findFirst({
        where: {
            userId: id,
            created_by: user.id,
        }
    })
    let partiPromise = prisma.user.findFirst({
        where: {
            id
        }
    })
    let [convParti, parti] = await Promise.all([convPartiPromise, partiPromise]);
    if (convParti) {
        return res.status(400).json({ success: false, message: "You already have this person in your contact list." });
    }
    if (!parti) {
        return res.status(400).json({ success: false, message: "User not found" })
    }
    convParti = await prisma.conversationParticipants.create({
        data: {
            userId: id as number,
            created_by: user?.id as number,
            first_name: firstName || "",
            last_name: lastName || "",
            image: parti.image || "",
            about: parti.about || ""
        }
    })
    if (!convParti) {
        return res.status(500).json({ success: false, message: "Failed to create conversation participant." })
    }
    if (convParti?.image) {
        convParti.image = await getPresigned(convParti?.image)
    }
    return res.status(200).json({ success: true, message: "User fetched successfully", convParti })
})


const searchChatsContacts = AsyncHandler(async (req: Request, res: Response) => {
    const searchTerm = req?.query?.search || "";
    const user = req?.user as User;
    if (!searchTerm) {
        return res.status(400).json({ success: false, message: "Invalid payload." })
    }
    const searchResults = await prisma.conversationParticipants.findMany({
        where: {
            created_by: user.id,
            OR: [
                {
                    first_name: {
                        contains: searchTerm as string,
                        mode: 'insensitive', // optional for case-insensitive match
                    },
                },
                {
                    last_name: {
                        contains: searchTerm as string,
                        mode: 'insensitive',
                    },
                },
            ],
        },
        include: {
            conversation: {
                include: {
                    messages: true
                }
            }
        }
    })
    let result: { chats: SearchChatsContactsType[], contacts: SearchChatsContactsType[] } = { chats: [], contacts: [] };
    if (searchResults) {
        const processedResults = await Promise.allSettled(
            searchResults.map(async (val) => {
                try {
                    val.image = val?.image ? await getPresigned(val.image) : val.image;
                } catch (e) {
                    console.error("Failed to get presigned URL", e);
                }
                return val;
            })
        );

        // Extract successful results only
        for (const resultItem of processedResults) {
            if (resultItem.status === 'fulfilled') {
                const val = resultItem.value;
                if (val.conversation === null) {
                    result.contacts.push(val);
                } else {
                    result.chats.push(val);
                }
            }
        }
    }
    return res.json({ success: true, message: "Chats and contacts fetched successfully.", result })
})








export default {
    searchUser,
    searchChatsContacts,

    createConversationParticipant
}