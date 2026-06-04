import { io } from "socket.io-client";

const socket = io("http://localhost:9999", {
  autoConnect: false, // manually connect
  transports: ["websocket"],
});

export default socket;
