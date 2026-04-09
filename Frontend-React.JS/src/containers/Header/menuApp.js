export const adminMenu = [
    {
        name: 'menu.admin.manage-user',
        menus: [
            {
                name: 'menu.admin.crud',
                link: '/system/user-manage'
            }
        ]
    },
    {
        name: 'menu.admin.manage-doctor',
        menus: [
            {
                name: 'menu.admin.manage-doctor',
                link: '/system/manage-doctor'
            }
        ]
    },
    {
        name: 'menu.admin.specialty',
        menus: [
            {
                name: 'menu.admin.manage-specialty',
                link: '/system/manage-specialty'
            }
        ]
    },
    {
        name: 'menu.admin.clinic',
        menus: [
            {
                name: 'menu.admin.manage-clinic',
                link: '/system/manage-clinic'
            }
        ]
    },
    {
        name: 'menu.admin.handbook',
        menus: [
            {
                name: 'menu.admin.manage-handbook',
                link: '/system/manage-handbook'
            }
        ]
    }
];

export const doctorMenu = [
    {
        name: 'menu.doctor.workspace',
        menus: [
            {
                name: 'menu.doctor.home',
                link: '/home'
            },
            {
                name: 'menu.doctor.manage-schedule',
                link: '/doctor/manage-schedule'
            },
            {
                name: 'menu.doctor.payment-qr',
                link: '/doctor/payment-qr'
            }
        ]
    }
];
