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
            logoImg: `
            width: 200px;
            margin: 30px 0px;
            `
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
    },

    restorePassword(email, name, restoreUrl) {
        const css = {
            resetBtn: `    
                box-sizing: border-box;
                border-color: #348eda;
                font-weight: bold;
                text-decoration: none;
                display: inline-block;
                margin: 0;
                margin-top: 15px;
                color: #ffffff;
                background-color: #348eda;
                border: solid 1px #348eda;
                border-radius: 2px;
                font-size: 14px;
                padding: 12px 45px;
            `,
            infoText: `
                color: #294661;
                font-weight: bold;
                margin-top: 5px;
            `
        }

        this.sendMail(email,
            "Bomba - Reset Password",
            getTimeBlessing(name) +
            `
                <div {{infoText}}>A request has been received to change the password for your Bomba account.</div>
                <a {{resetBtn}} href='${restoreUrl}'>Reset password</a>
                <p>
                    If you did not initiate this request, please ignore this message.
                </p>
                <div>
                    Thank you,<br>
                    Bomba Team<br>
                    ${config.address.site}
                </div>
            `, css);
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