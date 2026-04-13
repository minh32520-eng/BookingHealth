import db from "../models/index";
import moment from "moment";
import { Op } from "sequelize";
import emailService from "./email.Service";
const { parseBase64Attachment } = require("../utils/file");
const { convertBufferToBase64 } = require("../utils/image");
const { getScheduleStartTimestamp } = require("../utils/schedule");
const { buildUserDisplayName } = require("../utils/user");
require("dotenv").config();

const MAX_NUMBER_SCHEDULE = 3;

// ================== PRIVATE HELPERS ==================
const imageBase64ToBuffer = (imageBase64) => {
    if (!imageBase64 || !imageBase64.length) return null;
    // Strip data URL prefix if present (browser upload format)
    const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    return Buffer.from(cleanBase64, 'base64');
};
</xai:function_call >

<xai:function_call name="edit_file">
<parameter name="path">Backend-NodeJS-Quickstart-master (1)/Backend-NodeJS-Quickstart-master/src/services/doctorServices.js

// ================== GET TOP DOCTOR ==================
let getTopDoctorHome = (limitInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = await db.User.findAll({
                limit: Number(limitInput) || 10,
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

            // Convert image buffers once so homepage cards can use a plain base64 string.
            users = users.map((item) => {
                let doctor = item.get({ plain: true });
                doctor.image = convertBufferToBase64(doctor.image);
                return doctor;
            });

            resolve({
                errCode: 0,
                data: users,
            });

        } catch (e) {
            console.log("ERROR getTopDoctorHome:", e);
            reject(e);
        }
    });
};

let getAllDoctors = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { roleId: "R2" },
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
                        model: db.Markdown,
                        attributes: ["description"],
                    },
                    {
                        model: db.Doctor_Infor,
                        attributes: ["nameClinic", "addressClinic", "note", "priceId", "paymentId", "provinceId"],
                        include: [
                            {
                                model: db.Allcode,
                                as: "priceTypeData",
                                attributes: ["valueEn", "valueVi"],
                            },
                            {
                                model: db.Allcode,
                                as: "paymentTypeData",
                                attributes: ["valueEn", "valueVi"],
                            },
                            {
                                model: db.Allcode,
                                as: "provinceTypeData",
                                attributes: ["valueEn", "valueVi"],
                            },
                        ],
                    },
                ],
                raw: false,
                nest: true,
            });

            doctors = doctors.map((doctor) => {
                // Convert doctor images once so admin and patient pages can render them directly.
                let item = doctor.get({ plain: true });
                item.image = convertBufferToBase64(item.image);
                return item;
            });

            resolve({
                errCode: 0,
                data: doctors,
            });

        } catch (error) {
            console.log("ERROR getAllDoctors:", error);
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

            // Save article content and pricing/clinic metadata together so the admin form
            // can treat them as a single doctor profile.
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

            // Doctor_Infor behaves like a per-doctor profile row: update it if it exists, otherwise create it once.
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

            // Use private helper for image update
            if (inputData.image && inputData.image.length > 0) {
                const imageBuffer = imageBase64ToBuffer(inputData.image);
                if (imageBuffer) {
                    const doctor = await db.User.findOne({ where: { id: inputData.doctorId }, raw: false });
                    if (doctor) {
                        doctor.image = imageBuffer;
                        await doctor.save();
                    }
                }
            }

            resolve({
                errCode: 0,
                errMessage: "Save successfully",
            });


        } catch (e) {
            console.log("ERROR saveDetailInforDoctor:", e);
            reject(e);
        }
    });
};

// ================== PRIVATE HELPERS ==================
const getDoctorProfile = (inputId, options = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter!",
                });
            }

            const baseInclude = [
                {
                    model: db.Allcode,
                    as: "positionData",
                    attributes: ["valueEn", "valueVi"],
                },
                {
                    model: db.Markdown,
                    attributes: ["description", "contentHTML", "contentMarkdown"],
                }
            ];

            let include = baseInclude;
            if (options.includeClinic !== false) {
                include.push({
                    model: db.Doctor_Infor,
                    include: [
                        {
                            model: db.Allcode,
                            as: "priceTypeData",
                            attributes: ["valueEn", "valueVi"],
                        },
                        {
                            model: db.Allcode,
                            as: "provinceTypeData", 
                            attributes: ["valueEn", "valueVi"],
                        },
                        {
                            model: db.Allcode,
                            as: "paymentTypeData",
                            attributes: ["valueEn", "valueVi"],
                        },
                    ],
                });
            }

            let data = await db.User.findOne({
                where: { id: inputId },
                attributes: { exclude: ["password"] },
                include,
                raw: false,
                nest: true,
            });

            if (!data) {
                return resolve({ errCode: 0, data: {} });
            }

            let profile = data.get({ plain: true });
            profile.image = convertBufferToBase64(profile.image);

            resolve({
                errCode: 0,
                data: profile,
            });
        } catch (e) {
            console.log("ERROR getDoctorProfile:", e);
            reject(e);
        }
    });
};

