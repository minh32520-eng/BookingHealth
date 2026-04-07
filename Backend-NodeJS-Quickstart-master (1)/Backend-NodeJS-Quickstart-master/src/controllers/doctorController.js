import doctorService from '../services/doctorServices'

// get top doctor
let getTopDoctorHome = async (req, res) => {
    let limit = req.query.limit;
    if (!limit) limit = 10;

    try {
        let response = await doctorService.getTopDoctorHome(+limit);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            message: 'Error from server...'
        });
    }
};

// get all doctor
let getAllDoctors = async (req, res) => {
    try {
        let doctors = await doctorService.getAllDoctors();
        return res.status(200).json(doctors)
    } catch (error) {
        console.log(error); // log lỗi
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}

// save doctor (QUAN TRỌNG)
let postInforDoctor = async (req, res) => {
    try {
        // debug data từ frontend
        console.log("REQ BODY:", req.body);

        let response = await doctorService.saveDetailInforDoctor(req.body);

        return res.status(200).json(response);

    } catch (e) {
        console.log(e);

        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        });
    }
};

// get detail doctor
let getDetailDoctorById = async (req, res) => {
    try {
        let infor = await doctorService.getDetailDoctorById(req.query.id);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        });
    }
}

// create schedule
let bulkCreateSchedule = async (req, res) => {
    try {
        let infor = await doctorService.bulkCreateSchedule(req.body);
        return res.status(200).json(infor)
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from sever'
        })
    }
}

// get schedule
let getScheduleByDate = async (req, res) => {
    try {
        let infor = await doctorService.getScheduleByDate(
            req.query.doctorId,
            req.query.date
        );

        return res.status(200).json(infor);

    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        });
    }
}

// extra info doctor
let getExraInforDoctorById = async (req, res) => {
    try {
        let infor = await doctorService.getExraInforDoctorById(req.query.doctorId);
        return res.status(200).json(infor)
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        })
    }
}

// profile doctor
let getProfileDoctorById = async (req, res) => {
    try {
        // fix: đúng tên function trong service
        let infor = await doctorService.getProfileDoctorById(req.query.doctorId);

        return res.status(200).json(infor)

    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server'
        })
    }
}

module.exports = {
    getTopDoctorHome,
    getAllDoctors,
    postInforDoctor,
    getDetailDoctorById,
    bulkCreateSchedule,
    getScheduleByDate,
    getExraInforDoctorById,
    getProfileDoctorById
};