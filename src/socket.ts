import { Server, Socket } from "socket.io"
import prisma from "./config/db.config";



interface CustomSocket extends Socket {
    room?: string
}



export const getReceiverSocketId = (receiverId: string) => {
    return userSocketMap[receiverId];
};

const userSocketMap: { [key: string]: string } = {}; // {userId: socketId}



export function setupSocket(io: Server) {
    // io.use((socket: CustomSocket, next) => {
    //     const room = socket.handshake.auth.room || socket.handshake.headers.room;
    //     if (!room) {
    //         return next(new Error('Invalid room, Please pass correct room id'))
    //     }
    //     socket.room = room;
    //     next();
    // })


    io.on("connection", (socket: CustomSocket) => {
        console.log("Client connected", socket.id);
        const userIdStr = socket.handshake.query.userId as string || "";
        console.log(userIdStr)
        if (!userIdStr) {
            userSocketMap[userIdStr] = socket.id;
        }

        // socket.join(socket.room!)

        socket.on("message", async (data) => {
            console.log("Server side message", data);
            // socket.broadcast.emit("message", data);
            await prisma.conversation.create({
                data: data
            })
            socket.to(socket?.room!).emit('message', data)
        })

        socket.on("disconnect", () => {
            delete userSocketMap[userIdStr];
            console.log("A user got disconnected", socket.id)
        })
    })
}