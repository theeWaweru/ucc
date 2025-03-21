import { NextResponse } from "next/server";
import { initiateSTKPush } from "@/lib/api/mpesa";
import Payment from "@/models/Payment";
import dbConnect from "@/lib/db/connect";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, amount, category, campaignName, fullName, email } =
      body;

    if (!phoneNumber || !amount || !category) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a unique transaction ID
    const transactionId = uuidv4();

    // Format reference based on category
    let accountReference = "UhaiChurch";
    let transactionDesc = "Payment to Uhai Center Church";

    if (category === "tithe") {
      accountReference = "UhaiTithe";
      transactionDesc = "Tithe Payment to Uhai Center Church";
    } else if (category === "offering") {
      accountReference = "UhaiOffering";
      transactionDesc = "Offering to Uhai Center Church";
    } else if (category === "campaign" && campaignName) {
      accountReference = `Uhai${campaignName.replace(/\s+/g, "")}`;
      transactionDesc = `${campaignName} Campaign Donation`;
    }

    // Create callback URL (for production, this should be your deployed URL)
    const callbackURL = `${process.env.NEXTAUTH_URL}/api/mpesa/callback`;

    // Connect to database
    await dbConnect();

    // Create payment record
    const payment = new Payment({
      transactionId,
      amount,
      phoneNumber,
      category,
      campaignName: category === "campaign" ? campaignName : undefined,
      fullName,
      email,
      status: "pending",
    });

    await payment.save();

    // Initiate STK Push
    const result = await initiateSTKPush(
      phoneNumber,
      amount,
      callbackURL,
      accountReference,
      transactionDesc
    );

    // Update payment with CheckoutRequestID
    await Payment.findByIdAndUpdate(payment._id, {
      $set: { mpesaRequestId: result.CheckoutRequestID },
    });

    return NextResponse.json({
      success: true,
      message: "STK push initiated successfully",
      data: {
        transactionId,
        checkoutRequestId: result.CheckoutRequestID,
      },
    });
  } catch (error) {
    console.error("Error initiating STK push:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
