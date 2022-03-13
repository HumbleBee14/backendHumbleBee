// Send EMAIL from Contact Form

// npm i nodemailer (for nodemailer - use this for gmail)


const { sendEmailWithNodemailer } = require("../helpers/email"); // for sending GMAIL Email - Email helper function


// For CONTACT FORM  (sending email to website Admin / owner)
exports.contactForm = (req, res) => {

  const { email, name, sub, message } = req.body;

  // console.log("_ Email _ : ", req.body);


  const emailData = {
    to: process.env.EMAIL_TO, // Receiver (Admin/website owner in this case)
    // to: "xxxxxxxxx@gmail.com", // to other user (on behalf of Website's Official Email which is set in .env file)
    from: req.body.email, // from customer / form
    // cc: 'natthakw@scg.co.th', // Comma separated list or an array
    subject: `Website Contact Form -${process.env.APP_NAME}`, // email Subject Line
    // subject: `${sub}`, // Email Subject By User

    // We can send two types of email- both html & text
    text: `Email received from Contact Form \n Sender name: ${name} \n Sender email: ${email} \n Sender subject: ${sub} \n Sender message: ${message}`,
    html: `
          <h4> Email received from contact from:<h4>
          <p>Sender name: ${name}</p>
          <p>Sender email: ${email}</p>
          <p>Sender subject: ${sub}</p>
          <p>Sender message: ${message}</p>
          <hr/>
          <p>This email may contain sensitive information</p>
          <p>https://grepguru.com 🐝</p>
        `,
  };


  sendEmailWithNodemailer(req, res, emailData);// for sending email (using GMAIL as SMTP) 
};



// -------------------------------------------------------

// To Contact Blog Author
exports.contactBlogAuthorForm = (req, res) => {

  const { authorEmail, email, name, sub, message } = req.body;
  // console.log("Email : ", req.body);

  //               BLOG AUTHOR         WEBSITE ADMIN
  let mailList = [authorEmail, process.env.EMAIL_TO]; // both User (Blog AUthor) and the Admin will receive the mail

  const emailData = {
    // to: authorEmail, // Receiver (Blog Author in this case)
    to: mailList, // Receiver (Blog Author & Admin)
    from: email, // from customer
    // cc: 'natthakw@scg.com', // Comma separated list or an array
    subject: `Someone messaged you from - ${process.env.APP_NAME}`, // email Subject Line
    // subject: `${sub}`, // Email Subject By User
    // We can send two types of email- both html & text
    text: `Message received from \n  Name: ${name} \n  Email: ${email} \n Sender message: ${message}`,
    html: `
          <h4>Message received from :<h4>
          <p>Name   : ${name}</p>
          <p>Email  : ${email}</p>
          <p>Subject: ${sub}</p>
          <p>Message: ${message}</p>
          <hr/>
          <p>This email may contain sensitive information</p>
          <p>https://grepguru.com🐝</p>
        `,
  };

  sendEmailWithNodemailer(req, res, emailData); // send email 
};

 // ----------------------------------------------------------------------------