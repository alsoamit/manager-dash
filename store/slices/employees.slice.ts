import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import {
  listEmployees as apiList,
  deleteEmployee as apiDelete,
  updateEmployee as apiUpdate,
  registerEmployee as apiRegister,
  type IEmployee,
  type IListEmployeesData,
  type Response as ApiResponse,
} from "@/services/employee.service";
import { getEmployee as apiGet } from "@/services/employee.service";

// assuming e.sub is a string. If it's number, use `number`. If mixed, use `EntityId`.
const employeesAdapter = createEntityAdapter<IEmployee, string>({
  selectId: (e) => e.sub,
  sortComparer: (a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
});

type Status = "idle" | "loading" | "succeeded" | "failed";

export interface EmployeesState
  extends ReturnType<typeof employeesAdapter.getInitialState> {
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

const initialState: EmployeesState = employeesAdapter.getInitialState({
  listStatus: "idle",
  listError: undefined,
  nextToken: null,
  getStatus: "idle",
  getError: undefined,
  createStatus: "idle",
  updateStatus: "idle",
  deleteStatus: "idle",
});

export const listEmployees = createAsyncThunk<
  IListEmployeesData,
  { limit?: number; nextToken?: string | null; mode?: "replace" | "append" }
>("employees/list", async (args, { rejectWithValue }) => {
  try {
    const resp = await apiList({
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

export const updateEmployee = createAsyncThunk<
  IEmployee,
  { sub: string; changes: Partial<IEmployee> }
>("employees/update", async ({ sub, changes }, { rejectWithValue }) => {
  try {
    const resp = await apiUpdate(sub, changes);
    return resp.data.data;
  } catch (e) {
    const err = e as AxiosError<ApiResponse<unknown>>;
    return rejectWithValue(
      (err.response?.data?.msg as string) || err.message || "Update failed"
    );
  }
});

export const deleteEmployee = createAsyncThunk<
  { sub: string },
  { sub: string }
>("employees/delete", async ({ sub }, { rejectWithValue }) => {
  try {
    const resp = await apiDelete(sub);
    return { sub: resp.data.data.sub };
  } catch (e) {
    const err = e as AxiosError<ApiResponse<unknown>>;
    return rejectWithValue(
      (err.response?.data?.msg as string) || err.message || "Delete failed"
    );
  }
});

export const registerEmployee = createAsyncThunk<
  any,
  {
    username: string;
    password: string;
    email: string;
    name: string;
  }
>("employees/register", async (payload, { rejectWithValue }) => {
  try {
    const resp = await apiRegister(payload);
    return resp.data.data;
  } catch (e) {
    const err = e as AxiosError<ApiResponse<unknown>>;
    return rejectWithValue(
      (err.response?.data?.msg as string) || err.message || "Register failed"
    );
  }
});

export const getEmployee = createAsyncThunk<IEmployee, { sub: string }>(
  "employees/getOne",
  async ({ sub }, { rejectWithValue }) => {
    try {
      console.log("trying");

      const resp = await apiGet(sub); // import as: import { getEmployee as apiGet } from "@/services/employee.service";
      return resp.data.data;
    } catch (e) {
      const err = e as AxiosError<ApiResponse<unknown>>;
      return rejectWithValue(
        (err.response?.data?.msg as string) || err.message || "Fetch failed"
      );
    }
  }
);

const slice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    clearEmployees(state) {
      employeesAdapter.removeAll(state);
      state.nextToken = null;
      state.listStatus = "idle";
    },
  },
  extraReducers: (b) => {
    b.addCase(getEmployee.pending, (s) => {
      s.getStatus = "loading";
      s.getError = undefined;
    });
    b.addCase(getEmployee.fulfilled, (s, a) => {
      employeesAdapter.upsertOne(s, a.payload);
      s.getStatus = "succeeded";
    });
    b.addCase(getEmployee.rejected, (s, a) => {
      s.getStatus = "failed";
      s.getError =
        (a.payload as string) || a.error.message || "Fetch failed";
    });
    b.addCase(listEmployees.pending, (s) => {
      s.listStatus = "loading";
      s.listError = undefined;
    });
    b.addCase(listEmployees.fulfilled, (s, a) => {
      const mode = a.meta.arg?.mode ?? "replace";
      if (mode === "replace") employeesAdapter.setAll(s, a.payload.items);
      else employeesAdapter.upsertMany(s, a.payload.items);
      s.nextToken = a.payload.nextToken ?? null;
      s.listStatus = "succeeded";
    });
    b.addCase(listEmployees.rejected, (s, a) => {
      s.listStatus = "failed";
      s.listError = (a.payload as string) || a.error.message || "List failed";
    });

    b.addCase(updateEmployee.pending, (s) => {
      s.updateStatus = "loading";
    });
    b.addCase(updateEmployee.fulfilled, (s, a) => {
      employeesAdapter.upsertOne(s, a.payload);
      s.updateStatus = "succeeded";
    });
    b.addCase(updateEmployee.rejected, (s, a) => {
      s.updateStatus = "failed";
      s.updateError =
        (a.payload as string) || a.error.message || "Update failed";
    });

    b.addCase(deleteEmployee.pending, (s) => {
      s.deleteStatus = "loading";
    });
    b.addCase(deleteEmployee.fulfilled, (s, a) => {
      employeesAdapter.removeOne(s, a.payload.sub);
      s.deleteStatus = "succeeded";
    });
    b.addCase(deleteEmployee.rejected, (s, a) => {
      s.deleteStatus = "failed";
      s.deleteError =
        (a.payload as string) || a.error.message || "Delete failed";
    });
  },
});

export const { selectAll: selectAllEmployees, selectById: selectEmployeeById } =
  employeesAdapter.getSelectors(
    (state: any) => state.employees as EmployeesState
  );

export const selectEmployeesNextToken = (state: any) =>
  (state.employees as EmployeesState).nextToken;

export const selectEmployeesListStatus = (state: any) =>
  (state.employees as EmployeesState).listStatus;

export const selectEmployeesListError = (state: any) =>
  (state.employees as EmployeesState).listError;

export const selectEmployeeGetStatus = (state: any) =>
  (state.employees as EmployeesState).getStatus;

export const selectEmployeeGetError = (state: any) =>
  (state.employees as EmployeesState).getError;

export const { clearEmployees } = slice.actions;

export default slice.reducer;
