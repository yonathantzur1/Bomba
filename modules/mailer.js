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
        const templateHeader = "<div dir='ltr'><img {{logoImg}} src='cid:logo'></div>";
        const headerCss = {
            logoImg: "width: 200px;margin-bottom: 25px;"
        }

        // Setup email data with unicode symbols
        const mailOptions = {
            from: "'Bomba' <" + config.mailer.mail + ">", // Sender address
            to: destEmail, // List of receivers
            subject: title, // Subject line
            html: `
            ${setCss(templateHeader, headerCss)}
            <div dir='ltr' style="font-size: 16px;">${setCss(text, css)}</div>
            `,
            attachments: [
                {
                    filename: 'bomba-logo.png',
                    path: './src/assets/logo/bomba-logo.png',
                    cid: 'logo'
                }
            ]
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

function setCss(html, css) {
    css && Object.keys(css).forEach(className => {
        const styleAttr = `style="${css[className]}"`;
        const classRegExp = new RegExp("{{" + className + "}}", 'g');

        html = html.replace(classRegExp, styleAttr);
    });

    return html;
}