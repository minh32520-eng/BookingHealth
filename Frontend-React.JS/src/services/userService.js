import axios from '../axios';

const handleLoginApi = (userEmail, userPassword) => {
    return axios.post('/api/login', {
        userEmail: userEmail,
        password: userPassword
    });
};

const getAllUsers = (inputId) => {
    return axios.get(`/api/get-all-users?id=${inputId}`);
};

const createNewUserService = (data) => {
    return axios.post('/api/create-new-user', data);
};

const deleteUserService = (id) => {
    return axios.delete('/api/delete-user', {
        data: {
            id: id
        }
    });
};

const editUserService = (inputData) => {
    return axios.put('/api/edit-user', inputData);
};

const getAllCodeService = (inputType) => {
    return axios.get(`/api/allcode?type=${inputType}`);
};

const getTopDoctorHomeService = (limit) => {
    return axios.get(`/api/top-doctor-home?limit=${limit}`);
};

const getAllDoctors = () => {
    // backend route đang dùng get-alll-doctor (3 chữ l)
    return axios.get(`/api/get-alll-doctor`);
};

const saveDetailDoctorService = (data) => {
    return axios.post('/api/save-infor-doctors', data);
};

const getDetailInforDoctor = (inputId) => {
    return axios.get(`/api/get-detail-doctor-by-id?id=${inputId}`);
};

const saveBulkScheduleDoctor = (data) => {
    return axios.post('/api/bulk-create-schedule', data);
};

const getScheduleDoctorByDate = (doctorId, date) => {
    return axios.get(`/api/get-schedule-doctor-by-date?doctorId=${doctorId}&date=${date}`);
};
const getExtraInforDoctorById = (doctorId) => {
    return axios.get(`/api/get-extra-infor-doctor-by-id?doctorId=${doctorId}`)
}
const getProfileDoctorById = (doctorId) => {
    return axios.get(`/api/get-profile-doctor-by-id?doctorId=${doctorId}`)
}
const postPatientBookAppointment = (data) => {
    return axios.post('/api/patient-book-appointment', data)
}
const postVerifyBookAppointment = (data) => {
    return axios.post('/api/verify-book-appointment', data)
}
const createNewSpecialty = (data) => {
    return axios.post('/api/create-new-specialty', data);
};

const getAllSpecialty = () => {
    return axios.get('/api/get-specialty');
};

const getDetailSpecialtyById = (id) => {
    return axios.get(`/api/get-detail-specialty-by-id?id=${id}`);
};

const createNewClinic = (data) => {
    return axios.post('/api/create-new-clinic', data);
};

const getAllClinic = () => {
    return axios.get('/api/get-clinic');
};

const getDetailClinicById = (id) => {
    return axios.get(`/api/get-detail-clinic-by-id?id=${id}`);
};

const createNewHandbook = (data) => {
    return axios.post('/api/create-new-handbook', data);
};

const getAllHandbook = () => {
    return axios.get('/api/get-handbook');
};

const getDetailHandbookById = (id) => {
    return axios.get(`/api/get-detail-handbook-by-id?id=${id}`);
};

export {
    handleLoginApi,
    getAllUsers,
    createNewUserService,
    deleteUserService,
    editUserService,
    getAllCodeService,
    getTopDoctorHomeService,
    getAllDoctors,
    saveDetailDoctorService,
    getDetailInforDoctor,
    saveBulkScheduleDoctor,
    getScheduleDoctorByDate,
    getExtraInforDoctorById,
    postPatientBookAppointment,
    getProfileDoctorById,
    postVerifyBookAppointment,
    createNewSpecialty,
    getAllSpecialty,
    getDetailSpecialtyById,
    createNewClinic,
    getAllClinic,
    getDetailClinicById,
    createNewHandbook,
    getAllHandbook,
    getDetailHandbookById

};