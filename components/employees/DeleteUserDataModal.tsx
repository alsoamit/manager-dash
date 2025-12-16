"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { deleteAllUserData } from "@/services/userDataDeletion.service";
import socket from "@/lib/socket";
import useSession from "@/hooks/useSession";
import toast from "react-hot-toast";

const eraseDataSchema = z.object({
  userEmail: z.string().email("Invalid email address"),
  adminEmail: z.string().email("Invalid email address"),
  confirmationText: z.string().refine((val) => val === "I WANT TO DELETE IT", {
    message: 'Must be exactly "I WANT TO DELETE IT"',
  }),
});

type EraseDataFormValues = z.infer<typeof eraseDataSchema>;

interface DeletionStep {
  step: string;
  stepNumber: number;
  totalSteps: number;
  status: "pending" | "querying" | "deleting" | "completed" | "error";
  totalItems?: number;
  total?: number;
  deleted?: number;
  batch?: number;
  totalBatches?: number;
  error?: string;
}

export default function DeleteUserDataModal({
  sub,
  userEmail,
  open,
  onOpenChange,
}: {
  sub: string;
  userEmail?: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const { session } = useSession();
  const [deletionMode, setDeletionMode] = React.useState<
    "erase" | "erase-and-delete" | null
  >(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [steps, setSteps] = React.useState<DeletionStep[]>([]);
  const [summary, setSummary] = React.useState<Record<string, number>>({});
  const [errors, setErrors] = React.useState<
    Array<{ step: string; error: string }>
  >([]);
  const [socketConnected, setSocketConnected] = React.useState(false);

  const form = useForm<EraseDataFormValues>({
    resolver: zodResolver(eraseDataSchema),
    defaultValues: {
      userEmail: "",
      adminEmail: "",
      confirmationText: "",
    },
  });

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (open) {
      form.reset({
        userEmail: "",
        adminEmail: "",
        confirmationText: "",
      });
      setDeletionMode(null);
      setSteps([]);
      setSummary({});
      setErrors([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Socket connection for real-time updates
  React.useEffect(() => {
    if (!open || !deletionMode) return;

    // Connect socket if not connected
    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      setSocketConnected(true);
      // Join admin activities room
      if (session?.user?.role === "admin" && session?.user?.sub) {
        socket.emit("join", { sub: session.user.sub, isAdmin: true });
      }
    };

    const onDisconnect = () => {
      setSocketConnected(false);
    };

    const onDeletionStarted = (data: {
      sub: string;
      userEmail: string;
      adminEmail: string;
    }) => {
      if (data.sub === sub) {
        setIsDeleting(true);
        setSteps([]);
        setSummary({});
        setErrors([]);
      }
    };

    const onStepStart = (data: {
      step: string;
      stepNumber: number;
      totalSteps: number;
    }) => {
      if (data.stepNumber <= data.totalSteps) {
        setSteps((prev) => {
          const existing = prev.find((s) => s.step === data.step);
          if (existing) {
            return prev.map((s) =>
              s.step === data.step
                ? {
                    ...s,
                    status: "querying",
                    stepNumber: data.stepNumber,
                    totalSteps: data.totalSteps,
                  }
                : s
            );
          }
          return [
            ...prev,
            {
              step: data.step,
              stepNumber: data.stepNumber,
              totalSteps: data.totalSteps,
              status: "querying",
            },
          ];
        });
      }
    };

    const onStepQuerying = (data: { step: string; count: number }) => {
      setSteps((prev) =>
        prev.map((s) =>
          s.step === data.step ? { ...s, status: "querying" } : s
        )
      );
    };

    const onStepQueryComplete = (data: {
      step: string;
      totalItems: number;
    }) => {
      setSteps((prev) =>
        prev.map((s) =>
          s.step === data.step
            ? {
                ...s,
                status: "deleting",
                totalItems: data.totalItems,
                deleted: 0,
              }
            : s
        )
      );
    };

    const onStepDeleting = (data: {
      step: string;
      deleted: number;
      total: number;
      batch: number;
      totalBatches: number;
    }) => {
      setSteps((prev) =>
        prev.map((s) =>
          s.step === data.step
            ? {
                ...s,
                status: "deleting",
                deleted: data.deleted,
                total: data.total,
                batch: data.batch,
                totalBatches: data.totalBatches,
              }
            : s
        )
      );
    };

    const onStepComplete = (data: {
      step: string;
      deleted: number;
      total: number;
    }) => {
      setSteps((prev) =>
        prev.map((s) =>
          s.step === data.step
            ? {
                ...s,
                status: "completed",
                deleted: data.deleted,
                total: data.total,
              }
            : s
        )
      );
      setSummary((prev) => ({ ...prev, [data.step]: data.deleted }));
    };

    const onStepError = (data: { step: string; error: string }) => {
      setSteps((prev) =>
        prev.map((s) =>
          s.step === data.step
            ? { ...s, status: "error", error: data.error }
            : s
        )
      );
      setErrors((prev) => [...prev, { step: data.step, error: data.error }]);
    };

    const onDeletionComplete = (data: {
      summary: Record<string, number>;
      errors: Array<{ step: string; error: string }>;
      userDeleted?: boolean;
    }) => {
      setIsDeleting(false);
      setSummary(data.summary);
      setErrors(data.errors);

      // Backend handles user deletion as a step, so we just show the result
      if (data.userDeleted) {
        toast.success("User data and account deleted successfully");
        onOpenChange(false);
        router.push("/employees");
      } else if (deletionMode === "erase-and-delete" && data.errors.length > 0) {
        toast.error(
          "Data deletion completed with errors. User account was not deleted."
        );
      } else if (deletionMode === "erase") {
        toast.success("User data erased successfully");
        onOpenChange(false);
      } else {
        toast.success("User data deletion completed");
        onOpenChange(false);
      }
    };

    const onDeletionFailed = (data: { error: string }) => {
      setIsDeleting(false);
      toast.error(`Deletion failed: ${data.error}`, {
        duration: 6000, // Show longer for important errors
      });
      // Add the error to the errors list for display
      setErrors((prev) => [
        ...prev,
        { step: "Deletion Process", error: data.error },
      ]);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("user-deletion-started", onDeletionStarted);
    socket.on("user-deletion-step-start", onStepStart);
    socket.on("user-deletion-step-querying", onStepQuerying);
    socket.on("user-deletion-step-query-complete", onStepQueryComplete);
    socket.on("user-deletion-step-deleting", onStepDeleting);
    socket.on("user-deletion-step-complete", onStepComplete);
    socket.on("user-deletion-step-error", onStepError);
    socket.on("user-deletion-complete", onDeletionComplete);
    socket.on("user-deletion-failed", onDeletionFailed);

    // If already connected, join immediately
    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("user-deletion-started", onDeletionStarted);
      socket.off("user-deletion-step-start", onStepStart);
      socket.off("user-deletion-step-querying", onStepQuerying);
      socket.off("user-deletion-step-query-complete", onStepQueryComplete);
      socket.off("user-deletion-step-deleting", onStepDeleting);
      socket.off("user-deletion-step-complete", onStepComplete);
      socket.off("user-deletion-step-error", onStepError);
      socket.off("user-deletion-complete", onDeletionComplete);
      socket.off("user-deletion-failed", onDeletionFailed);
    };
  }, [open, deletionMode, sub, session?.user?.role, session?.user?.sub]);

  const handleEraseData = async (values: EraseDataFormValues) => {
    try {
      setIsDeleting(true);
      // Pass deleteUser flag based on deletion mode
      await deleteAllUserData(sub, {
        ...values,
        deleteUser: deletionMode === "erase-and-delete",
      });
      // The actual deletion happens via Socket.io events
      // The API call just triggers it
    } catch (err: any) {
      setIsDeleting(false);
      toast.error(err?.response?.data?.msg || "Failed to start data deletion");
    }
  };



  const totalSteps = steps.length > 0 ? steps[0].totalSteps : 8;
  const completedSteps = steps.filter((s) => s.status === "completed").length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" />
            Erase User Data
          </DialogTitle>
          <DialogDescription>
            Choose how you want to proceed. You can erase data only, or erase
            data and delete the user account.
          </DialogDescription>
        </DialogHeader>

        {!deletionMode ? (
          <div className="space-y-4 flex-shrink-0">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="break-words">
                <strong>Warning:</strong> This action cannot be undone. Erasing
                user data will permanently remove all data from the system.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <button
                type="button"
                className="w-full text-left py-4 px-4 rounded-md border bg-muted hover:bg-muted/80 transition-colors"
                onClick={() => setDeletionMode("erase")}
              >
                <div className="flex flex-col items-start gap-1 w-full">
                  <div className="font-semibold break-words">Erase</div>
                  <div className="text-sm text-muted-foreground font-normal break-words">
                    Delete all user data from all tables, but keep the user
                    account. The user account will remain but without any data.
                  </div>
                </div>
              </button>

              <button
                type="button"
                className="w-full text-left py-4 px-4 rounded-md border hover:bg-muted/50 transition-colors"
                onClick={() => setDeletionMode("erase-and-delete")}
              >
                <div className="flex flex-col items-start gap-1 w-full">
                  <div className="font-semibold break-words">
                    Erase and Delete
                  </div>
                  <div className="text-sm text-muted-foreground font-normal break-words">
                    Delete all user data from all tables, then delete the user
                    account. This ensures complete data removal.
                  </div>
                </div>
              </button>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </div>
        ) : deletionMode === "erase" || deletionMode === "erase-and-delete" ? (
          <div className="space-y-4">
            {!isDeleting ? (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleEraseData)}
                  className="space-y-4"
                >
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="break-words">
                      This will delete all user data from: Sales, Orders, Demos,
                      Visits, Salons, DailyVisitTargets, and LoginRequest
                      tables.
                      {deletionMode === "erase-and-delete" && (
                        <span className="block mt-1">
                          After data deletion, the user account will also be
                          deleted.
                        </span>
                      )}
                      {deletionMode === "erase" && (
                        <span className="block mt-1">
                          The user account will remain but without any data.
                        </span>
                      )}
                      This action cannot be undone.
                    </AlertDescription>
                  </Alert>

                  <FormField
                    control={form.control}
                    name="userEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User Email</FormLabel>
                        <FormControl>
                          <Input placeholder="user@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="adminEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Email</FormLabel>
                        <FormControl>
                          <Input placeholder="admin@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmationText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Type &quot;I WANT TO DELETE IT&quot; to confirm
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="I WANT TO DELETE IT" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter className="gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDeletionMode(null)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={!form.formState.isValid}
                    >
                      Start Deletion
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            ) : (
              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                <div className="space-y-2 flex-shrink-0">
                  <div className="flex items-center justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>
                      {completedSteps}/{totalSteps} steps completed
                    </span>
                  </div>
                  <Progress value={progress} />
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto min-h-0">
                  {steps.map((step) => (
                    <div
                      key={step.step}
                      className="p-3 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {step.status === "completed" ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : step.status === "error" ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : step.status === "deleting" ||
                            step.status === "querying" ? (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                          )}
                          <span className="font-medium">{step.step}</span>
                        </div>
                        <Badge
                          variant={
                            step.status === "completed"
                              ? "default"
                              : step.status === "error"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {step.status === "completed"
                            ? "Completed"
                            : step.status === "error"
                            ? "Error"
                            : step.status === "deleting"
                            ? "Deleting"
                            : step.status === "querying"
                            ? "Querying"
                            : "Pending"}
                        </Badge>
                      </div>

                      {step.status === "deleting" &&
                        step.total !== undefined && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                Batch {step.batch}/{step.totalBatches}
                              </span>
                              <span>
                                {step.deleted}/{step.total} items deleted
                              </span>
                            </div>
                            <Progress
                              value={
                                step.total > 0
                                  ? ((step.deleted || 0) / step.total) * 100
                                  : 0
                              }
                              className="h-1"
                            />
                          </div>
                        )}

                      {step.status === "querying" && (
                        <div className="text-xs text-muted-foreground">
                          Finding all items...
                        </div>
                      )}

                      {step.status === "completed" &&
                        step.deleted !== undefined && (
                          <div className="text-xs text-muted-foreground">
                            Deleted {step.deleted} item
                            {step.deleted !== 1 ? "s" : ""}
                          </div>
                        )}

                      {step.status === "error" && step.error && (
                        <Alert variant="destructive" className="py-2">
                          <AlertDescription className="text-xs break-words">
                            {step.error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>

                {errors.length > 0 && (
                  <Alert variant="destructive" className="flex-shrink-0">
                    <AlertDescription className="break-words">
                      <strong>Errors occurred:</strong>
                      <ul className="list-disc list-inside mt-2">
                        {errors.map((err, idx) => (
                          <li key={idx} className="text-xs break-words">
                            {err.step}: {err.error}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {!isDeleting && Object.keys(summary).length > 0 && (
                  <Alert className="flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription className="break-words">
                      <strong>Deletion process completed.</strong>
                      {deletionMode === "erase-and-delete" &&
                        summary["User Account"] === 1 && (
                          <span> User account has been deleted.</span>
                        )}
                      {deletionMode === "erase-and-delete" &&
                        summary["User Account"] !== 1 &&
                        errors.length > 0 && (
                          <span>
                            {" "}
                            User account was NOT deleted due to errors in data
                            deletion.
                          </span>
                        )}
                      {deletionMode === "erase" && (
                        <span> User data has been erased successfully.</span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
