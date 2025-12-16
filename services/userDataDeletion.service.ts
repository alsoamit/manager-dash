// services/userDataDeletion.service.ts
import axios from "./clients/axios";

export interface IDeleteAllUserDataPayload {
  userEmail: string;
  adminEmail: string;
  confirmationText: string;
  deleteUser?: boolean;
}

export interface IDeleteAllUserDataResponse {
  summary: Record<string, number>;
  errors: Array<{ step: string; error: string }>;
  userDeleted?: boolean;
}

export interface Response<T> {
  status: number;
  msg: string;
  data: T;
}

export const deleteAllUserData = (
  sub: string,
  payload: IDeleteAllUserDataPayload
) =>
  axios.post<Response<IDeleteAllUserDataResponse>>(
    `/api/user/${sub}/delete-all-data`,
    payload
  );
