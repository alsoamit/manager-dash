import axios from "./clients/axios";

const endpoints = {
  users: "/api/manager-reports/users",
  daily: (userId: string) => `/api/manager-reports/daily/${userId}`,
  monthly: (userId: string) => `/api/manager-reports/monthly/${userId}`,
  technical: (userId: string) => `/api/manager-reports/technical/${userId}`,
  allToday: "/api/manager-reports/all-today",
  generate: "/api/manager-reports/generate",
  employeeSummaries: "/api/manager-reports/employee-summaries",
};

export interface Response<T> {
  status: number;
  msg: string;
  data: T;
}

export interface IUser {
  sub: string;
  name: string;
  role: string;
  position?: string;
  hq?: string;
  email?: string;
}


export interface IOrderItem {
  productId: string;
  name?: string;
  qty: number;
  unitPrice?: number;
  discountPct?: number;
  priceBefore?: number;
  priceAfter?: number;
  product?: {
    id: string;
    name: string;
  } | null;
}

export interface IOrder {
  id: string;
  salonId: string;
  items: IOrderItem[];
  salon?: {
    id: string;
    name: string;
    mobile?: string;
  } | null;
}

export interface IVisit {
  id: string;
  salonId: string;
  beatId?: string;
  status: string;
  salon?: {
    id: string;
    name: string;
    mobile?: string;
  } | null;
  beat?: {
    id: string;
    beatname?: string;
    name?: string;
  } | null;
}

export interface IDemo {
  id: string;
  salonId: string;
  userId: string;
  status: string;
  outcome?: string;
  demoDateExpected?: string;
  demoDateApproved?: string;
  products?: Array<{
    id: string;
    name?: string;
    product?: {
      id: string;
      name?: string;
    } | null;
  }>;
  notes?: string;
  amountUsed?: string;
  salon?: {
    id: string;
    name?: string;
    mobile?: string;
  } | null;
}

export interface IDailyReport {
  user: IUser;
  date: string;
  dailyTarget: number;
  targetMonthly: number;
  achievementTillDate: number;
  totalTC: number;
  totalPC: number;
  cumulativeTC: number;
  cumulativePC: number;
  totalAmount: number;
  visits: IVisit[];
  orders: IOrder[];
  demos: IDemo[];
}

export interface IMonthlyReport {
  user: IUser;
  year: number;
  month: number;
  targetMonthly: number;
  totalAmount: number;
  totalVisits: number;
  totalOrders: number;
  visits: IVisit[];
  orders: IOrder[];
}

export const getAllUsers = () =>
  axios.get<Response<{ users: IUser[] }>>(endpoints.users);

export const getDailyReport = (userId: string, date?: string) =>
  axios.get<Response<IDailyReport>>(endpoints.daily(userId), {
    params: date ? { date } : {},
  });

export const getMonthlyReport = (userId: string, year?: number, month?: number) =>
  axios.get<Response<IMonthlyReport>>(endpoints.monthly(userId), {
    params: {
      ...(year ? { year } : {}),
      ...(month ? { month } : {}),
    },
  });


export interface ITechnicalReport {
  user: IUser;
  date: string;
  area: string;
  demos: IDemo[];
}

export interface IAllReportsResponse {
  date: string;
  reports: Array<
    | (IDailyReport & { type?: "sales" })
    | (ITechnicalReport & { type?: "tech" })
  >;
}

export const getTechnicalReport = (userId: string, date?: string) =>
  axios.get<Response<ITechnicalReport>>(endpoints.technical(userId), {
    params: date ? { date } : {},
  });

export const getAllReportsToday = (date?: string) =>
  axios.get<Response<IAllReportsResponse>>(endpoints.allToday, {
    params: date ? { date } : {},
  });

export const generateAllReports = (date?: string) =>
  axios.post<Response<{ message: string; date: string }>>(endpoints.generate, {
    date: date || new Date().toISOString().split("T")[0],
  });

export interface IEmployeeSummary {
  sub: string;
  name: string;
  role: string;
  position: string;
  hq: string;
  profileImage: string | null;
  dailyTarget: number;
  monthlyTarget: number;
  totalTC: number;
  totalSalonsVisited: number;
  totalOrders: number;
  todayBeat: {
    id: string;
    name: string | null;
  } | null;
  dailyVisitTarget: {
    minVisits: number;
    maxVisits: number;
    achieved: number;
    progressPercent: number;
  } | null;
  monthlySalesAchieved: number;
}

export interface IEmployeeSummariesData {
  date: string;
  summaries: IEmployeeSummary[];
}

export const getEmployeeSummaries = (date?: string) =>
  axios.get<Response<IEmployeeSummariesData>>(endpoints.employeeSummaries, {
    params: date ? { date } : {},
  });
