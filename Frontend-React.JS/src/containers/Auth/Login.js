import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { withRouter } from 'react-router-dom';
import * as actions from '../../store/actions';
import './Login.scss';
import { Label } from 'reactstrap';
import { handleLoginApi, registerApi, forgotPasswordApi, sendEmailOtpApi, verifyEmailOtpApi } from '../../services/userService';
import CommonUtils from '../../utils/CommonUtils';
import { USER_ROLE } from '../../utils';
import { FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaInstagram } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";

const getBackendUrl = () => process.env.REACT_APP_BACKEND_URL || 'http://localhost:6969';
const AUTH_STORAGE_KEY = 'bookingcare_user_session';

const getRedirectPathByRole = (user) => {
    if (!user || !user.roleId) return '/home';
    if (user.roleId === USER_ROLE.ADMIN) return '/system/user-manage';
    if (user.roleId === USER_ROLE.DOCTOR) return '/doctor/manage-schedule';
    return '/home';
};

const OAUTH_ERROR_VI = {
    facebook_not_configured: 'Facebook OAuth chua cau hinh tren server.',
    github_not_configured: 'GitHub OAuth chua cau hinh tren server.',
    google_not_configured: 'Google OAuth chua cau hinh tren server.',
    instagram_not_configured: 'Instagram OAuth chua cau hinh tren server.',
    facebook_failed: 'Dang nhap Facebook that bai.',
    github_failed: 'Dang nhap GitHub that bai.',
    google_failed: 'Dang nhap Google that bai.',
    instagram_denied: 'Ban da tu choi quyen Instagram.',
    instagram_token_failed: 'Khong lay duoc token Instagram.',
    instagram_user_failed: 'Khong tao/cap nhat tai khoan Instagram.',
    instagram_error: 'Loi Instagram.',
    session_failed: 'Phien dang nhap that bai.',
};

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: 'login',
            username: '',
            password: '',
            errMessage: '',
            successMessage: '',
            isShowPassWord: false,
            registerForm: {
                email: '',
                password: '',
                confirmPassword: '',
                firstName: '',
                lastName: '',
                phoneNumber: '',
                address: '',
                otpCode: '',
                verificationToken: '',
                otpVerified: false,
                otpSending: false,
                otpVerifying: false
            },
            forgotForm: {
                email: '',
                newPassword: '',
                confirmPassword: '',
                otpCode: '',
                verificationToken: '',
                otpVerified: false,
                otpSending: false,
                otpVerifying: false
            }
        };
    }

    componentDidMount() {
        this.handleOAuthReturn();
    }

    handleOAuthReturn = () => {
        const params = new URLSearchParams(this.props.location.search);
        if (params.get('oauth') === 'success') {
            const token = params.get('token');
            const user = token ? CommonUtils.userInfoFromOAuthToken(token) : null;
            if (user) {
                try {
                    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
                        isLoggedIn: true,
                        userInfo: user
                    }));
                } catch (error) { }
                this.props.userLoginSuccess(user);
                this.props.history.replace({ pathname: getRedirectPathByRole(user) });
            } else {
                this.setState({ errMessage: 'Token dang nhap khong hop le.' });
                this.props.history.replace('/login');
            }
            return;
        }
        if (params.get('oauth') === 'error') {
            const reason = params.get('reason') || '';
            this.setState({
                errMessage: OAUTH_ERROR_VI[reason] || 'Dang nhap mang xa hoi that bai.',
            });
            this.props.history.replace('/login');
        }
    };

    setMode = (mode) => {
        this.setState({
            mode,
            errMessage: '',
            successMessage: ''
        });
    }

    handleOnChangeUserName = (event) => {
        this.setState({ username: event.target.value });
    };

    handleOnChangePassword = (event) => {
        this.setState({ password: event.target.value });
    };

    onChangeRegisterField = (event, field) => {
        const value = event.target.value;
        this.setState(prevState => ({
            registerForm: {
                ...prevState.registerForm,
                [field]: value,
                ...(field === 'email'
                    ? { otpCode: '', verificationToken: '', otpVerified: false }
                    : {})
            }
        }));
    }

    onChangeForgotField = (event, field) => {
        const value = event.target.value;
        this.setState(prevState => ({
            forgotForm: {
                ...prevState.forgotForm,
                [field]: value,
                ...(field === 'email'
                    ? { otpCode: '', verificationToken: '', otpVerified: false }
                    : {})
            }
        }));
    }

    sendOtp = async (formKey, purpose) => {
        const form = this.state[formKey];
        const email = (form.email || '').trim().toLowerCase();

        if (!email) {
            this.setState({ errMessage: 'Vui long nhap email Gmail truoc khi gui OTP' });
            return;
        }

        this.setState(prevState => ({
            errMessage: '',
            successMessage: '',
            [formKey]: {
                ...prevState[formKey],
                otpSending: true
            }
        }));

        try {
            const res = await sendEmailOtpApi({ email, purpose });
            if (res && res.errCode === 0) {
                this.setState(prevState => ({
                    successMessage: 'Ma OTP da duoc gui ve Gmail cua ban.',
                    [formKey]: {
                        ...prevState[formKey],
                        otpSending: false
                    }
                }));
                return;
            }

            this.setState(prevState => ({
                errMessage: res?.errMessage || 'Khong gui duoc ma OTP',
                [formKey]: {
                    ...prevState[formKey],
                    otpSending: false
                }
            }));
        } catch (error) {
            this.setState(prevState => ({
                errMessage: error?.response?.data?.errMessage || 'Khong gui duoc ma OTP',
                [formKey]: {
                    ...prevState[formKey],
                    otpSending: false
                }
            }));
        }
    }

    verifyOtp = async (formKey, purpose) => {
        const form = this.state[formKey];
        const email = (form.email || '').trim().toLowerCase();
        const otpCode = (form.otpCode || '').trim();

        if (!email || !otpCode) {
            this.setState({ errMessage: 'Vui long nhap email va ma OTP' });
            return;
        }

        this.setState(prevState => ({
            errMessage: '',
            successMessage: '',
            [formKey]: {
                ...prevState[formKey],
                otpVerifying: true
            }
        }));

        try {
            const res = await verifyEmailOtpApi({ email, purpose, otpCode });
            if (res && res.errCode === 0) {
                this.setState(prevState => ({
                    successMessage: 'Xac minh email thanh cong.',
                    [formKey]: {
                        ...prevState[formKey],
                        otpVerifying: false,
                        otpVerified: true,
                        verificationToken: res?.data?.verificationToken || ''
                    }
                }));
                return;
            }

            this.setState(prevState => ({
                errMessage: res?.errMessage || 'Xac minh OTP that bai',
                [formKey]: {
                    ...prevState[formKey],
                    otpVerifying: false
                }
            }));
        } catch (error) {
            this.setState(prevState => ({
                errMessage: error?.response?.data?.errMessage || 'Xac minh OTP that bai',
                [formKey]: {
                    ...prevState[formKey],
                    otpVerifying: false
                }
            }));
        }
    }

    handelLogin = async () => {
        this.setState({ errMessage: '', successMessage: '' });

        let { username, password } = this.state;
        username = username.trim().toLowerCase();

        if (!username || !password) {
            this.setState({ errMessage: 'Vui long nhap email va mat khau' });
            return;
        }

        try {
            let data = await handleLoginApi(username, password);

            if (data && data.errCode !== 0) {
                let message = '';

                switch (data.errCode) {
                    case 1:
                        message = 'Email khong ton tai';
                        break;
                    case 3:
                        message = 'Sai mat khau';
                        break;
                    default:
                        message = data.errMessage || 'Dang nhap that bai';
                }

                this.setState({ errMessage: message });
                return;
            }

            if (data && data.errCode === 0) {
                this.props.userLoginSuccess(data.user);
                this.props.navigate(getRedirectPathByRole(data.user));
            }

        } catch (error) {
            const serverErr = error?.response?.data?.errMessage;
            this.setState({
                errMessage: serverErr || (error?.message || 'Loi ket noi server'),
            });
        }
    };

    handleRegister = async () => {
        const { registerForm } = this.state;
        this.setState({ errMessage: '', successMessage: '' });

        if (!registerForm.email || !registerForm.password || !registerForm.firstName || !registerForm.lastName) {
            this.setState({ errMessage: 'Vui long nhap day du thong tin bat buoc' });
            return;
        }

        if (!registerForm.otpVerified || !registerForm.verificationToken) {
            this.setState({ errMessage: 'Vui long xac minh OTP truoc khi dang ky' });
            return;
        }

        if (registerForm.password !== registerForm.confirmPassword) {
            this.setState({ errMessage: 'Mat khau xac nhan khong khop' });
            return;
        }

        try {
            const res = await registerApi({
                email: registerForm.email.trim().toLowerCase(),
                password: registerForm.password,
                firstName: registerForm.firstName,
                lastName: registerForm.lastName,
                phoneNumber: registerForm.phoneNumber,
                address: registerForm.address,
                verificationToken: registerForm.verificationToken
            });

            if (res && res.errCode === 0) {
                this.setState({
                    mode: 'login',
                    successMessage: 'Dang ky thanh cong. Vui long dang nhap.',
                    username: registerForm.email.trim().toLowerCase(),
                    password: '',
                    registerForm: {
                        email: '',
                        password: '',
                        confirmPassword: '',
                        firstName: '',
                        lastName: '',
                        phoneNumber: '',
                        address: '',
                        otpCode: '',
                        verificationToken: '',
                        otpVerified: false,
                        otpSending: false,
                        otpVerifying: false
                    }
                });
            } else {
                this.setState({ errMessage: res?.errMessage || 'Dang ky that bai' });
            }
        } catch (error) {
            this.setState({ errMessage: error?.response?.data?.errMessage || 'Dang ky that bai' });
        }
    }

    handleForgotPassword = async () => {
        const { forgotForm } = this.state;
        this.setState({ errMessage: '', successMessage: '' });

        if (!forgotForm.email || !forgotForm.newPassword) {
            this.setState({ errMessage: 'Vui long nhap email va mat khau moi' });
            return;
        }

        if (!forgotForm.otpVerified || !forgotForm.verificationToken) {
            this.setState({ errMessage: 'Vui long xac minh OTP truoc khi doi mat khau' });
            return;
        }

        if (forgotForm.newPassword !== forgotForm.confirmPassword) {
            this.setState({ errMessage: 'Mat khau xac nhan khong khop' });
            return;
        }

        try {
            const res = await forgotPasswordApi({
                email: forgotForm.email.trim().toLowerCase(),
                newPassword: forgotForm.newPassword,
                verificationToken: forgotForm.verificationToken
            });

            if (res && res.errCode === 0) {
                this.setState({
                    mode: 'login',
                    successMessage: 'Cap nhat mat khau thanh cong. Vui long dang nhap lai.',
                    username: forgotForm.email.trim().toLowerCase(),
                    password: '',
                    forgotForm: {
                        email: '',
                        newPassword: '',
                        confirmPassword: '',
                        otpCode: '',
                        verificationToken: '',
                        otpVerified: false,
                        otpSending: false,
                        otpVerifying: false
                    }
                });
            } else {
                this.setState({ errMessage: res?.errMessage || 'Khong the doi mat khau' });
            }
        } catch (error) {
            this.setState({ errMessage: error?.response?.data?.errMessage || 'Khong the doi mat khau' });
        }
    }

    handleShowHidePassword = (event) => {
        event.preventDefault();
        this.setState({ isShowPassWord: !this.state.isShowPassWord });
    };

    handleSocialLogin = (provider) => {
        const apiBase = getBackendUrl();
        window.location.href = `${apiBase}/api/auth/${provider}`;
    };

    handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
            if (this.state.mode === 'login') {
                this.handelLogin();
            }
        }
    };

    renderLoginForm = () => {
        return (
            <>
                <div className="col-12 form-group login-input">
                    <Label>Email</Label>
                    <input
                        type="text"
                        className={`form-control ${this.state.errMessage ? 'is-invalid' : ''}`}
                        placeholder="Enter email"
                        value={this.state.username}
                        onChange={this.handleOnChangeUserName}
                        onKeyDown={this.handleKeyDown}
                    />
                </div>

                <div className="col-12 form-group login-input">
                    <Label>Password</Label>
                    <div className="custom-input-password">
                        <input
                            className={`form-control ${this.state.errMessage ? 'is-invalid' : ''}`}
                            type={this.state.isShowPassWord ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={this.state.password}
                            onChange={this.handleOnChangePassword}
                            onKeyDown={this.handleKeyDown}
                        />
                        <span onClick={this.handleShowHidePassword}>
                            <i className={this.state.isShowPassWord ? 'far fa-eye' : 'far fa-eye-slash'} />
                        </span>
                    </div>
                </div>

                <div className="col-12">
                    <button className="btn-login" onClick={this.handelLogin}>Login</button>
                </div>

                <div className="col-12 auth-inline-actions">
                    <button type="button" className="link-button" onClick={() => this.setMode('forgot')}>
                        Forgot your password?
                    </button>
                    <button type="button" className="link-button" onClick={() => this.setMode('register')}>
                        Create account
                    </button>
                </div>
            </>
        );
    }

    renderRegisterForm = () => {
        const { registerForm } = this.state;
        return (
            <>
                <div className="col-6 form-group login-input compact-input">
                    <Label>First name</Label>
                    <input type="text" className="form-control" value={registerForm.firstName} onChange={(e) => this.onChangeRegisterField(e, 'firstName')} />
                </div>
                <div className="col-6 form-group login-input compact-input">
                    <Label>Last name</Label>
                    <input type="text" className="form-control" value={registerForm.lastName} onChange={(e) => this.onChangeRegisterField(e, 'lastName')} />
                </div>
                <div className="col-12 form-group login-input">
                    <Label>Email</Label>
                    <input type="text" className="form-control" value={registerForm.email} onChange={(e) => this.onChangeRegisterField(e, 'email')} />
                </div>
                <div className="col-8 form-group login-input compact-input">
                    <Label>OTP</Label>
                    <input type="text" className="form-control" value={registerForm.otpCode} onChange={(e) => this.onChangeRegisterField(e, 'otpCode')} />
                </div>
                <div className="col-4 form-group login-input compact-input otp-action-cell">
                    <Label>&nbsp;</Label>
                    <button type="button" className="btn-otp-action" onClick={() => this.sendOtp('registerForm', 'register')} disabled={registerForm.otpSending}>
                        {registerForm.otpSending ? 'Sending...' : 'Send OTP'}
                    </button>
                </div>
                <div className="col-12 auth-inline-actions otp-inline">
                    <button type="button" className="link-button" onClick={() => this.verifyOtp('registerForm', 'register')}>
                        {registerForm.otpVerifying ? 'Verifying...' : registerForm.otpVerified ? 'OTP verified' : 'Verify OTP'}
                    </button>
                </div>
                <div className="col-6 form-group login-input compact-input">
                    <Label>Password</Label>
                    <input type="password" className="form-control" value={registerForm.password} onChange={(e) => this.onChangeRegisterField(e, 'password')} />
                </div>
                <div className="col-6 form-group login-input compact-input">
                    <Label>Confirm</Label>
                    <input type="password" className="form-control" value={registerForm.confirmPassword} onChange={(e) => this.onChangeRegisterField(e, 'confirmPassword')} />
                </div>
                <div className="col-6 form-group login-input compact-input">
                    <Label>Phone</Label>
                    <input type="text" className="form-control" value={registerForm.phoneNumber} onChange={(e) => this.onChangeRegisterField(e, 'phoneNumber')} />
                </div>
                <div className="col-6 form-group login-input compact-input">
                    <Label>Address</Label>
                    <input type="text" className="form-control" value={registerForm.address} onChange={(e) => this.onChangeRegisterField(e, 'address')} />
                </div>
                <div className="col-12">
                    <button className="btn-login" onClick={this.handleRegister}>Register</button>
                </div>
                <div className="col-12 auth-inline-actions center-only">
                    <button type="button" className="link-button" onClick={() => this.setMode('login')}>
                        Back to login
                    </button>
                </div>
            </>
        );
    }

    renderForgotForm = () => {
        const { forgotForm } = this.state;
        return (
            <>
                <div className="col-12 form-group login-input">
                    <Label>Email</Label>
                    <input type="text" className="form-control" value={forgotForm.email} onChange={(e) => this.onChangeForgotField(e, 'email')} />
                </div>
                <div className="col-8 form-group login-input compact-input">
                    <Label>OTP</Label>
                    <input type="text" className="form-control" value={forgotForm.otpCode} onChange={(e) => this.onChangeForgotField(e, 'otpCode')} />
                </div>
                <div className="col-4 form-group login-input compact-input otp-action-cell">
                    <Label>&nbsp;</Label>
                    <button type="button" className="btn-otp-action" onClick={() => this.sendOtp('forgotForm', 'forgot_password')} disabled={forgotForm.otpSending}>
                        {forgotForm.otpSending ? 'Sending...' : 'Send OTP'}
                    </button>
                </div>
                <div className="col-12 auth-inline-actions otp-inline">
                    <button type="button" className="link-button" onClick={() => this.verifyOtp('forgotForm', 'forgot_password')}>
                        {forgotForm.otpVerifying ? 'Verifying...' : forgotForm.otpVerified ? 'OTP verified' : 'Verify OTP'}
                    </button>
                </div>
                <div className="col-12 form-group login-input">
                    <Label>New password</Label>
                    <input type="password" className="form-control" value={forgotForm.newPassword} onChange={(e) => this.onChangeForgotField(e, 'newPassword')} />
                </div>
                <div className="col-12 form-group login-input">
                    <Label>Confirm new password</Label>
                    <input type="password" className="form-control" value={forgotForm.confirmPassword} onChange={(e) => this.onChangeForgotField(e, 'confirmPassword')} />
                </div>
                <div className="col-12">
                    <button className="btn-login" onClick={this.handleForgotPassword}>Update password</button>
                </div>
                <div className="col-12 auth-inline-actions center-only">
                    <button type="button" className="link-button" onClick={() => this.setMode('login')}>
                        Back to login
                    </button>
                </div>
            </>
        );
    }

    render() {
        const apiBase = getBackendUrl();
        const { mode, errMessage, successMessage } = this.state;
        const modeTitle = mode === 'login' ? 'Login' : mode === 'register' ? 'Register' : 'Forgot password';

        return (
            <div className="login-background">
                <div className="login-container">
                    <div className="login-content row">
                        <div className="col-12 text-login">{modeTitle}</div>

                        <div className="col-12 auth-mode-tabs">
                            <button className={mode === 'login' ? 'active' : ''} onClick={() => this.setMode('login')}>Login</button>
                            <button className={mode === 'register' ? 'active' : ''} onClick={() => this.setMode('register')}>Register</button>
                            <button className={mode === 'forgot' ? 'active' : ''} onClick={() => this.setMode('forgot')}>Forgot</button>
                        </div>

                        {errMessage ? <div className="col-12 auth-message error">{errMessage}</div> : null}
                        {successMessage ? <div className="col-12 auth-message success">{successMessage}</div> : null}

                        {mode === 'login' && this.renderLoginForm()}
                        {mode === 'register' && this.renderRegisterForm()}
                        {mode === 'forgot' && this.renderForgotForm()}

                        <div className="col-12 text-center social-title">
                            <span className="text-other-login">Or continue with</span>
                        </div>

                        <div className="col-12-social-login">
                            <button type="button" className="social-icon facebook" onClick={() => this.handleSocialLogin('facebook')} title="Dang nhap Facebook" aria-label="Dang nhap Facebook">
                                <FaFacebookF />
                            </button>
                            <button type="button" className="social-icon google" onClick={() => this.handleSocialLogin('google')} title="Dang nhap Google" aria-label="Dang nhap Google">
                                <FcGoogle />
                            </button>
                            <button type="button" className="social-icon instagram" onClick={() => this.handleSocialLogin('instagram')} title="Dang nhap Instagram" aria-label="Dang nhap Instagram">
                                <FaInstagram />
                            </button>
                            <button type="button" className="social-icon github" onClick={() => this.handleSocialLogin('github')} title="Dang nhap GitHub" aria-label="Dang nhap GitHub">
                                <FaGithub />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        lang: state.app.language
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        navigate: (path) => dispatch(push(path)),
        userLoginSuccess: (userInfor) => dispatch(actions.userLoginSuccess(userInfor))
    };
};

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Login));

