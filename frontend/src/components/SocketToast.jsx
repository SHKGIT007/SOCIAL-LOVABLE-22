import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import socket from "../utils/socket";

export default function SocketToast() {
  useEffect(() => {
    console.log("🔔 SocketToast mounted, listening for notifications");

    socket.on("receive_notification", (data) => {
      console.log("📨 Notification received:", data);
      toast.success(data.message, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    return () => {
      socket.off("receive_notification");
    };
  }, []);

  return <ToastContainer position="top-right" autoClose={4000} />;
}
