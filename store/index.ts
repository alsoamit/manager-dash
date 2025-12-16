import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "@/store/slices/products.slice";
import salonsReducer from "@/store/slices/salon.slice";
import employeesReducer from "@/store/slices/employees.slice";
import targetReducer from "@/store/slices/target.slice";
import beatsReducer from "@/store/slices/beats.slice";
import ordersReducer from "@/store/slices/order.slice";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    salons: salonsReducer,
    employees: employeesReducer,
    employeeTarget: targetReducer,
    beats: beatsReducer,
    orders: ordersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
