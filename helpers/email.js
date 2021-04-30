// Email Helper function

// Refer: https://codecontinue.com/article/how-to-use-nodemailer-and-gmail-to-send-email-in-nodejs

// Let's create a reusable function in helpers folder. We need to pass req, res, emailData as arguments to this function.

// Now we can import it in any module and use to send emails. Lets try using it to send contact form

// I have added additonal parameter - 'customMsg' - for functions which want to return custom message through the email response

const nodeMailer = require("nodemailer");

exports.sendEmailWithNodemailer = (req, res, emailData, customMsg) => {

  const transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com", // hostname
    //port: 587, //587 port for secured SMTP server (secure:true) // 465 for secure: false
    secure: false, // use SSL
    // requireTLS: true,
    auth: {
      user: "contactdy14@gmail.com", // MAKE SURE THIS EMAIL IS YOUR GMAIL FOR WHICH YOU GENERATED APP PASSWORD
      pass: "neuvqyvcszrbsiho", // MAKE SURE THIS PASSWORD IS YOUR GMAIL APP PASSWORD WHICH YOU GENERATED EARLIER
      // pass: process.env.EMAILPASS
    },
    // tls: {
    //   ciphers: "SSLv3",
    //   // rejectUnauthorized: false
    // },start

    // debug: true, // show debug output
    // logger: true // log information in console

  });


  return transporter
    .sendMail(emailData)
    .then((info) => {
      console.log(`Message sent: ${info.response}`);
      // on successfully sending email

      // If the user has provided any custom success message through parameter for sending through the response, send that custom message in response
      if (customMsg) {
        return res.json({
          success: true, // sending this to frontend
          message: customMsg
        });
      }

      return res.json({
        success: true, // sending this to frontend
        message: `Email has been successfully sent to ${emailData.to}`
      });
    })
    .catch((err) => {
      console.log(`Problem sending email _:_ ${err}`);
      return res.status(502).json(
        {
          error: `${err}. Unable to send email! Please contact :Dev`, // Error Message
          // message: `${err}. Unable to send email. Please contact Dev team`, // Error Message
          success: false,
          ErrorCode: err // Object inside object (complex object)
          // Note: We should NOT send Complex objects to Frontend, as they can not handle complex objects. Use Array instead. Else, make sure to send those object properties as string which are accesed on the Frontend (in our case, we are are using 'error' property of this response on Frontend, therefore make if plain string,not complex Object like ErrorCode)
        }
      );
    });
};


// ----------------------------------------------------------

// emailData => the Email data like -to, from, message,subject, etc anything you want the user to Send to you, including attachments.

// NOTE: If you get any error while sending EMAIL using the API route on local system: http://localhost:8000/api/contact
// Error Like: ;