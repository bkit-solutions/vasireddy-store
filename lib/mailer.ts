import nodemailer from "nodemailer";
import fs from "node:fs";
import path from "node:path";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const FROM_NAME = "Vasireddy Designer Studio";
const BRAND_LOGO_CID = "brand-logo@vasireddy-store";

type MailLayoutInput = {
  preheader: string;
  title: string;
  subtitle?: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
};

type OrderEmailLineItem = {
  name: string;
  quantity: number;
  unitPrice: number;
};

type OrderEmailDetails = {
  items: OrderEmailLineItem[];
  totalAmount: number;
  createdAt?: Date;
};

function isEmailConfigured() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
}

function getBrandLogoAttachment() {
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  if (!fs.existsSync(logoPath)) return [];

  return [
    {
      filename: "logo.png",
      path: logoPath,
      cid: BRAND_LOGO_CID,
    },
  ];
}

function buildMailLayout(input: MailLayoutInput) {
  const baseUrl = process.env.NEXTAUTH_URL || "https://vasireddydesigner.com";
  const ctaHtml =
    input.ctaText && input.ctaUrl
      ? `
        <tr>
          <td style="padding: 0 32px 28px 32px;">
            <a href="${input.ctaUrl}" style="display:inline-block;background:#3f348f;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:14px;font-weight:700;letter-spacing:0.2px;">
              ${input.ctaText}
            </a>
          </td>
        </tr>
      `
      : "";

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${input.title}</title>
      </head>
      <body style="margin:0;padding:0;background:#f3f0ff;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;color:#1f1638;">
        <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${input.preheader}</span>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f0ff;padding:24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;background:#ffffff;border:1px solid #e5defa;border-radius:20px;overflow:hidden;">
                <tr>
                  <td style="padding:28px 32px 16px 32px;background:linear-gradient(135deg,#f7f5ff 0%,#ffffff 100%);border-bottom:1px solid #ebe5fb;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:12px;">
                          <img src="cid:${BRAND_LOGO_CID}" alt="Vasireddy Designer Studio" width="44" height="44" style="display:block;border-radius:10px;border:1px solid #ded5f8;" />
                        </td>
                        <td style="vertical-align:middle;">
                          <p style="margin:0;font-size:24px;line-height:30px;font-weight:700;color:#3f348f;">Vasireddy Designer Studio</p>
                          <p style="margin:4px 0 0 0;font-size:11px;line-height:16px;text-transform:uppercase;letter-spacing:1.6px;color:#7469a8;font-weight:700;">Our Desire Our Design</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 32px 8px 32px;">
                    <h1 style="margin:0;font-size:24px;line-height:32px;color:#201741;">${input.title}</h1>
                    ${input.subtitle ? `<p style="margin:10px 0 0 0;font-size:14px;line-height:22px;color:#5b537c;">${input.subtitle}</p>` : ""}
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 32px 16px 32px;">
                    <div style="background:#f8f6ff;border:1px solid #ebe5fb;border-radius:14px;padding:18px 16px;font-size:14px;line-height:24px;color:#2f2555;">
                      ${input.bodyHtml}
                    </div>
                  </td>
                </tr>
                ${ctaHtml}
                <tr>
                  <td style="padding:16px 32px 24px 32px;border-top:1px solid #f0ebff;background:#fcfbff;">
                    <p style="margin:0;font-size:12px;line-height:20px;color:#7a7398;">
                      Need help with your order or styling assistance? Contact us at
                      <a href="mailto:${process.env.EMAIL_USER || "support@vasireddydesigner.com"}" style="color:#3f348f;text-decoration:none;font-weight:700;">${process.env.EMAIL_USER || "support@vasireddydesigner.com"}</a>
                      or visit
                      <a href="${baseUrl}" style="color:#3f348f;text-decoration:none;font-weight:700;">our store</a>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function formatCurrencyInrFromPaise(amountInPaise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(amountInPaise / 100));
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildOrderItemsTable(details?: OrderEmailDetails) {
  if (!details?.items?.length) return "";

  const rows = details.items
    .map((item) => {
      const lineTotal = item.unitPrice * item.quantity;
      return `
        <tr>
          <td style="padding:10px 8px;border-bottom:1px solid #ece7fb;color:#2b2450;">${escapeHtml(item.name)}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #ece7fb;color:#2b2450;text-align:center;">${item.quantity}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #ece7fb;color:#2b2450;text-align:right;">${formatCurrencyInrFromPaise(item.unitPrice)}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #ece7fb;color:#2b2450;text-align:right;font-weight:700;">${formatCurrencyInrFromPaise(lineTotal)}</td>
        </tr>
      `;
    })
    .join("");

  const orderedOn = details.createdAt
    ? `<p style="margin:0 0 12px 0;font-size:12px;color:#6a628f;">Ordered on ${details.createdAt.toLocaleDateString("en-IN")}</p>`
    : "";

  return `
    <div style="margin-top:14px;border:1px solid #e7e1fa;border-radius:12px;overflow:hidden;background:#ffffff;">
      <div style="padding:12px 12px 8px 12px;background:#f7f4ff;border-bottom:1px solid #ece7fb;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#3f348f;letter-spacing:0.2px;">Order Summary</p>
      </div>
      <div style="padding:10px 12px 4px 12px;">
        ${orderedOn}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-size:13px;">
          <thead>
            <tr>
              <th align="left" style="padding:6px 8px;color:#6a628f;font-weight:700;border-bottom:1px solid #ece7fb;">Product</th>
              <th align="center" style="padding:6px 8px;color:#6a628f;font-weight:700;border-bottom:1px solid #ece7fb;">Qty</th>
              <th align="right" style="padding:6px 8px;color:#6a628f;font-weight:700;border-bottom:1px solid #ece7fb;">Unit</th>
              <th align="right" style="padding:6px 8px;color:#6a628f;font-weight:700;border-bottom:1px solid #ece7fb;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <p style="margin:12px 0 8px 0;text-align:right;font-size:14px;color:#2b2450;">
          Grand Total: <strong style="color:#1f1844;">${formatCurrencyInrFromPaise(details.totalAmount)}</strong>
        </p>
      </div>
    </div>
  `;
}

async function sendMailSafe(options: {
  to: string;
  subject: string;
  html: string;
  bcc?: string[];
}) {
  if (!isEmailConfigured()) return;

  await transporter.sendMail({
    from: `${FROM_NAME} <${process.env.EMAIL_USER}>`,
    to: options.to,
    bcc: options.bcc,
    subject: options.subject,
    html: options.html,
    attachments: getBrandLogoAttachment(),
  });
}

function chunkEmails(emails: string[], chunkSize = 50) {
  const chunks: string[][] = [];
  for (let i = 0; i < emails.length; i += chunkSize) {
    chunks.push(emails.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function sendOrderConfirmationEmail(to: string, orderId: string) {
  const html = buildMailLayout({
    preheader: `Your order ${orderId.slice(-8)} is confirmed`,
    title: "Order Confirmed",
    subtitle: "Thank you for shopping with us. Your order is now in process.",
    bodyHtml: `
      <p style="margin:0 0 10px 0;">Hi there,</p>
      <p style="margin:0 0 10px 0;">Your order <strong>${orderId}</strong> has been placed successfully.</p>
      <p style="margin:0;">You can check the latest updates from your account page anytime.</p>
    `,
    ctaText: "View My Orders",
    ctaUrl: `${process.env.NEXTAUTH_URL || "https://vasireddydesigner.com"}/account`,
  });

  await sendMailSafe({
    to,
    subject: `Order confirmed: ${orderId}`,
    html,
  });
}

export async function sendOrderStatusUpdateEmail(
  to: string,
  orderId: string,
  status: string,
  details?: OrderEmailDetails,
) {
  const statusTone = {
    PENDING: "#8a6f00",
    PAID: "#196c2e",
    SHIPPED: "#1d5d9b",
    DELIVERED: "#1b7f56",
    RETURN_REQUESTED: "#b05f12",
    RETURNED: "#374151",
    CANCELLED: "#a12b2b",
  }[status] || "#3f348f";

  const orderItemsHtml = buildOrderItemsTable(details);

  const html = buildMailLayout({
    preheader: `Order ${orderId.slice(-8)} moved to ${status}`,
    title: `Order Status: ${status}`,
    subtitle: "We have an update on your order timeline.",
    bodyHtml: `
      <p style="margin:0 0 12px 0;">Hello,</p>
      <p style="margin:0 0 12px 0;">Your order <strong>${orderId}</strong> status is now
        <span style="display:inline-block;margin-left:8px;padding:4px 10px;border-radius:999px;background:${statusTone}1A;color:${statusTone};font-size:12px;font-weight:700;letter-spacing:0.4px;">${status}</span>
      </p>
      <p style="margin:0;">You can track the latest updates in your account page.</p>
      ${orderItemsHtml}
    `,
    ctaText: "Track Order",
    ctaUrl: `${process.env.NEXTAUTH_URL || "https://vasireddydesigner.com"}/account`,
  });

  await sendMailSafe({
    to,
    subject: `Order ${orderId.slice(-8)} status updated to ${status}`,
    html,
  });
}

export async function sendOfferAnnouncementEmail(input: {
  recipients: string[];
  subject: string;
  heading: string;
  message: string;
}) {
  if (!isEmailConfigured() || input.recipients.length === 0) return;

  const batches = chunkEmails(input.recipients, 50);
  const html = buildMailLayout({
    preheader: input.subject,
    title: input.heading,
    subtitle: "Exclusive update from our store",
    bodyHtml: `
      <p style="margin:0 0 10px 0;">${input.message}</p>
      <p style="margin:0;">Visit our store to explore fresh arrivals, curated looks, and current offers.</p>
    `,
    ctaText: "Explore Collection",
    ctaUrl: `${process.env.NEXTAUTH_URL || "https://vasireddydesigner.com"}/collections`,
  });

  for (const batch of batches) {
    await sendMailSafe({
      to: process.env.EMAIL_USER as string,
      bcc: batch,
      subject: input.subject,
      html,
    });
  }
}
