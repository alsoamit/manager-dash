// services/attendance.service.ts
import axios from "./clients/axios";

export interface Response<T> {
  status: number;
  msg: string;
  data: T;
}

export interface IAttendanceDay {
  day: string; // "YYYY-MM-DD"
  pingCount: number; // integer
  minutesActive: number; // integer
  firstPing?: string;
  lastPing?: string;
}

export interface IListAttendanceData {
  items: IAttendanceDay[];
}

const endpoints = {
  me: "/api/attendance/me", // backend reads req.user.sub
  byUser: "/api/attendance/by-user", // admin endpoint
};

export const listMyAttendance = (params: { from: string; to: string }) =>
  axios.get<Response<IListAttendanceData>>(endpoints.me, { params });

export const listAttendanceByUser = (params: {
  sub: string;
  from?: string;
  to?: string;
}) =>
  axios.get<Response<IListAttendanceData>>(endpoints.byUser, { params });
