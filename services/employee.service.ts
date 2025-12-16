import axios from "./clients/axios";

const endpoints = {
  base: "/api/user",
  bySub: (sub: string) => `/api/user/${sub}`,
  register: "/api/auth/register",
};

export interface Response<T> {
  status: number;
  msg: string;
  data: T;
}

export const getEmployee = (sub: string) =>
  axios.get<Response<IEmployee>>(`/api/user/${sub}`);

export interface IEmployee {
  sub: string;
  name: string;
  email?: string;
  mobileNumber?: string;
  dateOfBirth?: string;
  role?: string;
  position?: string;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
  firstVisitTime?: string;
  firstLoginTime?: string;
  loginTime?: string; // ISO timestamp of firstLoginTime if loginTime date is today
  lastLogoutTime?: string;
  dayBeatId?: string;
  dayBeatDate?: string;
  dayBeatName?: string;
  isTechHead?: boolean;
}

export interface IListEmployeesData {
  items: IEmployee[];
  nextToken: string | null;
}

export const listEmployees = (params?: {
  limit?: number;
  nextToken?: string | null;
}) =>
  axios.get<Response<IListEmployeesData>>(endpoints.base, {
    params: {
      ...(params?.limit ? { limit: params.limit } : {}),
      ...(params?.nextToken ? { nextToken: params.nextToken } : {}),
    },
  });

export const deleteEmployee = (sub: string) =>
  axios.delete<Response<{ sub: string; username: string }>>(
    endpoints.bySub(sub)
  );

export const updateEmployee = (sub: string, changes: Partial<IEmployee>) =>
  axios.patch<Response<IEmployee>>(endpoints.bySub(sub), changes);

export const registerEmployee = (payload: {
  username: string;
  password: string;
  email: string;
  name: string;
}) => axios.post<Response<any>>(endpoints.register, payload);
