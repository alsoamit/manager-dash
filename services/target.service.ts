// services/employeeTarget.service.ts
import axios from "./clients/axios";

export interface Response<T> {
  status: number;
  msg: string;
  data: T;
}

export interface IEmployeeTarget {
  sub: string;
  targetMonthly?: number;
  updatedAt?: string;
}

/** Target History Models */
export interface IDailyTargetHistoryItem {
  userId: string;
  targetKey: string;
  targetType: "daily";
  targetDate: string;
  minVisits: number;
  maxVisits: number;
  achieved: number;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IMonthlyTargetHistoryItem {
  userId: string;
  targetKey: string;
  targetType: "monthly";
  targetMonth: string;
  targetMonthly: number;
  achieved: number;
  month: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ITargetHistory {
  items: (IDailyTargetHistoryItem | IMonthlyTargetHistoryItem)[];
  type: "daily" | "monthly";
}

const endpoints = {
  bySub: (sub: string) => `/api/target/${sub}`,
  history: (userId: string) => `/api/target/${userId}/history`,
};

export const getEmployeeTarget = (sub: string) =>
  axios.get<Response<IEmployeeTarget>>(endpoints.bySub(sub));

export const setEmployeeTarget = (sub: string, targetMonthly: number) =>
  axios.patch<Response<IEmployeeTarget>>(endpoints.bySub(sub), {
    targetMonthly,
  });

export const getTargetHistory = (params: {
  userId: string;
  type: "daily" | "monthly";
  from?: string; // YYYY-MM-DD for daily, YYYY-MM for monthly
  to?: string; // YYYY-MM-DD for daily, YYYY-MM for monthly
}) =>
  axios.get<Response<ITargetHistory>>(endpoints.history(params.userId), {
    params: {
      type: params.type,
      ...(params.from ? { from: params.from } : {}),
      ...(params.to ? { to: params.to } : {}),
    },
  });
