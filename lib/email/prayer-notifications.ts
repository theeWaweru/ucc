import { sendEmail } from "./index";

// Define the admin email to receive prayer notifications
const ADMIN_EMAIL = process.env.PRAYER_TEAM_EMAIL || "davidngari47@gmail.com";

// Define common email styles
const emailStyles = `
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background-color: #3182ce; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }
  .content { padding: 20px; background-color: #f7fafc; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 5px 5px; }
  .footer { margin-top: 20px; font-size: 0.85rem; text-align: center; color: #718096; }
  .urgent-badge { display: inline-block; background-color: #f56565; color: white; padding: 5px 10px; border-radius: 15px; font-weight: bold; margin-bottom: 15px; }
  .prayer-text { background-color: #ebf8ff; padding: 15px; border-left: 4px solid #3182ce; border-radius: 4px; margin: 15px 0; }
  .button { display: inline-block; background-color: #3182ce; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
  .verse { font-style: italic; color: #718096; padding: 10px; border-left: 2px solid #cbd5e0; margin: 20px 0; }
  h1, h2, h3 { margin-top: 0; }
  p { margin: 10px 0; }
  a { color: #3182ce; }
`;

// Create a reusable email template
const createEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${emailStyles}</style>
  </head>
  <body>
    <div class="container">
      ${content}
      <div class="footer">
        <p>Uhai Centre Church - Growing together in faith, hope, and love.</p>
        <p>&copy; ${new Date().getFullYear()} Uhai Centre Church. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
`;

/**
 * Send prayer request emails
 * This function ensures emails are sent to both the submitter and the admin
 */
export async function sendPrayerRequestEmails(requestData: any) {
  const isUrgent = requestData.isUrgent || false;
  const isAnonymous = requestData.isAnonymous || false;

  // STEP 1: Always send an email to the admin/prayer team
  const adminEmailSubject = isUrgent
    ? `🔴 URGENT Prayer Request ${
        isAnonymous ? "(Anonymous)" : `from ${requestData.name}`
      }`
    : `New Prayer Request ${
        isAnonymous ? "(Anonymous)" : `from ${requestData.name}`
      }`;

  // Build admin email content
  const urgentTag = isUrgent
    ? `<div class="urgent-badge">URGENT PRAYER NEEDED</div>`
    : "";

  const adminEmailContent = createEmailTemplate(`
    <div class="header" style="${isUrgent ? "background-color: #e53e3e;" : ""}">
      <h1>New ${isAnonymous ? "Anonymous " : ""}Prayer Request${
    isUrgent ? " (URGENT)" : ""
  }</h1>
    </div>
    <div class="content">
      ${urgentTag}
      ${
        !isAnonymous
          ? `
        <p><strong>From:</strong> ${requestData.name}</p>
        <p><strong>Email:</strong> ${requestData.email}</p>
        ${
          requestData.phone
            ? `<p><strong>Phone:</strong> ${requestData.phone}</p>`
            : ""
        }
      `
          : "<p><strong>This is an anonymous prayer request.</strong></p>"
      }
      <h3>Prayer Request:</h3>
      <div class="prayer-text">
        ${requestData.prayerRequest.replace(/\n/g, "<br>")}
      </div>
      <p>Time Submitted: ${new Date().toLocaleString()}</p>
      <a href="${
        process.env.NEXTAUTH_URL
      }/admin/prayer" class="button">View in Admin Dashboard</a>
    </div>
  `);

  // STEP 2: Send email to the person who submitted the request (even if anonymous)
  // This uses their actual email data which we collect but don't store
  const userEmailSubject = isUrgent
    ? "Your Urgent Prayer Request Has Been Received"
    : "Your Prayer Request Has Been Received";

  const userEmailContent = createEmailTemplate(`
    <div class="header" style="${isUrgent ? "background-color: #e53e3e;" : ""}">
      <h1>We Are Praying With You</h1>
    </div>
    <div class="content">
      <p>Dear ${requestData.name},</p>
      <p>Thank you for sharing your prayer request with us. Our prayer team has received it and will be praying faithfully for you.</p>
      ${
        isUrgent
          ? "<p><strong>We recognize the urgency of your request and will be praying immediately.</strong></p>"
          : ""
      }
      ${
        isAnonymous
          ? `
        <p><strong>As requested, we have kept your submission anonymous. Your personal information has not been stored in our system.</strong></p>
      `
          : ""
      }
      <h3>Your Prayer Request:</h3>
      <div class="prayer-text">
        ${requestData.prayerRequest.replace(/\n/g, "<br>")}
      </div>
      <div class="verse">
        "Cast all your anxiety on him because he cares for you." - 1 Peter 5:7
      </div>
      <p>If you have any updates or would like to talk with someone from our prayer team, please feel free to reply to this email.</p>
      <p>Blessings,<br>Uhai Centre Church Prayer Team</p>
    </div>
  `);

  // Send both emails
  try {
    // Send to admin
    await sendEmail({
      to: ADMIN_EMAIL,
      from: "noreply@uhaicentre.church",
      subject: adminEmailSubject,
      html: adminEmailContent,
    });

    // Send to user
    await sendEmail({
      to: requestData.email,
      from: "noreply@uhaicentre.church",
      subject: userEmailSubject,
      html: userEmailContent,
      replyTo: ADMIN_EMAIL,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending prayer request emails:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
