import axios from '../axios';

const handleLoginApi = (userEmail, userPassword) => {
    return axios.post('/api/login', {
        userEmail: userEmail,
        password: userPassword
    });
};

const registerApi = (data) => {
    return axios.post('/api/register', data);
};

const forgotPasswordApi = (data) => {
    return axios.post('/api/forgot-password', data);
};

const sendEmailOtpApi = (data) => {
    return axios.post('/api/send-email-otp', data);
};

const verifyEmailOtpApi = (data) => {
    return axios.post('/api/verify-email-otp', data);
};

const getRevenueDashboard = (year, filters = {}) => {
    const params = new URLSearchParams();
    params.append('year', year);
    if (filters.doctorId) params.append('doctorId', filters.doctorId);
    if (filters.clinicId) params.append('clinicId', filters.clinicId);
    return axios.get(`/api/admin/revenue-dashboard?${params.toString()}`);
};

const getAdminBookings = (statusId = '') => {
    const params = new URLSearchParams();
    if (statusId) params.append('statusId', statusId);
    return axios.get(`/api/admin/bookings?${params.toString()}`);
};

const getAdminPayments = (paymentStatus = '') => {
    const params = new URLSearchParams();
    if (paymentStatus) params.append('paymentStatus', paymentStatus);
    return axios.get(`/api/admin/payments?${params.toString()}`);
};

const getPaymentConfig = () => {
    return axios.get('/api/admin/payment-config');
};

const savePaymentConfig = (data) => {
    return axios.put('/api/admin/payment-config', data);
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

const deleteDoctorInforService = (doctorId) => {
    return axios.delete('/api/delete-doctor-infor', {
        data: { doctorId }
    });
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
const getListPatientForDoctor = (doctorId, date) => {
    return axios.get(`/api/get-list-patient-for-doctor?doctorId=${doctorId}&date=${date}`);
};
const getExtraInforDoctorById = (doctorId) => {
    return axios.get(`/api/get-extra-infor-doctor-by-id?doctorId=${doctorId}`)
}
const getProfileDoctorById = (doctorId) => {
    return axios.get(`/api/get-profile-doctor-by-id?doctorId=${doctorId}`)
}
const getDoctorMedicalRecords = (doctorId, statusId = '') => {
    const params = new URLSearchParams();
    params.append('doctorId', doctorId);
    if (statusId) params.append('statusId', statusId);
    return axios.get(`/api/get-doctor-medical-records?${params.toString()}`);
}
const saveDoctorMedicalRecord = (data) => {
    return axios.post('/api/save-doctor-medical-record', data);
}
const confirmFinishedBooking = (data) => {
    return axios.put('/api/confirm-finished-booking', data);
}
const updateDoctorProfile = (data) => {
    return axios.put('/api/update-doctor-profile', data);
}
const postPatientBookAppointment = (data) => {
    return axios.post('/api/patient-book-appointment', data)
}
const getBookingHistoryByPatient = (patientId) => {
    return axios.get(`/api/get-booking-history-by-patient?patientId=${patientId}`)
}
const createVnpayPayment = (data) => {
    return axios.post('/api/create-vnpay-payment', data);
}
const postVerifyBookAppointment = (data) => {
    return axios.post('/api/verify-book-appointment', data)
}
const createNewSpecialty = (data) => {
    return axios.post('/api/create-new-specialty', data);
};

const editSpecialty = (data) => {
    return axios.put('/api/edit-specialty', data);
};

const deleteSpecialty = (id) => {
    return axios.delete('/api/delete-specialty', {
        data: { id }
    });
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

const editClinic = (data) => {
    return axios.put('/api/edit-clinic', data);
};

const deleteClinic = (id) => {
    return axios.delete('/api/delete-clinic', {
        data: { id }
    });
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

const editHandbook = (data) => {
    return axios.put('/api/edit-handbook', data);
};

const deleteHandbook = (id) => {
    return axios.delete('/api/delete-handbook', {
        data: { id }
    });
};

const getAllHandbook = () => {
    return axios.get('/api/get-handbook');
};

const getDetailHandbookById = (id) => {
    return axios.get(`/api/get-detail-handbook-by-id?id=${id}`);
};

export {
    handleLoginApi,
    registerApi,
    forgotPasswordApi,
    sendEmailOtpApi,
    verifyEmailOtpApi,
    getRevenueDashboard,
    getAdminBookings,
    getAdminPayments,
    getPaymentConfig,
    savePaymentConfig,
    getAllUsers,
    createNewUserService,
    deleteUserService,
    editUserService,
    getAllCodeService,
    getTopDoctorHomeService,
    getAllDoctors,
    saveDetailDoctorService,
    deleteDoctorInforService,
    getDetailInforDoctor,
    saveBulkScheduleDoctor,
    getScheduleDoctorByDate,
    getListPatientForDoctor,
    getExtraInforDoctorById,
    getDoctorMedicalRecords,
    saveDoctorMedicalRecord,
    confirmFinishedBooking,
    updateDoctorProfile,
    postPatientBookAppointment,
    getBookingHistoryByPatient,
    createVnpayPayment,
    getProfileDoctorById,
    postVerifyBookAppointment,
    createNewSpecialty,
    editSpecialty,
    deleteSpecialty,
    getAllSpecialty,
    getDetailSpecialtyById,
    createNewClinic,
    editClinic,
    deleteClinic,
    getAllClinic,
    getDetailClinicById,
    createNewHandbook,
    editHandbook,
    deleteHandbook,
    getAllHandbook,
    getDetailHandbookById

};
