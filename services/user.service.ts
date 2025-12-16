// services/user.service.ts
import axios from "./clients/axios";

export interface Response<T> {
  status: number;
  msg: string;
  data: T;
}

export interface IUser {
  sub: string;
  email?: string;
  name?: string;
  mobileNumber?: string;
  role?: string;
  dayBeatId?: string;
  dayBeatDate?: string;
  [key: string]: any;
}

export interface IListUsersData {
  items: IUser[];
  nextToken: string | null;
}

const endpoints = {
  base: "/api/users",
  byDayBeat: (beatId: string) => `/api/users/by-day-beat/${beatId}`,
};

export const listUsersByDayBeatId = (params: {
  beatId: string;
  limit?: number;
  nextToken?: string | null;
}) =>
  axios.get<Response<IListUsersData>>(endpoints.byDayBeat(params.beatId), {
    params: {
      ...(params.limit ? { limit: params.limit } : {}),
      ...(params.nextToken ? { nextToken: params.nextToken } : {}),
    },
  });
