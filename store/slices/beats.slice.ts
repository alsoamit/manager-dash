import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import {
  listBeats as apiListBeats,
  getBeat as apiGetBeat,
  createBeat as apiCreateBeat,
  updateBeat as apiUpdateBeat,
  deleteBeat as apiDeleteBeat,
  assignBeatsToUser as apiAssignBeatsToUser,
  getAssignedBeats as apiGetAssignedBeats,
  type IBeat,
  type ICreateBeatPayload,
  type IUpdateBeatPayload,
  type IAssignBeatsPayload,
  type IAssignedBeat,
  type Response as ApiResponse,
  type IListBeatsData,
  type IAssignedBeatsData,
} from "@/services/beat.service";

/* =========================
 * Entity adapter & state
 * ========================= */
const beatsAdapter = createEntityAdapter<IBeat>({
  sortComparer: (a, b) => (a.createdAt > b.createdAt ? -1 : 1), // newest first
});

type Status = "idle" | "loading" | "succeeded" | "failed";

export interface BeatsState
  extends ReturnType<typeof beatsAdapter.getInitialState> {
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

  assignStatus: Status;
  assignError?: string;

  assignedBeats: Record<string, IAssignedBeat[]>; // userId -> assigned beats
  assignedBeatsStatus: Record<string, Status>; // userId -> status
}

const initialState: BeatsState = beatsAdapter.getInitialState({
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

  assignStatus: "idle",
  assignError: undefined,

  assignedBeats: {},
  assignedBeatsStatus: {},
});

/* =========================
 * Thunks
 * ========================= */

// List
export const listBeats = createAsyncThunk<
  IListBeatsData,
  {
    limit?: number;
    nextToken?: string | null;
    mode?: "replace" | "append";
    includeSalonCounts?: boolean;
  }
