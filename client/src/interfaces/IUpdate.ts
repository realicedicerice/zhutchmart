import { IOrder } from "./IOrder";

export interface IUpdate {
  department: number;
  diff: {
    added: IOrder[];
    removed: IOrder[];
  };
}
