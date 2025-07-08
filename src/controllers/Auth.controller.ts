import { Request, Response } from "express";
import prisma from "../config/db.config";
import jwt from 'jsonwebtoken'
import sendSMS from "../services/twilio/sendSMS";
import { getPresigned } from "../utils/getPresigned";



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

type AllSettledType = { status: string, value?: any, reason?: string }



async function login(req: Request, res: Response) {
    try {
        const body: LoginPayloadType = req.body;
        let findUser = await prisma.user.findUnique({
            where: {
                phone: body.mobile,
            }
        }
        );
        if (!findUser) {
            return res.status(404).json({ message: "User not found!" })
        }
        if (findUser?.password !== body.password) {
            return res.status(401).json({ message: "Invalid password!" })
        }
        let JWTPayload = {
            name: findUser.name,
            phone: findUser.phone,
            id: findUser.id,
        }
        const token = jwt.sign(JWTPayload, process.env.JWT_SECRET_KEY!, {
            expiresIn: '1d'
        });
        let image = null;
        if (findUser?.image) {
            image = await getPresigned(findUser?.image)
        }
        const { password, ...user } = findUser;
        return res.json({
            message: 'Logged in successfully',
            user: {
                ...user,
                image,
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
        if (findUser) {
            return res.status(400).json({ message: "User already exists!" })
        }

        let otp = Math.ceil(Math.random() * 1000000);
        const verification = await prisma.verification.create({ data: { otp } });
        const newUser = await prisma.user.create({ data: { name: body.name, phone: body.mobile, password: body.password, image: body.image, verificationId: verification.id } });
        // const smsPromise = sendSMS(`+91${body?.mobile}`, otp);
        // const [newUser, smsResponse]: AllSettledType[] = await Promise.allSettled([findUserPromise, smsPromise]);

        // if (newUser?.status === "rejected") {
        //     return res.status(500).json({ message: "Something went wrong, Please try again!", reason: newUser?.reason })
        // }


        return res.json({
            success: true,
            message: 'An OTP is sent to your mobile number',
            user: {
                ...newUser,
            }
        })
    } catch (error) {
        console.log("error while singing up", error)
        return res.status(500).json({ message: "Something went wrong, Please try again!" })
    }
}


async function verifyOTP(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { otp } = req.query;
        if (!id) {
            return res.status(400).json({ message: "Invalid request!" })
        }
        const user = await prisma.user.findUnique({
            where: { id: id },
            include: {
                verification: true, // this assumes a `verification` relation exists in your Prisma schema
            },
        })
        if (!user) {
            return res.status(404).json({ message: "User not found!" })
        }

        if (Number(otp) === user?.verification?.otp) {
            const verification = await prisma.verification.update({
                where: { id: user?.verification?.id },
                data: {
                    status: true
                },
            })
            return res.json({ success: true, message: "OTP verified successfully!" })
        } else {
            return res.status(400).json({ success: false, message: "Invalid OTP!" })
        }


    } catch (error) {
        console.log("Error while verifing otp", error)
        return res.status(500).json({ message: "Something went wrong, while verifying OTP!" })
    }
}



export default {
    login,
    signup,
    verifyOTP
}