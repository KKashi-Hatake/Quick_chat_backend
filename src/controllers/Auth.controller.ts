import { Request, Response } from "express";
import prisma from "../config/db.config";
import jwt from 'jsonwebtoken'



interface LoginPayloadType {
    mobile: string,
    password: string,
}

interface SignupPayloadType {
    name: string,
    mobile: string,
    image?: string
    password: string
}



async function login(req: Request, res: Response) {
    try {
        const body: LoginPayloadType = req.body;
        console.log(body)
        let findUser = await prisma.user.findUnique({
            where: {
                phone: body.mobile,
            }
        }
        );
        if (!findUser) {
            return res.status(404).json({ message: "User not found!" })
        }
        let JWTPayload = {
            name: findUser.name,
            phone: findUser.phone,
            id: findUser.id,
        }
        const token = jwt.sign(JWTPayload, process.env.JWT_SECRET_KEY!, {
            expiresIn: '1d'
        });
        return res.json({
            message: 'Logged in successfully',
            user: {
                ...findUser,
                token: `Bearer ${token}`
            }
        })
    } catch (error) {
        return res.status(500).json({ message: "Something went wrong, Please try again!" })
    }
}

async function signup(req: Request, res: Response) {
    try {
        const body: SignupPayloadType = req.body;
        let findUser = await prisma.user.findFirst({
            where: {
                phone: body.mobile,
            }
        }
        );
        if (!findUser) {
            findUser = await prisma.user.create({ data: { name: body.name, phone: body.mobile, password: body.password, image: body.image } })
        } else {
            return res.status(400).json({ message: "User already exists!" })
        }

        return res.json({
            success: true,
            message: 'Registered successfully',
            user: {
                ...findUser,
            }
        })
    } catch (error) {
        console.log("error while singing up", error)
        return res.status(500).json({ message: "Something went wrong, Please try again!" })
    }
}




export default {
    login,
    signup
}