import prisma from "../config/db.config";
import { Request, Response } from "express";
import AsyncHandler from "../middlewares/AsyncHandler";




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











export default {
    searchUser
}