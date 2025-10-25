import nodemailer from 'nodemailer';

interface BookingEmailData {
  bookingId: string;
  customerEmail: string;
  customerName: string;
  villaName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  paymentIntentId: string;
}

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  try {
    const transporter = createTransporter();
    
    const checkInDate = new Date(data.checkIn).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    const checkOutDate = new Date(data.checkOut).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0891b2, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 15px 0; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
          .label { font-weight: bold; color: #475569; }
          .value { color: #1e293b; }
          .total { font-size: 1.2em; font-weight: bold; color: #0891b2; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 0.9em; }
          .button { display: inline-block; background: linear-gradient(135deg, #0891b2, #3b82f6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏖️ Booking Confirmed!</h1>
            <p>Your luxury villa reservation is confirmed</p>
          </div>
          
          <div class="content">
            <p>Dear <strong>${data.customerName}</strong>,</p>
            
            <p>Thank you for choosing Exclusive Villa Samui! We're excited to confirm your reservation.</p>
            
            <div class="booking-card">
              <h3>📋 Booking Details</h3>
              
              <div class="detail-row">
                <span class="label">Booking ID:</span>
                <span class="value">${data.bookingId}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Villa:</span>
                <span class="value">${data.villaName}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Check-in:</span>
                <span class="value">${checkInDate}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Check-out:</span>
                <span class="value">${checkOutDate}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Guests:</span>
                <span class="value">${data.guests} ${data.guests === 1 ? 'Guest' : 'Guests'}</span>
              </div>
              
              <div class="detail-row">
                <span class="label total">Total Paid:</span>
                <span class="value total">฿${data.totalAmount.toLocaleString()}</span>
              </div>
            </div>
            
            <h3>🎉 What's Next?</h3>
            <ul>
              <li>Save this email for your records</li>
              <li>Bring a valid ID for check-in</li>
              <li>Contact us if you have any special requests</li>
              <li>Prepare for an amazing stay!</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}" class="button">View Our Villas</a>
            </div>
            
            <h3>📞 Need Help?</h3>
            <p>Our team is available 24/7 to assist you:</p>
            <ul>
              <li>📧 Email: ${process.env.FROM_EMAIL}</li>
              <li>🌐 Website: ${process.env.NEXT_PUBLIC_BASE_URL}</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>© 2025 Exclusive Villa Samui - Luxury Villa Rentals</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: data.customerEmail,
      subject: `✅ Booking Confirmed - ${data.villaName} (${data.bookingId})`,
      html: emailHtml,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function sendAdminNotification(data: BookingEmailData) {
  try {
    const transporter = createTransporter();
    
    const emailHtml = `
      <h2>🏖️ New Villa Booking Received</h2>
      <p><strong>Booking ID:</strong> ${data.bookingId}</p>
      <p><strong>Villa:</strong> ${data.villaName}</p>
      <p><strong>Customer:</strong> ${data.customerName} (${data.customerEmail})</p>
      <p><strong>Dates:</strong> ${data.checkIn} to ${data.checkOut}</p>
      <p><strong>Guests:</strong> ${data.guests}</p>
      <p><strong>Total:</strong> ฿${data.totalAmount.toLocaleString()}</p>
      <p><strong>Payment:</strong> ${data.paymentIntentId}</p>
    `;

    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🏖️ New Booking: ${data.villaName} - ${data.bookingId}`,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Admin notification sent');

  } catch (error) {
    console.error('❌ Admin notification failed:', error);
  }
}

export async function sendPasswordResetEmail(email: string, name: string, resetLink: string) {
  try {
    // For development, just log the email instead of sending
    if (process.env.NODE_ENV === 'development' || !process.env.SMTP_USER) {
      console.log('\n📧 Password Reset Email (Development Mode):');
      console.log('═'.repeat(50));
      console.log(`To: ${email}`);
      console.log(`Name: ${name}`);
      console.log(`Subject: Reset Your Password - Villa Samui`);
      console.log(`Reset Link: ${resetLink}`);
      console.log('═'.repeat(50));
      return; // Don't actually send email in development
    }

    const transporter = createTransporter();

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🏝️ Villa Samui</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Password Reset Request</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">Hello ${name},</h2>
              
              <p style="color: #6b7280; line-height: 1.6; margin: 0 0 24px 0; font-size: 16px;">
                We received a request to reset your password for your Villa Samui account. Click the button below to create a new password:
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetLink}" 
                   style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); 
                          color: white; 
                          text-decoration: none; 
                          padding: 16px 32px; 
                          border-radius: 8px; 
                          font-weight: bold; 
                          font-size: 16px; 
                          display: inline-block;
                          box-shadow: 0 4px 6px rgba(14, 165, 233, 0.3);">
                  Reset Password 🔑
                </a>
              </div>

              <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.5;">
                  <strong>Important:</strong> This link will expire in 1 hour for security reasons. If you didn't request this password reset, please ignore this email.
                </p>
              </div>

              <p style="color: #6b7280; line-height: 1.6; margin: 24px 0 0 0; font-size: 14px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="color: #0ea5e9; font-size: 14px; word-break: break-all; margin: 8px 0 0 0;">
                ${resetLink}
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 24px 30px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px; text-align: center;">
                © 2024 Villa Samui. All rights reserved.<br>
                This email was sent to ${email}
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `${process.env.FROM_NAME || 'Villa Samui'} <${process.env.FROM_EMAIL || 'noreply@villasamui.com'}>`,
      to: email,
      subject: 'Reset Your Password - Villa Samui',
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);

  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    throw error;
  }
}