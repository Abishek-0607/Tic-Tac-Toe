import { Client } from "@heroiclabs/nakama-js";

let client = null;
let socket = null;
let session = null;


export const initClient = () => {
  client = new Client("defaultkey", "localhost", "7350", false);
};

export const connectSocket = async (userSession) => {
  session = userSession;

  socket = client.createSocket();

  await socket.connect(session, true);

  console.log("✅ Socket connected for:", session.user_id);
};

export const restoreSession = () => {
  const stored = localStorage.getItem("session");

  if (!stored) return null;

  return JSON.parse(stored);
};

export const getSocket = () => socket;
export const getClient = () => client;
export const getSession = () => session;
export const getUserId = () => {
  return session?.user_id;
};
