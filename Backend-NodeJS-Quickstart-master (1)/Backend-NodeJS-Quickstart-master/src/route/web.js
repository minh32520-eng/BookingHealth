import express from "express";
import homeController from "../controllers/homeController.js";
import userControler from "../controllers/userControler.js";
import doctorController from "../controllers/doctorController.js"
import patientController from '../controllers/patientController';
import specialtyController from '../controllers/specialtyController.js';
import clinicController from '../controllers/clinicController.js';
import handbookController from '../controllers/handbookController.js';
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
    router.put('/api/edit-user', userControler.handleEditUser);
    router.delete('/api/delete-user', userControler.handleDeleteUser);
    router.get('/api/get-all-users', userControler.handleGetAllUsers);
    router.post('/api/create-new-user', userControler.handleCreateNewUser)
    router.get('/api/allcode', userControler.getAllCode);
    router.get('/api/top-doctor-home', doctorController.getTopDoctorHome);
    router.get('/api/get-alll-doctor', doctorController.getAllDoctors);
    // alias đúng chính tả để tương thích frontend cũ/mới
    router.get('/api/get-all-doctor', doctorController.getAllDoctors);
    router.get('/api/get-all-doctors', doctorController.getAllDoctors);
    router.post('/api/save-infor-doctors', doctorController.postInforDoctor);
    router.get('/api/get-detail-doctor-by-id', doctorController.getDetailDoctorById);

    router.post('/api/bulk-create-schedule', doctorController.bulkCreateSchedule);
    router.get('/api/get-schedule-doctor-by-date', doctorController.getScheduleByDate);
    router.get('/api/get-extra-infor-doctor-by-id', doctorController.getExraInforDoctorById);
    router.get('/api/get-profile-doctor-by-id', doctorController.getProfileDoctorById);
    router.post('/api/patient-book-appointment', patientController.postBookAppointment);
    router.get('/api/get-specialty', specialtyController.getAllSpecialties);
    router.get(
        '/api/get-detail-specialty-by-id',
        specialtyController.getDetailSpecialtyById
    );
    router.post('/api/create-new-specialty', specialtyController.createSpecialty);
    router.get('/api/get-clinic', clinicController.getAllClinics);
    router.get('/api/get-detail-clinic-by-id', clinicController.getDetailClinicById);
    router.post('/api/create-new-clinic', clinicController.createClinic);
    router.get('/api/get-handbook', handbookController.getAllHandbooks);
    router.get('/api/get-detail-handbook-by-id', handbookController.getDetailHandbookById);
    router.post('/api/create-new-handbook', handbookController.createHandbook);

    router.post('/api/verify-book-appointment', patientController.postVerifyBookAppointment);
    return app.use("/", router);
};

export default initWebRoutes;
