// store/slices/employeeTarget.slice.ts
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import {
  getEmployeeTarget as apiGetTarget,
  setEmployeeTarget as apiSetTarget,
  type IEmployeeTarget,
  type Response as ApiResponse,
} from "@/services/target.service";

const targetAdapter = createEntityAdapter<IEmployeeTarget, string>({
  selectId: (e) => e.sub, // if sub is a string
});

type Status = "idle" | "loading" | "succeeded" | "failed";

export interface EmployeeTargetState
  extends ReturnType<typeof targetAdapter.getInitialState> {
  getStatus: Status;
  getError?: string;
  setStatus: Status;
  setError?: string;
}

const initialState: EmployeeTargetState = targetAdapter.getInitialState({
  getStatus: "idle",
  setStatus: "idle",
});

export const fetchEmployeeTarget = createAsyncThunk<
  IEmployeeTarget,
  { sub: string }
>("employeeTarget/fetch", async ({ sub }, { rejectWithValue }) => {
  try {
    const resp = await apiGetTarget(sub);
    return resp.data.data;
  } catch (e) {
    const err = e as AxiosError<ApiResponse<unknown>>;
    return rejectWithValue(
      (err.response?.data?.msg as string) ||
        err.message ||
        "Fetch target failed"
    );
  }
});

export const updateEmployeeTarget = createAsyncThunk<
  IEmployeeTarget,
  { sub: string; targetMonthly: number }
>(
  "employeeTarget/update",
  async ({ sub, targetMonthly }, { rejectWithValue }) => {
    try {
      const resp = await apiSetTarget(sub, targetMonthly);
      return resp.data.data;
    } catch (e) {
      const err = e as AxiosError<ApiResponse<unknown>>;
      return rejectWithValue(
        (err.response?.data?.msg as string) ||
          err.message ||
          "Update target failed"
      );
    }
  }
);

const employeeTargetSlice = createSlice({
  name: "employeeTarget",
  initialState,
  reducers: {
    clearEmployeeTargets(state) {
      targetAdapter.removeAll(state);
      state.getStatus = "idle";
      state.setStatus = "idle";
      state.getError = undefined;
      state.setError = undefined;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchEmployeeTarget.pending, (s) => {
      s.getStatus = "loading";
      s.getError = undefined;
    });
    b.addCase(fetchEmployeeTarget.fulfilled, (s, a) => {
      targetAdapter.upsertOne(s, a.payload);
      s.getStatus = "succeeded";
    });
    b.addCase(fetchEmployeeTarget.rejected, (s, a) => {
      s.getStatus = "failed";
      s.getError = (a.payload as string) || a.error.message || "Fetch failed";
    });

    b.addCase(updateEmployeeTarget.pending, (s) => {
      s.setStatus = "loading";
      s.setError = undefined;
    });
    b.addCase(updateEmployeeTarget.fulfilled, (s, a) => {
      targetAdapter.upsertOne(s, a.payload);
      s.setStatus = "succeeded";
    });
    b.addCase(updateEmployeeTarget.rejected, (s, a) => {
      s.setStatus = "failed";
      s.setError = (a.payload as string) || a.error.message || "Update failed";
    });
  },
});

export default employeeTargetSlice.reducer;
export const { clearEmployeeTargets } = employeeTargetSlice.actions;

/* selectors */
export const {
  selectById: selectEmployeeTargetBySub,
  selectAll: selectAllEmployeeTargets,
} = targetAdapter.getSelectors(
  (state: any) => state.employeeTarget as EmployeeTargetState
);

export const selectTargetGetStatus = (state: any) =>
  (state.employeeTarget as EmployeeTargetState).getStatus;
export const selectTargetSetStatus = (state: any) =>
  (state.employeeTarget as EmployeeTargetState).setStatus;
export const selectTargetGetError = (state: any) =>
  (state.employeeTarget as EmployeeTargetState).getError;
export const selectTargetSetError = (state: any) =>
  (state.employeeTarget as EmployeeTargetState).setError;
