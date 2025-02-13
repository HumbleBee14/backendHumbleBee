// Email Helper function

// Refer: https://codecontinue.com/article/how-to-use-nodemailer-and-gmail-to-send-email-in-nodejs

// Let's create a reusable function in helpers folder. We need to pass req, res, emailData as arguments to this function.
// Now we can import it in any module and use to send emails. Lets try using it to send contact form
// I have added additonal parameter - 'customMsg' - for functions which want to return custom message through the email response

const nodeMailer = require("nodemailer");

exports.sendEmailWithNodemailer = (req, res, emailData, customMsg) => {

  const transporter = nodeMailer.createTransport({
    service: "gmail",
    // host: "smtp.office365.com",
    // port: 587, // Always use 587 for TLS
    secure: false, // false for STARTTLS, true for SSL (port 465)
    auth: {
      user: process.env.EMAIL_USER, // Your Outlook email
      pass: process.env.EMAIL_PASS // Your App Password from Outlook
    },
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false
    },
    debug: true, // Debug logs
    logger: true // Log details
  });

  return transporter
    .sendMail(emailData)
    .then((info) => {
      console.log(`Message sent: ${info.response}`);
      if (customMsg) {
        return res.json({ success: true, message: customMsg });
      }
      return res.json({ success: true, message: `Email has been sent to ${emailData.to}` });
    })
    .catch((err) => {
      console.log(`Problem sending email _:_ ${err}`);
      return res.status(502).json({
        error: `${err}. Unable to send email! Please contact support.`,
        success: false
      });
    });
};


// ----------------------------------------------------------

// emailData => the Email data like -to, from, message,subject, etc anything you want the user to Send to you, including attachments.

// NOTE: If you get any error while sending EMAIL using the API route on local system: http://localhost:8000/api/contact
// Error Like: ;