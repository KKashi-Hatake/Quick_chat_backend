import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthUser } from "../custom-types";
import AsyncHandler from "./AsyncHandler";
import prisma from "../config/db.config";



export const isAuthenticated = AsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const authorization = req?.headers?.authorization as string;
    const token = authorization && authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const secret = process.env.JWT_SECRET_KEY;

    if (!secret) {
        throw new Error('JWT_SECRET_KEY is not defined in environment variables');
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as AuthUser;
        const user = await prisma.user.findFirst({
            where: {
                id: decoded.id,
            }
        });
        if (!user) {
            console.log("User not found while verifying token");
            return res.status(404).json({ message: 'Unauthorized access.' });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token expired or invalid' });
    }
});