import sgMail from "@sendgrid/mail";

// Initialize with your API key
const BREVO_API_KEY = process.env.BREVO_API_KEY;
sgMail.setApiKey(BREVO_API_KEY || "");

type EmailData = {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html: string;
  replyTo?: string;
};

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
      </div>
    </div>
  </body>
</html>
`;

/**
 * Send an email using Brevo API
 */
export async function sendEmail(data: EmailData) {
  try {
    await sgMail.send(data);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send a contact form submission notification
 */
export async function sendContactFormNotification(formData: any) {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@uhaicentre.church";

  // Email to admin
  const adminEmailData: EmailData = {
    to: adminEmail,
    from: "no-reply@uhaicentre.church",
    subject: `New Contact Form Submission: ${formData.subject}`,
    html: createEmailTemplate(`
      <div class="header">
        <h1>New Contact Form Submission</h1>
      </div>
      <div class="content">
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Phone:</strong> ${formData.phone || "Not provided"}</p>
        <p><strong>Subject:</strong> ${formData.subject}</p>
        <h3>Message:</h3>
        <div class="prayer-text">
          ${formData.message.replace(/\n/g, "<br>")}
        </div>
        <p>Time Received: ${new Date().toLocaleString()}</p>
      </div>
    `),
  };

  // Email to the person who submitted the form
  const userEmailData: EmailData = {
    to: formData.email,
    from: "no-reply@uhaicentre.church",
    subject: "Thank you for contacting Uhai Centre Church",
    html: createEmailTemplate(`
      <div class="header">
        <h1>Thank You for Reaching Out</h1>
      </div>
      <div class="content">
        <p>Dear ${formData.name},</p>
        <p>We have received your message and will get back to you shortly.</p>
        <h3>Your message:</h3>
        <p><strong>Subject:</strong> ${formData.subject}</p>
        <div class="prayer-text">
          ${formData.message.replace(/\n/g, "<br>")}
        </div>
        <p>Blessings,<br>Uhai Centre Church Team</p>
      </div>
    `),
  };

  // Send both emails
  const [adminResult, userResult] = await Promise.all([
    sendEmail(adminEmailData),
    sendEmail(userEmailData),
  ]);

  return {
    success: adminResult.success && userResult.success,
    error: adminResult.error || userResult.error,
  };
}

/**
 * Send a prayer request notification
 */
export async function sendPrayerRequestNotification(requestData: any) {
  const prayerTeamEmail =
    process.env.PRAYER_TEAM_EMAIL || "prayer@uhaicentre.church";

  // If the prayer request is anonymous, don't send an email to the submitter
  if (requestData.isAnonymous) {
    // Only send to prayer team
    const urgentTag = requestData.isUrgent
      ? `<div class="urgent-badge">URGENT PRAYER NEEDED</div>`
      : "";

    const prayerTeamEmailData: EmailData = {
      to: prayerTeamEmail,
      from: "no-reply@uhaicentre.church",
      subject: requestData.isUrgent
        ? "🔴 URGENT Prayer Request (Anonymous)"
        : "New Prayer Request (Anonymous)",
      html: createEmailTemplate(`
        <div class="header" style="${
          requestData.isUrgent ? "background-color: #e53e3e;" : ""
        }">
          <h1>New Anonymous Prayer Request</h1>
        </div>
        <div class="content">
          ${urgentTag}
          <h3>Prayer Request Details:</h3>
          <div class="prayer-text">
            ${requestData.prayerRequest.replace(/\n/g, "<br>")}
          </div>
          <p>Time Submitted: ${new Date().toLocaleString()}</p>
          <a href="${
            process.env.NEXTAUTH_URL
          }/admin/prayer" class="button">View in Admin Dashboard</a>
        </div>
      `),
    };

    return sendEmail(prayerTeamEmailData);
  }

  // If not anonymous, send to both prayer team and submitter
  const urgentTag = requestData.isUrgent
    ? `<div class="urgent-badge">URGENT PRAYER NEEDED</div>`
    : "";

  const prayerTeamEmailData: EmailData = {
    to: prayerTeamEmail,
    from: "no-reply@uhaicentre.church",
    subject: requestData.isUrgent
      ? `🔴 URGENT Prayer Request from ${requestData.name}`
      : `New Prayer Request from ${requestData.name}`,
    html: createEmailTemplate(`
      <div class="header" style="${
        requestData.isUrgent ? "background-color: #e53e3e;" : ""
      }">
        <h1>New Prayer Request</h1>
      </div>
      <div class="content">
        ${urgentTag}
        <p><strong>From:</strong> ${requestData.name}</p>
        <p><strong>Email:</strong> ${requestData.email}</p>
        <p><strong>Phone:</strong> ${requestData.phone || "Not provided"}</p>
        <h3>Prayer Request:</h3>
        <div class="prayer-text">
          ${requestData.prayerRequest.replace(/\n/g, "<br>")}
        </div>
        <p>Time Submitted: ${new Date().toLocaleString()}</p>
        <a href="${
          process.env.NEXTAUTH_URL
        }/admin/prayer" class="button">View in Admin Dashboard</a>
      </div>
    `),
  };

  // Email to the person who submitted the prayer request
  const userEmailData: EmailData = {
    to: requestData.email,
    from: "no-reply@uhaicentre.church",
    subject: requestData.isUrgent
      ? "Your Urgent Prayer Request Has Been Received"
      : "Your Prayer Request Has Been Received",
    html: createEmailTemplate(`
      <div class="header" style="${
        requestData.isUrgent ? "background-color: #e53e3e;" : ""
      }">
        <h1>We Are Praying With You</h1>
      </div>
      <div class="content">
        <p>Dear ${requestData.name},</p>
        <p>Thank you for sharing your prayer request with us. Our prayer team has received it and will be praying faithfully for you.</p>
        ${
          requestData.isUrgent
            ? "<p><strong>We recognize the urgency of your request and will be praying immediately.</strong></p>"
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
    `),
    replyTo: prayerTeamEmail,
  };

  // Send both emails
  const [teamResult, userResult] = await Promise.all([
    sendEmail(prayerTeamEmailData),
    sendEmail(userEmailData),
  ]);

  return {
    success: teamResult.success && userResult.success,
    error: teamResult.error || userResult.error,
  };
}

/**
 * Send a prayer request status update notification
 */
export async function sendPrayerRequestStatusUpdate(requestData: any) {
  // Only send if not anonymous and we have an email
  if (requestData.isAnonymous || !requestData.email) {
    return { success: true }; // Nothing to send, but not an error
  }

  const prayerTeamEmail =
    process.env.PRAYER_TEAM_EMAIL || "prayer@uhaicentre.church";

  // Email to the person who submitted the prayer request
  const userEmailData: EmailData = {
    to: requestData.email,
    from: "no-reply@uhaicentre.church",
    subject: "Update on Your Prayer Request",
    html: createEmailTemplate(`
      <div class="header" style="background-color: #38a169;">
        <h1>Your Prayer Request Update</h1>
      </div>
      <div class="content">
        <p>Dear ${requestData.name},</p>
        <p>We wanted to let you know that your prayer request has been prayed for by our prayer team.</p>
        <h3>Your original request was:</h3>
        <div class="prayer-text" style="background-color: #f0fff4; border-left-color: #38a169;">
          ${requestData.prayerRequest.replace(/\n/g, "<br>")}
        </div>
        <p>We hope that you have experienced God's comfort and peace. If you'd like to submit another prayer request or discuss this further, please don't hesitate to reach out.</p>
        <div class="verse">
          "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus." - Philippians 4:6-7
        </div>
        <p>Blessings,<br>The Prayer Team at Uhai Centre Church</p>
      </div>
    `),
    replyTo: prayerTeamEmail,
  };

  return sendEmail(userEmailData);
}

/**
 * Send a payment confirmation email
 */
export async function sendPaymentConfirmation(paymentData: any) {
  // Only send if we have an email
  if (!paymentData.email) {
    return { success: false, error: "No email provided" };
  }

  const financeTeamEmail =
    process.env.FINANCE_TEAM_EMAIL || "finance@uhaicentre.church";

  // Email to finance team
  const teamEmailData: EmailData = {
    to: financeTeamEmail,
    from: "no-reply@uhaicentre.church",
    subject: `New ${paymentData.category} Payment Received`,
    html: createEmailTemplate(`
      <div class="header" style="background-color: #2c5282;">
        <h1>New Payment Received</h1>
      </div>
      <div class="content">
        <p><strong>Amount:</strong> KES ${paymentData.amount}</p>
        <p><strong>Category:</strong> ${paymentData.category}</p>
        ${
          paymentData.campaignName
            ? `<p><strong>Campaign:</strong> ${paymentData.campaignName}</p>`
            : ""
        }
        <p><strong>From:</strong> ${paymentData.fullName || "Anonymous"}</p>
        <p><strong>Phone:</strong> ${paymentData.phoneNumber}</p>
        <p><strong>Email:</strong> ${paymentData.email}</p>
        <p><strong>M-Pesa Receipt:</strong> ${
          paymentData.mpesaReceiptNumber || "N/A"
        }</p>
        <p><strong>Transaction ID:</strong> ${paymentData.transactionId}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      </div>
    `),
  };

  // Email to the person who made the payment
  const userEmailData: EmailData = {
    to: paymentData.email,
    from: "no-reply@uhaicentre.church",
    subject: "Thank You for Your Generous Gift",
    html: createEmailTemplate(`
      <div class="header" style="background-color: #2c5282;">
        <h1>Thank You for Your Gift</h1>
      </div>
      <div class="content">
        <p>Dear ${paymentData.fullName || "Friend"},</p>
        <p>Thank you for your generous ${paymentData.category} of KES ${
      paymentData.amount
    } to Uhai Centre Church.</p>
        ${
          paymentData.campaignName
            ? `<p>Your contribution to our "${paymentData.campaignName}" campaign is deeply appreciated.</p>`
            : ""
        }
        <p>Your gift helps us continue our mission and ministry in our community and beyond.</p>
        <h3>Payment Details:</h3>
        <div class="prayer-text" style="background-color: #ebf8ff;">
          <p><strong>Amount:</strong> KES ${paymentData.amount}</p>
          <p><strong>M-Pesa Receipt:</strong> ${
            paymentData.mpesaReceiptNumber || "N/A"
          }</p>
          <p><strong>Transaction Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <div class="verse">
          "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." - 2 Corinthians 9:7
        </div>
        <p>Blessings,<br>Uhai Centre Church</p>
      </div>
    `),
  };

  // Send both emails
  const [teamResult, userResult] = await Promise.all([
    sendEmail(teamEmailData),
    sendEmail(userEmailData),
  ]);

  return {
    success: teamResult.success && userResult.success,
    error: teamResult.error || userResult.error,
  };
}

/**
 * Send an event registration confirmation
 */
export async function sendEventRegistrationConfirmation(
  registrationData: any,
  eventData: any
) {
  const eventsTeamEmail =
    process.env.EVENTS_TEAM_EMAIL || "events@uhaicentre.church";

  // Email to events team
  const teamEmailData: EmailData = {
    to: eventsTeamEmail,
    from: "no-reply@uhaicentre.church",
    subject: `New Registration: ${eventData.title}`,
    html: createEmailTemplate(`
      <div class="header" style="background-color: #805ad5;">
        <h1>New Event Registration</h1>
      </div>
      <div class="content">
        <p><strong>Event:</strong> ${eventData.title}</p>
        <p><strong>Date:</strong> ${new Date(
          eventData.startDate
        ).toLocaleString()}</p>
        <p><strong>Name:</strong> ${registrationData.name}</p>
        <p><strong>Email:</strong> ${registrationData.email}</p>
        <p><strong>Phone:</strong> ${
          registrationData.phone || "Not provided"
        }</p>
        ${
          registrationData.additionalInfo
            ? `<p><strong>Additional Info:</strong> ${registrationData.additionalInfo}</p>`
            : ""
        }
      </div>
    `),
  };

  // Email to the person who registered
  const userEmailData: EmailData = {
    to: registrationData.email,
    from: "no-reply@uhaicentre.church",
    subject: `Registration Confirmation: ${eventData.title}`,
    html: createEmailTemplate(`
      <div class="header" style="background-color: #805ad5;">
        <h1>Your Registration is Confirmed</h1>
      </div>
      <div class="content">
        <p>Dear ${registrationData.name},</p>
        <p>Thank you for registering for ${eventData.title}.</p>
        <h3>Event Details:</h3>
        <div class="prayer-text" style="background-color: #f5f0ff; border-left-color: #805ad5;">
          <p><strong>Event:</strong> ${eventData.title}</p>
          <p><strong>Date:</strong> ${new Date(
            eventData.startDate
          ).toLocaleString()}</p>
          <p><strong>Location:</strong> ${eventData.location}</p>
        </div>
        <p>${eventData.description}</p>
        <p>We look forward to seeing you there!</p>
        <p>Blessings,<br>Uhai Centre Church</p>
      </div>
    `),
  };

  // Send both emails
  const [teamResult, userResult] = await Promise.all([
    sendEmail(teamEmailData),
    sendEmail(userEmailData),
  ]);

  return {
    success: teamResult.success && userResult.success,
    error: teamResult.error || userResult.error,
  };
}
