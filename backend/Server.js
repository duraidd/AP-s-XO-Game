import morgan from "morgan";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

const app = express();

app.use(express.json());
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Update with your React app's URL
        methods: ["GET", "POST"],
    },
});


io.on("connection", (socket) => {
    console.log("A user connected");
  
    socket.on("makeMove", (data) => {
      io.emit("moveMade", data);
    });
  
    socket.on("resetGame", (newGame) => {
      io.emit("gameReset", newGame);
    });
  
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
  


const port = 9999;

app.get("/", (req, res) => {
    res.status(200).send("Tic Tac Toe Game Server");
  });


app.use(morgan("common"));

server.listen(port,()=>{
    console.log(`Server running at http://localhost:${port}`);
});


export default app;
