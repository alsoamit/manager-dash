// store/dash/salons.slice.ts
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import {
  listSalons as apiList,
  listSalonsByBeatId as apiListByBeatId,
  getSalon as apiGet,
  createSalon as apiCreate,
  updateSalon as apiUpdate,
  deleteSalon as apiDelete,
  getSalonPage as apiGetSalonPage,
  type ISalon,
  type ICreateSalonPayload,
  type IUpdateSalonPayload,
  type IListSalonsData,
  type Response as ApiResponse,
  type ISalonPageData,
  type IVisitLite,
  type ISalonPageInsights,
} from "@/services/salon.service";

const salonsAdapter = createEntityAdapter<ISalon>({
  sortComparer: (a, b) => (a.createdAt > b.createdAt ? -1 : 1), // newest first
});

export type Status = "idle" | "loading" | "succeeded" | "failed";

export interface SalonsState
  extends ReturnType<typeof salonsAdapter.getInitialState> {
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

  // Salon Page caches
  pageInsightsBySalonId: Record<string, ISalonPageInsights | undefined>;
  pageVisitsBySalonId: Record<string, IVisitLite[] | undefined>;
  pageNextTokenBySalonId: Record<string, string | null | undefined>;
  pageStatusBySalonId: Record<string, Status>;
  pageErrorBySalonId: Record<string, string | undefined>;
}

const initialState: SalonsState = salonsAdapter.getInitialState({
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

  pageInsightsBySalonId: {},
  pageVisitsBySalonId: {},
  pageNextTokenBySalonId: {},
  pageStatusBySalonId: {},
  pageErrorBySalonId: {},
});

/* ============= Thunks ============= */

export const listSalons = createAsyncThunk<
  IListSalonsData,
  {
    limit?: number;
    nextToken?: string | null;
    mode?: "replace" | "append";
    search?: string;
    userId?: string;
    beatId?: string;
  }
>("salons/list", async (args, { rejectWithValue }) => {
  try {
    const resp = await apiList({
      limit: args?.limit,
      nextToken: args?.nextToken ?? undefined,
      search: args?.search ?? undefined,
      userId: args?.userId ?? undefined,
      beatId: args?.beatId ?? undefined,
    });
    return resp.data.data;
  } catch (e) {
    const err = e as AxiosError<ApiResponse<unknown>>;
    return rejectWithValue(
      (err.response?.data?.msg as string) || err.message || "List failed"
    );
  }
});

export const listSalonsByBeatId = createAsyncThunk<
  IListSalonsData,
  {
    beatId: string;
    limit?: number;
    nextToken?: string | null;
    mode?: "replace" | "append";
  }
>("salons/listByBeatId", async (args, { rejectWithValue }) => {
  try {
    const resp = await apiListByBeatId({
      beatId: args.beatId,
      limit: args?.limit,
      nextToken: args?.nextToken ?? undefined,
    });
    return resp.data.data;
  } catch (e) {
    const err = e as AxiosError<ApiResponse<unknown>>;
    return rejectWithValue(
      (err.response?.data?.msg as string) ||
        err.message ||
        "List by beat failed"
    );
  }
});

export const getSalon = createAsyncThunk<ISalon, { id: string }>(
  "salons/getOne",
  async ({ id }, { rejectWithValue }) => {
    try {
      const resp = await apiGet(id);
      return resp.data.data;
    } catch (e) {
      const err = e as AxiosError<ApiResponse<unknown>>;
      return rejectWithValue(
        (err.response?.data?.msg as string) || err.message || "Fetch failed"
      );
    }
  }
);

export const createSalon = createAsyncThunk<ISalon, ICreateSalonPayload>(
  "salons/create",
  async (payload, { rejectWithValue }) => {
    try {
      const resp = await apiCreate(payload);
      return resp.data.data;
    } catch (e) {
      const err = e as AxiosError<ApiResponse<unknown>>;
      return rejectWithValue(
        (err.response?.data?.msg as string) || err.message || "Create failed"
      );
    }
  }
);

export const updateSalon = createAsyncThunk<
  ISalon,
  { id: string; changes: IUpdateSalonPayload }
