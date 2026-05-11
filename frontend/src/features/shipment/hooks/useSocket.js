// features/shipment/hooks/useSocket.js
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const useSocket = (shipmentId, onStatusUpdate) => {
  const socketRef = useRef(null);
  const [liveLog, setLiveLog] = useState([]);

  useEffect(() => {
    if (!shipmentId) return;
    const socketUrl = process.env.REACT_APP_SOCKET_URL;
    if (!socketUrl) {
      console.error(
        "Missing REACT_APP_SOCKET_URL in environment. Socket not connected.",
      );
      return;
    }

    socketRef.current = io(socketUrl);
    socketRef.current.emit("join-shipment", shipmentId);

    socketRef.current.on("status", (data) => {
      setLiveLog((prev) => [
        { ...data, time: new Date().toLocaleTimeString() },
        ...prev,
      ]);
      if (onStatusUpdate) onStatusUpdate(data);
    });

    return () => socketRef.current?.disconnect();
  }, [shipmentId]);

  return { liveLog };
};

export default useSocket;
