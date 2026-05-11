// features/dashboard/hooks/useNotifications.js
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import {
  getNotificationsAPI,
  markReadAPI,
  markAllReadAPI,
} from "../services/notificationServices";

const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    try {
      const res = await getNotificationsAPI();
      setNotifications(res.data);
    } catch (err) {
      console.error("Notifications fetch error:", err);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();
    // Join personal forwarder room for real-time notifications
    const socketUrl = process.env.REACT_APP_SOCKET_URL;
    if (!socketUrl) {
      console.error(
        "Missing REACT_APP_SOCKET_URL in environment. Notifications socket not connected.",
      );
      return;
    }

    socketRef.current = io(socketUrl);
    socketRef.current.emit("join-forwarder", userId);

    socketRef.current.on("new-notification", ({ notification }) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => socketRef.current?.disconnect();
  }, [userId]);

  const markRead = async (id) => {
    await markReadAPI(id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllRead = async () => {
    await markAllReadAPI();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return { notifications, unreadCount, markRead, markAllRead };
};

export default useNotifications;
