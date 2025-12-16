import axios from "./clients/axios";

/** Endpoints */
const salonEndpoints = {
  base: "/api/salons",
  byId: (id: string) => `/api/salons/${id}`,
  byBeat: "/api/salons/by-beat",
  byUser: "/api/salons/by-user",
  mine: "/api/salons/mine",
  page: (id: string) => `/api/salons/${id}/page`,
};

/** API envelope */
export interface Response<T> {
  status: number;
  msg: string;
  data: T;
}

/** Domain model
 *  Keep in sync with `frontend/services/salon.service.ts`
 */
export interface ISalon {
  id: string;
  name: string;
  address?: string;
  mobile?: string;
  phone?: string; // Alias for mobile (for backward compatibility)
  email?: string;
  zip?: string;
  state?: string;
  beatId?: string;
  status?: string; // active/inactive
  visit?: string; // visited/not_visited
  visitStatus?: string; // pipeline status
  location?: {
    lat: number;
    lng: number;
    accuracy?: number;
    source?: string;
    ts?: number;
  };
  paymentAmount?: number;
  type: "SALON";
  createdAt: string;
  updatedAt: string;
  visited: string;
  sub?: string; // creator user sub
  createdByUser?: {
    sub: string;
    name?: string;
    email?: string;
    profileImage?: string;
  } | null;
}

export type VisitStatus =
  | "interested_yet_to_follow_up"
  | "owner_not_available"
  | "demo_booked"
  | "not_interested"
  | "product_sold";

export interface IVisitLite {
  id: string;
  salonId: string;
  visitedBy: string;
  status: VisitStatus;
  reasons?: string[];
  notes?: string;
  createdAt: string;
}

export interface ISalonPageInsights {
  totals: {
    totalVisits: number;
    interested_yet_to_follow_up: number;
    owner_not_available: number;
    demo_booked: number;
    not_interested: number;
    product_sold: number;
  };
  likeability: number; // 0..100
  latestVisitAt: string | null;
}

export interface ISalonInsights {
  totals: {
    totalVisits: number;
    interested: number;
    interested_yet_to_follow_up: number;
    owner_not_available: number;
    demo_booked: number;
    not_interested: number;
    product_sold: number;
  };
  reasons: { reason: string; count: number }[];
  latestVisitAt: string | null;
  likeability: number; // 0..100
  recentVisits: IVisitLite[];
}

export interface ISalonPageData {
  salon: ISalon;
  insights: ISalonPageInsights;
  visits: {
    items: IVisitLite[];
    nextToken: string | null;
  };
}

export interface ICreateSalonPayload {
  name: string;
  mobile?: string;
  email?: string;
  address?: string;
  zip?: string;
  state: string;
  beatId: string;
  status?: "active" | "inactive";
  visit?: "visited" | "not_visited";
  visitStatus?:
    | "interested_yet_to_follow_up"
    | "owner_not_available"
    | "demo_booked"
    | "not_interested"
    | "product_sold";
  location?: {
    lat: number;
    lng: number;
    accuracy?: number;
    source?: string;
    ts?: number;
  };
  paymentAmount?: number;
}

export interface IUpdateSalonPayload
  extends Partial<Omit<ICreateSalonPayload, "beatId" | "state">> {
  beatId?: string;
  state?: string;
}

export interface IListSalonsData {
  items: ISalon[];
  nextToken: string | null;
}

/** Calls */
export const listSalons = (params?: {
  limit?: number;
  nextToken?: string | null;
  search?: string;
  userId?: string;
  beatId?: string;
}) =>
  axios.get<Response<IListSalonsData>>(salonEndpoints.base, {
    params: {
      ...(params?.limit ? { limit: params.limit } : {}),
      ...(params?.nextToken ? { nextToken: params.nextToken } : {}),
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.userId ? { userId: params.userId } : {}),
      ...(params?.beatId ? { beatId: params.beatId } : {}),
    },
  });

export const createSalon = (payload: ICreateSalonPayload) =>
  axios.post<Response<ISalon>>(salonEndpoints.base, payload);

export const getSalon = (id: string) =>
  axios.get<Response<ISalon>>(salonEndpoints.byId(id));

export const updateSalon = (id: string, payload: IUpdateSalonPayload) =>
  axios.patch<Response<ISalon>>(salonEndpoints.byId(id), payload);

export const deleteSalon = (id: string) =>
  axios.delete<Response<{ id: string }>>(salonEndpoints.byId(id));

export const listSalonsByBeatId = (params: {
  beatId: string;
  limit?: number;
  nextToken?: string | null;
}) =>
  axios.get<Response<IListSalonsData>>(salonEndpoints.byBeat, {
    params: {
      beatId: params.beatId,
      ...(params.limit ? { limit: params.limit } : {}),
      ...(params.nextToken ? { nextToken: params.nextToken } : {}),
    },
  });

export const listSalonsByUserId = (params: {
  sub: string;
  limit?: number;
  nextToken?: string | null;
}) =>
  axios.get<Response<IListSalonsData>>(salonEndpoints.byUser, {
    params: {
      sub: params.sub,
      ...(params.limit ? { limit: params.limit } : {}),
      ...(params.nextToken ? { nextToken: params.nextToken } : {}),
    },
  });

export const listMySalons = (params?: {
  limit?: number;
  nextToken?: string | null;
}) =>
  axios.get<Response<IListSalonsData>>(salonEndpoints.mine, {
    params: {
      ...(params?.limit ? { limit: params.limit } : {}),
      ...(params?.nextToken ? { nextToken: params.nextToken } : {}),
    },
  });

export const getSalonPage = (
  id: string,
  params?: { limit?: number; nextToken?: string | null; days?: number }
) =>
  axios.get<Response<ISalonPageData>>(salonEndpoints.page(id), {
    params: {
      ...(params?.limit ? { limit: params.limit } : {}),
      ...(params?.nextToken ? { nextToken: params.nextToken } : {}),
      ...(params?.days ? { days: params.days } : {}),
    },
  });
