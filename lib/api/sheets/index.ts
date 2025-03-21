import { google } from "googleapis";
import { JWT } from "google-auth-library";

// Configuration
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n"
);

// Sheet IDs (these would be the IDs of your Google Sheets)
const CONTACT_FORM_SHEET_ID = process.env.CONTACT_FORM_SHEET_ID;
const PRAYER_REQUEST_SHEET_ID = process.env.PRAYER_REQUEST_SHEET_ID;
const PAYMENT_SHEET_ID = process.env.PAYMENT_SHEET_ID;

// Create JWT client
function getJwtClient() {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error("Google service account credentials are missing");
  }

  return new JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

// Get sheets API client
async function getSheetsClient() {
  const jwtClient = getJwtClient();
  await jwtClient.authorize();
  return google.sheets({ version: "v4", auth: jwtClient });
}

// Add contact form submission to Google Sheets
export async function addContactFormSubmission(formData: any) {
  try {
    if (!CONTACT_FORM_SHEET_ID) {
      throw new Error("Contact form sheet ID is missing");
    }

    const sheets = await getSheetsClient();

    // Format row data
    const rowData = [
      new Date().toISOString(), // Timestamp
      formData.name,
      formData.email,
      formData.phone || "N/A",
      formData.subject,
      formData.message,
    ];

    // Append row to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: CONTACT_FORM_SHEET_ID,
      range: "Sheet1!A:F", // Adjust based on your sheet's structure
      valueInputOption: "RAW",
      requestBody: {
        values: [rowData],
      },
    });

    return { success: true };
  } catch (error) {
    console.error(
      "Error adding contact form submission to Google Sheets:",
      error
    );
    return { success: false, error };
  }
}

