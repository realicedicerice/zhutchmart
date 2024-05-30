import React, {
  createRef,
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import EventEmitter2 from "eventemitter2";

import { TransitionGroup, CSSTransition } from "react-transition-group";

import { IOrder } from "../interfaces/IOrder";
import { IUpdate } from "../interfaces/IUpdate";

const Order = forwardRef<HTMLDivElement, { order: IOrder }>(
  ({ order }, ref) => {
    return (
      <div className="orderLog__order" ref={ref}>
        <span className="order__code">{order.code}</span>
        <span>
          {order.guestName ? <b>{order.guestName}</b> : "Кто-то"} заказал(а):
        </span>
        <ul>
          {order.products.map((product, i) => (
            <li key={i}>
              <b>{product.count}x</b> {product.title}
            </li>
          ))}
        </ul>
        <i>{order.address}</i>
      </div>
    );
  }
);

export interface IOrderLogProps {
  eventBus: EventEmitter2;
}

export const OrderLog: React.FC<IOrderLogProps> = ({ eventBus }) => {
  const [orders, setOrders] = useState<
    Array<
      IOrder & {
        ref: React.MutableRefObject<HTMLDivElement | null>;
        key: string;
      }
    >
  >([]);
  const orderLog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleUpdate = (update: IUpdate) => {
      setOrders((currentOrders) =>
        currentOrders
          .concat(
            update.diff.added.map((added) => ({
              ...added,
              ref: createRef(),
              key: added.code + "_" + added.department_id,
            }))
          )
          .slice(-20)
      );
    };

    eventBus.on("update", handleUpdate);

    return () => {
      eventBus.off("update", handleUpdate);
    };
  }, [eventBus]);

  useLayoutEffect(() => {
    orderLog.current?.scrollTo({
      top: orderLog.current.scrollHeight + 1000,
      behavior: "smooth",
    });
  }, [orders]);

  return (
    <div className="orderLog" ref={orderLog}>
      <TransitionGroup>
        {orders.map((order) => (
          <CSSTransition
            nodeRef={order.ref}
            timeout={400}
            key={order.key}
            classNames="orderLog__order"
          >
            <Order order={order} ref={order.ref} />
          </CSSTransition>
        ))}
      </TransitionGroup>
    </div>
  );
};
