import { getServerSession } from "next-auth/next";
import { authConfig } from "../../auth/auth.config";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { username: string } }) {
  let username = params.username;

  if (!username) {
    console.error("Error fetching user profile: no username provided");
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { name: username },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        elo: true,
        problemsSolved: true
      },
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "User not found" }),
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
} 
