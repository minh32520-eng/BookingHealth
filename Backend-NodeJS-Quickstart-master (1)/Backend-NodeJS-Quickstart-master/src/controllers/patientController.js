import patientService from '../services/patientServices';

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
module.exports = {
    postBookAppointment: postBookAppointment,
    postVerifyBookAppointment:postVerifyBookAppointment
}