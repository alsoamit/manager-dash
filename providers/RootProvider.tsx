"use client";

import { Toaster } from "@/components/ui/sonner";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import BaseLayoutWrapper from "./BaseLayoutProvider";
import { store } from "@/store";
import { ThemeProvider } from "./ThemeProvider";

export default function RootProvider({ children }: any) {
  return (
    <NextAuthSessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      <Provider store={store}>
        <ThemeProvider>
          <BaseLayoutWrapper>{children}</BaseLayoutWrapper>
          <Toaster position="top-center" />
        </ThemeProvider>
      </Provider>
    </NextAuthSessionProvider>
  );
}
