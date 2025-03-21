import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Payment from "@/models/Payment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const category = searchParams.get("category");

    await dbConnect();

    // Build query
    const query: any = { status: "completed" };

    // Add date filters if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Add one day to include the end date fully
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        query.createdAt.$lt = end;
      }
    }

    // Add category filter if provided
    if (category && category !== "all") {
      query.category = category;
    }

    // Get payments
    const payments = await Payment.find(query).sort({ createdAt: -1 });

    // Calculate summary statistics
    const totalAmount = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const categorySummary = payments.reduce((summary: any, payment) => {
      const category = payment.category;
      if (!summary[category]) {
        summary[category] = {
          count: 0,
          amount: 0,
        };
      }
      summary[category].count += 1;
      summary[category].amount += payment.amount;
      return summary;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        payments,
        summary: {
          totalCount: payments.length,
          totalAmount,
          categorySummary,
        },
      },
    });
  } catch (error) {
    console.error("Error generating payment report:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate payment report" },
      { status: 500 }
    );
  }
}
