import { z } from "zod";

export const confirmSignUpSchema = z.object({
  username: z.string().min(1, "Username is required"),
  confirmationCode: z.string().min(1, "Confirmation Code is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
});

export const loginSchema = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  username: z.string().min(3, "Username must be at least 3 characters long"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const resetPasswordSchema = z.object({
  user: z.string().min(1, "Required field"),
  code: z
    .string()
    .length(6, "Code must be exactly 6 characters")
    .regex(/^\d{6}$/, "Code must contain only digits"),
  newpassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(15, "Password must be at most 15 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character"
    ),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "required field"),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(15, "Password must be at most 15 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "required field"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type TConfirmSignUpFormData = z.infer<typeof confirmSignUpSchema>;
export type TForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type TLoginFormData = z.infer<typeof loginSchema>;
export type TResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type TChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type TSignUpFormData = z.infer<typeof signUpSchema>;
export type TResetPasswordForm = z.infer<typeof resetPasswordSchema>;
