"use client";
import { useTopBarStore } from "@/app/stores/task-topbar.store";
import { Card, CardContent } from "./ui/card";

export function TopBar({
  children,
  title,
}: {
  children?: React.ReactNode;
  title?: React.ReactNode;
}) {
  const { actions, total_tasks } = useTopBarStore(); // Get actions from store

  return (
    <Card className="sticky top-0 z-50 rounded-none border-x-0 border-t-0 bg-background">
      <CardContent className="flex h-3 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {total_tasks && <div className="text-sm pl-4">{total_tasks}</div>}
        </div>
        {/* Render the dynamic actions here */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </CardContent>
    </Card>
  );
}
