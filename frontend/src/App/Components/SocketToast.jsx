import { useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import socket from "../utils/socket";

export default function SocketToast() {
  const listenerRef = useRef(null);

  useEffect(() => {

    // Remove previous listener if it exists to prevent duplicates
    if (listenerRef.current) {
      socket.off("receive_notification", listenerRef.current);
    }

    // Create new listener function
    const handleNotification = (data) => {
      toast.success(data.message, {
        position: "top-right",
        autoClose: 5000,
      });
    };

    // Store reference to listener
    listenerRef.current = handleNotification;

    // Add the listener
    socket.on("receive_notification", handleNotification);

    // Cleanup
    return () => {
      socket.off("receive_notification", handleNotification);
    };
  }, []);

  return <ToastContainer position="top-right" autoClose={4000} />;
}