>("salons/update", async ({ id, changes }, { rejectWithValue }) => {
  try {
    const resp = await apiUpdate(id, changes);
    return resp.data.data;
  } catch (e) {
    const err = e as AxiosError<ApiResponse<unknown>>;
    return rejectWithValue(
      (err.response?.data?.msg as string) || err.message || "Update failed"
    );
  }
});

export const deleteSalon = createAsyncThunk<{ id: string }, { id: string }>(
  "salons/delete",
  async ({ id }, { rejectWithValue }) => {
    try {
      const resp = await apiDelete(id);
      return resp.data.data;
    } catch (e) {
      const err = e as AxiosError<ApiResponse<unknown>>;
      return rejectWithValue(
        (err.response?.data?.msg as string) || err.message || "Delete failed"
      );
    }
  }
);

// Salon Page (details + insights + recent visits)
export const fetchSalonPage = createAsyncThunk<
  { salonId: string; data: ISalonPageData; mode: "replace" | "append" },
  {
    salonId: string;
    limit?: number;
    nextToken?: string | null;
    days?: number;
    mode?: "replace" | "append";
  }
>("salons/fetchPage", async (args, { rejectWithValue }) => {
  try {
    const resp = await apiGetSalonPage(args.salonId, {
      limit: args.limit,
      nextToken: args.nextToken,
      days: args.days,
    });
    return {
      salonId: args.salonId,
      data: resp.data.data,
      mode: args.mode ?? "replace",
    };
  } catch (e) {
    const err = e as AxiosError<ApiResponse<unknown>>;
    return rejectWithValue(
      (err.response?.data?.msg as string) || err.message || "Fetch page failed"
    );
  }
});

/* ============= Slice ============= */

const salonsSlice = createSlice({
  name: "salons",
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
    clearSalons(state) {
      salonsAdapter.removeAll(state);
      state.nextToken = null;
    },
    clearSalonPage(state, action) {
      const id: string = action.payload;
      delete state.pageInsightsBySalonId[id];
      delete state.pageVisitsBySalonId[id];
      delete state.pageNextTokenBySalonId[id];
      delete state.pageStatusBySalonId[id];
      delete state.pageErrorBySalonId[id];
    },
  },
  extraReducers: (builder) => {
    // list
    builder.addCase(listSalons.pending, (state) => {
      state.listStatus = "loading";
      state.listError = undefined;
    });
    builder.addCase(listSalons.fulfilled, (state, action) => {
      const mode = action.meta.arg?.mode ?? "replace";
      if (mode === "replace") salonsAdapter.setAll(state, action.payload.items);
      else salonsAdapter.upsertMany(state, action.payload.items);
      state.nextToken = action.payload.nextToken ?? null;
      state.listStatus = "succeeded";
    });
    builder.addCase(listSalons.rejected, (state, action) => {
      state.listStatus = "failed";
      state.listError =
        (action.payload as string) || action.error.message || "List failed";
    });

    // list by beatId
    builder.addCase(listSalonsByBeatId.pending, (state) => {
      state.listStatus = "loading";
      state.listError = undefined;
    });
    builder.addCase(listSalonsByBeatId.fulfilled, (state, action) => {
      const mode = action.meta.arg?.mode ?? "replace";
      if (mode === "replace") salonsAdapter.setAll(state, action.payload.items);
      else salonsAdapter.upsertMany(state, action.payload.items);
      state.nextToken = action.payload.nextToken ?? null;
      state.listStatus = "succeeded";
    });
    builder.addCase(listSalonsByBeatId.rejected, (state, action) => {
      state.listStatus = "failed";
      state.listError =
        (action.payload as string) ||
        action.error.message ||
        "List by beat failed";
    });

    // get one
    builder.addCase(getSalon.pending, (state) => {
      state.getStatus = "loading";
      state.getError = undefined;
    });
    builder.addCase(getSalon.fulfilled, (state, action) => {
      salonsAdapter.upsertOne(state, action.payload);
      state.getStatus = "succeeded";
    });
    builder.addCase(getSalon.rejected, (state, action) => {
      state.getStatus = "failed";
      state.getError =
        (action.payload as string) || action.error.message || "Fetch failed";
    });

    // create
    builder.addCase(createSalon.pending, (state) => {
      state.createStatus = "loading";
    });
    builder.addCase(createSalon.fulfilled, (state, action) => {
      salonsAdapter.addOne(state, action.payload);
      state.createStatus = "succeeded";
    });
    builder.addCase(createSalon.rejected, (state, action) => {
      state.createStatus = "failed";
      state.createError =
        (action.payload as string) || action.error.message || "Create failed";
    });

    // update
    builder.addCase(updateSalon.pending, (state) => {
      state.updateStatus = "loading";
    });
    builder.addCase(updateSalon.fulfilled, (state, action) => {
      salonsAdapter.upsertOne(state, action.payload);
      state.updateStatus = "succeeded";
    });
    builder.addCase(updateSalon.rejected, (state, action) => {
      state.updateStatus = "failed";
      state.updateError =
        (action.payload as string) || action.error.message || "Update failed";
    });

    // delete
    builder.addCase(deleteSalon.pending, (state) => {
      state.deleteStatus = "loading";
    });
    builder.addCase(deleteSalon.fulfilled, (state, action) => {
      salonsAdapter.removeOne(state, action.payload.id);
      state.deleteStatus = "succeeded";
    });
    builder.addCase(deleteSalon.rejected, (state, action) => {
      state.deleteStatus = "failed";
      state.deleteError =
        (action.payload as string) || action.error.message || "Delete failed";
    });

    // salon page
    builder.addCase(fetchSalonPage.pending, (state, action) => {
      const id = action.meta.arg.salonId;
      state.pageStatusBySalonId[id] = "loading";
      state.pageErrorBySalonId[id] = undefined;
    });
    builder.addCase(fetchSalonPage.fulfilled, (state, action) => {
      const { salonId, data, mode } = action.payload;

      // hydrate entity
      salonsAdapter.upsertOne(state, data.salon);

      // insights
      state.pageInsightsBySalonId[salonId] = data.insights;

      // visits list
      const prev = state.pageVisitsBySalonId[salonId] ?? [];
      state.pageVisitsBySalonId[salonId] =
        mode === "append" ? [...prev, ...data.visits.items] : data.visits.items;

      state.pageNextTokenBySalonId[salonId] = data.visits.nextToken ?? null;
      state.pageStatusBySalonId[salonId] = "succeeded";
    });
    builder.addCase(fetchSalonPage.rejected, (state, action) => {
      const id = (action.meta?.arg as any)?.salonId;
      state.pageStatusBySalonId[id] = "failed";
      state.pageErrorBySalonId[id] =
        (action.payload as string) ||
        action.error.message ||
        "Fetch page failed";
    });
  },
});

