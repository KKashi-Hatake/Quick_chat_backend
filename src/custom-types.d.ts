import { MessageTypeEnum, TypeEnum } from "@prisma/client";
import { Request } from "express";



export interface AuthUser {
    id: string;
    name: string;
    phone: string;
    image: string | null
    about: string | null
}


export interface User {
    id: string,
    name: string,
    image?: string | null,
    phone: string,
    password: sring,
    created_at: Date,
    updated_at: Date,
    last_seen?: Date | null,
    about?: string | null,
    verificationId: string,
    twoFAId?: string | null
}

export type ConversationType = {
    id: string
    name: string | null
    description: string | null
    created_by: string
    avatar: string | null
    type: string
    created_at: Date,
    message?: MessageType[] | null
}


export type SearchChatsContactsType = {
    id: string
    first_name?: string | null
    last_name?: string | null
    conversationId: string | null
    conversation?: ConversationType | null
    image?: string | null
    userId: string
    created_at: Date
    updated_at: Date
    role: string
    created_by: string
}


export type MessageType = {
    id: string
    content: string
    senderId: string
    conversationId: string
    messageType: string
    mediaUrl?: string
    created_at: Date
    is_deleted: boolean
}

export interface IConversation {
    id:string
    first_name?: string | null
    last_name?: string | null
    image?: string | null
    conversation: ConversationType | null
}

export type MessagePayloadType = {
    userId: string,
    msg: string
    convType: TypeEnum,
    partiId: string,
    mediaUrl: string,
    type: MessageTypeEnum
}


export type MessageStatusType = {
      id: string,
      messageId: string,
      status: string,
      created_at: Date,
      updated_at: Date,
      message:  { conversationId: string | null; } 
}







declare module "express-serve-static-core" {
    interface Request {
        user?: AuthUser;
    }
}