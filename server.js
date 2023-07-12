import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import knex from "knex";
import moment from "moment";

const connection = {
    client: "pg",
    connection: {
        host: "localhost",
        user: "blaz",
        password: "chatapp123",
        database: "chat-app-db",
    },
};

const db = knex(connection);

const app = express();

// set static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(join(__dirname, "public")));

// create new server with socket.io
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.json());

// API to get all chat rooms
app.get("/api/rooms", async (req, res) => {
    try {
        const rooms = await db("chat_rooms").select("id", "name");
        res.json(rooms);
    } catch (error) {
        console.error("Error getting chat rooms:", error);
        res.status(500).json({ message: "Failed to get chat rooms" });
    }
});

// API for creating new room
app.post("/api/rooms", async (req, res) => {
    const { roomName } = req.body;

    // Validate the roomName field
    if (!roomName) {
        return res.status(400).json({ message: "Room name is required" });
    }

    try {
        const newRoom = await db("chat_rooms")
            .insert({ name: roomName })
            .returning("*");

        res.status(201).json(newRoom);
    } catch (error) {
        console.error("Error creating new room:", error);
        res.status(500).json({ message: "Failed to create new room" });
    }
});

// API for joining a room
app.post("/api/join", async (req, res) => {
    const { roomId } = req.body;

    try {
        // check if the roomId exists in the database
        const room = await db("chat_rooms").where("id", roomId).first();
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // send a success response
        res.status(200).json({ message: "Joined room successfully" });
    } catch (error) {
        console.error("Error joining room:", error);
        res.status(500).json({ message: "Failed to join room" });
    }
});

function formatMessage(username, text) {
    return {
        username,
        text,
        time: moment().format("hh:mm a"),
    };
}

const botName = "Chat Bot";

// Array to store users in a room
const users = [];

// Fetch the room name from the database and emit roomUsers
async function emitRoomUsers(roomId) {
    try {
        const roomData = await db("chat_rooms").where("id", roomId).first();
        if (!roomData) {
            throw new Error("Room not found");
        }

        const { name } = roomData;

        // Emit the room name and users to the client
        io.to(roomId).emit("roomUsers", {
            room: name,
            users: users.filter((u) => u.room === roomId),
        });
    } catch (error) {
        console.error("Error getting room data:", error);
    }
}

// run when user connects
io.on("connection", (socket) => {
    socket.on("joinRoom", async ({ room, username }) => {
        const user = { id: socket.id, room, username };

        socket.join(user.room);
        users.push(user);

        socket.emit("message", formatMessage(botName, "Welcome to chat"));

        // Fetch the room name from the database and emit roomUsers
        emitRoomUsers(room);

        socket.to(user.room).emit(
            "message",
            formatMessage(botName, `${user.username} has joined the chat`)
        );
    });

    // listen to chatMessage
    socket.on("chatMessage", (msg) => {
        const user = users.find((u) => u.id === socket.id);
        if (user) {
            io.to(user.room).emit("message", formatMessage(user.username, msg));
        }
    });

    // run when user disconnects
    socket.on("disconnect", () => {
        const userIndex = users.findIndex((u) => u.id === socket.id);
        if (userIndex !== -1) {
            const user = users[userIndex];
            users.splice(userIndex, 1);

            io.to(user.room).emit(
                "message",
                formatMessage(botName, `${user.username} has left the chat`)
            );

            // Emit the room name and users to the client
            emitRoomUsers(user.room);
        }
    });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () =>
    console.log(`Server is running on port ${PORT}`)
);
