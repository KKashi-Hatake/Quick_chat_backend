import prisma from "../config/db.config";
import { Request, Response } from "express";
import AsyncHandler from "../middlewares/AsyncHandler";
import { AuthUser } from "../custom-types";
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










export default {
    searchUser,
    createConversationParticipant
}