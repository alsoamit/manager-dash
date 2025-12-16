// services/products.ts
import axios from "./clients/axios";

/** ---------- Endpoints ---------- */
const productEndpoints = {
  base: "/api/products",
  byId: (id: string) => `/api/products/${id}`,
};

/** ---------- Shared API response shape ---------- */
export interface Response<T> {
  status: number;
  msg: string;
  data: T;
}

/** ---------- Domain models ---------- */
export interface IProduct {
  id: string;
  name: string;
  image?: string;
  description?: string;
  price: number;
  unit?: string;
  stock: number;
  type: "PRODUCT";
  createdAt: string;
  updatedAt: string;
}

export interface ICreateProductPayload {
  name: string;
  image?: string;
  description?: string;
  price?: number;
  unit?: string;
  stock?: number;
}

export interface IUpdateProductPayload {
  name?: string;
  image?: string;
  description?: string;
  price?: number;
  unit?: string;
  stock?: number;
}

export interface IListProductsData {
  items: IProduct[];
  nextToken: string | null;
}

/** ---------- API calls ---------- */

// List (newest first). Optional pagination.
export const listProducts = (params?: {
  limit?: number;
  nextToken?: string | null;
}) => {
  return axios.get<Response<IListProductsData>>(productEndpoints.base, {
    params: {
      ...(params?.limit ? { limit: params.limit } : {}),
      ...(params?.nextToken ? { nextToken: params.nextToken } : {}),
    },
  });
};

// Create
export const createProduct = (payload: ICreateProductPayload) => {
  return axios.post<Response<IProduct>>(productEndpoints.base, payload);
};

// Get by id
export const getProduct = (id: string) => {
  return axios.get<Response<IProduct>>(productEndpoints.byId(id));
};

// Update (partial)
export const updateProduct = (id: string, payload: IUpdateProductPayload) => {
  return axios.patch<Response<IProduct>>(productEndpoints.byId(id), payload);
};

// Delete
export const deleteProduct = (id: string) => {
  return axios.delete<Response<{ id: string }>>(productEndpoints.byId(id));
};
