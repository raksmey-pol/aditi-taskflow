import { headers } from "next/headers";
import tasks from "../../db/tasks.json";

export async function GET() {
  return new Response(JSON.stringify(tasks), {
    headers: { "Content-Type": "application/json" }
  });
}
