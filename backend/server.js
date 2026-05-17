require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL, methods: ["GET", "POST"] }
});

connectDB();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://freight-genie.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.options("*", cors({ origin: true, credentials: true }));

app.use(express.json());

// Socket.io setup
const forwarderSockets = {};
io.on("connection", (socket) => {
  socket.on("join-forwarder", (userId) => {
    forwarderSockets[userId] = socket.id;
    console.log(`Forwarder ${userId} connected`);
  });
  socket.on("join-shipment", (shipmentId) => {
    socket.join(shipmentId);
  });
  socket.on("disconnect", () => {
    Object.keys(forwarderSockets).forEach(k => {
      if (forwarderSockets[k] === socket.id) delete forwarderSockets[k];
    });
  });
});

// Make io & emitToForwarder available in controllers
app.set("io", io);
app.set("emitToForwarder", (userId, event, data) => {
  const socketId = forwarderSockets[userId];
  if (socketId) io.to(socketId).emit(event, data);
});

// Routes
app.use("/api/auth",          require("./routes/authRoutes"));
app.use("/api/shipments",     require("./routes/shipmentRoutes"));
app.use("/api/compliance",    require("./routes/complianceRoutes"));
app.use("/api/documents",     require("./routes/documentRoutes"));
app.use("/api/email",         require("./routes/emailRoutes"));
app.use("/api/exporter",      require("./routes/exporterRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

const PORT = process.env.PORT || 5123;
server.listen(PORT, () => console.log(`Server running on port ${PORT}!`));