// ================== GET DETAIL ==================
let getDetailDoctorById = (inputId) => getDoctorProfile(inputId, { includeClinic: false });



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
                let selectedTimeTypes = schedule.map(item => item.timeType);
                const selectedTimeCodes = await db.Allcode.findAll({
                    where: { keyMap: selectedTimeTypes },
                    attributes: ["keyMap", "valueEn", "valueVi"],
                    raw: true,
                });
                const timeCodeMap = new Map(selectedTimeCodes.map(item => [item.keyMap, item]));
                const now = moment().valueOf();
                const hasPastSchedule = schedule.some((item) => {
                    const startTimestamp = getScheduleStartTimestamp(item.date, timeCodeMap.get(item.timeType));
                    return startTimestamp <= now;
                });

                if (hasPastSchedule || moment(Number(data.formatedDate)).startOf("day").valueOf() < moment().startOf("day").valueOf()) {
                    return resolve({
                        errCode: 1,
                        errMessage: "Cannot create schedules in the past",
                    });
                }

                if (schedule && schedule.length > 0) {
                    schedule = schedule.map((item) => ({
                        ...item,
                        currentNumber: 0,
                        maxNumber: MAX_NUMBER_SCHEDULE
                    }));
                }

                let existing = await db.Schedule.findAll({
                    where: {
                        doctorId: data.doctorId,
                        date: data.formatedDate,
                    },
                    raw: true,
                });

                let bookings = await db.Booking.findAll({
                    where: {
                        doctorId: data.doctorId,
                        date: data.formatedDate,
                    },
                    attributes: ["timeType", "statusId"],
                    raw: true,
                });

                let slotBookingCountMap = new Map();
                (bookings || []).forEach((item) => {
                    if (!["S1", "S2", "S3"].includes(item.statusId)) {
                        return;
                    }

                    const current = slotBookingCountMap.get(item.timeType) || 0;
                    slotBookingCountMap.set(item.timeType, current + 1);
                });

                let bookedTimeTypes = new Set(Array.from(slotBookingCountMap.keys()));

                if (existing.length > 0) {
                    await Promise.all(existing.map(async (item) => {
                        const currentNumber = slotBookingCountMap.get(item.timeType) || 0;

                        if (item.currentNumber !== currentNumber || item.maxNumber !== MAX_NUMBER_SCHEDULE) {
                            await db.Schedule.update({
                                currentNumber,
                                maxNumber: MAX_NUMBER_SCHEDULE
                            }, {
                                where: { id: item.id }
                            });
                        }
                    }));
                }
                // Insert only slots that do not already exist for this doctor/date/time.
                let toCreate = schedule.filter(item =>
                    !existing.some(e =>
                        e.timeType === item.timeType &&
                        +e.date === +item.date &&
                        e.doctorId === item.doctorId
                    )
                );

                // Do not remove slots that already have a patient booking.
                let removableSchedules = existing.filter(item =>
                    !selectedTimeTypes.includes(item.timeType) && !bookedTimeTypes.has(item.timeType)
                );

                if (removableSchedules.length > 0) {
                    await db.Schedule.destroy({
                        where: {
                            doctorId: data.doctorId,
                            date: data.formatedDate,
                            timeType: removableSchedules.map(item => item.timeType),
                        },
                    });
                }

                if (toCreate.length > 0) {
                    await db.Schedule.bulkCreate(toCreate);
                }

                resolve({
                    errCode: 0,
                    errMessage: "OK",
                });
            }
        } catch (e) {
            console.log("ERROR bulkCreateSchedule:", e);
            reject(e);
        }
    });
};

