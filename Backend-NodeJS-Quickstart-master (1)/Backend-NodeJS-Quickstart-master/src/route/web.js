import express from "express";
import homeController from "../controllers/homeController.js";
import userControler from "../controllers/userControler.js";
import doctorController from "../controllers/doctorController.js"
import patientController from '../controllers/patientController';
import specialtyController from '../controllers/specialtyController.js';
import clinicController from '../controllers/clinicController.js';
import handbookController from '../controllers/handbookController.js';
import dashboardController from '../controllers/dashboardController.js';
import bookingController from '../controllers/bookingController.js';
import paymentController from '../controllers/paymentController.js';
let router = express.Router();

let initWebRoutes = (app) => {
    router.get('/', homeController.getHomePage);
    router.get('/about', homeController.getAboutPage);
    router.get('/crud', homeController.getCRUD);
    router.post('/post-crud', homeController.postCRUD);
    router.get('/get-crud', homeController.displayCRUD);
    router.get('/edit-crud', homeController.getEditCRUD);
    router.post('/put-crud', homeController.putCRUD)
    router.get('/delete-crud', homeController.deleteCRUD)
    router.post('/api/login', userControler.handleLogin);
    router.post('/api/register', userControler.handleRegister);
    router.post('/api/forgot-password', userControler.handleForgotPassword);
    router.post('/api/send-email-otp', userControler.handleSendEmailOtp);
    router.post('/api/verify-email-otp', userControler.handleVerifyEmailOtp);
    router.put('/api/edit-user', userControler.handleEditUser);
    router.delete('/api/delete-user', userControler.handleDeleteUser);
    router.get('/api/get-all-users', userControler.handleGetAllUsers);
    router.post('/api/create-new-user', userControler.handleCreateNewUser)
    router.get('/api/allcode', userControler.getAllCode);
    // Admin analytics and payment screens read from this admin route group.
    router.get('/api/admin/revenue-dashboard', dashboardController.getRevenueDashboard);
    router.get('/api/admin/bookings', bookingController.getAllBookingsForAdmin);
    router.get('/api/admin/payments', bookingController.getAllPaymentsForAdmin);
    router.get('/api/admin/payment-config', paymentController.getPaymentConfig);
    router.put('/api/admin/payment-config', paymentController.savePaymentConfig);
    router.get('/api/top-doctor-home', doctorController.getTopDoctorHome);
    router.get('/api/get-alll-doctor', doctorController.getAllDoctors);
    // alias đúng chính tả để tương thích frontend cũ/mới
    router.get('/api/get-all-doctor', doctorController.getAllDoctors);
    router.get('/api/get-all-doctors', doctorController.getAllDoctors);
    router.post('/api/save-infor-doctors', doctorController.postInforDoctor);
    router.delete('/api/delete-doctor-infor', doctorController.deleteDoctorInfor);
    router.get('/api/get-detail-doctor-by-id', doctorController.getDetailDoctorById);

    router.post('/api/bulk-create-schedule', doctorController.bulkCreateSchedule);
    router.get('/api/get-schedule-doctor-by-date', doctorController.getScheduleByDate);
    router.get('/api/get-list-patient-for-doctor', doctorController.getListPatientForDoctor);
    router.get('/api/get-extra-infor-doctor-by-id', doctorController.getExraInforDoctorById);
    router.get('/api/get-profile-doctor-by-id', doctorController.getProfileDoctorById);
    router.get('/api/get-doctor-medical-records', doctorController.getDoctorMedicalRecords);
    router.post('/api/save-doctor-medical-record', doctorController.postDoctorMedicalRecord);
    router.put('/api/confirm-finished-booking', doctorController.putConfirmFinishedBooking);
    router.put('/api/update-doctor-profile', doctorController.putDoctorProfile);
    router.post('/api/patient-book-appointment', patientController.postBookAppointment);
    router.get('/api/get-booking-history-by-patient', patientController.getBookingHistoryByPatient);
    router.post('/api/create-vnpay-payment', patientController.createVnpayPaymentUrl);
    router.get('/api/vnpay-return', patientController.handleVnpayReturn);
    router.get('/api/vnpay-ipn', patientController.handleVnpayIpn);
    router.get('/api/get-specialty', specialtyController.getAllSpecialties);
    router.get(
        '/api/get-detail-specialty-by-id',
        specialtyController.getDetailSpecialtyById
    );
    router.post('/api/create-new-specialty', specialtyController.createSpecialty);
    router.put('/api/edit-specialty', specialtyController.updateSpecialty);
    router.delete('/api/delete-specialty', specialtyController.deleteSpecialty);
    router.get('/api/get-clinic', clinicController.getAllClinics);
    router.get('/api/get-detail-clinic-by-id', clinicController.getDetailClinicById);
    router.post('/api/create-new-clinic', clinicController.createClinic);
    router.put('/api/edit-clinic', clinicController.updateClinic);
    router.delete('/api/delete-clinic', clinicController.deleteClinic);
    router.get('/api/get-handbook', handbookController.getAllHandbooks);
    router.get('/api/get-detail-handbook-by-id', handbookController.getDetailHandbookById);
    router.post('/api/create-new-handbook', handbookController.createHandbook);
    router.put('/api/edit-handbook', handbookController.updateHandbook);
    router.delete('/api/delete-handbook', handbookController.deleteHandbook);

    router.post('/api/verify-book-appointment', patientController.postVerifyBookAppointment);
    return app.use("/", router);
};

export default initWebRoutes;
