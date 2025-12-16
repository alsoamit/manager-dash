import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import {
  listProducts as apiListProducts,
  getProduct as apiGetProduct,
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
  type IProduct,
  type ICreateProductPayload,
  type IUpdateProductPayload,
  type Response as ApiResponse,
  type IListProductsData,
} from "@/services/product.service";

/* =========================
 * Entity adapter & state
 * ========================= */
const productsAdapter = createEntityAdapter<IProduct>({
  // don't pass selectId when your entity has `id`; RTK infers it
  sortComparer: (a, b) => (a.createdAt > b.createdAt ? -1 : 1), // newest first
});

type Status = "idle" | "loading" | "succeeded" | "failed";

export interface ProductsState
  extends ReturnType<typeof productsAdapter.getInitialState> {
  listStatus: Status;
  listError?: string;
  nextToken: string | null;

  getStatus: Status;
  getError?: string;

  createStatus: Status;
  createError?: string;

  updateStatus: Status;
  updateError?: string;

  deleteStatus: Status;
  deleteError?: string;
}

const initialState: ProductsState = productsAdapter.getInitialState({
  listStatus: "idle",
  listError: undefined,
  nextToken: null,

  getStatus: "idle",
  getError: undefined,

  createStatus: "idle",
  createError: undefined,

  updateStatus: "idle",
  updateError: undefined,

  deleteStatus: "idle",
  deleteError: undefined,
});

/* =========================
 * Thunks
 * ========================= */

// List (newest first via createdAt-index)
export const listProducts = createAsyncThunk<
  IListProductsData,
  { limit?: number; nextToken?: string | null; mode?: "replace" | "append" }
>("products/list", async (args, { rejectWithValue }) => {
  try {
    const resp = await apiListProducts({
      limit: args?.limit,
      nextToken: args?.nextToken ?? undefined,
    });
    return resp.data.data;
  } catch (e) {
    const err = e as AxiosError<ApiResponse<unknown>>;
    return rejectWithValue(
      (err.response?.data?.msg as string) || err.message || "List failed"
    );
  }
});

// Get one
export const getProduct = createAsyncThunk<IProduct, { id: string }>(
  "products/getOne",
  async ({ id }, { rejectWithValue }) => {
    try {
      const resp = await apiGetProduct(id);
      return resp.data.data;
    } catch (e) {
      const err = e as AxiosError<ApiResponse<unknown>>;
      return rejectWithValue(
        (err.response?.data?.msg as string) || err.message || "Fetch failed"
      );
    }
  }
);

// Create
export const createProduct = createAsyncThunk<IProduct, ICreateProductPayload>(
  "products/create",
  async (payload, { rejectWithValue }) => {
    try {
      const resp = await apiCreateProduct(payload);
      return resp.data.data;
    } catch (e) {
      const err = e as AxiosError<ApiResponse<unknown>>;
      return rejectWithValue(
        (err.response?.data?.msg as string) || err.message || "Create failed"
      );
    }
  }
);

// Update (partial)
export const updateProduct = createAsyncThunk<
  IProduct,
  { id: string; changes: IUpdateProductPayload }
>("products/update", async ({ id, changes }, { rejectWithValue }) => {
  try {
    const resp = await apiUpdateProduct(id, changes);
    return resp.data.data;
  } catch (e) {
    const err = e as AxiosError<ApiResponse<unknown>>;
    return rejectWithValue(
      (err.response?.data?.msg as string) || err.message || "Update failed"
    );
  }
});

// Delete
export const deleteProduct = createAsyncThunk<{ id: string }, { id: string }>(
  "products/delete",
  async ({ id }, { rejectWithValue }) => {
    try {
      const resp = await apiDeleteProduct(id);
      return resp.data.data;
    } catch (e) {
      const err = e as AxiosError<ApiResponse<unknown>>;
      return rejectWithValue(
        (err.response?.data?.msg as string) || err.message || "Delete failed"
      );
    }
  }
);

/* =========================
 * Slice
 * ========================= */
