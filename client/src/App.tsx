import EventEmitter2 from "eventemitter2";

import { Map } from "./components/Map";
import { OrderLog } from "./components/OrderLog";

import { wsEventBus } from "./ws";

import "./index.css";

import { departmentIds } from "./data";

const eventBus = new EventEmitter2();

let visible: number[] = departmentIds.slice();

function setVisible(newVisible: number[]) {
  visible = newVisible;
}

wsEventBus.on("update", (update) => {
  if (!visible.includes(update.department)) return;

  eventBus.emit("update", update);
});

function App() {
  return (
    <>
      <div className="logoText">жуймарт</div>
      <div className="orderLog-container">
        <OrderLog eventBus={eventBus} />
      </div>
      <div style={{ width: "100vw", height: "100vh" }}>
        <Map eventBus={eventBus} onVisibleChange={setVisible} />
      </div>
    </>
  );
}

export default App;
