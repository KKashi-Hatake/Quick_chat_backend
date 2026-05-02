import { Server, Socket } from "socket.io"
import { statusChanged } from "./socketListener/statusChange.listener";
import { conversationListener } from "./socketListener/conversation.listener";



interface CustomSocket extends Socket {
    room?: string
}



export const getReceiverSocketId = (receiverId: string) => {
    return userSocketMap.get(receiverId);
};

const userSocketMap: Map<string, Set<string>> = new Map(); // {userId: socketId}



export function setupSocket(io: Server) {


    io.on("connection", (socket: CustomSocket) => {
        const userIdStr = socket.handshake.query.userId as string || "";
        console.log("Client:", userIdStr, 'socket:', socket.id);
        if (userIdStr) {
            if (!userSocketMap.has(userIdStr)) {
                userSocketMap.set(userIdStr, new Set());
            }
            userSocketMap.get(userIdStr)?.add(socket.id);
        }

        statusChanged(socket);
        conversationListener(socket);

        socket.on("disconnect", () => {
            const socketIds = userSocketMap.get(userIdStr);
            if (socketIds) {
                socketIds.delete(socket.id);
                if (socketIds.size === 0) {
                    userSocketMap.delete(userIdStr);
                }
            }
            // console.log("A user got disconnected", socket.id)
        })
    })
}

