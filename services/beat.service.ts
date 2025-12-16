// services/beat.service.ts
import axios from "./clients/axios";

/** API envelope */
export interface Response<T> {
  status: number;
  msg: string;
  data: T;
}

/** Domain model */
export interface IBeat {
  id: string;
  beatname: string;
  code?: string;
  state?: string;
  createdBy?: string;
  type: "BEAT";
  createdAt: string;
  updatedAt: string;
  salonCount?: number; // Added when includeSalonCounts=true for admin
}

export interface IListBeatsData {
  items: IBeat[];
  nextToken: string | null;
}

export interface ISetTodayBeatResponse {
  beat: IBeat;
  dayBeatId: string;
  dayBeatDate: string;
}

export interface ICreateBeatPayload {
  beatname: string;
  code?: string;
  state?: string;
}

export interface IUpdateBeatPayload {
  beatname?: string;
  code?: string;
  state?: string;
}

export interface IAssignBeatsPayload {
  userId: string;
  beats: Array<{ beatId: string; order: number }>;
}

export interface IAssignedBeat extends IBeat {
  order: number;
}

export interface IAssignedBeatsData {
  items: IAssignedBeat[];
}

export interface IRecommendedBeatData {
  beat: IBeat | null;
  lastVisitedBeatId: string | null;
}

/** Endpoints */
const endpoints = {
  beats: "/api/beats",
};

/** Calls */
export const listBeats = (params?: {
  limit?: number;
  nextToken?: string | null;
  includeSalonCounts?: boolean;
}) =>
  axios.get<Response<IListBeatsData>>(endpoints.beats, {
    params: {
      ...(params?.limit ? { limit: params.limit } : {}),
      ...(params?.nextToken ? { nextToken: params.nextToken } : {}),
      ...(params?.includeSalonCounts ? { includeSalonCounts: "true" } : {}),
    },
  });

export const getBeat = (id: string) =>
  axios.get<Response<IBeat>>(`${endpoints.beats}/${id}`);

export const createBeat = (payload: ICreateBeatPayload) =>
  axios.post<Response<IBeat>>(endpoints.beats, payload);

export const updateBeat = (id: string, payload: IUpdateBeatPayload) =>
  axios.patch<Response<IBeat>>(`${endpoints.beats}/${id}`, payload);

export const deleteBeat = (id: string) =>
  axios.delete<Response<{ id: string }>>(`${endpoints.beats}/${id}`);

/**
 * Set today's beat for current user
 * POST /api/beats/today
 */
export const setTodayBeat = (body: { beatId: string }) =>
  axios.post<Response<ISetTodayBeatResponse>>(`${endpoints.beats}/today`, body);

/**
 * Assign beats to a user
 * POST /api/beats/assign
 */
export const assignBeatsToUser = (payload: IAssignBeatsPayload) =>
  axios.post<Response<{ userId: string; assignedBeats: Array<{ beatId: string; order: number }> }>>(
    `${endpoints.beats}/assign`,
    payload
  );

/**
 * Get assigned beats for a user
 * GET /api/beats/assigned/:userId
 */
export const getAssignedBeats = (userId: string) =>
  axios.get<Response<IAssignedBeatsData>>(`${endpoints.beats}/assigned/${userId}`);

/**
 * Get recommended beat for a user
 * GET /api/beats/recommended/:userId
 */
export const getRecommendedBeat = (userId: string) =>
  axios.get<Response<IRecommendedBeatData>>(`${endpoints.beats}/recommended/${userId}`);