>("beats/list", async (args, { rejectWithValue }) => {
  try {
    const resp = await apiListBeats({
      limit: args?.limit,
      nextToken: args?.nextToken ?? undefined,
      includeSalonCounts: args?.includeSalonCounts,
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
export const getBeat = createAsyncThunk<IBeat, { id: string }>(
  "beats/getOne",
  async ({ id }, { rejectWithValue }) => {
    try {
      const resp = await apiGetBeat(id);
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
export const createBeat = createAsyncThunk<IBeat, ICreateBeatPayload>(
  "beats/create",
  async (payload, { rejectWithValue }) => {
    try {
      const resp = await apiCreateBeat(payload);
      return resp.data.data;
    } catch (e) {
      const err = e as AxiosError<ApiResponse<unknown>>;
      return rejectWithValue(
        (err.response?.data?.msg as string) || err.message || "Create failed"
      );
    }
  }
);

// Update
export const updateBeat = createAsyncThunk<
  IBeat,
  { id: string; payload: IUpdateBeatPayload }
>("beats/update", async ({ id, payload }, { rejectWithValue }) => {
  try {
    const resp = await apiUpdateBeat(id, payload);
    return resp.data.data;
  } catch (e) {
    const err = e as AxiosError<ApiResponse<unknown>>;
    return rejectWithValue(
      (err.response?.data?.msg as string) || err.message || "Update failed"
    );
  }
});

// Delete
export const deleteBeat = createAsyncThunk<string, { id: string }>(
  "beats/delete",
  async ({ id }, { rejectWithValue }) => {
    try {
      await apiDeleteBeat(id);
      return id;
    } catch (e) {
      const err = e as AxiosError<ApiResponse<unknown>>;
      return rejectWithValue(
        (err.response?.data?.msg as string) || err.message || "Delete failed"
      );
    }
  }
);

// Assign beats to user
export const assignBeatsToUser = createAsyncThunk<
  { userId: string; assignedBeats: Array<{ beatId: string; order: number }> },
  IAssignBeatsPayload
>("beats/assign", async (payload, { rejectWithValue }) => {
  try {
    const resp = await apiAssignBeatsToUser(payload);
    return resp.data.data;
  } catch (e) {
    const err = e as AxiosError<ApiResponse<unknown>>;
    return rejectWithValue(
      (err.response?.data?.msg as string) || err.message || "Assign failed"
    );
  }
});

// Get assigned beats for user
export const getAssignedBeats = createAsyncThunk<
  IAssignedBeatsData & { userId: string },
  { userId: string }
>("beats/getAssigned", async ({ userId }, { rejectWithValue }) => {
  try {
    const resp = await apiGetAssignedBeats(userId);
    return { ...resp.data.data, userId };
  } catch (e) {
    const err = e as AxiosError<ApiResponse<unknown>>;
    return rejectWithValue(
      (err.response?.data?.msg as string) || err.message || "Fetch failed"
    );
  }
});

/* =========================
 * Slice
 * ========================= */
const slice = createSlice({
  name: "beats",
  initialState,
  reducers: {
    clearBeats(state) {
      beatsAdapter.removeAll(state);
      state.listStatus = "idle";
      state.listError = undefined;
      state.nextToken = null;
    },
  },
  extraReducers: (b) => {
    // listBeats
    b.addCase(listBeats.pending, (s) => {
      s.listStatus = "loading";
      s.listError = undefined;
    });
    b.addCase(listBeats.fulfilled, (s, a) => {
      const mode = a.meta.arg?.mode ?? "replace";
      if (mode === "replace") beatsAdapter.setAll(s, a.payload.items);
      else beatsAdapter.upsertMany(s, a.payload.items);

      s.nextToken = a.payload.nextToken ?? null;
      s.listStatus = "succeeded";
    });
    b.addCase(listBeats.rejected, (s, a) => {
      s.listStatus = "failed";
      s.listError = (a.payload as string) || a.error.message || "List failed";
    });

    // getBeat
    b.addCase(getBeat.pending, (s) => {
      s.getStatus = "loading";
      s.getError = undefined;
    });
    b.addCase(getBeat.fulfilled, (s, a) => {
      beatsAdapter.upsertOne(s, a.payload);
      s.getStatus = "succeeded";
    });
    b.addCase(getBeat.rejected, (s, a) => {
      s.getStatus = "failed";
      s.getError = (a.payload as string) || a.error.message || "Fetch failed";
    });

    // createBeat
    b.addCase(createBeat.pending, (s) => {
      s.createStatus = "loading";
      s.createError = undefined;
    });
    b.addCase(createBeat.fulfilled, (s, a) => {
      beatsAdapter.addOne(s, a.payload);
      s.createStatus = "succeeded";
    });
    b.addCase(createBeat.rejected, (s, a) => {
      s.createStatus = "failed";
      s.createError =
        (a.payload as string) || a.error.message || "Create failed";
    });

    // updateBeat
    b.addCase(updateBeat.pending, (s) => {
      s.updateStatus = "loading";
      s.updateError = undefined;
    });
    b.addCase(updateBeat.fulfilled, (s, a) => {
      beatsAdapter.upsertOne(s, a.payload);
      s.updateStatus = "succeeded";
    });
    b.addCase(updateBeat.rejected, (s, a) => {
      s.updateStatus = "failed";
      s.updateError =
        (a.payload as string) || a.error.message || "Update failed";
    });

    // deleteBeat
    b.addCase(deleteBeat.pending, (s) => {
      s.deleteStatus = "loading";
      s.deleteError = undefined;
    });
    b.addCase(deleteBeat.fulfilled, (s, a) => {
      beatsAdapter.removeOne(s, a.payload);
      s.deleteStatus = "succeeded";
    });
    b.addCase(deleteBeat.rejected, (s, a) => {
      s.deleteStatus = "failed";
      s.deleteError =
        (a.payload as string) || a.error.message || "Delete failed";
    });

    // assignBeatsToUser
    b.addCase(assignBeatsToUser.pending, (s) => {
      s.assignStatus = "loading";
      s.assignError = undefined;
    });
    b.addCase(assignBeatsToUser.fulfilled, (s, a) => {
      s.assignStatus = "succeeded";
      // Refresh assigned beats for this user
      // The actual beats will be fetched separately
    });
    b.addCase(assignBeatsToUser.rejected, (s, a) => {
      s.assignStatus = "failed";
      s.assignError =
        (a.payload as string) || a.error.message || "Assign failed";
    });

    // getAssignedBeats
    b.addCase(getAssignedBeats.pending, (s, a) => {
      const userId = a.meta.arg.userId;
      s.assignedBeatsStatus[userId] = "loading";
    });
    b.addCase(getAssignedBeats.fulfilled, (s, a) => {
      const userId = a.payload.userId;
      s.assignedBeats[userId] = a.payload.items;
      s.assignedBeatsStatus[userId] = "succeeded";
      // Also upsert beats into main store
      beatsAdapter.upsertMany(
        s,
        a.payload.items.map(({ order, ...beat }) => beat)
      );
    });
    b.addCase(getAssignedBeats.rejected, (s, a) => {
      const userId = a.meta.arg.userId;
      s.assignedBeatsStatus[userId] = "failed";
    });
  },
});

export const { selectAll: selectAllBeats, selectById: selectBeatById } =
  beatsAdapter.getSelectors((state: any) => state.beats as BeatsState);

export const selectBeatsListStatus = (state: any) =>
  (state.beats as BeatsState).listStatus;

export const selectBeatsListError = (state: any) =>
  (state.beats as BeatsState).listError;

export const selectBeatsNextToken = (state: any) =>
  (state.beats as BeatsState).nextToken;

export const selectBeatGetStatus = (state: any) =>
  (state.beats as BeatsState).getStatus;

export const selectBeatGetError = (state: any) =>
  (state.beats as BeatsState).getError;

export const selectBeatCreateStatus = (state: any) =>
  (state.beats as BeatsState).createStatus;

export const selectBeatUpdateStatus = (state: any) =>
  (state.beats as BeatsState).updateStatus;

export const selectBeatDeleteStatus = (state: any) =>
  (state.beats as BeatsState).deleteStatus;

export const selectAssignedBeats = (state: any, userId: string) =>
  (state.beats as BeatsState).assignedBeats[userId] || [];

export const selectAssignedBeatsStatus = (state: any, userId: string) =>
  (state.beats as BeatsState).assignedBeatsStatus[userId] || "idle";

export const selectBeatAssignStatus = (state: any) =>
  (state.beats as BeatsState).assignStatus;

export const { clearBeats } = slice.actions;

export default slice.reducer;