let getScheduleByDate = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter!",
                });
            }

            let start = moment(+date).startOf("day").valueOf();
            let end = moment(+date).endOf("day").valueOf();

            const [data, bookings] = await Promise.all([
                db.Schedule.findAll({
                    where: {
                        doctorId: doctorId,
                        date: {
                            [Op.between]: [start, end],
                        },
                    },
                    include: [
                        {
                            model: db.Allcode,
                            as: "timeTypeData",
                            attributes: ["valueEn", "valueVi"],
                        },
                    ],
                    raw: false,
                    nest: true,
                }),
                db.Booking.findAll({
                    where: {
                        doctorId,
                        date: {
                            [Op.between]: [start, end],
                        },
                        statusId: {
                            [Op.in]: ["S1", "S2", "S3"],
                        }
                    },
                    attributes: ["timeType"],
                    raw: true,
                })
            ]);

            const slotBookingCountMap = new Map();
            (bookings || []).forEach((item) => {
                const current = slotBookingCountMap.get(item.timeType) || 0;
                slotBookingCountMap.set(item.timeType, current + 1);
            });

            const now = moment().valueOf();
            // Double-check past times on the backend so stale frontend state cannot expose them.
            const filteredData = (data || []).filter((item) => {
                const schedule = item.get ? item.get({ plain: true }) : item;
                const startTimestamp = getScheduleStartTimestamp(schedule.date, schedule.timeTypeData);
                return startTimestamp > now;
            }).map((item) => {
                const schedule = item.get ? item.get({ plain: true }) : item;
                return {
                    ...schedule,
                    currentNumber: slotBookingCountMap.get(schedule.timeType) || 0,
                    maxNumber: MAX_NUMBER_SCHEDULE
                };
            });

            resolve({
                errCode: 0,
                data: filteredData,
            });

        } catch (e) {
            console.log("ERROR getScheduleByDate:", e);
            reject(e);
        }
    });
};

let getListPatientForDoctor = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter!",
                    data: [],
                });
            }

            let start = moment(+date).startOf("day").valueOf();
            let end = moment(+date).endOf("day").valueOf();

            let bookings = await db.Booking.findAll({
                where: {
                    doctorId,
                    date: {
                        [Op.between]: [start, end],
                    },
                },
                raw: true,
            });

            if (!bookings || bookings.length === 0) {
                return resolve({
                    errCode: 0,
                    data: [],
                });
            }

            let patientIds = [...new Set(bookings.map(item => item.patientId).filter(Boolean))];
            let timeTypes = [...new Set(bookings.map(item => item.timeType).filter(Boolean))];

            let [patients, timeCodes] = await Promise.all([
                // Resolve patient identities and time labels together for the doctor dashboard table.
                db.User.findAll({
                    where: { id: patientIds },
                    attributes: ["id", "email", "firstName", "lastName", "phoneNumber", "address"],
                    raw: true,
                }),
                db.Allcode.findAll({
                    where: { keyMap: timeTypes },
                    attributes: ["keyMap", "valueEn", "valueVi"],
                    raw: true,
                }),
            ]);

            let patientMap = new Map(patients.map(item => [item.id, item]));
            let timeMap = new Map(timeCodes.map(item => [item.keyMap, item]));

            // Merge booking rows with patient and time labels for the doctor dashboard table.
            let data = bookings.map(item => ({
                ...item,
                patientData: patientMap.get(item.patientId) || null,
                timeTypeDataPatient: timeMap.get(item.timeType) || null,
            }));

            resolve({
                errCode: 0,
                data,
            });
        } catch (e) {
            console.log("ERROR getListPatientForDoctor:", e);
            reject(e);
        }
    });
};

let deleteDoctorInfor = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter!",
                });
            }

            await db.Markdown.destroy({
                where: { doctorId }
            });

            await db.Doctor_Infor.destroy({
                where: { doctorId }
            });

            resolve({
                errCode: 0,
                errMessage: "ok",
            });
        } catch (e) {
            console.log("ERROR deleteDoctorInfor:", e);
            reject(e);
        }
    });
};

let getExtraInforDoctorById = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter!",
                });
            }

            let data = await db.Doctor_Infor.findOne({
                where: { doctorId },
                include: [
                    {
                        model: db.Allcode,
                        as: "priceTypeData",
                        attributes: ["valueEn", "valueVi"],
                    },
                    {
                        model: db.Allcode,
                        as: "provinceTypeData",
                        attributes: ["valueEn", "valueVi"],
                    },
                    {
                        model: db.Allcode,
                        as: "paymentTypeData",
                        attributes: ["valueEn", "valueVi"],
                    },
                ],
                raw: false,
                nest: true,
            });

            resolve({
                errCode: 0,
                data: data ? data.get({ plain: true }) : {},
            });
        } catch (e) {
            console.log("ERROR getExtraInforDoctorById:", e);
            reject(e);
        }
    });
};

