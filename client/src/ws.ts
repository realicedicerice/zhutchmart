import EventEmitter2 from "eventemitter2";

const wsEventBus = new EventEmitter2();

const wsUrl =
  new URLSearchParams(location.search).get("ws") || "ws://127.0.0.1:8080";

const ws = new WebSocket(wsUrl);

ws.onmessage = ({ data }) => {
  const event = JSON.parse(data);

  wsEventBus.emit("update", event);
};

export { wsEventBus };
