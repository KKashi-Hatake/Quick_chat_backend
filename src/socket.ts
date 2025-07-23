import { Server, Socket } from "socket.io"
import prisma from "./config/db.config";
import { statusChanged } from "./socketListener/statusChange";



interface CustomSocket extends Socket {
    room?: string
}



export const getReceiverSocketId = (receiverId: string) => {
    return userSocketMap[receiverId];
};

const userSocketMap: { [key: string]: string } = {}; // {userId: socketId}



export function setupSocket(io: Server) {


    io.on("connection", (socket: CustomSocket) => {
        const userIdStr = socket.handshake.query.userId as string || "";
        console.log("Client:", userIdStr, 'socket:', socket.id);
        if (userIdStr) {
            userSocketMap[userIdStr] = socket.id;
        }

        statusChanged(socket);

        socket.on("disconnect", () => {
            delete userSocketMap[userIdStr];
            // console.log("A user got disconnected", socket.id)
        })
    })
}

