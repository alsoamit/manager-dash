import axios from "./clients/axios";

const endpoints = {
  users: "/api/manager-reports/users",
  daily: (userId: string) => `/api/manager-reports/daily/${userId}`,
  monthly: (userId: string) => `/api/manager-reports/monthly/${userId}`,
};

export interface Response<T> {
  status: number;
  msg: string;
  data: T;
}

export interface IUser {
  sub: string;
  name: string;
  role: string;
  position?: string;
  hq?: string;
  email?: string;
}

export interface IVisit {
  id: string;
  salonId: string;
  status: string;
  salon?: {
    id: string;
    name: string;
    mobile?: string;
  } | null;
}

export interface IOrderItem {
  productId: string;
  name?: string;
  qty: number;
  product?: {
    id: string;
    name: string;
  } | null;
}

export interface IOrder {
  id: string;
  salonId: string;
  items: IOrderItem[];
  salon?: {
    id: string;
    name: string;
    mobile?: string;
  } | null;
}

export interface IDailyReport {
  user: IUser;
  date: string;
  dailyTarget: number;
  targetMonthly: number;
  achievementTillDate: number;
  totalTC: number;
  totalPC: number;
  cumulativeTC: number;
  cumulativePC: number;
  totalAmount: number;
  visits: IVisit[];
  orders: IOrder[];
}

export interface IMonthlyReport {
  user: IUser;
  year: number;
  month: number;
  targetMonthly: number;
  totalAmount: number;
  totalVisits: number;
  totalOrders: number;
  visits: IVisit[];
  orders: IOrder[];
}

export const getAllUsers = () =>
  axios.get<Response<{ users: IUser[] }>>(endpoints.users);

export const getDailyReport = (userId: string, date?: string) =>
  axios.get<Response<IDailyReport>>(endpoints.daily(userId), {
    params: date ? { date } : {},
  });

export const getMonthlyReport = (userId: string, year?: number, month?: number) =>
  axios.get<Response<IMonthlyReport>>(endpoints.monthly(userId), {
    params: {
      ...(year ? { year } : {}),
      ...(month ? { month } : {}),
    },
  });
