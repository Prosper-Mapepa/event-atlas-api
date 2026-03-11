import http from "http";
import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "./config/index.js";
import { routes } from "./routes/index.js";
import { setSocketIo } from "./socket.js";
import type { AuthUser } from "./types/index.js";

const uploadsPath = path.join(process.cwd(), config.uploadDir);
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

const app = express();

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(uploadsPath));

app.use("/api", routes);

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: { origin: config.frontendUrl, credentials: true },
});

io.use((socket, next) => {
  const token =
    (socket.handshake.auth?.token as string) ||
    (socket.handshake.query?.token as string);
  if (!token) {
    next(new Error("Missing token"));
    return;
  }
  try {
    const payload = jwt.verify(token, config.jwt.secret) as AuthUser & { iat?: number; exp?: number };
    socket.data.userId = payload.id;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.data.userId as string;
  if (userId) {
    socket.join(`user:${userId}`);
  }
});

setSocketIo(io);

server.listen(config.port, () => {
  console.log(`EventAtlas API running at http://localhost:${config.port}`);
});
