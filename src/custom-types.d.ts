import { Request } from "express";



export interface AuthUser {
    id: number;
    name: string;
    phone: string;

}


export interface User {
    id: number,
    name: string,
    image?: string | null,
    phone: string,
    password: sring,
    created_at: Date,
    last_seen?: Date | null,
    about?: string | null,
    verificationId: number,
    twoFAId?: number | null
}


declare module "express-serve-static-core" {
    interface Request {
        user?: AuthUser;
    }
}