// Create a new prayer request sheet if needed
async function createPrayerRequestSheet() {
  try {
    const sheets = await getSheetsClient();
    const title = "Uhai Centre Church - Prayer Requests";

    // Create a new spreadsheet
    const createResponse = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title },
        sheets: [
          {
            properties: { title: "Prayer Requests" },
            data: [
              {
                startRow: 0,
                startColumn: 0,
                rowData: [
                  {
                    values: [
                      { userEnteredValue: { stringValue: "Timestamp" } },
                      { userEnteredValue: { stringValue: "ID" } },
                      { userEnteredValue: { stringValue: "Name" } },
                      { userEnteredValue: { stringValue: "Email" } },
                      { userEnteredValue: { stringValue: "Phone" } },
                      { userEnteredValue: { stringValue: "Prayer Request" } },
                      { userEnteredValue: { stringValue: "Urgent" } },
                      { userEnteredValue: { stringValue: "Anonymous" } },
                      { userEnteredValue: { stringValue: "Status" } },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    const newSheetId = createResponse.data.spreadsheetId;
    console.log(`Created new prayer request sheet with ID: ${newSheetId}`);
    console.log(`Add this ID to your .env file as PRAYER_REQUEST_SHEET_ID`);

    return newSheetId;
  } catch (error) {
    console.error("Error creating prayer request sheet:", error);
    throw error;
  }
}

// Add prayer request to Google Sheets with enhanced structure
export async function addPrayerRequest(requestData: any) {
  try {
    let spreadsheetId = PRAYER_REQUEST_SHEET_ID;

    // If no sheet ID exists, create a new sheet
    if (!spreadsheetId) {
      try {
        spreadsheetId = await createPrayerRequestSheet();
      } catch (createError) {
        console.error("Error creating new prayer request sheet:", createError);
        return { success: false, error: createError };
      }
    }

    const sheets = await getSheetsClient();

    // Format the data with better structure
    const rowData = [
      new Date().toISOString(), // Timestamp
      requestData.id || `PR-${Date.now()}`, // Generate an ID if not provided
      requestData.isAnonymous ? "Anonymous" : requestData.name,
      requestData.isAnonymous ? "N/A" : requestData.email || "N/A",
      requestData.isAnonymous ? "N/A" : requestData.phone || "N/A",
      requestData.prayerRequest,
      requestData.isUrgent ? "Yes" : "No",
      requestData.isAnonymous ? "Yes" : "No",
      requestData.status
        ? requestData.status.charAt(0).toUpperCase() +
          requestData.status.slice(1)
        : "New",
    ];

    // Append row to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Prayer Requests!A:I", // Updated range to match new structure
      valueInputOption: "RAW",
      requestBody: {
        values: [rowData],
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding prayer request to Google Sheets:", error);
    return { success: false, error };
  }
}

// For compatibility with your updated MongoDB structure
export async function addPrayerRequestToSheet(data: any) {
  return addPrayerRequest({
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    prayerRequest: data.prayerRequest,
    isUrgent: data.isUrgent,
    isAnonymous: data.isAnonymous,
    status: data.status,
  });
}

// Update prayer request status in Google Sheets
export async function updatePrayerRequestStatus(id: string, status: string) {
  try {
    if (!PRAYER_REQUEST_SHEET_ID) {
      return { success: false, error: "Prayer request sheet ID is missing" };
    }

    const sheets = await getSheetsClient();

    // Get all rows from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: PRAYER_REQUEST_SHEET_ID,
      range: "Prayer Requests!A:I",
    });

    const rows = response.data.values || [];

    // Find the row with the matching ID (column B)
    const rowIndex = rows.findIndex((row) => row[1] === id);

    if (rowIndex === -1) {
      return {
        success: false,
        error: `Prayer request with ID ${id} not found`,
      };
    }

    // Update the status column (column I)
    await sheets.spreadsheets.values.update({
      spreadsheetId: PRAYER_REQUEST_SHEET_ID,
      range: `Prayer Requests!I${rowIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[status.charAt(0).toUpperCase() + status.slice(1)]],
      },
    });

    return { success: true };
  } catch (error) {
    console.error(
      "Error updating prayer request status in Google Sheets:",
      error
    );
    return { success: false, error };
  }
}

// Get prayer requests from Google Sheets
export async function getPrayerRequestsFromSheet() {
  try {
    if (!PRAYER_REQUEST_SHEET_ID) {
      return { success: false, error: "Prayer request sheet ID is missing" };
    }

    const sheets = await getSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: PRAYER_REQUEST_SHEET_ID,
      range: "Prayer Requests!A:I",
    });

    const rows = response.data.values || [];

    // Skip header row and transform data to our format
    const prayerRequests = rows.slice(1).map((row) => ({
      timestamp: row[0],
      id: row[1],
      name: row[2],
      email: row[3] === "N/A" ? "" : row[3],
      phone: row[4] === "N/A" ? "" : row[4],
      prayerRequest: row[5],
      isUrgent: row[6] === "Yes",
      isAnonymous: row[7] === "Yes",
      status: row[8]?.toLowerCase() || "new",
    }));

    return { success: true, data: prayerRequests };
  } catch (error) {
    console.error("Error getting prayer requests from Google Sheets:", error);
    return { success: false, error };
  }
}

// Add payment record to Google Sheets
export async function addPaymentRecord(paymentData: any) {
  try {
    if (!PAYMENT_SHEET_ID) {
      throw new Error("Payment sheet ID is missing");
    }

    const sheets = await getSheetsClient();

    // Format row data
    const rowData = [
      new Date().toISOString(), // Timestamp
      paymentData.transactionId,
      paymentData.mpesaReceiptNumber || "N/A",
      paymentData.amount.toString(),
      paymentData.phoneNumber,
      paymentData.category,
      paymentData.campaignName || "N/A",
      paymentData.fullName || "N/A",
      paymentData.email || "N/A",
      paymentData.status,
    ];

    // Append row to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: PAYMENT_SHEET_ID,
      range: "Sheet1!A:J", // Adjust based on your sheet's structure
      valueInputOption: "RAW",
      requestBody: {
        values: [rowData],
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding payment record to Google Sheets:", error);
    return { success: false, error };
  }
}
