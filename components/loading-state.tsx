import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export function LoadingState({
  message = "Loading...",
  fullScreen = false,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        fullScreen && "h-screen",
        className
      )}
    >
      <Spinner className="size-16" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}
