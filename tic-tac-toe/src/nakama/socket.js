import { Client } from "@heroiclabs/nakama-js";

let client = null;
let socket = null;
let session = null;


export const initClient = () => {
  client = new Client("defaultkey", "127.0.0.1", "7350", false);
};

export const connectSocket = async (userSession) => {
  session = userSession;

  socket = client.createSocket();

  await socket.connect(session, true);

  console.log("✅ Socket connected for:", session.user_id);
};

export const getSocket = () => socket;
export const getClient = () => client;
export const getSession = () => session;