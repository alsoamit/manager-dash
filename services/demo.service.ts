// services/demo.service.ts
import axios from "./clients/axios";

export interface IDemoProduct {
  id: string;
  name: string;
}

export type DemoStatus = "booked" | "demo_done" | "cancelled" | "rejected";
export type DemoOutcome =
  | "interested"
  | "not_interested"
  | "price_too_high"
  | "reschedule_requested"
  | "no_show";

export interface IDemo {
  id: string;
  type: "DEMO";
  salonId: string;
  beatId?: string;
  userId: string;
  demoAssignedTo?: string;
  status: DemoStatus;
  outcome?: DemoOutcome;
  demoDateExpected?: string;
  demoDateApproved?: string;
  demoDoneTimestamp?: string;
  products: IDemoProduct[];
  amountUsed?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  // Enriched fields (from API)
  salon?: {
    id: string;
    name?: string;
    address?: string;
  } | null;
  beat?: {
    id: string;
    beatname?: string;
    code?: string;
  } | null;
  assignedUser?: {
    sub: string;
    name?: string;
    email?: string;
  } | null;
  creator?: {
    sub: string;
    name?: string;
    email?: string;
  } | null;
}

export interface IListDemosData {
  items: IDemo[];
  nextToken: string | null;
}

export interface Response<T> {
  status: number;
  msg: string;
  data: T;
}

const base = "/api/demos";

export const createDemo = (payload: Partial<IDemo>) =>
  axios.post<Response<IDemo>>(base, payload);

export const getDemo = (id: string) =>
  axios.get<Response<IDemo>>(`${base}/${id}`);

export const updateDemo = (id: string, patch: Partial<IDemo>) =>
  axios.patch<Response<IDemo>>(`${base}/${id}`, patch);

export const deleteDemo = (id: string) =>
  axios.delete<Response<{ id: string }>>(`${base}/${id}`);

export const listDemos = (params?: {
  beatId?: string;
  salonId?: string;
  userId?: string;
  demoAssignedTo?: string;
  sort?: "createdAt" | "updatedAt";
  status?: DemoStatus;
  outcome?: DemoOutcome;
  limit?: number;
  nextToken?: string | null;
}) =>
  axios.get<Response<IListDemosData>>(base, {
    params: {
      ...params,
      nextToken: params?.nextToken || undefined,
    },
  });

export const listBookedDemos = (params?: {
  limit?: number;
  nextToken?: string | null;
}) =>
  axios.get<Response<IListDemosData>>(`${base}/status/booked`, {
    params: {
      ...params,
      nextToken: params?.nextToken || undefined,
    },
  });

export const listUserDemos = (params?: {
  userId?: string; // if omitted, backend can infer from auth
  status?: DemoStatus;
  limit?: number;
  nextToken?: string | null;
}) =>
  axios.get<Response<IListDemosData>>(`${base}/by-user`, {
    params: {
      ...params,
      nextToken: params?.nextToken || undefined,
    },
  });

export const listAssignedDemos = (params?: {
  demoAssignedTo?: string; // if omitted, backend can infer from auth
  status?: DemoStatus;
  limit?: number;
  nextToken?: string | null;
}) =>
  axios.get<Response<IListDemosData>>(`${base}/assigned`, {
    params: {
      ...params,
      nextToken: params?.nextToken || undefined,
    },
  });

export const acceptDemo = (id: string, demoDateApproved: string) =>
  axios.post<Response<IDemo>>(`${base}/${id}/accept`, {
    demoDateApproved,
  });

export const listTodayDemos = () =>
  axios.get<Response<IListDemosData>>(`${base}/today`);

export const listUnassignedDemos = (params?: {
  limit?: number;
  nextToken?: string | null;
}) =>
  axios.get<Response<IListDemosData>>(`${base}/unassigned`, {
    params: {
      ...params,
      nextToken: params?.nextToken || undefined,
    },
  });
