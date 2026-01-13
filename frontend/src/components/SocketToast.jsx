import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import socket from "../utils/socket";

export default function SocketToast() {
  useEffect(() => {
    socket.on("receive_notification", (data) => {
      toast.info(data.message);
    });

    return () => {
      socket.off("receive_notification");
    };
  }, []);

  return <ToastContainer position="top-right" autoClose={4000} />;
}
