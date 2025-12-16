// services/activities.service.ts
import server from "./clients/axios";

export interface IActivityUser {
  sub: string;
  name?: string;
  email?: string;
  avatar?: string;
}

export interface IActivity {
  type:
    | "LOGIN"
    | "SALON_CREATED"
    | "ORDER_CREATED"
    | "PAYMENT_RECEIVED"
    | "DEMO_BOOKED"
    | "SALON_VISITED";
  message: string;
  user: IActivityUser;
  timestamp: string;
  salonId?: string;
  orderId?: string;
  demoId?: string;
  visitId?: string;
}

export interface IListActivitiesResponse {
  items: IActivity[];
}

interface ApiResponse<T> {
  status: number;
  msg: string;
  data: T;
}

/**
 * Get activities from cache (for initial load)
 * Real-time updates come via Socket.IO "activity" event
 */
export const getActivities = () =>
  server.get<ApiResponse<IListActivitiesResponse>>("/api/activities");
