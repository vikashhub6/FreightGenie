// features/shipment/hooks/useSocket.js
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const useSocket = (shipmentId, onStatusUpdate) => {
  const socketRef = useRef(null);
  const callbackRef = useRef(onStatusUpdate); // ✅ stale closure fix
  const [liveLog, setLiveLog] = useState([]);

  // Always keep callbackRef updated without re-connecting socket
  useEffect(() => {
    callbackRef.current = onStatusUpdate;
  }, [onStatusUpdate]);

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
      if (callbackRef.current) callbackRef.current(data); // ✅ hamesha latest callback
    });

    return () => socketRef.current?.disconnect();
  }, [shipmentId]); // socket sirf shipmentId change pe reconnect kare

  return { liveLog };
};

export default useSocket;