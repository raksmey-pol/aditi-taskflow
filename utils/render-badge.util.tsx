import { Badge } from "@/components/ui/badge";

export const renderBadge = (status: string) => {
  switch (status) {
    case "in-progress":
      return (
        <Badge className="bg-amber-500/20 text-amber-600 border-amber-600">
          In Progress
        </Badge>
      );
    case "done":
      return (
        <Badge className="bg-green-500/20 text-green-600 border-green-600">
          Done
        </Badge>
      );
    case "todo":
      return (
        <Badge className="bg-gray-200/20 text-gray-900 border-gray-600">
          To Do
        </Badge>
      );
    default:
      return <Badge>Status</Badge>;
  }
};