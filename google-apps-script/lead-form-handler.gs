/**
 * Lynkrs lead form handler — Google Apps Script Web App
 *
 * Receives a JSON POST from an external site's fetch() call, validates it,
 * appends a row to a Google Sheet, and emails a notification.
 *
 * ============================================================
 * PASTE YOUR VALUES HERE
 * ============================================================
 */

// 1. Paste your Google Sheet ID (the long string between /d/ and /edit in the Sheet's URL).
var SHEET_ID = 'PASTE_YOUR_SHEET_ID_HERE';

// 2. The sheet tab (Sheet1 by default — change if you renamed it).
var SHEET_NAME = 'Sheet1';

// 3. Paste the email address that should receive new-lead notifications.
var NOTIFICATION_EMAIL = 'PASTE_YOUR_EMAIL_HERE';

// 4. Name of the hidden honeypot field the front-end form must include.
//    It must be present in the submitted JSON but always left empty by real users
//    (hide it with CSS, e.g. position:absolute; left:-9999px, not display:none,
//    which some bots skip). If it arrives non-empty, the submission is a bot and
//    is silently dropped.
var HONEYPOT_FIELD = 'website';

/**
 * ============================================================
 * SETUP — run this once from the Apps Script editor
 * ============================================================
 * Select "setup" in the function dropdown above the editor, click Run,
 * and approve the permission prompts. This writes the header row to the
 * sheet. Safe to re-run; it only overwrites row 1.
 */
