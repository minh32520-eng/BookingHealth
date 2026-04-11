import patientService from '../services/patientServices';

// Booking request body already contains all patient-entered form fields and the chosen slot metadata.
let postBookAppointment = async (req, res) => {
    try {
        let infor = await patientService.postBookAppointment(req.body);
        return res.status(200).json(
            infor
        )
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        })
    }
}
// This verify flow activates a pending booking after the patient clicks the email confirmation link.
let postVerifyBookAppointment = async (req, res) => {
    try {
        // Gọi service để xử lý dữ liệu xác nhận đặt lịch hẹn, truyền dữ liệu từ body request
        let infor = await patientService.postVerifyBookAppointment(req.body);

        // Trả về kết quả thành công cho client với status 200
        return res.status(200).json(infor);
    } catch (e) {
        // Nếu có lỗi, log lỗi ra console
        console.log(e);

        // Trả về lỗi cho client, status vẫn là 200 nhưng kèm thông tin lỗi
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        });
    }
}
let getBookingHistoryByPatient = async (req, res) => {
    try {
        let infor = await patientService.getBookingHistoryByPatient(req.query.patientId);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        });
    }
}
// The payment URL service needs both the request body and the client IP for VNPAY.
let createVnpayPaymentUrl = async (req, res) => {
    try {
        let infor = await patientService.createVnpayPaymentUrl(req.body, req.ip || req.connection?.remoteAddress);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        });
    }
}

// Browser returns from VNPAY here, then backend redirects the user back to the frontend result page.
let handleVnpayReturn = async (req, res) => {
    try {
        let result = await patientService.handleVnpayReturn(req.query);
        return res.redirect(result.redirectUrl);
    } catch (e) {
        console.log(e);
        const fallback = `${process.env.CLIENT_URL || process.env.URL_REACT || 'http://localhost:3000'}/patient/booking-history?vnpay=failed`;
        return res.redirect(fallback);
    }
}

// IPN is the server-to-server confirmation path that finalizes payment status independently from the browser.
let handleVnpayIpn = async (req, res) => {
    try {
        let result = await patientService.handleVnpayIpn(req.query);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            RspCode: '99',
            Message: 'Unknown error'
        });
    }
}
module.exports = {
    postBookAppointment: postBookAppointment,
    postVerifyBookAppointment:postVerifyBookAppointment,
    getBookingHistoryByPatient,
    createVnpayPaymentUrl,
    handleVnpayReturn,
    handleVnpayIpn
}