/* ============= Selectors ============= */

export const {
  selectAll: selectAllSalons,
  selectById: selectSalonById,
  selectIds: selectSalonIds,
} = salonsAdapter.getSelectors((state: any) => state.salons as SalonsState);

export const selectSalonsNextToken = (state: any) =>
  (state.salons as SalonsState).nextToken;

export const selectSalonsListStatus = (state: any): Status =>
  (state.salons as SalonsState).listStatus;

export const selectSalonsListError = (state: any) =>
  (state.salons as SalonsState).listError;

export const selectSalonPageInsights = (state: any, salonId: string) =>
  (state.salons as SalonsState).pageInsightsBySalonId[salonId];

export const selectSalonPageVisits = (state: any, salonId: string) =>
  (state.salons as SalonsState).pageVisitsBySalonId[salonId] ?? [];

export const selectSalonPageNextToken = (state: any, salonId: string) =>
  (state.salons as SalonsState).pageNextTokenBySalonId[salonId] ?? null;

export const selectSalonPageStatus = (state: any, salonId: string) =>
  (state.salons as SalonsState).pageStatusBySalonId[salonId] ?? "idle";

export const selectSalonPageError = (state: any, salonId: string) =>
  (state.salons as SalonsState).pageErrorBySalonId[salonId];

export const selectSalonGetStatus = (state: any) =>
  (state.salons as SalonsState).getStatus;

export const selectSalonGetError = (state: any) =>
  (state.salons as SalonsState).getError;

/* ============= Exports ============= */

export const {
  resetListState: resetSalonListState,
  resetMutationState: resetSalonMutationState,
  clearSalons,
  clearSalonPage,
} = salonsSlice.actions;

export default salonsSlice.reducer;
