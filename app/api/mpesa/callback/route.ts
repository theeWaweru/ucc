import { NextResponse } from "next/server";
import Payment from "@/models/Payment";
import dbConnect from "@/lib/db/connect";
import { addPaymentRecord } from "@/lib/api/sheets";
import { sendPaymentConfirmation } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Connect to database
    await dbConnect();

    // Extract relevant data from callback
    const { Body } = body;

    if (Body.stkCallback.ResultCode !== 0) {
      // Payment failed
      // Find the payment using CheckoutRequestID and update status
      const payment = await Payment.findOneAndUpdate(
        { mpesaRequestId: Body.stkCallback.CheckoutRequestID },
        {
          $set: {
            status: "failed",
            resultCode: Body.stkCallback.ResultCode,
            resultDesc: Body.stkCallback.ResultDesc,
          },
        },
        { new: true }
      );

      // Log the failed payment to sheets if we have the payment details
      if (payment) {
        await addPaymentRecord({
          ...payment.toObject(),
          status: "failed",
        });
      }

      return NextResponse.json({ success: true });
    }

    // Payment successful
    const callbackMetadata = Body.stkCallback.CallbackMetadata;

    // Extract receipt number and phone number
    const mpesaReceiptNumber = callbackMetadata.Item.find(
      (item: any) => item.Name === "MpesaReceiptNumber"
    )?.Value;
    const phoneNumber = callbackMetadata.Item.find(
      (item: any) => item.Name === "PhoneNumber"
    )?.Value;

    // Update payment status
    const payment = await Payment.findOneAndUpdate(
      { mpesaRequestId: Body.stkCallback.CheckoutRequestID },
      {
        $set: {
          status: "completed",
          mpesaReceiptNumber,
          resultCode: Body.stkCallback.ResultCode,
          resultDesc: Body.stkCallback.ResultDesc,
        },
      },
      { new: true }
    );

    // Add payment record to Google Sheets
    if (payment) {
      await addPaymentRecord(payment.toObject());

      // Send payment confirmation email if the user provided an email
      if (payment.email) {
        await sendPaymentConfirmation(payment.toObject());
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing M-Pesa callback:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process callback" },
      { status: 500 }
    );
  }
}
