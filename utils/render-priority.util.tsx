import { Flag } from "lucide-react";

export  const renderPriorityFlag = (priority: string) => {
    if (priority === "high") return <Flag className="text-red-600" />;
    if (priority === "medium") return <Flag className="text-amber-600" />;
    if (priority === "low") return <Flag className="text-blue-500" />;
    return <Flag />;
  };
