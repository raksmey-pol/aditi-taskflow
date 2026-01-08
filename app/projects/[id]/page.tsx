"use client";
import { useParams } from "next/navigation";

export default function ProjectPage() {
  const params = useParams<{ id: string }>()
  return(
    <div>
        <h1>Project ID: {params.id}</h1>
    </div>
  );
}