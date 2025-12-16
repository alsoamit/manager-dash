// services/order.service.ts
import axios from "./clients/axios";
import { ISalon } from "./salon.service";

export interface Response<T> {
  status: number;
  msg: string;
  data: T;
}

export type OrderStatus = "pending" | "completed";

/** Line item kept in the order */
export interface IOrderItem {
  productId: string;
  name?: string; // optional (for convenience in UI)
  unitPrice: number; // product.price
  qty: number; // >= 1
  discountPct: number; // 0..100
  priceBefore: number; // unitPrice * qty
  priceAfter: number; // priceBefore * (1 - discountPct/100)
}

export interface IOrderPayment {
  id: string;
  orderId?: string;
  amount: number;
  method: string; // "cash" | "upi" | "card" | "other" etc.
  reference?: string;
  createdAt: string;
  createdBy?: string;
}

export interface IOrder {
  id: string;
  sub: string;
  mobile?: string;
  email?: string;
  zip?: string;
  address?: string;
  state?: string;
  salonId: string;

  items: IOrderItem[];
  totalBefore: number;
  totalAfter: number;
  salon: ISalon | null;
  user?: {
    sub: string;
    name?: string;
    email?: string;
  } | null;
  productIds?: string[];

  status: OrderStatus;
  type: "ORDER";
  createdAt: string;
  updatedAt: string;

  // NEW:
  payments?: IOrderPayment[];
  paidAmount?: number;
  remainingAmount?: number;
  recoveredPct?: number;
}

export interface ICreatePaymentPayload {
  amount: number;
  method: string;
  reference?: string;
}

export interface ICreateOrderPayload {
  mobile?: string;
  email?: string;
  zip?: string;
  address?: string;
  state?: string;
  salonId: string;

  // NEW:
  items: IOrderItem[];

  status?: OrderStatus; // default "pending"
}

export interface IUpdateOrderPayload extends Partial<ICreateOrderPayload> {}

export interface IListOrdersData {
  items: IOrder[];
  nextToken: string | null;
}

const endpoints = {
  base: "/api/orders",
  byId: (id: string) => `/api/orders/${id}`,
  payments: (id: string) => `/api/orders/${id}/payments`,
};

export const listTodayOrders = () =>
  axios.get<Response<IListOrdersData>>(`${endpoints.base}/today`);

export const listOrders = (params?: {
  limit?: number;
  nextToken?: string | null;
}) =>
  axios.get<Response<IListOrdersData>>(endpoints.base, {
    params: {
      ...(params?.limit ? { limit: params.limit } : {}),
      ...(params?.nextToken ? { nextToken: params.nextToken } : {}),
    },
  });

export const createOrder = (payload: ICreateOrderPayload) =>
  axios.post<Response<IOrder>>(endpoints.base, payload);

export const getOrder = (id: string) =>
  axios.get<Response<IOrder>>(endpoints.byId(id));

export const updateOrder = (id: string, payload: IUpdateOrderPayload) =>
  axios.patch<Response<IOrder>>(endpoints.byId(id), payload);

export const deleteOrder = (id: string) =>
  axios.delete<Response<{ id: string }>>(endpoints.byId(id));

export const addOrderPayment = (id: string, payload: ICreatePaymentPayload) =>
  axios.post<Response<IOrder>>(endpoints.payments(id), payload);
