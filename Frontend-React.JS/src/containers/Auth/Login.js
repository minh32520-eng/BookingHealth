import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { withRouter } from 'react-router-dom';
import * as actions from '../../store/actions';
import './Login.scss';
import { Label } from 'reactstrap';
import { handleLoginApi } from '../../services/userService';
import CommonUtils from '../../utils/CommonUtils';
import { FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaInstagram } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";

const getBackendUrl = () => process.env.REACT_APP_BACKEND_URL || 'http://localhost:6969';

const OAUTH_ERROR_VI = {
    facebook_not_configured: 'Facebook OAuth chưa cấu hình trên server.',
    github_not_configured: 'GitHub OAuth chưa cấu hình trên server.',
    google_not_configured: 'Google OAuth chưa cấu hình trên server.',
    instagram_not_configured: 'Instagram OAuth chưa cấu hình trên server.',
    facebook_failed: 'Đăng nhập Facebook thất bại.',
    github_failed: 'Đăng nhập GitHub thất bại.',
    google_failed: 'Đăng nhập Google thất bại.',
    instagram_denied: 'Bạn đã từ chối quyền Instagram.',
    instagram_token_failed: 'Không lấy được token Instagram.',
    instagram_user_failed: 'Không tạo/cập nhật tài khoản Instagram.',
    instagram_error: 'Lỗi Instagram.',
    session_failed: 'Phiên đăng nhập thất bại.',
};

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            errMessage: '',
            isShowPassWord: false
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
                this.props.userLoginSuccess(user);
                this.props.history.replace({ pathname: '/system/user-manage' });
            } else {
                this.setState({ errMessage: 'Token đăng nhập không hợp lệ.' });
                this.props.history.replace('/login');
            }
            return;
        }
        if (params.get('oauth') === 'error') {
            const reason = params.get('reason') || '';
            this.setState({
                errMessage: OAUTH_ERROR_VI[reason] || 'Đăng nhập mạng xã hội thất bại.',
            });
            this.props.history.replace('/login');
        }
    };

    handleOnChangeUserName = (event) => {
        this.setState({
            username: event.target.value
        });
    };

    handleOnChangePassword = (event) => {
        this.setState({
            password: event.target.value
        });
    };

    handelLogin = async () => {
        this.setState({
            errMessage: ''
        });

        let { username, password } = this.state;

        //  Validate rỗng
        if (!username || !password) {
            this.setState({
                errMessage: 'Vui lòng nhập username và password'
            });
            return;
        }

        try {
            let data = await handleLoginApi(username, password);

            console.log('login response:', data);

            //  xử lý lỗi từ backend
            if (data && data.errCode !== 0) {
                let message = '';

                switch (data.errCode) {
                    case 1:
                        message = 'Email không tồn tại';
                        break;
                    case 3:
                        message = 'Sai mật khẩu';
                        break;
                    default:
                        message = data.errMessage || 'Đăng nhập thất bại';
                }

                this.setState({
                    errMessage: message
                });
                return;
            }

            // login success
            if (data && data.errCode === 0) {
                this.props.userLoginSuccess(data.user);
                console.log('login success');
                this.props.navigate('/system/user-manage');
            }

        } catch (error) {
            console.log(error);


            const serverErr =
                error?.response?.data?.errMessage ||
                error?.response?.data?.errMessage ||
                error?.response?.data?.errMessage;

            this.setState({
                errMessage: serverErr || (error?.message || 'Lỗi kết nối server'),
            });
        }
    };

    handleShowHidePassword = (event) => {
        event.preventDefault();
        this.setState({
            isShowPassWord: !this.state.isShowPassWord
        });
    };

    handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
            this.handelLogin(); // ✅ fix đúng tên hàm
        }
    };

    render() {
        const apiBase = getBackendUrl();
        return (
            <div className="login-background">
                <div className="login-container">
                    <div className="login-content row">
                        <div className="col-12 text-login">Login</div>

                        <div className="col-12 form-group login-input">
                            <Label>Username</Label>
                            <input
                                type="text"
                                className={`form-control ${this.state.errMessage ? 'is-invalid' : ''}`}
                                placeholder="Enter your username"
                                value={this.state.username}
                                onChange={(event) => this.handleOnChangeUserName(event)}
                                onKeyDown={(event) => this.handleKeyDown(event)}
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
                                    onChange={(event) => this.handleOnChangePassword(event)}
                                    onKeyDown={(event) => this.handleKeyDown(event)}
                                />
                                <span onClick={(event) => this.handleShowHidePassword(event)}>
                                    <i
                                        className={
                                            this.state.isShowPassWord
                                                ? 'far fa-eye'
                                                : 'far fa-eye-slash'
                                        }
                                    />
                                </span>
                            </div>
                        </div>

                        <div className="col-12" style={{ color: 'red' }}>
                            {this.state.errMessage}
                        </div>

                        <div className="col-12">
                            <button
                                className="btn-login"
                                onClick={() => { this.handelLogin() }}
                            >
                                Login
                            </button>
                        </div>

                        <div className="col-12">
                            <span className="forgot-pass">
                                Forgot your password ?
                            </span>
                        </div>

                        <div className="col-12 text-center">
                            <span className="text-other-login">Or Login</span>
                        </div>

                        <div className="col-12-social-login">
                            <a
                                className="social-icon facebook"
                                href={`${apiBase}/api/auth/facebook`}
                                title="Đăng nhập Facebook"
                                aria-label="Đăng nhập Facebook"
                            >
                                <FaFacebookF />
                            </a>
                            <a
                                className="social-icon google"
                                href={`${apiBase}/api/auth/google`}
                                title="Đăng nhập Google"
                                aria-label="Đăng nhập Google"
                            >
                                <FcGoogle />
                            </a>
                            <a
                                className="social-icon instagram"
                                href={`${apiBase}/api/auth/instagram`}
                                title="Đăng nhập Instagram"
                                aria-label="Đăng nhập Instagram"
                            >
                                <FaInstagram />
                            </a>
                            <a
                                className="social-icon github"
                                href={`${apiBase}/api/auth/github`}
                                title="Đăng nhập GitHub"
                                aria-label="Đăng nhập GitHub"
                            >
                                <FaGithub />
                            </a>
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