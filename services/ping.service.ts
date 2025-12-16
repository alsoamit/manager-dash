// services/ping.service.ts
import axios from "./clients/axios";

export interface Response<T> {
  status: number;
  msg: string;
  data: T;
}

export interface IPing {
  sub: string;
  ts: string;
  day: string;
  lat: number;
  lng: number;
  accuracy?: number;
  ip?: string;
  ua?: string;
  ttl?: number;
}

export interface IListPingsData {
  items: IPing[];
}

const endpoints = {
  byUser: "/api/pings/by-user",
};

export const listPingsByUser = (params: {
  sub: string;
  day?: string; // YYYY-MM-DD, defaults to today (IST)
}) =>
  axios.get<Response<IListPingsData>>(endpoints.byUser, {
    params: {
      sub: params.sub,
      ...(params.day ? { day: params.day } : {}),
    },
  });
