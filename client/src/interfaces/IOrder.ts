import { IProduct } from "./IProduct";

export interface IOrder {
  address: string;
  code: string;
  created: number;
  department_id: number;
  guestName: string | null;
  orderStatus: boolean;
  products: IProduct[];
  removeAt: number;
  startTime: string;
  timestamp: string;
  __clientKey: string;
  __identifier: string;
}
