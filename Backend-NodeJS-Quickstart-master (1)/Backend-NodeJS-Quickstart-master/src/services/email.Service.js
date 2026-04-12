require('dotenv').config();
import nodemailer from 'nodemailer';

const createTransporter = () => {
    if (!process.env.EMAIL_APP || !process.env.EMAIL_APP_PASSWORD) {
        throw new Error('Email service is not configured');
    }

    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_APP,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });
};

const sendEmail = async ({ to, subject, html, attachments = [] }) => {
    let transporter = createTransporter();

    return transporter.sendMail({
        from: `"BookingCare" <${process.env.EMAIL_APP}>`,
        to,
        subject,
        html,
        attachments,
    });
};

let sendSimpleEmail = async (dataSend) => {
    return sendEmail({
        to: dataSend.reciverEmail,
        subject: 'Thong tin dat lich kham benh',
        html: getBodyHTMLEmail(dataSend),
    });
}

let sendOtpEmail = async (dataSend) => {
    return sendEmail({
        to: dataSend.reciverEmail,
        subject: 'Ma OTP xac minh email',
        html: getBodyHTMLOtpEmail(dataSend),
    });
}

let sendRemedyEmail = async (dataSend) => {
    if (!dataSend?.attachment?.content || !dataSend?.attachment?.filename) {
        throw new Error('Prescription attachment is missing');
    }

    return sendEmail({
        to: dataSend.reciverEmail,
        subject: dataSend.language === 'vi'
            ? 'Don thuoc sau khi kham benh'
            : 'Your prescription after appointment',
        html: getBodyHTMLRemedyEmail(dataSend),
        attachments: [
            {
                filename: dataSend.attachment.filename,
                content: dataSend.attachment.content,
                encoding: 'base64',
                contentType: dataSend.attachment.contentType || 'application/octet-stream',
            }
        ]
    });
}

let getBodyHTMLEmail = (dataSend) => {
    let result = '';

    if (dataSend.language === 'vi') {
        result = `
            <h3>Xin chao ${dataSend.patientName}!</h3>
            <p>Ban nhan duoc email nay vi da dat lich kham benh online tren he thong.</p>
            <p>Thong tin dat lich kham benh:</p>

            <div><b>Thoi gian: ${dataSend.time}</b></div>
            <div><b>Bac si: ${dataSend.doctorName}</b></div>

            <p>
                Neu cac thong tin tren la dung, vui long click vao duong link ben duoi
                de xac nhan va hoan tat thu tuc dat lich kham benh.
            </p>

            <div>
                <a href="${dataSend.redirectLink}" target="_blank" rel="noreferrer">
                    Click here
                </a>
            </div>

            <div>Xin chan thanh cam on!</div>
        `;
    }

    if (dataSend.language === 'en') {
        result = `
            <h3>Dear ${dataSend.patientName}!</h3>
            <p>You received this email because you booked an online medical appointment.</p>
            <p>Appointment information:</p>

            <div><b>Time: ${dataSend.time}</b></div>
            <div><b>Doctor: ${dataSend.doctorName}</b></div>

            <p>
                If the above information is correct, please click the link below
                to confirm and complete your appointment.
            </p>

            <div>
                <a href="${dataSend.redirectLink}" target="_blank" rel="noreferrer">
                    Click here
                </a>
            </div>

            <div>Sincerely, thank you!</div>
        `;
    }

    return result;
}

let getBodyHTMLOtpEmail = (dataSend) => {
    return `
        <div style="font-family: Arial, sans-serif; color: #163247; line-height: 1.6;">
            <h3>Ma OTP xac minh email</h3>
            <p>Ban dang thuc hien thao tac <b>${dataSend.purposeLabel}</b> tren he thong BookingCare.</p>
            <p>Ma OTP cua ban la:</p>
            <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #1f8da0; margin: 16px 0;">
                ${dataSend.otpCode}
            </div>
            <p>Ma nay co hieu luc trong <b>${dataSend.expireMinutes} phut</b>.</p>
            <p>Neu ban khong thuc hien thao tac nay, vui long bo qua email.</p>
        </div>
    `;
}

let getBodyHTMLRemedyEmail = (dataSend) => {
    if (dataSend.language === 'vi') {
        return `
            <div style="font-family: Arial, sans-serif; color: #163247; line-height: 1.6;">
                <h3>Xin chao ${dataSend.patientName || 'ban'}!</h3>
                <p>Bac si da hoan tat buoi kham cua ban tren he thong BookingCare.</p>
                <p>Thong tin lich kham:</p>
                <div><b>Bac si:</b> ${dataSend.doctorName || '--'}</div>
                <div><b>Thoi gian:</b> ${dataSend.time || '--'}</div>
                <p>Don thuoc/tep huong dan dieu tri duoc dinh kem trong email nay.</p>
                <p>Mo tep dinh kem de xem chi tiet va vui long lien he phong kham neu can duoc ho tro them.</p>
                <div>Xin cam on!</div>
            </div>
        `;
    }

    return `
        <div style="font-family: Arial, sans-serif; color: #163247; line-height: 1.6;">
            <h3>Dear ${dataSend.patientName || 'patient'}!</h3>
            <p>Your doctor has completed the appointment on BookingCare.</p>
            <p>Appointment information:</p>
            <div><b>Doctor:</b> ${dataSend.doctorName || '--'}</div>
            <div><b>Time:</b> ${dataSend.time || '--'}</div>
            <p>Your prescription or treatment instructions are attached to this email.</p>
            <p>Please open the attachment for details and contact the clinic if you need further support.</p>
            <div>Thank you.</div>
        </div>
    `;
}

module.exports = {
    sendEmail,
    sendSimpleEmail,
    sendOtpEmail,
    sendRemedyEmail
}
