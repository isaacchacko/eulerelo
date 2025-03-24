/**
 * Signup API Route
 * Handles user registration by creating a new user account in the database.
 * Includes password hashing and validation.
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Request body interface for the signup endpoint
 */
interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

/**
 * POST handler for user registration
 * Creates a new user account with hashed password
 * 
 * @param request - HTTP request containing user registration data
 * @returns Response with success or error message
 */
export async function POST(request: Request) {
  try {
    // Parse request body
    const body: SignupRequest = await request.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password for secure storage
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user in database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Return success response without sensitive data
    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Log error for debugging
    console.error("Signup error:", error);

    // Return generic error response
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
} 