'use strict';

const db = require('../models');

module.exports = {
    async up() {
        const now = new Date();

        // 1) Ensure required allcode exists for ManageDoctor dropdowns
        const requiredCodes = [
            { type: 'PRICE', keyMap: 'PR1', valueVi: '200000', valueEn: '20' },
            { type: 'PRICE', keyMap: 'PR2', valueVi: '300000', valueEn: '30' },
            { type: 'PRICE', keyMap: 'PR3', valueVi: '500000', valueEn: '50' },

            { type: 'PAYMENT', keyMap: 'PAY1', valueVi: 'Tiền mặt', valueEn: 'Cash' },
            { type: 'PAYMENT', keyMap: 'PAY2', valueVi: 'Chuyển khoản', valueEn: 'Transfer' },

            { type: 'PROVINCE', keyMap: 'PROV1', valueVi: 'Hà Nội', valueEn: 'Hanoi' },
            { type: 'PROVINCE', keyMap: 'PROV2', valueVi: 'Đà Nẵng', valueEn: 'Da Nang' },
            { type: 'PROVINCE', keyMap: 'PROV3', valueVi: 'TP.HCM', valueEn: 'Ho Chi Minh' },
        ];

        for (const c of requiredCodes) {
            // eslint-disable-next-line no-await-in-loop
            const existed = await db.Allcode.findOne({ where: { type: c.type, keyMap: c.keyMap } });
            if (!existed) {
                // eslint-disable-next-line no-await-in-loop
                await db.Allcode.create({
                    ...c,
                    createdAt: now,
                    updatedAt: now,
                });
            }
        }

        // 2) Seed Doctor_Infor for all doctor users (roleId = R2) if missing
        const doctors = await db.User.findAll({
            where: { roleId: 'R2' },
            attributes: ['id', 'firstName', 'lastName'],
            raw: true,
        });

        for (const doctor of doctors) {
            // eslint-disable-next-line no-await-in-loop
            const existedInfor = await db.Doctor_Infor.findOne({
                where: { doctorId: doctor.id },
            });

            if (!existedInfor) {
                // eslint-disable-next-line no-await-in-loop
                await db.Doctor_Infor.create({
                    doctorId: doctor.id,
                    priceId: 'PR1',
                    provinceId: 'PROV1',
                    paymentId: 'PAY1',
                    addressClinic: 'Số 1, Đường A, Hà Nội',
                    nameClinic: `Phòng khám ${doctor.lastName || ''} ${doctor.firstName || ''}`.trim(),
                    note: 'Khám theo lịch hẹn',
                    count: 0,
                });
            }
        }
    },

    async down() {
        // Không xóa allcode để tránh ảnh hưởng dữ liệu hệ thống đang dùng.
        // Chỉ xóa Doctor_Infor của user role R2 nếu cần rollback.
        const doctors = await db.User.findAll({
            where: { roleId: 'R2' },
            attributes: ['id'],
            raw: true,
        });
        const doctorIds = doctors.map((d) => d.id);
        if (doctorIds.length > 0) {
            await db.Doctor_Infor.destroy({
                where: { doctorId: doctorIds },
            });
        }
    },
};

