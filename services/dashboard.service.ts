// services/dashboard.service.ts
import axios from "./clients/axios";

export interface Response<T> {
  status: number;
  msg: string;
  data: T;
}

export interface IProductSales {
  productId: string;
  count: number;
  totalAmount: number;
  product: {
    id: string;
    name: string;
    stock: number;
    price: number;
  } | null;
}

export interface ISalonSales {
  salonId: string;
  totalAmount: number;
  count: number;
  salon: {
    id: string;
    name: string;
    address?: string;
  } | null;
}

export interface IUserSales {
  userId: string;
  totalAmount: number;
  count: number;
  avgDiscount: number;
  user: {
    sub: string;
    name?: string;
    email?: string;
  } | null;
}

export interface IAdminDashboardInsights {
  topProducts: IProductSales[];
  topSalons: ISalonSales[];
  topUsers: IUserSales[];
  laggingUsers: IUserSales[];
  mostDiscount: IUserSales[];
  leastDiscount: IUserSales[];
}

export interface ISalesSummary {
  total: number;
  today: number;
  last7Days: number;
  last30Days: number;
}

export interface IDailySales {
  date: string;
  amount: number;
  count: number;
}

export interface IComparisonItem {
  name: string;
  amount: number;
  count: number;
}

export interface ISalesAnalytics {
  dailySales: IDailySales[];
  employeeComparison: IComparisonItem[];
  productComparison: IComparisonItem[];
  salonComparison: IComparisonItem[];
}

export interface ISale {
  id: string;
  productId: string;
  orderId?: string;
  userId: string;
  salonId: string;
  qty: number;
  unitPrice: number;
  discountPct: number;
  priceBefore: number;
  amountAfter: number;
  createdAt: string;
  updatedAt: string;
  salon?: {
    id: string;
    name?: string;
    address?: string;
  } | null;
  user?: {
    sub: string;
    name?: string;
    email?: string;
  } | null;
  product?: {
    id: string;
    name?: string;
    price?: number;
  } | null;
}

export interface IListSalesData {
  items: ISale[];
  nextToken: string | null;
}

const endpoints = {
  adminInsights: "/api/analytics/insights",
  salesSummary: "/api/analytics/sales-summary",
  salesAnalytics: "/api/analytics/sales-analytics",
  sales: "/api/analytics/sales",
};

export const getAdminDashboardInsights = (config?: { params?: { forceRefresh?: string } }) =>
  axios.get<Response<IAdminDashboardInsights>>(endpoints.adminInsights, config);

export const getSalesSummary = (config?: { params?: { forceRefresh?: string } }) =>
  axios.get<Response<ISalesSummary>>(endpoints.salesSummary, config);

export const getSalesAnalytics = (config?: { params?: { forceRefresh?: string } }) =>
  axios.get<Response<ISalesAnalytics>>(endpoints.salesAnalytics, config);

export const listSales = (params?: {
  filter?: "today" | "last7days" | "last30days" | "all";
  limit?: number;
  nextToken?: string | null;
}) =>
  axios.get<Response<IListSalesData>>(endpoints.sales, {
    params: {
      ...(params?.filter ? { filter: params.filter } : {}),
      ...(params?.limit ? { limit: params.limit } : {}),
      ...(params?.nextToken ? { nextToken: params.nextToken } : {}),
    },
  });

export const invalidateDashboardCache = () =>
  axios.delete<Response<{ invalidated: number }>>(
    "/api/analytics/cache"
  );

// User dashboard data (same structure as frontend)
export interface IDailySales {
  date: string;
  amount: number;
  count: number;
}

export interface IDemoStats {
  total: number;
  byStatus: Record<string, number>;
  byOutcome: Record<string, number>;
}

export interface IDailyVisitTarget {
  minVisits: number;
  maxVisits: number;
  achieved: number;
  progressPercent: number;
  status: "achieved" | "in_range" | "below_min";
  targetDate: string;
}

export interface IUserDashboardData {
  sub: string;
  role?: "sales" | "tech" | string;
  targetMonthly: number;
  percent: number;
  salesMonthTotal: number;
  salesMonthCount: number;
  salesMonthProducts: number;
  salesMonthOrders: number;
  salesMonthSalons: number;
  last7Total: number;
  last7Count: number;
  last7Products: number;
  last7Orders: number;
  last7Salons: number;
  last7DailySales: IDailySales[];
  last30Total: number;
  last30Count: number;
  last30Products: number;
  last30Orders: number;
  last30Salons: number;
  last30DailySales: IDailySales[];
  lifetimeTotal: number;
  lifetimeCount: number;
  lifetimeProducts: number;
  lifetimeOrders: number;
  lifetimeSalons: number;
  visitsLast7: number;
  visitsLast30: number;
  visitsLifetime: number;
  uniqueSalonsLast7: number;
  uniqueSalonsLast30: number;
  uniqueSalonsLifetime: number;
  ordersLast7: number;
  ordersLast30: number;
  ordersLifetime: number;
  demos?: {
    last7: IDemoStats;
    last30: IDemoStats;
    lifetime: IDemoStats;
  } | null;
  dailyVisitTarget?: IDailyVisitTarget | null;
  updatedAt?: string | null;
}

export const getUserDashboard = (userId: string) =>
  axios.get<Response<IUserDashboardData>>(`/api/dashboard/user/${userId}`);

export interface IEmployeeOverview {
  isTechHead?: boolean;
  sub: string;
  name: string;
  profileImage: string | null;
  role: string;
  position: string | null;
  loginTime: string | null;
  lastLogoutTime: string | null;
  firstVisitTime: string | null;
  dayBeatId: string | null;
  dayBeatName: string | null;
  dayBeatDate: string | null;
  todaySales: number;
  todayVisits: number;
  todayDemos?: number;
  dailyVisitTarget: {
    minVisits: number;
    maxVisits: number;
    achieved: number;
  } | null;
}

export interface IEmployeeOverviewData {
  employees: IEmployeeOverview[];
}

export const getEmployeeOverview = (config?: {
  params?: { forceRefresh?: string };
}) =>
  axios.get<Response<IEmployeeOverviewData>>(
    "/api/dashboard/employee-overview",
    config
  );
