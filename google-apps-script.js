/**
 * ==============================================================================
 * GDGconnect - Google Apps Script Database Backend
 * ==============================================================================
 * This script turns your Google Sheet into a real-time REST API database for
 * the GDG on Campus IIMT Meerut Ambassador & Mentor Portal.
 *
 * HOW TO DEPLOY (Takes 60 Seconds):
 * 1. Create a new Google Sheet (e.g. named "GDGconnect Database").
 * 2. In Google Sheets, click: Extensions > Apps Script.
 * 3. Delete any default code in Code.gs, paste this ENTIRE file, and click Save (💾).
 * 4. Click: Deploy > New Deployment.
 * 5. Select type: Web App (click the gear icon ⚙️ > Web app).
 * 6. Set Description: "GDGconnect Portal DB".
 * 7. Set "Execute as": "Me" (your Google account).
 * 8. Set "Who has access": "Anyone" (allows the portal client to fetch/save data).
 * 9. Click "Deploy", authorize permissions when prompted, and COPY the Web App URL.
 * 10. Open GDGconnect portal, click "Sheets DB", paste the URL, and click "Connect"!
 * ==============================================================================
 */

const HEADERS = {
  Mentors: [
    "id", "name", "email", "password", "phone", "institution",
    "department", "avatar", "expertise", "bio", "availability",
    "maxMentees", "joinedDate", "officeHours", "officeLocation"
  ],
  Ambassadors: [
    "id", "name", "email", "password", "phone", "institution",
    "department", "year", "mentorId", "skills", "bio", "linkedin",
    "photoUrl", "status", "joinedDate", "avatar"
  ],
  Tasks: [
    "id", "title", "description", "category", "assigneeId",
    "creatorId", "priority", "startDate", "deadline", "status",
    "instructions"
  ],
  Sessions: [
    "id", "title", "description", "date", "startTime", "endTime",
    "status", "meetingLink", "mentorId", "ambassadorIds", "type"
  ],
  Announcements: [
    "id", "title", "content", "category", "authorId", "authorName",
    "authorRole", "targetRole", "priority", "publishedAt"
  ]
};

/**
 * Handle HTTP GET Requests
 * Used to fetch data or test connection
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = (e && e.parameter && e.parameter.action) || "getAllData";

    if (action === "ping") {
      return jsonResponse({
        status: "success",
        message: "GDGconnect Google Sheets DB is Online",
        timestamp: new Date().toISOString()
      });
    }

    if (action === "getAllData") {
      const data = {
        mentors: readSheetToObjects(ss, "Mentors", HEADERS.Mentors),
        ambassadors: readSheetToObjects(ss, "Ambassadors", HEADERS.Ambassadors),
        tasks: readSheetToObjects(ss, "Tasks", HEADERS.Tasks),
        sessions: readSheetToObjects(ss, "Sessions", HEADERS.Sessions),
        announcements: readSheetToObjects(ss, "Announcements", HEADERS.Announcements)
      };

      return jsonResponse({
        status: "success",
        data: data,
        timestamp: new Date().toISOString()
      });
    }

    return jsonResponse({
      status: "error",
      message: "Unknown action: " + action
    });
  } catch (err) {
    return jsonResponse({
      status: "error",
      message: err.toString()
    });
  }
}

/**
 * Handle HTTP POST Requests
 * Used to sync database or save records
 */
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const rawData = e.postData.contents;
    const payload = JSON.parse(rawData);
    const action = payload.action || "syncAll";

    if (action === "syncAll") {
      const data = payload.data || {};

      if (data.mentors) writeObjectsToSheet(ss, "Mentors", data.mentors, HEADERS.Mentors);
      if (data.ambassadors) writeObjectsToSheet(ss, "Ambassadors", data.ambassadors, HEADERS.Ambassadors);
      if (data.tasks) writeObjectsToSheet(ss, "Tasks", data.tasks, HEADERS.Tasks);
      if (data.sessions) writeObjectsToSheet(ss, "Sessions", data.sessions, HEADERS.Sessions);
      if (data.announcements) writeObjectsToSheet(ss, "Announcements", data.announcements, HEADERS.Announcements);

      return jsonResponse({
        status: "success",
        message: "Full database synced to Google Sheets successfully",
        timestamp: new Date().toISOString()
      });
    }

    if (action === "saveRecord") {
      const table = payload.table;
      const record = payload.record;
      if (!table || !record || !HEADERS[table]) {
        return jsonResponse({ status: "error", message: "Invalid table or record" });
      }

      upsertRecordInSheet(ss, table, record, HEADERS[table]);

      return jsonResponse({
        status: "success",
        message: "Record saved to " + table,
        timestamp: new Date().toISOString()
      });
    }

    return jsonResponse({ status: "error", message: "Unknown action: " + action });
  } catch (err) {
    return jsonResponse({
      status: "error",
      message: err.toString()
    });
  }
}

/**
 * Helper: Read a sheet into an array of objects based on expected headers
 */
function readSheetToObjects(ss, sheetName, headers) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // Only header or empty

  const sheetHeaders = data[0].map(h => String(h).trim());
  const rows = data.slice(1);

  return rows.map(row => {
    const obj = {};
    sheetHeaders.forEach((header, index) => {
      let val = row[index];
      // Try parsing JSON arrays/objects
      if (typeof val === "string" && (val.startsWith("[") || val.startsWith("{"))) {
        try { val = JSON.parse(val); } catch (e) { /* keep as string */ }
      }
      obj[header] = val;
    });
    return obj;
  }).filter(obj => obj.id); // Filter out blank rows
}

/**
 * Helper: Overwrite or populate a sheet from an array of objects
 */
function writeObjectsToSheet(ss, sheetName, objects, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    sheet.clear();
  }

  // Write headers
  sheet.appendRow(headers);

  if (!objects || objects.length === 0) return;

  const rows = objects.map(item => {
    return headers.map(header => {
      let val = item[header];
      if (val === undefined || val === null) return "";
      if (typeof val === "object") return JSON.stringify(val);
      return val;
    });
  });

  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  sheet.setFrozenRows(1);
}

/**
 * Helper: Insert or Update a record by ID
 */
function upsertRecordInSheet(ss, sheetName, record, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    writeObjectsToSheet(ss, sheetName, [record], headers);
    return;
  }

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    writeObjectsToSheet(ss, sheetName, [record], headers);
    return;
  }

  const idColIndex = data[0].indexOf("id");
  let foundRow = -1;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idColIndex]) === String(record.id)) {
      foundRow = i + 1;
      break;
    }
  }

  const rowValues = headers.map(header => {
    let val = record[header];
    if (val === undefined || val === null) return "";
    if (typeof val === "object") return JSON.stringify(val);
    return val;
  });

  if (foundRow > 0) {
    sheet.getRange(foundRow, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
}

/**
 * Helper: Return JSON Response with CORS headers
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
