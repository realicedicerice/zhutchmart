import { SocksProxyAgent } from "socks-proxy-agent";

import { EventEmitter } from "events";

import io from "socket.io-client";

import { WebSocketServer } from "ws";

import { createServer } from "https";

import fetch from "node-fetch";

import { readFileSync } from "fs";

const ee = new EventEmitter();

// const sockets = new Map();
const departmentOrders = new Map();

const agent = new SocksProxyAgent("socks://127.0.0.1:20170");

const server = createServer({
  cert: readFileSync("./cert.pem"),
  key: readFileSync("./key.pem"),
  ca: readFileSync("./ca.pem"),
  requestCert: true,
  rejectUnauthorized: false,
});

const wss = new WebSocketServer({
  server,
});

server.listen(8443);

function ordersDiff(orders1, orders2) {
  return {
    added: orders2.filter(
      (order2) => !orders1.find((order1) => order1.code === order2.code)
    ),
    removed: orders1.filter(
      (order1) => !orders2.find((order2) => order1.code === order2.code)
    ),
  };
}

function getCities() {
  return fetch("https://api.lifemart.ru/api/cities/index", {
    agent,
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      "content-language": "ru",
      pragma: "no-cache",
      "sec-ch-ua": '"Chromium";v="125", "Not.A/Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Linux"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      sitenew: "1",
      source: "site-B",
      uuid: "e2d22168-af66-a30e-279c-131ae20dad8c",
      "x-api-key": "318660",
    },
  }).then((res) => res.json());
}

function getDepartmentIds(cities) {
  return cities.flatMap((city) => city.departments.map((d) => d.id)).toSorted();
}

async function init() {
  const departments = await getCities().then(getDepartmentIds);

  for (let department of departments) {
    const socket = io("wss://shop-bar-socket.lifemart.ru", {
      autoConnect: true,
      path: "",
      transports: ["websocket"],
      agent,
    });

    socket.on("message", ({ orders }) => {
      if (!orders) return;

      if (departmentOrders.has(department)) {
        const update = {
          department,
          diff: ordersDiff(departmentOrders.get(department), orders),
        };

        ee.emit("update", update);
      }

      departmentOrders.set(department, orders);
    });

    socket.on("error", (e) => console.log("\n\n", e, "\n\n"));

    socket.emit("setIdentifier", {
      clientKey: "shop-bar-display",
      identifier: department,
    });

    // sockets.set(department, socket);
  }
}

wss.on("connection", (socket) => {
  const handleUpdate = (update) => {
    socket.send(JSON.stringify(update));
  };

  ee.addListener("update", handleUpdate);

  socket.on("close", () => {
    ee.removeListener("update", handleUpdate);
  });
});

init();
