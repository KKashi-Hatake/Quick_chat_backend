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


    io.on("connection", (socket: CustomSocket) => {
        console.log("Client connected", socket.id);
        const userIdStr = socket.handshake.query.userId as string || "";
        console.log(userIdStr)
        if (userIdStr) {
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


// await prisma.messageStatus.updateMany({
//   where: {
//     message: {
//       conversationId: convoId,
//       receiverId: participantId, // the one reading it
//     },
//     status: {
//       not: 'read',
//     },
//   },
//   data: {
//     status: 'read',
//     updated_at: new Date(),
//   },
// });
