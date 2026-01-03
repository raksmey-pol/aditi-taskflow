import { NextResponse } from "next/server";

export async function GET() {
  try {
        const response = await fetch("http://localhost:3001/projects", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Network was not ok" },
        { status: 500 }
      );
    }
    
    const data = await response.json()

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
