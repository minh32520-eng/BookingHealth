import db from "../models/index";
require("dotenv").config();
import _ from "lodash";

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

// ================== GET TOP DOCTOR ==================
let getTopDoctorHome = (limitInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = await db.User.findAll({
                limit: limitInput,
                where: { roleId: "R2" },
                order: [["createdAt", "DESC"]],
                attributes: {
                    exclude: ["password"],
                },
                include: [
                    {
                        model: db.Allcode,
                        as: "positionData",
                        attributes: ["valueEn", "valueVi"],
                    },
                    {
                        model: db.Allcode,
                        as: "genderData",
                        attributes: ["valueEn", "valueVi"],
                    },
                ],
                raw: false,
                nest: true,
            });

            // FIX IMAGE
            users = users.map(item => {
                if (item.image) {
                    item.image = item.image.toString('base64');
                }
                return item;
            });

            resolve({
                errCode: 0,
                data: users,
            });
        } catch (e) {
            reject(e);
        }
    });
};

// ================== GET ALL DOCTOR ==================
let getAllDoctors = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { roleId: "R2" },
                attributes: {
                    exclude: ["password"],
                },
            });

            // FIX IMAGE
            doctors = doctors.map(item => {
                if (item.image) {
                    item.image = item.image.toString('base64');
                }
                return item;
            });

            resolve({
                errCode: 0,
                data: doctors,
            });
        } catch (error) {
            reject(error);
        }
    });
};

// ================== SAVE DOCTOR ==================
let saveDetailInforDoctor = (inputData) => {
    return new Promise(async (resolve, reject) => {
        try {

            if (
                !inputData.doctorId ||
                !inputData.contentHTML ||
                !inputData.contentMarkdown ||
                !inputData.action ||
                !inputData.priceId ||
                !inputData.paymentId ||
                !inputData.provinceId ||
                !inputData.nameClinic ||
                !inputData.addressClinic
            ) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing parameter",
                });
            }

            // ===== MARKDOWN =====
            if (inputData.action === "CREATE") {
                await db.Markdown.create({
                    contentHTML: inputData.contentHTML,
                    contentMarkdown: inputData.contentMarkdown,
                    description: inputData.description,
                    doctorId: inputData.doctorId,
                });
            } else if (inputData.action === "EDIT") {
                let doctorMarkdown = await db.Markdown.findOne({
                    where: { doctorId: inputData.doctorId },
                    raw: false,
                });

                if (doctorMarkdown) {
                    doctorMarkdown.contentHTML = inputData.contentHTML;
                    doctorMarkdown.contentMarkdown = inputData.contentMarkdown;
                    doctorMarkdown.description = inputData.description;
                    doctorMarkdown.updatedAt = new Date();
                    await doctorMarkdown.save();
                }
            }

            // ===== DOCTOR INFO =====
            let doctorInfor = await db.Doctor_Infor.findOne({
                where: { doctorId: inputData.doctorId },
                raw: false
            });

            if (doctorInfor) {
                doctorInfor.priceId = inputData.priceId;
                doctorInfor.provinceId = inputData.provinceId;
                doctorInfor.paymentId = inputData.paymentId;
                doctorInfor.nameClinic = inputData.nameClinic;
                doctorInfor.addressClinic = inputData.addressClinic;
                doctorInfor.note = inputData.note;
                await doctorInfor.save();
            } else {
                await db.Doctor_Infor.create({
                    doctorId: inputData.doctorId,
                    priceId: inputData.priceId,
                    provinceId: inputData.provinceId,
                    paymentId: inputData.paymentId,
                    nameClinic: inputData.nameClinic,
                    addressClinic: inputData.addressClinic,
                    note: inputData.note,
                });
            }

            // ===== SAVE IMAGE =====
            if (inputData.image && inputData.image.length > 0) {

                console.log("INPUT IMAGE:", inputData.image);

                let doctor = await db.User.findOne({
                    where: { id: inputData.doctorId },
                    raw: false
                });

                if (doctor) {

                    let imageBase64 = inputData.image.includes(',')
                        ? inputData.image.split(',')[1]
                        : inputData.image;

                    doctor.image = Buffer.from(imageBase64, 'base64');

                    await doctor.save();

                    console.log("✅ SAVED IMAGE");
                }
            }

            // ✅ RETURN KẾT QUẢ
            resolve({
                errCode: 0,
                errMessage: "Save successfully",
            });

        } catch (e) {
            reject(e);
        }
    });
};

// ================== GET DETAIL ==================
let getDetailDoctorById = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter!",
                });
            } else {
                let data = await db.User.findOne({
                    where: { id: inputId },
                    attributes: {
                        exclude: ["password"],
                    },
                    include: [
                        {
                            model: db.Markdown,
                            attributes: ["description", "contentHTML", "contentMarkdown"],
                        },
                        {
                            model: db.Allcode,
                            as: "positionData",
                            attributes: ["valueEn", "valueVi"],
                        },
                        {
                            model: db.Doctor_Infor,
                            attributes: { exclude: ['id', 'doctorId'] },
                        }
                    ],
                    raw: false,
                    nest: true,
                });

                // FIX IMAGE
                if (data && data.image) {
                    data.image = data.image.toString('base64');
                }

                if (!data) data = {};

                resolve({
                    errCode: 0,
                    data: data,
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

// ================== SCHEDULE ==================
let bulkCreateSchedule = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.arrSchedule || !data.doctorId || !data.formatedDate) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required param!",
                });
            } else {
                let schedule = data.arrSchedule;

                if (schedule && schedule.length > 0) {
                    schedule = schedule.map((item) => {
                        item.maxNumber = MAX_NUMBER_SCHEDULE;
                        return item;
                    });
                }

                let existing = await db.Schedule.findAll({
                    where: {
                        doctorId: data.doctorId,
                        date: data.formatedDate,
                    },
                    raw: true,
                });

                let toCreate = _.differenceWith(
                    schedule,
                    existing,
                    (a, b) => a.timeType === b.timeType && +a.date === +b.date
                );

                if (toCreate && toCreate.length > 0) {
                    await db.Schedule.bulkCreate(toCreate);
                }

                resolve({
                    errCode: 0,
                    errMessage: "OK",
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};

// ================== EXPORT ==================
module.exports = {
    getTopDoctorHome,
    getAllDoctors,
    saveDetailInforDoctor,
    getDetailDoctorById,
    bulkCreateSchedule,
};