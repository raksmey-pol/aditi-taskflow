"use client";

import { Button } from "@/components/ui/button";
import tasks from "../db/tasks.json";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function TasksList() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="grid place-items-center h-screen">
        <Spinner className="size-16"/>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-6">
      {tasks.map((task) => (
        <div key={task.id} className="">
          <Card>
            <CardHeader className="flex">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
              <CardTitle>{task.title}
            </CardTitle>
            <Badge className="space-x-1.5">Badge</Badge>
            </CardHeader>
            <CardContent>
            <p className="text-gray-500">{task.remark}</p>
            </CardContent>
            <div className="flex items-start justify-between mx-4">
              <div className="flex items-start">
                <Button className=" bg-blue-700">View</Button>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox />
              <Label>Completed?</Label>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}
