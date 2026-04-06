'use strict';

const now = new Date();

module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('specialties', [
            {
                name: 'Tim mạch',
                image:
                    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80',
                description:
                    '<p><strong>Chuyên khoa Tim mạch</strong> chẩn đoán và điều trị các bệnh về tim và hệ tuần hoàn: tăng huyết áp, suy tim, rối loạn nhịp tim, bệnh mạch vành.</p><p>Đội ngũ bác sĩ tư vấn điều trị cá thể hóa, theo dõi sát sao và hướng dẫn thay đổi lối sống.</p>',
                createdAt: now,
                updatedAt: now
            },
            {
                name: 'Thần kinh',
                image:
                    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80',
                description:
                    '<p><strong>Chuyên khoa Thần kinh</strong> xử lý đau đầu, chóng mặt, động kinh, sa sút trí tuệ, bệnh Parkinson, các rối loạn dây thần kinh ngoại biên.</p><p>Ứng dụng chẩn đoán hình ảnh và thăm khám lâm sàng chuyên sâu.</p>',
                createdAt: now,
                updatedAt: now
            },
            {
                name: 'Nhi khoa',
                image:
                    'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80',
                description:
                    '<p><strong>Chuyên khoa Nhi</strong> chăm sóc trẻ từ sơ sinh đến tuổi vị thành niên: tiêm chủng, dinh dưỡng, nhiễm khuẩn, hen, dị ứng.</p><p>Môi trường khám thân thiện, giảm lo lắng cho phụ huynh và trẻ.</p>',
                createdAt: now,
                updatedAt: now
            },
            {
                name: 'Da liễu',
                image:
                    'https://images.unsplash.com/photo-1612349317150e413ee57f6f4b2d0b3b?w=600&q=80',
                description:
                    '<p><strong>Chuyên khoa Da liễu</strong> điều trị mụn, vẩy nến, viêm da dị ứng, nấm da, bệnh da liên quan tự miễn.</p><p>Tư vấn chăm sóc da và laser điều trị theo chỉ định.</p>',
                createdAt: now,
                updatedAt: now
            },
            {
                name: 'Tai – Mũi – Họng',
                image:
                    'https://images.unsplash.com/photo-1603398938378-54d4f7e1a5e4?w=600&q=80',
                description:
                    '<p><strong>Chuyên khoa TMH</strong> xử lý viêm họng, viêm xoang, ù tai, giảm thính lực, rối loạn giọng nói.</p><p>Nội soi và phẫu thuật can thiệp khi cần.</p>',
                createdAt: now,
                updatedAt: now
            },
            {
                name: 'Mắt',
                image:
                    'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=600&q=80',
                description:
                    '<p><strong>Chuyên khoa Mắt</strong> khám thị lực, tật khúc xạ, bệnh võng mạc, tăng nhãn áp, khô mắt.</p><p>Trang thiết bị đo và chẩn đoán hiện đại.</p>',
                createdAt: now,
                updatedAt: now
            },
            {
                name: 'Nội tiết',
                image:
                    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
                description:
                    '<p><strong>Chuyên khoa Nội tiết</strong> đái tháo đường, rối loạn tuyến giáp, béo phì, rối loạn chuyển hóa lipid.</p><p>Kế hoạch điều trị kết hợp theo dõi đánh giá định kỳ.</p>',
                createdAt: now,
                updatedAt: now
            },
            {
                name: 'Tiêu hóa – Gan mật',
                image:
                    'https://images.unsplash.com/photo-1535919187386-57f0b5e9c2d2?w=600&q=80',
                description:
                    '<p><strong>Chuyên khoa Tiêu hóa</strong> trào ngược, loét dạ dày, hội chứng ruột kích thích, viêm gan, sỏi mật.</p><p>Nội soi tiêu hóa và tư vấn dinh dưỡng đi kèm.</p>',
                createdAt: now,
                updatedAt: now
            }
        ]);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('specialties', null, {});
    }
};
