const nodemailer = require('nodemailer');

const {
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USER,
  MAIL_PASS,
  MAIL_FROM,
  APP_BASE_URL,
} = process.env;

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (!MAIL_HOST || !MAIL_PORT || !MAIL_FROM) {
    console.warn('[mail] Missing SMTP env vars; email notifications disabled.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: Number(MAIL_PORT) || 587,
    secure: false,
    auth: MAIL_USER && MAIL_PASS ? { user: MAIL_USER, pass: MAIL_PASS } : undefined,
  });

  return transporter;
}

async function sendBookingNotification(booking) {
  const tx = getTransporter();
  if (!tx) return;

  const {
    name,
    email,
    phone,
    preferredDate,
    preferredTime,
    message,
    requestedAt,
  } = booking;

  // Use the email provided in the booking form as the recipient
  const customerEmail = email;
  const adminInbox = MAIL_FROM;

  const subject = `New consultation request from ${name}`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Preferred Date: ${preferredDate ? new Date(preferredDate).toDateString() : 'N/A'}`,
    `Preferred Time: ${preferredTime || 'N/A'}`,
    `Requested At: ${requestedAt ? new Date(requestedAt).toISOString() : new Date().toISOString()}`,
    `Message: ${message || '-'}`,
  ].join('\n');

  const html = `
    <h2>New Consultation Request</h2>
    <ul>
      <li><strong>Name:</strong> ${name}</li>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Phone:</strong> ${phone}</li>
      <li><strong>Preferred Date:</strong> ${preferredDate ? new Date(preferredDate).toDateString() : 'N/A'}</li>
      <li><strong>Preferred Time:</strong> ${preferredTime || 'N/A'}</li>
      <li><strong>Requested At:</strong> ${requestedAt ? new Date(requestedAt).toISOString() : new Date().toISOString()}</li>
      <li><strong>Message:</strong> ${message || '-'}</li>
    </ul>
    <img src="${(APP_BASE_URL || 'http://localhost:5000')}/api/bookings/${booking._id}/open-track.gif" alt="" width="1" height="1" style="display:none;" />
  `;

  try {
    await tx.sendMail({
      from: customerEmail, // show customer as sender
      to: adminInbox,      // deliver to admin inbox
      replyTo: customerEmail,
      subject,
      text,
      html,
    });
    console.info(`[mail] booking notification sent to admin inbox ${adminInbox} from ${customerEmail} (name: ${name})`);
  } catch (err) {
    console.error('[mail] booking notification failed:', err);
    throw err;
  }
}

module.exports = { sendBookingNotification };