function setup() {
  var sheet = getSheet_();
  var headers = [
    'Timestamp',
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Company',
    'Job Title',
    'Service Needed',
    'Message',
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

/**
 * ============================================================
 * doPost — the actual form submission endpoint
 * ============================================================
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_({ success: false, error: 'Missing request body.' });
    }

    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse_({ success: false, error: 'Invalid JSON payload.' });
    }

    // Honeypot check — bots that fill every field trip this. Pretend success
    // so the bot doesn't learn anything, but never touch the sheet or inbox.
    if (data[HONEYPOT_FIELD]) {
      return jsonResponse_({ success: true });
    }

    var firstName = cleanString_(data.firstName);
    var lastName = cleanString_(data.lastName);
    var email = cleanString_(data.email);
    var phoneCountryCode = cleanString_(data.phoneCountryCode);
    var phoneNumber = cleanString_(data.phoneNumber);
    var company = cleanString_(data.company);
    var jobTitle = cleanString_(data.jobTitle);
    var serviceNeeded = cleanString_(data.serviceNeeded);
    var message = cleanString_(data.message);

    // Required-field validation.
    var missing = [];
    if (!firstName) missing.push('firstName');
    if (!lastName) missing.push('lastName');
    if (!email) missing.push('email');
    if (!serviceNeeded) missing.push('serviceNeeded');
    if (missing.length) {
      return jsonResponse_({
        success: false,
        error: 'Missing required field(s): ' + missing.join(', '),
      });
    }
    if (!isValidEmail_(email)) {
      return jsonResponse_({ success: false, error: 'Invalid email address.' });
    }

    var phone = (phoneCountryCode + ' ' + phoneNumber).trim();

    var sheet = getSheet_();
    sheet.appendRow([
      new Date(),
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      serviceNeeded,
      message,
    ]);

    sendNotificationEmail_({
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      company: company,
      jobTitle: jobTitle,
      serviceNeeded: serviceNeeded,
      message: message,
    });

    return jsonResponse_({ success: true });
  } catch (err) {
    return jsonResponse_({ success: false, error: 'Server error: ' + err.message });
  }
}

/**
 * CORS preflight handling.
 *
 * Apps Script web apps do not let you set custom response headers the way a
 * normal server does, and there is no officially documented doOptions()
 * trigger — this is defined defensively in case a request reaches it, but
 * Google's infrastructure generally answers OPTIONS preflights for Apps
 * Script web apps before your code runs, and ContentService responses from
 * doGet/doPost are served with a permissive Access-Control-Allow-Origin: *
 * header automatically when the deployment access is "Anyone".
 *
 * The reliable way to avoid the browser sending a preflight at all is to
 * send the request from the front end as a "simple request": POST with
 * Content-Type: text/plain instead of application/json. The body is still
 * JSON.stringify(...) text — Apps Script parses it the same way via
 * JSON.parse(e.postData.contents) above. Example fetch() call:
 *
 *   fetch(WEB_APP_URL, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'text/plain;charset=utf-8' },
 *     body: JSON.stringify(formData),
 *   });
 *
 * Using 'Content-Type': 'application/json' instead will trigger a real
 * preflight, which Apps Script cannot answer with custom headers — the
 * browser will report a CORS failure even though the POST itself would
 * have worked.
 */
function doOptions(e) {
  return ContentService.createTextOutput('');
}

/**
 * ============================================================
 * Helpers
 * ============================================================
 */

function getSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

function cleanString_(value) {
  return (value === undefined || value === null) ? '' : String(value).trim();
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Apps Script's ContentService cannot attach custom CORS headers to the
// response; the Access-Control-Allow-Origin: * header is added
// automatically by Google's infrastructure for web apps deployed with
// "Who has access: Anyone". This helper just centralizes the JSON output.
function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendNotificationEmail_(lead) {
  var subject = 'New lead: ' + lead.firstName + ' ' + lead.lastName + ' — ' + lead.serviceNeeded;

  var lines = [
    'New lead form submission',
    '',
    'Name: ' + lead.firstName + ' ' + lead.lastName,
    'Email: ' + lead.email,
    'Phone: ' + (lead.phone || '—'),
    'Company: ' + (lead.company || '—'),
    'Job Title: ' + (lead.jobTitle || '—'),
    'Service Needed: ' + lead.serviceNeeded,
    '',
    'Message:',
    lead.message || '—',
  ];
  var plainBody = lines.join('\n');

  var htmlBody =
    '<div style="font-family:Arial,sans-serif;font-size:14px;color:#111;">' +
    '<h2 style="margin:0 0 12px;">New lead form submission</h2>' +
    '<table style="border-collapse:collapse;">' +
    leadRow_('Name', lead.firstName + ' ' + lead.lastName) +
    leadRow_('Email', lead.email) +
    leadRow_('Phone', lead.phone || '—') +
    leadRow_('Company', lead.company || '—') +
    leadRow_('Job Title', lead.jobTitle || '—') +
    leadRow_('Service Needed', lead.serviceNeeded) +
    '</table>' +
    '<p style="margin-top:16px;"><strong>Message:</strong><br>' +
    escapeHtml_(lead.message || '—').replace(/\n/g, '<br>') +
    '</p>' +
    '</div>';

  MailApp.sendEmail({
    to: NOTIFICATION_EMAIL,
    subject: subject,
    body: plainBody,
    htmlBody: htmlBody,
  });
}

function leadRow_(label, value) {
  return (
    '<tr>' +
    '<td style="padding:4px 12px 4px 0;color:#555;vertical-align:top;"><strong>' +
    escapeHtml_(label) +
    ':</strong></td>' +
    '<td style="padding:4px 0;">' +
    escapeHtml_(value) +
    '</td>' +
    '</tr>'
  );
}

function escapeHtml_(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * ============================================================
 * DEPLOYMENT — step by step
 * ============================================================
 *
 * 1. Create (or open) the destination Google Sheet, copy its Sheet ID from
 *    the URL (https://docs.google.com/spreadsheets/d/SHEET_ID_IS_HERE/edit),
 *    and paste it into SHEET_ID above.
 *
 * 2. Paste your notification email into NOTIFICATION_EMAIL above.
 *
 * 3. In that Sheet, go to Extensions → Apps Script. Delete any boilerplate
 *    code in Code.gs and paste this entire file in its place. Save
 *    (Ctrl/Cmd+S), name the project something like "Lead Form Handler".
 *
 * 4. Run the one-time setup:
 *    - In the toolbar dropdown next to the "Run" (▷) button, select
 *      "setup".
 *    - Click Run. The first time, Google will show an "Authorization
 *      required" prompt — click Review permissions, pick your account,
 *      click Advanced → "Go to <project name> (unsafe)" (this warning is
 *      expected for your own unpublished script), then Allow.
 *    - Check the Sheet — row 1 should now have the header row.
 *
 * 5. Deploy as a Web App:
 *    - Click Deploy (top right) → New deployment.
 *    - Click the gear icon next to "Select type" and choose "Web app".
 *    - Description: anything, e.g. "Lead form v1".
 *    - Execute as: Me (your account).
 *    - Who has access: Anyone.
 *    - Click Deploy.
 *    - Approve the permissions prompt again if asked.
 *
 * 6. Get the Web App URL:
 *    - After deploying, a dialog shows a "Web app URL" ending in /exec —
 *      copy it. This is the endpoint your site's fetch() call should POST
 *      to.
 *    - You can always find it again later via Deploy → Manage deployments.
 *
 * 7. From your front-end form, POST to that URL as described in the
 *    doOptions() comment above (Content-Type: text/plain to avoid a CORS
 *    preflight), with a JSON body containing: firstName, lastName, email,
 *    phoneCountryCode, phoneNumber, company, jobTitle, serviceNeeded,
 *    message, and the honeypot field named by HONEYPOT_FIELD (left empty,
 *    hidden from real users via CSS).
 *
 * 8. Whenever you edit this script after the first deploy, changes won't
 *    go live automatically. Go to Deploy → Manage deployments → click the
 *    pencil (Edit) on the existing deployment → Version → "New version" →
 *    Deploy. The /exec URL stays the same.
 */
