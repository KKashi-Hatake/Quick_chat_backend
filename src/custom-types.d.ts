import { MessageTypeEnum, TypeEnum } from "@prisma/client";
import { Request } from "express";



export interface AuthUser {
    id: number;
    name: string;
    phone: string;
    image: string | null
    about: string | null
}


export interface User {
    id: number,
    name: string,
    image?: string | null,
    phone: string,
    password: sring,
    created_at: Date,
    updated_at: Date,
    last_seen?: Date | null,
    about?: string | null,
    verificationId: number,
    twoFAId?: number | null
}

export type ConversationType = {
    id: number
    name: string | null
    description: string | null
    created_by: number
    avatar: string | null
    type: string
    created_at: Date,
    message?: MessageType[] | null
}


export type SearchChatsContactsType = {
    id: number
    first_name?: string | null
    last_name?: string | null
    conversationId: number | null
    conversation?: ConversationType | null
    image?: string | null
    userId: number
    created_at: Date
    updated_at: Date
    role: string
    created_by: number
}


export type MessageType = {
    id: number
    content: string
    senderId: number
    conversationId: number
    messageType: string
    mediaUrl?: string
    created_at: Date
    is_deleted: boolean
}

export interface IConversation {
    first_name?: string | null
    last_name?: string | null
    image?: string | null
    conversation: ConversationType | null
}

export type MessagePayloadType = {
    userId: number,
    msg: string
    convType: TypeEnum,
    partiId: number,
    mediaUrl: string,
    type: MessageTypeEnum
}


declare module "express-serve-static-core" {
    interface Request {
        user?: AuthUser;
    }
}