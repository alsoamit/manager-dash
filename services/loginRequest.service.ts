// services/loginRequest.service.ts
import server from "./clients/axios";

export interface ILoginRequest {
  id: string;
  userId: string;
  status: "pending" | "approved" | "rejected";
  requestDate: string; // YYYY-MM-DD
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  approvedAt?: string; // ISO 8601
  approvedBy?: string; // Admin user ID
  reason?: string; // Reason for late login
  user?: {
    sub: string;
    name?: string;
    email?: string;
    username?: string;
    role?: string;
  } | null;
}

export interface Response<T> {
  status: number;
  msg: string;
  data: T;
}

export interface IListLoginRequestsData {
  items: ILoginRequest[];
  nextToken?: string | null;
}

export interface IListLoginRequestsParams {
  limit?: number;
  status?: "pending" | "approved" | "rejected";
  nextToken?: string;
}

/**
 * List all login requests
 * GET /api/login-requests
 */
export const listLoginRequests = (params?: IListLoginRequestsParams) =>
  server.get<Response<IListLoginRequestsData>>("/api/login-requests", {
    params,
  });

/**
 * Approve a login request
 * PATCH /api/login-requests/:id/approve
 */
export const approveLoginRequest = (id: string) =>
  server.patch<Response<ILoginRequest>>(`/api/login-requests/${id}/approve`);

/**
 * Reject a login request
 * PATCH /api/login-requests/:id/reject
 */
export const rejectLoginRequest = (id: string) =>
  server.patch<Response<ILoginRequest>>(`/api/login-requests/${id}/reject`);
