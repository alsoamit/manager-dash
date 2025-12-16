"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Head from "next/head";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { loginSchema, type TLoginFormData } from "@/validators/auth.validator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params?.get("callbackUrl") || "/";

  const form = useForm<TLoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    criteriaMode: "all",
    defaultValues: { username: "", password: "" },
  });

  const { handleSubmit, control, formState, setError, clearErrors } = form;

  // Map error codes to user-friendly messages
  const getErrorMessage = (code: string | null): string | null => {
    if (!code) return null;

    const errorMessages: Record<string, string> = {
      LoginRequestError: "Request already submitted. Contact admin.",
      LoginAfterNoonNotAllowed: "Request submitted. Contact admin.",
      UserNotConfirmedException: "Please verify your email first.",
      NotAuthorizedException: "Invalid username or password.",
      UserNotFoundException: "User not found.",
    };

    return errorMessages[code] || null;
  };

  // Check for error in URL params on mount (Auth.js redirects with error param)
  useEffect(() => {
    const errorParam = params?.get("error");
    const codeParam = params?.get("code");

    if (errorParam === "CredentialsSignin" && codeParam) {
      // For CredentialsSignin errors, check the code and show mapped message
      const errorMessage = getErrorMessage(codeParam);
      if (errorMessage) {
        setError("root", { type: "server", message: errorMessage });
        // Clear the error params from URL
        router.replace("/auth/login", { scroll: false });
      }
    } else if (errorParam && errorParam !== "CredentialsSignin") {
      // For other errors, show the error code or mapped message
      const errorMessage = getErrorMessage(errorParam) || errorParam;
      setError("root", { type: "server", message: errorMessage });
      router.replace("/auth/login", { scroll: false });
    }
  }, [params, setError, router]);

  const onSubmit = async (data: TLoginFormData) => {
    clearErrors("root");

    // Clear any existing error from URL params
    if (params?.get("error")) {
      router.replace("/auth/login", { scroll: false });
    }

    const result = await signIn("credentials", {
      username: data.username.trim(),
      password: data.password,
      redirect: false,
    });

    // Check result code first (for specific error types) - matching working example
    if (result?.code === "UserNotConfirmedException") {
      router.push("/auth/verify-email");
      return;
    }

    // Check for code in URL params (Auth.js redirects with code param)
    const codeParam = params?.get("code");
    const errorParam = params?.get("error");

    // If we have a code in URL params, use it
    const errorCode = result?.code || codeParam;

    if (errorCode) {
      const errorMessage = getErrorMessage(errorCode);
      if (errorMessage) {
        setError("root", { type: "server", message: errorMessage });
        // Clear URL params
        if (codeParam || errorParam) {
          router.replace("/auth/login", { scroll: false });
        }
        return;
      }
    }

    // Check for error in result
    if (result?.error) {
      // If error is CredentialsSignin, check URL params for code
      if (result.error === "CredentialsSignin" && codeParam) {
        const errorMessage = getErrorMessage(codeParam);
        if (errorMessage) {
          setError("root", { type: "server", message: errorMessage });
          router.replace("/auth/login", { scroll: false });
          return;
        }
      }
      setError("root", { type: "server", message: result.error });
      return;
    }

    router.push(callbackUrl);
  };

  return (
    <div className="flex items-center justify-center p-4 min-h-dvh">
      <Head>
        <title>Login</title>
      </Head>

      <div className="flex flex-col items-center justify-center w-full max-w-md p-6 border bg-card rounded-xl lg:p-8">
        <h2 className="text-2xl font-semibold text-center sm:text-3xl">
          Login
        </h2>

        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full mt-6 space-y-6"
          >
            {formState.errors.root?.message && (
              <Alert variant="destructive" role="alert" aria-live="assertive">
                <AlertDescription>
                  {formState.errors.root.message}
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username or Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your-username or email"
                      autoComplete="username"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (formState.errors.root) clearErrors("root");
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Your password"
                        autoComplete="current-password"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (formState.errors.root) clearErrors("root");
                        }}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute -translate-y-1/2 right-2 top-1/2"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <AiOutlineEye className="text-xl text-primary" />
                      ) : (
                        <AiOutlineEyeInvisible className="text-xl text-primary" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={!formState.isValid || formState.isSubmitting}
            >
              {formState.isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Form>

        <div className="w-full mt-10 space-y-2 text-sm">
          <p className="">
            Forgot Password?{" "}
            <a
              href="https://app.frenzyfollicles.com/auth/forgot-password"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-green-300 hover:underline"
            >
              Reset Password
            </a>
          </p>
          <p>
            Don&apos;t have an account?{" "}
            <a
              href="https://app.frenzyfollicles.com/auth/register"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-green-300 hover:underline"
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
