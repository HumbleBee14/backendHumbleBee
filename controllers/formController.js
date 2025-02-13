// Send EMAIL from Contact Form
import { sendEmailWithNodemailer } from "../helpers/email.js"; 


// For CONTACT FORM (sending email to website Admin / owner)
export const contactForm = (req, res) => {
  const { email, name, sub, message } = req.body;

  const emailData = {
    to: process.env.EMAIL_TO, // Receiver (Admin/website owner)
    from: email, // Sender (customer/form)
    subject: `New Contact Form Submission - ${process.env.APP_NAME}`,
    text: `You have received a new message from the contact form on your website.\n\nName: ${name}\nEmail: ${email}\nSubject: ${sub}\nMessage: ${message}`,
    html: `
      <h4>New Contact Form Submission:</h4>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${sub}</p>
      <p><strong>Message:</strong> ${message}</p>
      <hr/>
      <p>This email may contain sensitive information.</p>
      <p><a href="https://grepguru.com">https://grepguru.com</a> 🐝</p>
    `,
  };

  sendEmailWithNodemailer(req, res, emailData);
};



// -------------------------------------------------------

// To Contact Blog Author
export const contactBlogAuthorForm = (req, res) => {
  const { authorEmail, email, name, sub, message } = req.body;

  const mailList = [authorEmail, process.env.EMAIL_TO]; // Blog Author and Admin will receive the email

  const emailData = {
    to: mailList,
    from: email,
    subject: `New Message from ${process.env.APP_NAME}`,
    text: `You have received a new message from the blog contact form.\n\nName: ${name}\nEmail: ${email}\nSubject: ${sub}\nMessage: ${message}`,
    html: `
      <h4>New Message from Blog Contact Form:</h4>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${sub}</p>
      <p><strong>Message:</strong> ${message}</p>
      <hr/>
      <p>This email may contain sensitive information.</p>
      <p><a href="https://grepguru.com">https://grepguru.com</a> 🐝</p>
    `,
  };

  sendEmailWithNodemailer(req, res, emailData);
};

 // ----------------------------------------------------------------------------