// services/dailyVisitTarget.service.ts
import axios from "./clients/axios";

/** API envelope */
export interface Response<T> {
  status: number;
  msg: string;
  data: T;
}

/** Domain model */
export interface IDailyVisitTarget {
  userId: string;
  targetDate: string; // YYYY-MM-DD
  minVisits: number;
  maxVisits: number;
  achieved?: number; // Only in dashboard response
  progressPercent?: number; // Only in dashboard response
  status?: "achieved" | "in_range" | "below_min"; // Only in dashboard response
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface IDailyVisitTargetHistory {
  items: IDailyVisitTarget[];
}

export interface ISetDailyVisitTargetPayload {
  targetDate?: string; // Optional, defaults to today
  minVisits: number;
  maxVisits: number;
}

/** Endpoints */
const endpoints = {
  base: "/api/daily-visit-targets",
  byUserId: (userId: string) => `/api/daily-visit-targets/${userId}`,
  history: (userId: string) => `/api/daily-visit-targets/${userId}/history`,
};

/** Calls */
export const getDailyVisitTarget = (params: {
  userId: string;
  date?: string; // Optional, defaults to today
}) =>
  axios.get<Response<IDailyVisitTarget>>(endpoints.byUserId(params.userId), {
    params: params.date ? { date: params.date } : {},
  });

export const getDailyVisitTargetHistory = (params: {
  userId: string;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
}) =>
  axios.get<Response<IDailyVisitTargetHistory>>(
    endpoints.history(params.userId),
    {
      params: {
        ...(params.from ? { from: params.from } : {}),
        ...(params.to ? { to: params.to } : {}),
      },
    }
  );

export const setDailyVisitTarget = (
  userId: string,
  payload: ISetDailyVisitTargetPayload
) =>
  axios.post<Response<IDailyVisitTarget>>(
    endpoints.byUserId(userId),
    payload
  );
