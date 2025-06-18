import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthUser } from "../custom-types";



export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!);
        console.log(decoded);
        req.user = decoded as AuthUser;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token expired or invalid' });
    }
};