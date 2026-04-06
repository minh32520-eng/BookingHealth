import db from '../models/index.js';
import CRUDservices from '../services/CRUDservices.js';

const DEFAULT_ROLES = [
    { keyMap: 'R1', valueVi: 'Quản trị viên', valueEn: 'Admin' },
    { keyMap: 'R2', valueVi: 'Bác sĩ', valueEn: 'Doctor' },
    { keyMap: 'R3', valueVi: 'Bệnh nhân', valueEn: 'Patient' },
];

const DEFAULT_GENDERS = [
    { keyMap: 'M', valueVi: 'Nam', valueEn: 'Male' },
    { keyMap: 'F', valueVi: 'Nữ', valueEn: 'Female' },
];

const loadFormOptions = async () => {
    const [roles, positions, genders] = await Promise.all([
        db.Allcode.findAll({
            where: { type: 'ROLE' },
            raw: true,
            order: [['keyMap', 'ASC']],
        }),
        db.Allcode.findAll({
            where: { type: 'POSITION' },
            raw: true,
            order: [['keyMap', 'ASC']],
        }),
        db.Allcode.findAll({
            where: { type: 'GENDER' },
            raw: true,
            order: [['keyMap', 'ASC']],
        }),
    ]);

    return {
        roles: roles.length ? roles : DEFAULT_ROLES,
        positions,
        genders: genders.length ? genders : DEFAULT_GENDERS,
    };
};

const toLabelMap = (rows) => {
    const m = {};
    for (const r of rows) {
        m[r.keyMap] = r.valueVi || r.valueEn || r.keyMap;
    }
    return m;
};

const getHomePage = async (req, res) => {
    let data = await db.User.findAll({ raw: true });
    return res.render('homepage.ejs', { data });
};

const getAboutPage = (req, res) => {
    return res.render('test/about.ejs');
};

const getCRUD = async (req, res) => {
    try {
        const { roles, positions, genders } = await loadFormOptions();
        return res.render('crud.ejs', { roles, positions, genders });
    } catch (e) {
        console.error('getCRUD:', e);
        return res.status(500).send('Không tải được form phân quyền.');
    }
};

const postCRUD = async (req, res) => {
    await CRUDservices.createNewUser(req.body);
    return res.redirect('/get-crud');
};

const displayCRUD = async (req, res) => {
    try {
        const data = await CRUDservices.getAllUser();
        const { roles, positions } = await loadFormOptions();
        const roleMap = toLabelMap(roles);
        const positionMap = toLabelMap(positions);
        return res.render('displayCRUD.ejs', {
            dataTable: data,
            roleMap,
            positionMap,
        });
    } catch (e) {
        console.error('displayCRUD:', e);
        return res.status(500).send('Không tải được danh sách người dùng.');
    }
};

const getEditCRUD = async (req, res) => {
    const userId = req.query.id;
    if (!userId) return res.send('Không tìm thấy người dùng.');

    try {
        const userData = await CRUDservices.getUserInfoById(userId);
        if (!userData) {
            return res.send('Không tìm thấy người dùng.');
        }
        const { roles, positions, genders } = await loadFormOptions();
        return res.render('editCRUD.ejs', {
            user: userData,
            roles,
            positions,
            genders,
        });
    } catch (e) {
        console.error('getEditCRUD:', e);
        return res.status(500).send('Không tải được form chỉnh sửa.');
    }
};

const putCRUD = async (req, res) => {
    await CRUDservices.updateUserData(req.body);
    return res.redirect('/get-crud');
};

const deleteCRUD = async (req, res) => {
    const id = req.query.id;
    if (!id) return res.send('Không tìm thấy người dùng.');

    await CRUDservices.deleteUserById(id);
    return res.redirect('/get-crud');
};

export default {
    getHomePage,
    getAboutPage,
    getCRUD,
    postCRUD,
    displayCRUD,
    getEditCRUD,
    putCRUD,
    deleteCRUD,
};