// Optimized to use shared helper - reduces duplication
let getProfileDoctorById = (doctorId) => getDoctorProfile(doctorId, { includeClinic: true });

let getDoctorMedicalRecords = (doctorId, statusId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter!",
                    data: {
                        pendingAppointments: [],
                        historyRecords: [],
                    },
                });
            }

            const bookingWhere = { doctorId };
            if (statusId) {
                bookingWhere.statusId = statusId;
            } else {
                bookingWhere.statusId = {
                    [Op.in]: ["S2", "S3"],
                };
            }

            const [bookings, histories] = await Promise.all([
                db.Booking.findAll({
                    where: bookingWhere,
                    raw: true,
                    order: [["date", "DESC"], ["createdAt", "DESC"]],
                }),
                db.History.findAll({
                    where: { doctorId },
                    raw: true,
                    order: [["createdAt", "DESC"]],
                }),
            ]);

            const patientIds = [...new Set([
                ...(bookings || []).map(item => item.patientId),
                ...(histories || []).map(item => item.patientId),
            ].filter(Boolean))];
            const timeTypes = [...new Set((bookings || []).map(item => item.timeType).filter(Boolean))];

            const [patients, timeCodes] = await Promise.all([
                patientIds.length > 0
                    ? db.User.findAll({
                        where: { id: patientIds },
                        attributes: ["id", "email", "firstName", "lastName", "phoneNumber", "address", "gender"],
                        raw: true,
                    })
                    : [],
                timeTypes.length > 0
                    ? db.Allcode.findAll({
                        where: { keyMap: timeTypes },
                        attributes: ["keyMap", "valueEn", "valueVi"],
                        raw: true,
                    })
                    : [],
            ]);

            const patientMap = new Map((patients || []).map(item => [String(item.id), item]));
            const timeMap = new Map((timeCodes || []).map(item => [item.keyMap, item]));

            // The doctor page renders upcoming confirmed visits and completed history separately.
            const pendingAppointments = (bookings || [])
                .filter(item => item.statusId === "S2")
                .map(item => ({
                    ...item,
                    patientData: patientMap.get(String(item.patientId)) || null,
                    timeTypeData: timeMap.get(item.timeType) || null,
                }));

            const historyRecords = (histories || []).map(item => ({
                ...item,
                patientData: patientMap.get(String(item.patientId)) || null,
            }));

            resolve({
                errCode: 0,
                data: {
                    pendingAppointments,
                    historyRecords,
                },
            });
        } catch (e) {
            console.log("ERROR getDoctorMedicalRecords:", e);
            reject(e);
        }
    });
};

