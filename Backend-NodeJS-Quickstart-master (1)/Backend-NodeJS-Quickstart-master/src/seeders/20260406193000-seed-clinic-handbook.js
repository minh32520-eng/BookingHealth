'use strict';

const now = new Date();

module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('clininc', [
            {
                name: 'Phòng khám Đa khoa Trung Tâm',
                address: '123 Lê Lợi, Quận 1, TP.HCM',
                description: 'Khám tổng quát, nội tim mạch, xét nghiệm cơ bản.',
                image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
                createdAt: now,
                updatedAt: now,
            },
        ]);

        await queryInterface.bulkInsert('handbooks', [
            {
                title: '5 bước chuẩn bị trước khi đi khám',
                content:
                    'Mang theo giấy tờ tùy thân, BHYT, danh sách thuốc đang dùng và các kết quả xét nghiệm gần nhất.',
                createdAt: now,
                updatedAt: now,
            },
            {
                title: 'Khi nào nên khám chuyên khoa tim mạch?',
                content:
                    'Nếu có đau ngực, khó thở, hồi hộp, tăng huyết áp kéo dài hoặc tiền sử gia đình bệnh tim.',
                createdAt: now,
                updatedAt: now,
            },
        ]);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('handbooks', null, {});
        await queryInterface.bulkDelete('clininc', null, {});
    },
};

