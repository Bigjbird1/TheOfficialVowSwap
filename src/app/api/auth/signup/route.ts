import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    // Enhanced input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists in Prisma
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Error checking existing user:", error);
      return NextResponse.json(
        { error: "Error checking user existence" },
        { status: 500 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let prismaUser;
    // Create user in Supabase first
    let supabaseUser;
    try {
      const { data, error: supabaseError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || null,
          },
          emailRedirectTo: `${process.env.NEXTAUTH_URL}/auth/callback`
        }
      });

      if (supabaseError) {
        console.error("Supabase signup error:", supabaseError);
        return NextResponse.json(
          { 
            error: "Error creating authentication record",
            details: supabaseError.message 
          },
          { status: 500 }
        );
      }

      if (!data?.user?.id) {
        return NextResponse.json(
          { error: "Failed to create authentication record" },
          { status: 500 }
        );
      }

      supabaseUser = data.user;
    } catch (error) {
      console.error("Supabase signup exception:", error);
      return NextResponse.json(
        { 
          error: "Error creating authentication record",
          details: error instanceof Error ? error.message : "Unknown error"
        },
        { status: 500 }
      );
    }

    // Only create Prisma user if Supabase user was created successfully
    try {
      prismaUser = await prisma.user.create({
        data: {
          id: supabaseUser.id, // Use Supabase user ID
          email,
          password: hashedPassword,
          name: name || null,
        },
      });
    } catch (error) {
      // If Prisma user creation fails, delete the Supabase user
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Error signing out Supabase user:", error);
        }
      } catch (deleteError) {
        console.error("Error deleting Supabase user during rollback:", deleteError);
      }

      console.error("Prisma user creation error:", error);
      return NextResponse.json(
        { error: "Error creating user in database" },
        { status: 500 }
      );
    }

    console.log("User created successfully in both Supabase and Prisma");

    return NextResponse.json(
      {
        user: {
          id: prismaUser.id,
          email: prismaUser.email,
          name: prismaUser.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { 
        error: "Error creating user",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