let saveDoctorMedicalRecord = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.doctorId || !data.patientId || !data.bookingId || !data.description || !data.file || !data.fileName) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter!",
                });
            }

            const booking = await db.Booking.findOne({
                where: {
                    id: data.bookingId,
                    doctorId: data.doctorId,
                    patientId: data.patientId,
                },
                raw: false,
            });

            if (!booking) {
                return resolve({
                    errCode: 2,
                    errMessage: "Booking not found",
                });
            }

            const [patient, doctor, timeCode] = await Promise.all([
                db.User.findOne({
                    where: { id: data.patientId },
                    attributes: ["id", "email", "firstName", "lastName"],
                    raw: true,
                }),
                db.User.findOne({
                    where: { id: data.doctorId },
                    attributes: ["id", "email", "firstName", "lastName"],
                    raw: true,
                }),
                db.Allcode.findOne({
                    where: { keyMap: booking.timeType },
                    attributes: ["keyMap", "valueEn", "valueVi"],
                    raw: true,
                })
            ]);

            if (!patient?.email) {
                return resolve({
                    errCode: 3,
                    errMessage: "Patient email not found",
                });
            }

            const attachment = parseBase64Attachment(data.file);
            if (!attachment?.content) {
                return resolve({
                    errCode: 4,
                    errMessage: "Prescription file is invalid",
                });
            }

            await db.History.create({
                // Persist the doctor's diagnosis/notes before marking the booking as completed.
                doctorId: data.doctorId,
                patientId: data.patientId,
                description: data.description,
                files: JSON.stringify({
                    fileName: data.fileName,
                    contentType: attachment.contentType || data.fileType || "application/octet-stream",
                }),
            });

            booking.statusId = "S3";
            await booking.save();

            try {
                const timeLabel = data.language === "vi"
                    ? timeCode?.valueVi || booking.timeType
                    : timeCode?.valueEn || booking.timeType;
                const dateLabel = data.language === "vi"
                    ? moment(Number(booking.date)).format("DD/MM/YYYY")
                    : moment(Number(booking.date)).format("MM/DD/YYYY");

                await emailService.sendRemedyEmail({
                    language: data.language || "vi",
                    reciverEmail: patient.email,
                    patientName: buildUserDisplayName(patient, data.language),
                    doctorName: buildUserDisplayName(doctor, data.language),
                    time: `${timeLabel} - ${dateLabel}`,
                    attachment: {
                        filename: data.fileName,
                        content: attachment.content,
                        contentType: data.fileType || attachment.contentType,
                    }
                });
            } catch (emailError) {
                console.log("EMAIL remedy error:", emailError);
                return resolve({
                    errCode: 0,
                    errMessage: "Save medical record succeed",
                    warningMessage: "Prescription email could not be sent",
                });
            }

            resolve({
                errCode: 0,
                errMessage: "Save medical record succeed",
            });
        } catch (e) {
            console.log("ERROR saveDoctorMedicalRecord:", e);
            reject(e);
        }
    });
};

let confirmFinishedBooking = (doctorId, bookingId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !bookingId) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter!",
                });
            }

            const booking = await db.Booking.findOne({
                where: {
                    id: bookingId,
                    doctorId
                },
                raw: false,
            });

            if (!booking) {
                return resolve({
                    errCode: 2,
                    errMessage: "Booking not found",
                });
            }

            if (booking.statusId === "S3") {
                return resolve({
                    errCode: 0,
                    errMessage: "Booking already completed",
                });
            }

            if (booking.statusId !== "S2") {
                // Only confirmed bookings can move to the examined state.
                return resolve({
                    errCode: 3,
                    errMessage: "Only confirmed bookings can be marked as examined",
                });
            }

            booking.statusId = "S3";
            await booking.save();

            return resolve({
                errCode: 0,
                errMessage: "Confirm examined succeed",
            });
        } catch (e) {
            console.log("ERROR confirmFinishedBooking:", e);
            reject(e);
        }
    });
};

let updateDoctorProfile = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.firstName || !data.lastName || !data.email) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter!",
                });
            }

            const doctor = await db.User.findOne({
                where: { id: data.id, roleId: "R2" },
                raw: false,
            });

            if (!doctor) {
                return resolve({
                    errCode: 2,
                    errMessage: "Doctor not found",
                });
            }

            doctor.firstName = data.firstName;
            doctor.lastName = data.lastName;
            doctor.address = data.address || "";
            doctor.phoneNumber = data.phoneNumber || "";
            doctor.gender = data.gender || doctor.gender;

            if (data.image && data.image.length > 0) {
                // Support both raw base64 and browser data URLs when the doctor updates their avatar.
                const imageBase64 = data.image.includes(",")
                    ? data.image.split(",")[1]
                    : data.image;
                doctor.image = Buffer.from(imageBase64, "base64");
            }

            await doctor.save();

            const updatedDoctor = await db.User.findOne({
                where: { id: data.id },
                attributes: { exclude: ["password"] },
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

            const plainDoctor = updatedDoctor ? updatedDoctor.get({ plain: true }) : null;
            if (plainDoctor) {
                // Convert the avatar before returning the updated profile to the frontend.
                plainDoctor.image = convertBufferToBase64(plainDoctor.image);
            }

            resolve({
                errCode: 0,
                errMessage: "Update profile succeed",
                data: plainDoctor,
            });
        } catch (e) {
            console.log("ERROR updateDoctorProfile:", e);
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
    getScheduleByDate,
    getListPatientForDoctor,
    getExtraInforDoctorById,
    getProfileDoctorById,
    deleteDoctorInfor,
    getDoctorMedicalRecords,
    saveDoctorMedicalRecord,
    confirmFinishedBooking,
    updateDoctorProfile
};
