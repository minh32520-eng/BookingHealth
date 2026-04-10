import doctorService from '../services/doctorServices'

// ================== GET TOP DOCTOR ==================
let getTopDoctorHome = async (req, res) => {
    let limit = req.query.limit ? Number(req.query.limit) : 10;

    try {
        let response = await doctorService.getTopDoctorHome(limit);
        return res.status(200).json(response);

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            message: 'Error from server...'
        });
    }
};

// ================== FIXED HERE ==================
let getAllDoctors = async (req, res) => {
    try {
        let doctors = await doctorService.getAllDoctors();

        // ✅ TRẢ THẲNG SERVICE (KHÔNG BỌC LẠI)
        return res.status(200).json(doctors);

    } catch (error) {
        console.log(error);

        return res.status(200).json({
            errCode: -1,
            data: []
        });
    }
}

// ================== SAVE DOCTOR ==================
let postInforDoctor = async (req, res) => {
    try {
        let response = await doctorService.saveDetailInforDoctor(req.body);
        return res.status(200).json(response);

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server'
        });
    }
};

// ================== GET DETAIL ==================
let getDetailDoctorById = async (req, res) => {
    try {
        let infor = await doctorService.getDetailDoctorById(req.query.id);
        return res.status(200).json(infor);

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server'
        });
    }
}

// ================== CREATE SCHEDULE ==================
let bulkCreateSchedule = async (req, res) => {
    try {
        let infor = await doctorService.bulkCreateSchedule(req.body);
        return res.status(200).json(infor)

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}

// ================== GET SCHEDULE ==================
let getScheduleByDate = async (req, res) => {
    try {
        let infor = await doctorService.getScheduleByDate(
            req.query.doctorId,
            req.query.date
        );

        return res.status(200).json(infor);

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server'
        });
    }
}

// ================== EXTRA INFO ==================
let getExraInforDoctorById = async (req, res) => {
    try {
        let infor = await doctorService.getExraInforDoctorById(req.query.doctorId);
        return res.status(200).json(infor)

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server'
        })
    }
}

// ================== PROFILE ==================
let getProfileDoctorById = async (req, res) => {
    try {
        let infor = await doctorService.getProfileDoctorById(req.query.doctorId);
        return res.status(200).json(infor)

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server'
        })
    }
}

let getListPatientForDoctor = async (req, res) => {
    try {
        let infor = await doctorService.getListPatientForDoctor(
            req.query.doctorId,
            req.query.date
        );

        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server'
        });
    }
}

let deleteDoctorInfor = async (req, res) => {
    try {
        let response = await doctorService.deleteDoctorInfor(req.body.doctorId);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server'
        });
    }
}

let getDoctorMedicalRecords = async (req, res) => {
    try {
        let response = await doctorService.getDoctorMedicalRecords(
            req.query.doctorId,
            req.query.statusId
        );
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server'
        });
    }
}

let postDoctorMedicalRecord = async (req, res) => {
    try {
        let response = await doctorService.saveDoctorMedicalRecord(req.body);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server'
        });
    }
}

let putConfirmFinishedBooking = async (req, res) => {
    try {
        let response = await doctorService.confirmFinishedBooking(req.body.doctorId, req.body.bookingId);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server'
        });
    }
}

let putDoctorProfile = async (req, res) => {
    try {
        let response = await doctorService.updateDoctorProfile(req.body);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from the server'
        });
    }
}

module.exports = {
    getTopDoctorHome,
    getAllDoctors,
    postInforDoctor,
    getDetailDoctorById,
    bulkCreateSchedule,
    getScheduleByDate,
    getListPatientForDoctor,
    getExraInforDoctorById,
    getProfileDoctorById,
    deleteDoctorInfor,
    getDoctorMedicalRecords,
    postDoctorMedicalRecord,
    putConfirmFinishedBooking,
    putDoctorProfile
};