const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    resetListState(state) {
      state.listStatus = "idle";
      state.listError = undefined;
      state.nextToken = null;
    },
    resetMutationState(state) {
      state.createStatus = "idle";
      state.createError = undefined;
      state.updateStatus = "idle";
      state.updateError = undefined;
      state.deleteStatus = "idle";
      state.deleteError = undefined;
    },
    clearProducts(state) {
      productsAdapter.removeAll(state);
      state.nextToken = null;
    },
  },
  extraReducers: (builder) => {
    // list
    builder.addCase(listProducts.pending, (state) => {
      state.listStatus = "loading";
      state.listError = undefined;
    });
    // NOTE: no explicit PayloadAction type here, so `meta` is available
    builder.addCase(listProducts.fulfilled, (state, action) => {
      const mode = action.meta.arg?.mode ?? "replace";
      if (mode === "replace") {
        productsAdapter.setAll(state, action.payload.items);
      } else {
        productsAdapter.upsertMany(state, action.payload.items);
      }
      state.nextToken = action.payload.nextToken ?? null;
      state.listStatus = "succeeded";
    });
    builder.addCase(listProducts.rejected, (state, action) => {
      state.listStatus = "failed";
      state.listError =
        (action.payload as string) || action.error.message || "List failed";
    });

    // get one
    builder.addCase(getProduct.pending, (state) => {
      state.getStatus = "loading";
      state.getError = undefined;
    });
    builder.addCase(getProduct.fulfilled, (state, action) => {
      productsAdapter.upsertOne(state, action.payload);
      state.getStatus = "succeeded";
    });
    builder.addCase(getProduct.rejected, (state, action) => {
      state.getStatus = "failed";
      state.getError =
        (action.payload as string) || action.error.message || "Fetch failed";
    });

    // create
    builder.addCase(createProduct.pending, (state) => {
      state.createStatus = "loading";
      state.createError = undefined;
    });
    builder.addCase(createProduct.fulfilled, (state, action) => {
      productsAdapter.addOne(state, action.payload);
      state.createStatus = "succeeded";
    });
    builder.addCase(createProduct.rejected, (state, action) => {
      state.createStatus = "failed";
      state.createError =
        (action.payload as string) || action.error.message || "Create failed";
    });

    // update
    builder.addCase(updateProduct.pending, (state) => {
      state.updateStatus = "loading";
      state.updateError = undefined;
    });
    builder.addCase(updateProduct.fulfilled, (state, action) => {
      productsAdapter.upsertOne(state, action.payload);
      state.updateStatus = "succeeded";
    });
    builder.addCase(updateProduct.rejected, (state, action) => {
      state.updateStatus = "failed";
      state.updateError =
        (action.payload as string) || action.error.message || "Update failed";
    });

    // delete
    builder.addCase(deleteProduct.pending, (state) => {
      state.deleteStatus = "loading";
      state.deleteError = undefined;
    });
    builder.addCase(deleteProduct.fulfilled, (state, action) => {
      productsAdapter.removeOne(state, action.payload.id);
      state.deleteStatus = "succeeded";
    });
    builder.addCase(deleteProduct.rejected, (state, action) => {
      state.deleteStatus = "failed";
      state.deleteError =
        (action.payload as string) || action.error.message || "Delete failed";
    });
  },
});

/* =========================
 * Selectors
 * ========================= */
export const {
  selectAll: selectAllProducts,
  selectById: selectProductById,
  selectIds: selectProductIds,
} = productsAdapter.getSelectors(
  (state: any) => state.products as ProductsState
);

export const selectProductsNextToken = (state: any) =>
  (state.products as ProductsState).nextToken;

export const selectProductsListStatus = (state: any) =>
  (state.products as ProductsState).listStatus;

export const selectProductsListError = (state: any) =>
  (state.products as ProductsState).listError;

export const selectProductGetStatus = (state: any) =>
  (state.products as ProductsState).getStatus;

export const selectProductGetError = (state: any) =>
  (state.products as ProductsState).getError;

export const selectProductsMutationStatuses = (state: any) => {
  const s = state.products as ProductsState;
  return {
    createStatus: s.createStatus,
    updateStatus: s.updateStatus,
    deleteStatus: s.deleteStatus,
    createError: s.createError,
    updateError: s.updateError,
    deleteError: s.deleteError,
  };
};

/* =========================
 * Exports
 * ========================= */
export const { resetListState, resetMutationState, clearProducts } =
  productsSlice.actions;

export default productsSlice.reducer;
