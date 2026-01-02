// components/top-bar.tsx
import { Card, CardContent } from "@/components/ui/card";

export function TopBar({
  children,
  title,
  actions,
}: {
  children?: React.ReactNode;
  title?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <Card className="sticky top-0 z-50 rounded-none border-x-0 border-t-0 bg-background">
      <CardContent className="flex h-3 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {children}
          {title && <div className="font-semibold text-lg">{title}</div>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </CardContent>
    </Card>
  );
}
