import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("http://localhost:3001/tasks", {
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
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    const response = await fetch(`http://localhost:3001/tasks/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({status}),
    })

    const data = await response.json();

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
