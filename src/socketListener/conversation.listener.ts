import { Socket } from "socket.io";
import prisma from "../config/db.config";
import { getReceiverSocketId } from "../socket";
import { io } from "..";

type statusChangedToReadType = {
    userId?: string,
    receiverId?: string,
    conversation?: string,
    receiver?: string
}

type statusChangedToDeliveredType = {
    receiverId?: string,
    conversation?: string,
    receiver?: string
}



export const conversationListener = (socket: Socket) => {
    const getAllConv = ()=>{
        
    }    












    socket.on('get:allConv', getAllConv)
    // socket.on('message:delivered', statusChangedToDelivered)
}