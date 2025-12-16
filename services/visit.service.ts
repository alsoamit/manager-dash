// services/visit.service.ts
import axios from "./clients/axios";

export interface Response<T> {
  status: number;
  msg: string;
  data: T;
}

export type VisitStatus =
  | "interested_yet_to_follow_up"
  | "owner_not_available"
  | "demo_booked"
  | "not_interested"
  | "product_sold";

export interface IVisit {
  id: string;
  salonId: string;
  visitedBy: string;
  status: VisitStatus;
  reasons?: string[];
  notes?: string;
  location?: { longitude: number; latitude: number };
  createdAt: string;
  updatedAt: string;
  visitedByUser?: {
    sub: string;
    name?: string;
    email?: string;
    mobileNumber?: string;
  } | null;
}

export interface ICreateVisitPayload {
  salonId: string;
  status: VisitStatus;
  reasons?: string[];
  notes?: string;
  location?: { longitude: number; latitude: number };
}

export interface IListVisitsData {
  items: IVisit[];
  nextToken: string | null;
}

const endpoints = {
  base: "/api/visits",
  bySalon: "/api/visits/by-salon",
  byUser: "/api/visits/by-user",
  mine: "/api/visits/mine",
};

export const createVisit = (payload: ICreateVisitPayload) =>
  axios.post<Response<IVisit>>(endpoints.base, payload);

export const listVisitsBySalon = (args: {
  salonId: string;
  limit?: number;
  nextToken?: string | null;
  sort?: "created" | "updated";
}) =>
  axios.get<Response<IListVisitsData>>(endpoints.bySalon, {
    params: {
      salonId: args.salonId,
      ...(args.limit ? { limit: args.limit } : {}),
      ...(args.nextToken ? { nextToken: args.nextToken } : {}),
      ...(args.sort ? { sort: args.sort } : {}),
    },
  });

export const listVisitsByUser = (args: {
  sub: string;
  limit?: number;
  nextToken?: string | null;
  sort?: "created" | "updated";
}) =>
  axios.get<Response<IListVisitsData>>(endpoints.byUser, {
    params: {
      sub: args.sub,
      ...(args.limit ? { limit: args.limit } : {}),
      ...(args.nextToken ? { nextToken: args.nextToken } : {}),
      ...(args.sort ? { sort: args.sort } : {}),
    },
  });

export const listMyVisits = (args?: {
  limit?: number;
  nextToken?: string | null;
  sort?: "created" | "updated";
}) =>
  axios.get<Response<IListVisitsData>>(endpoints.mine, {
    params: {
      ...(args?.limit ? { limit: args.limit } : {}),
      ...(args?.nextToken ? { nextToken: args.nextToken } : {}),
      ...(args?.sort ? { sort: args.sort } : {}),
    },
  });

export const listVisitsBySalonWithUsers = (args: {
  salonId: string;
  limit?: number;
  nextToken?: string | null;
  sort?: "created" | "updated";
}) =>
  axios.get<Response<IListVisitsData>>("/api/visits/by-salon-with-users", {
    params: {
      salonId: args.salonId,
      ...(args.limit ? { limit: args.limit } : {}),
      ...(args.nextToken ? { nextToken: args.nextToken } : {}),
      ...(args.sort ? { sort: args.sort } : {}),
    },
  });
