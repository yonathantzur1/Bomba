const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../logger');

// Create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport(
    {
        service: 'SendGrid',
        auth: {
            user: 'apikey',
            pass: config.mailer.apiKeyCode
        }
    }
);

module.exports = {
    sendMail(destEmail, title, text, css) {
        // Setup email data with unicode symbols
        let mailOptions = {
            from: "'Bomba' <" + config.mailer.mail + ">", // Sender address
            to: destEmail, // List of receivers
            subject: title, // Subject line
            html: "<div dir='ltr'>" + replaceStyleCss(text, css) + "</div>" // html body
        };

        // Send email with defined transport object
        transporter.sendMail(mailOptions, error => {
            error && logger.error(error);
        });
    },

    registerMail(email, name) {
        this.sendMail(email,
            "Bomba",
            getTimeBlessing(name) +
            "Welcome to Bomba!");
    }

};

function formatDate(date) {
    date = new Date(date);
    return (date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear());
}

function getTimeBlessing(name) {
    let hour = new Date().getHours();
    let blessingStr;

    if (hour >= 5 && hour < 12) {
        blessingStr = "Good morning";
    }
    else if (hour >= 12 && hour < 17) {
        blessingStr = "Good afternoon";
    }
    else if (hour >= 17 && hour < 21) {
        blessingStr = "Good evening";
    }
    else {
        blessingStr = "Good night";
    }

    return blessingStr + " " + name + ",<br>";
}

function replaceStyleCss(html, css) {
    css && Object.keys(css).forEach(className => {
        let styleAttr = 'style="' + css[className] + '"';
        let classRegExp = new RegExp("{{" + className + "}}", 'g');

        html = html.replace(classRegExp, styleAttr);
    });

    return html;
}