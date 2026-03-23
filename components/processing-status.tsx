"use client";

import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessingStatusProps {
  status: "idle" | "uploading" | "processing" | "completed" | "error";
  message: string;
  progress: number;
}

export function ProcessingStatus({
  status,
  message,
  progress,
}: ProcessingStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-accent" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "bg-accent";
      case "error":
        return "bg-destructive";
      default:
        return "bg-primary";
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        {getStatusIcon()}
        <div>
          <p className="font-medium text-foreground capitalize">{status}</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-foreground font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out rounded-full",
              getStatusColor()
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {status === "processing" && (
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse [animation-delay:100ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse [animation-delay:200ms]" />
          </div>
          <span>Processing may take a few minutes depending on audio length</span>
        </div>
      )}
    </div>
  );
}
