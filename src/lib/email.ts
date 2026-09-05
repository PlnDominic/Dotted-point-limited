import nodemailer from "nodemailer";
import { formatGHS } from "@/lib/currency";

type OrderConfirmationItem = {
  name: string;
  quantity: number;
  price: number;
};

type OrderConfirmationInput = {
  orderId: string;
  customerEmail: string;
  customerName: string;
  total: number;
  shippingFee: number;
  items: OrderConfirmationItem[];
  shippingAddress: string;
  shippingCity: string;
  shippingRegion: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Requires SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS to be set (Vercel project
// env vars). Missing config is treated as "email disabled", not an error —
// order placement should never fail because email isn't set up yet.
function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }
  const port = Number(SMTP_PORT);
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465, // 465 = implicit TLS; 587/others use STARTTLS
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendOrderConfirmationEmail(
  input: OrderConfirmationInput
): Promise<{ sent: boolean; reason?: "not_configured" | "send_error" }> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(
      "Order confirmation email not sent: SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS are not configured."
    );
    return { sent: false, reason: "not_configured" };
  }

  const orderNumber = input.orderId.slice(0, 8).toUpperCase();
  const itemRows = input.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;">${escapeHtml(item.name)}</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;">${formatGHS(
            item.price * item.quantity
          )}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
      <h1 style="font-size:20px;margin-bottom:8px;">Thanks for your order${
        input.customerName ? `, ${escapeHtml(input.customerName)}` : ""
      }!</h1>
      <p style="color:#555;font-size:14px;">
        Order <strong>#${orderNumber}</strong> has been received and is being processed.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
        <thead>
          <tr>
            <th style="text-align:left;border-bottom:2px solid #1a1a1a;padding-bottom:8px;">Item</th>
            <th style="text-align:center;border-bottom:2px solid #1a1a1a;padding-bottom:8px;">Qty</th>
            <th style="text-align:right;border-bottom:2px solid #1a1a1a;padding-bottom:8px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <p style="text-align:right;font-size:14px;color:#555;margin:4px 0;">
        Delivery Fee: ${formatGHS(input.shippingFee)}
      </p>
      <p style="text-align:right;font-size:16px;font-weight:bold;">
        Total: ${formatGHS(input.total)}
      </p>
      <h2 style="font-size:14px;margin-top:24px;margin-bottom:4px;">Delivery Address</h2>
      <p style="color:#555;font-size:14px;margin-top:0;">
        ${escapeHtml(input.shippingAddress)}<br/>
        ${escapeHtml(input.shippingCity)}, ${escapeHtml(input.shippingRegion)}
      </p>
      <p style="color:#999;font-size:12px;margin-top:32px;">
        Dotted Point Limited &middot; Accra, Ghana &middot; +233 54 164 4600
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Dotted Point Limited" <${process.env.SMTP_USER}>`,
      to: input.customerEmail,
      bcc: process.env.ORDER_NOTIFICATION_EMAIL || undefined,
      subject: `Order Confirmed — #${orderNumber}`,
      html,
    });
    return { sent: true };
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    return { sent: false, reason: "send_error" };
  }
}
