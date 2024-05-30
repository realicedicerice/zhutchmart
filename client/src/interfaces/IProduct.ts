export interface IProduct {
  count: number;
  guestName: string | null;
  isOwnCup: boolean;
  isWithoutLid: boolean;
  modifiers: string[];
  productId: number;
  title: string;
}
