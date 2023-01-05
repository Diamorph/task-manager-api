const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: process.env.SENDGRID_EMAIL,
        subject: 'Thanks for joining in!',
        html: `Welcome to the app, <strong>${name}</strong>. Let me know how you get along with the app.`
    });
};

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: process.env.SENDGRID_EMAIL,
        subject: 'Sorry to see you go',
        html: `Goodbye <strong>${name}</strong>. \n I hope to see you again soon!`
    });
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
};
