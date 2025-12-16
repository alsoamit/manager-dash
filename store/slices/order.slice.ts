// store/slices/order.slice.ts
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import {
  listOrders as apiList,
  getOrder as apiGet,
  type IOrder,
  type IListOrdersData,
  type Response as ApiResponse,
} from "@/services/order.service";

const ordersAdapter = createEntityAdapter<IOrder>({
  sortComparer: (a, b) => (a.createdAt > b.createdAt ? -1 : 1), // newest first
});

export type Status = "idle" | "loading" | "succeeded" | "failed";

export interface OrdersState
  extends ReturnType<typeof ordersAdapter.getInitialState> {
  listStatus: Status;
  listError?: string;
  nextToken: string | null;

  getStatus: Status;
  getError?: string;
}

const initialState: OrdersState = ordersAdapter.getInitialState({
  listStatus: "idle",
  listError: undefined,
  nextToken: null,

  getStatus: "idle",
  getError: undefined,
});

/* ============= Thunks ============= */

export const listOrders = createAsyncThunk<
  IListOrdersData,
  {
    limit?: number;
    nextToken?: string | null;
    mode?: "replace" | "append";
  }
>("orders/list", async (args, { rejectWithValue }) => {
  try {
    const resp = await apiList({
      limit: args?.limit,
      nextToken: args?.nextToken ?? undefined,
    });
    if (resp.data.status === 0) {
      return rejectWithValue(resp.data.msg || "Failed to list orders");
    }
    return resp.data.data;
  } catch (err) {
    const error = err as AxiosError<ApiResponse<IListOrdersData>>;
    return rejectWithValue(
      error.response?.data?.msg || error.message || "Failed to list orders"
    );
  }
});

export const getOrder = createAsyncThunk<IOrder, string>(
  "orders/get",
  async (id, { rejectWithValue }) => {
    try {
      const resp = await apiGet(id);
      if (resp.data.status === 0) {
        return rejectWithValue(resp.data.msg || "Failed to get order");
      }
      return resp.data.data;
    } catch (err) {
      const error = err as AxiosError<ApiResponse<IOrder>>;
      return rejectWithValue(
        error.response?.data?.msg || error.message || "Failed to get order"
      );
    }
  }
);

/* ============= Slice ============= */

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrders: (state) => {
      ordersAdapter.removeAll(state);
      state.nextToken = null;
      state.listStatus = "idle";
      state.listError = undefined;
    },
  },
  extraReducers: (builder) => {
    // listOrders
    builder
      .addCase(listOrders.pending, (state) => {
        state.listStatus = "loading";
        state.listError = undefined;
      })
      .addCase(listOrders.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.listError = undefined;
        state.nextToken = action.payload.nextToken;

        if (action.meta.arg.mode === "append") {
          ordersAdapter.upsertMany(state, action.payload.items);
        } else {
          ordersAdapter.setAll(state, action.payload.items);
        }
      })
      .addCase(listOrders.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = String(action.payload || "Failed to list orders");
      });

    // getOrder
    builder
      .addCase(getOrder.pending, (state) => {
        state.getStatus = "loading";
        state.getError = undefined;
      })
      .addCase(getOrder.fulfilled, (state, action) => {
        state.getStatus = "succeeded";
        state.getError = undefined;
        ordersAdapter.upsertOne(state, action.payload);
      })
      .addCase(getOrder.rejected, (state, action) => {
        state.getStatus = "failed";
        state.getError = String(action.payload || "Failed to get order");
      });
  },
});

export const { clearOrders } = ordersSlice.actions;

export const {
  selectAll: selectAllOrders,
  selectById: selectOrderById,
  selectIds: selectOrderIds,
  selectEntities: selectOrderEntities,
} = ordersAdapter.getSelectors((state: { orders: OrdersState }) => state.orders);

export const selectOrdersListStatus = (state: { orders: OrdersState }) =>
  state.orders.listStatus;
export const selectOrdersListError = (state: { orders: OrdersState }) =>
  state.orders.listError;
export const selectOrdersNextToken = (state: { orders: OrdersState }) =>
  state.orders.nextToken;

export const selectOrderGetStatus = (state: { orders: OrdersState }) =>
  state.orders.getStatus;
export const selectOrderGetError = (state: { orders: OrdersState }) =>
  state.orders.getError;

export default ordersSlice.reducer;
