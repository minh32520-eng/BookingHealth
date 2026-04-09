
import userService from "../services/userServices.js";

let handleLogin = async (req, res) => {
    try {
        let email = req.body.userEmail;
        let password = req.body.password;

        if (!email || !password) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing inputs parameter!'
            });
        }

        let userData = await userService.handleUserLogin(email, password);

        return res.status(200).json({
            errCode: userData.errCode,
            errMessage: userData.errMessage,
            user: userData.user ? userData.user : {}
        });

    } catch (e) {
        console.error('LOGIN ERROR:', e);
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

let handleGetAllUsers = async (req, res) => {
    try {
        let id = req.query.id;

        if (!id) {
            return res.status(400).json({
                errCode: 1,
                errMessage: 'Missing parameter',
                users: []
            });
        }

        let users = await userService.getAllUsers(id);

        return res.status(200).json({
            errCode: 0,
            errMessage: 'OK',
            users
        });

    } catch (e) {
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

let handleCreateNewUser = async (req, res) => {
    try {
        let message = await userService.createNewUser(req.body);
        return res.status(200).json(message);
    } catch (e) {
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

let handleRegister = async (req, res) => {
    try {
        let message = await userService.registerNewPatient(req.body);
        return res.status(200).json(message);
    } catch (e) {
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

let handleForgotPassword = async (req, res) => {
    try {
        let message = await userService.forgotPassword(req.body);
        return res.status(200).json(message);
    } catch (e) {
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

let handleDeleteUser = async (req, res) => {
    try {
        if (!req.body.id) {
            return res.status(400).json({
                errCode: 1,
                errMessage: "Missing id",
            });
        }

        let message = await userService.deleteUser(req.body.id);
        return res.status(200).json(message);

    } catch (e) {
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

let handleEditUser = async (req, res) => {
    try {
        let data = req.body;
        let message = await userService.updateUserData(data);
        return res.status(200).json(message);
    } catch (e) {
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

let getAllCode = async (req, res) => {
    try {
        let data = await userService.getAllCodeService(req.query.type);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({
            errCode: -1,
            errMessage: 'Error from server'
        });
    }
};

module.exports = {
    handleLogin,
    handleGetAllUsers,
    handleCreateNewUser,
    handleRegister,
    handleForgotPassword,
    handleEditUser,
    handleDeleteUser,
    getAllCode,
};
