import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We encountered an error while loading the data. Please try again.",
  onRetry,
  fullScreen = false,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-8 text-center",
        fullScreen && "h-screen",
        className
      )}
    >
      <div className="rounded-full bg-red-100 p-3">
        <AlertCircle className="size-8 text-red-600" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="size-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
