// utils/resendClient.js
import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

export const resend = new Resend(process.env.RESEND_KEY); // Replace with your Resend API key

export const sendOrderConfirmationEmail = async ({ to, name, orderId }) => {
  try {
    const response = await resend.emails.send({
      from: "onboarding@rmsjeans.com",
      to,
      subject: "Order Confirmation",
      html: `
          <h2>Hi ${name},</h2>
          <p>Thank you for your purchase!</p>
          <p>Your order (<strong>${orderId}</strong>) has been successfully placed.</p>
          <p>We'll notify you once it's shipped.</p>
          <br />
          <p>Regards,<br />Your Store Team</p>
        `,
    });

    console.log("Resend response:", response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export const sendOrderDeliveredEmail = async ({ to, name, orderId }) => {
  try {
    const response = await resend.emails.send({
      from: "onboarding@rmsjeans.com",
      to,
      subject: "Order Delivered Successfully",
      html: `
        <h2>Hi ${name},</h2>
        <p>Good news! Your order (<strong>${orderId}</strong>) has been successfully delivered.</p>
        <p>We hope you enjoy your purchase!</p>
        <p>Thank you for shopping with us.</p>
        <br />
        <p>Regards,<br />Your Store Team</p>
      `,
    });

    console.log("Resend response:", response);
  } catch (error) {
    console.error("Error sending delivery email:", error);
  }
};
