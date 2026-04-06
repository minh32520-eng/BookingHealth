'use strict';

const bcrypt = require('bcryptjs');
const db = require('../models');

const now = new Date();
const salt = bcrypt.genSaltSync(10);
const DEFAULT_PASSWORD = '123456';

const startOfDayMs = (d) => {
  const x = new Date(d);
  return new Date(x.getFullYear(), x.getMonth(), x.getDate()).valueOf();
};

const upsertAllcode = async ({ type, keyMap, valueVi, valueEn }) => {
  const existed = await db.Allcode.findOne({ where: { type, keyMap } });
  if (existed) return existed;

  return db.Allcode.create({
    type,
    keyMap,
    valueVi,
    valueEn,
    createdAt: now,
    updatedAt: now,
  });
};

const upsertUser = async ({
  email,
  password,
  firstName,
  lastName,
  address,
  roleId,
  gender,
  positionId,
  image = null,
  authProvider = null,
  socialId = null,
}) => {
  const existed = await db.User.findOne({ where: { email } });
  if (existed) return existed;

  const passwordHash = password
    ? password
    : bcrypt.hashSync(DEFAULT_PASSWORD, salt);

  return db.User.create({
    email,
    password: passwordHash,
    firstName,
    lastName,
    address,
    gender,
    roleId,
    positionId,
    image,
    authProvider,
    socialId,
    createdAt: now,
    updatedAt: now,
  });
};

module.exports = {
  async up() {
    // Specialty (bài Home "Chuyên khoa"):
    // - Nếu bảng đang rỗng thì chèn vài chuyên khoa demo
    // - Tránh chèn trùng nếu bạn đã chạy seeder chuyên khoa trước đó
    const specialtiesCount = await db.Specialty.count();
    if (specialtiesCount === 0) {
      await db.Specialty.bulkCreate([
        {
          name: 'Tim mạch',
          image:
            'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80',
          description:
            '<p><strong>Chuyên khoa Tim mạch</strong> chẩn đoán và điều trị các bệnh về tim và hệ tuần hoàn.</p>',
          createdAt: now,
          updatedAt: now,
        },
        {
          name: 'Thần kinh',
          image:
            'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80',
          description:
            '<p><strong>Chuyên khoa Thần kinh</strong> xử lý đau đầu, chóng mặt và các rối loạn thần kinh.</p>',
          createdAt: now,
          updatedAt: now,
        },
        {
          name: 'Nhi khoa',
          image:
            'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80',
          description:
            '<p><strong>Chuyên khoa Nhi</strong> chăm sóc trẻ từ sơ sinh đến tuổi vị thành niên.</p>',
          createdAt: now,
          updatedAt: now,
        },
        {
          name: 'Da liễu',
          image:
            'https://images.unsplash.com/photo-1612349317150e413ee57f6f4b2d0b3b?w=600&q=80',
          description:
            '<p><strong>Chuyên khoa Da liễu</strong> điều trị mụn, viêm da dị ứng, nấm da và các bệnh về da.</p>',
          createdAt: now,
          updatedAt: now,
        },
        {
          name: 'Tai – Mũi – Họng',
          image:
            'https://images.unsplash.com/photo-1603398938378-54d4f7e1a5e4?w=600&q=80',
          description:
            '<p><strong>Chuyên khoa TMH</strong> xử lý viêm họng, viêm xoang, ù tai, giảm thính lực.</p>',
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }

    // 1) allcode (dùng cho hiển thị và chọn trong nhiều component)
    const allcodes = [
      // ROLE
      { type: 'ROLE', keyMap: 'R1', valueVi: 'Admin', valueEn: 'Admin' },
      { type: 'ROLE', keyMap: 'R2', valueVi: 'Doctor', valueEn: 'Doctor' },
      { type: 'ROLE', keyMap: 'R3', valueVi: 'Patient', valueEn: 'Patient' },

      // GENDER
      { type: 'GENDER', keyMap: 'M', valueVi: 'Nam', valueEn: 'Male' },
      { type: 'GENDER', keyMap: 'F', valueVi: 'Nữ', valueEn: 'Female' },

      // POSITION
      { type: 'POSITION', keyMap: 'POS1', valueVi: 'TS.', valueEn: 'Dr.' },
      { type: 'POSITION', keyMap: 'POS2', valueVi: 'BS.', valueEn: 'MD' },
      { type: 'POSITION', keyMap: 'POS3', valueVi: 'ThS.', valueEn: 'Assoc. Prof.' },

      // TIME (để hiển thị lịch khám)
      { type: 'TIME', keyMap: 'T1', valueVi: '08:00', valueEn: '08:00' },
      { type: 'TIME', keyMap: 'T2', valueVi: '09:00', valueEn: '09:00' },
      { type: 'TIME', keyMap: 'T3', valueVi: '10:00', valueEn: '10:00' },

      // PRICE
      { type: 'PRICE', keyMap: 'PR1', valueVi: '200000', valueEn: '200' },
      { type: 'PRICE', keyMap: 'PR2', valueVi: '300000', valueEn: '300' },

      // PAYMENT
      { type: 'PAYMENT', keyMap: 'PAY1', valueVi: 'Tiền mặt', valueEn: 'Cash' },
      { type: 'PAYMENT', keyMap: 'PAY2', valueVi: 'Chuyển khoản', valueEn: 'Transfer' },

      // PROVINCE
      { type: 'PROVINCE', keyMap: 'PROV1', valueVi: 'Hà Nội', valueEn: 'Hanoi' },
      { type: 'PROVINCE', keyMap: 'PROV2', valueVi: 'Hải Phòng', valueEn: 'Hai Phong' },
    ];

    for (const item of allcodes) {
      // eslint-disable-next-line no-await-in-loop
      await upsertAllcode(item);
    }

    // 2) Users: 1 admin + 2 doctors + 1 patient
    // Mật khẩu mặc định: 123456
    const admin = await upsertUser({
      email: 'admin@demo.local',
      firstName: 'Admin',
      lastName: 'System',
      address: 'Ha Noi',
      roleId: 'R1',
      gender: 'M',
      positionId: 'POS2',
    });

    // Doctor 1
    const doctor1 = await upsertUser({
      email: 'doctor1@demo.local',
      firstName: 'Minh',
      lastName: 'Nguyen',
      address: 'Ha Noi',
      roleId: 'R2',
      gender: 'M',
      positionId: 'POS2',
    });

    // Doctor 2
    const doctor2 = await upsertUser({
      email: 'doctor2@demo.local',
      firstName: 'Linh',
      lastName: 'Tran',
      address: 'Ha Noi',
      roleId: 'R2',
      gender: 'F',
      positionId: 'POS1',
    });

    await upsertUser({
      email: 'patient1@demo.local',
      firstName: 'An',
      lastName: 'Pham',
      address: 'Ha Noi',
      roleId: 'R3',
      gender: 'F',
      positionId: 'POS3',
    });

    // 3) Doctor_Infor + Markdown + Schedule
    const doctors = [doctor1, doctor2];
    for (const doctor of doctors) {
      // Doctor_Infor
      const existedInfor = await db.Doctor_Infor.findOne({
        where: { doctorId: doctor.id },
      });

      if (!existedInfor) {
        await db.Doctor_Infor.create({
          doctorId: doctor.id,
          priceId: 'PR1',
          provinceId: 'PROV1',
          paymentId: 'PAY1',
          nameClinic: 'Phòng khám Minh Anh',
          addressClinic: 'Số 1, Đường A, Hà Nội',
          note: 'Lưu ý: đến sớm 10 phút trước giờ khám.',
          count: 0,
        });
      }

      // Markdown (nội dung mô tả bác sĩ)
      const existedMarkdown = await db.Markdown.findOne({
        where: { doctorId: doctor.id },
      });
      if (!existedMarkdown) {
        await db.Markdown.create({
          doctorId: doctor.id,
          description:
            'Bác sĩ tận tâm, tư vấn rõ ràng, theo dõi điều trị sát sao.',
          contentHTML:
            '<p><strong>Bác sĩ chuyên khoa</strong></p><p>Nội dung demo để hiển thị trang chi tiết bác sĩ.</p>',
          contentMarkdown:
            '## Bác sĩ chuyên khoa\n\nNội dung demo để hiển thị trang chi tiết bác sĩ.',
        });
      }

      // Schedule (lịch khám 7 ngày tới)
      const base = startOfDayMs(now);
      const existingSchedules = await db.Schedule.findAll({
        where: { doctorId: doctor.id },
        attributes: ['date', 'timeType'],
        raw: true,
      });
      const existingSet = new Set(
        existingSchedules.map((s) => `${s.date}::${s.timeType}`)
      );

      for (let i = 0; i < 7; i++) {
        const dateMs = String(base + i * 24 * 60 * 60 * 1000);
        const slots = ['T1', 'T2'];

        for (const timeType of slots) {
          const key = `${dateMs}::${timeType}`;
          if (existingSet.has(key)) continue;

          // eslint-disable-next-line no-await-in-loop
          await db.Schedule.create({
            doctorId: doctor.id,
            date: dateMs,
            timeType,
            currentNumber: 0,
            maxNumber: 5,
          });
        }
      }
    }
  },

  async down() {
    // Xóa dữ liệu demo theo email/doctorId để chạy lại seed dễ dàng
    await db.User.destroy({
      where: {
        email: [
          'admin@demo.local',
          'doctor1@demo.local',
          'doctor2@demo.local',
          'patient1@demo.local',
        ],
      },
    });

    // allcode demo: xóa theo type + keyMap
    await db.Allcode.destroy({
      where: {
        type: ['ROLE', 'GENDER', 'POSITION', 'TIME', 'PRICE', 'PAYMENT', 'PROVINCE'],
        keyMap: ['R1', 'R2', 'R3', 'M', 'F', 'POS1', 'POS2', 'POS3', 'T1', 'T2', 'T3', 'PR1', 'PR2', 'PAY1', 'PAY2', 'PROV1', 'PROV2'],
      },
    });
  },
};

