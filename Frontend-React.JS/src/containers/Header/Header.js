import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import * as actions from "../../store/actions";
import Navigator from '../../components/Navigator';
import { adminMenu, doctorMenu } from './menuApp';
import './Header.scss';
import { LANGUAGES, USER_ROLE } from '../../utils/constant';
import _ from 'lodash'

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menuApp: []
        }
    }

    handleChangeLanguage = (language) => {
        this.props.changeLanguageAppRedux(language)
    }

    componentDidMount() {
        this.loadMenu();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.userInfo !== this.props.userInfo) {
            this.loadMenu();
        }
    }

    loadMenu = () => {
        let { userInfo } = this.props;
        let menu = [];

        console.log("USER INFO:", userInfo);
        console.log("ROLE:", userInfo?.roleId);

        if (userInfo && !_.isEmpty(userInfo)) {
            let role = userInfo.roleId;

            if (role === USER_ROLE.ADMIN) {
                menu = adminMenu;
            }

            if (role === USER_ROLE.DOCTOR) {
                menu = doctorMenu;
            }
        }

        this.setState({
            menuApp: menu
        });
    }

    getAdminLinks = () => {
        return adminMenu.flatMap(group => group.menus || []);
    }

    getDoctorLinks = () => {
        return doctorMenu.flatMap(group => group.menus || []);
    }

    getCurrentWorkspaceTitle = (links, fallbackTitle) => {
        const currentPath = this.props.location?.pathname;
        const currentItem = links.find(item => item.link === currentPath);
        return currentItem?.name || fallbackTitle;
    }

    getWorkspaceIconClass = (link) => {
        const iconMap = {
            '/system/revenue-dashboard': 'fas fa-chart-pie',
            '/system/user-manage': 'fas fa-users',
            '/system/manage-booking': 'far fa-calendar-check',
            '/system/manage-payment': 'fas fa-wallet',
            '/system/payment-config': 'fas fa-cog',
            '/system/manage-doctor': 'fas fa-user-md',
            '/system/manage-specialty': 'fas fa-notes-medical',
            '/system/manage-clinic': 'fas fa-hospital',
            '/system/manage-handbook': 'fas fa-book-medical'
        };

        return iconMap[link] || 'fas fa-circle';
    }

    getDoctorIconClass = (link) => {
        const iconMap = {
            '/doctor/dashboard': 'fas fa-chart-line',
            '/doctor/manage-schedule': 'far fa-calendar-alt',
            '/doctor/medical-records': 'fas fa-file-medical-alt',
            '/doctor/profile': 'fas fa-user-circle'
        };

        return iconMap[link] || 'fas fa-circle';
    }

    renderWorkspaceLayout = (config) => {
        const { processLogout, language, userInfo, location } = this.props;
        const { links, brandMark, eyebrow, title, fallbackTitle, shellClass, getIconClass } = config;

        return (
            <div className={`admin-nav-shell ${shellClass || ''}`}>
                <aside className="admin-sidebar">
                    <div className="admin-brand">
                        <div className="brand-mark">{brandMark}</div>
                        <div className="brand-copy">
                            <span className="eyebrow">{eyebrow}</span>
                            <strong>{title}</strong>
                        </div>
                    </div>

                    <div className="admin-nav-section">
                        {links.map((item) => {
                            const isActive = location?.pathname === item.link;
                            return (
                                <Link
                                    key={item.link}
                                    to={item.link}
                                    className={isActive ? 'admin-nav-link active' : 'admin-nav-link'}
                                >
                                    <i className={getIconClass(item.link)}></i>
                                    <span><FormattedMessage id={item.name} /></span>
                                </Link>
                            );
                        })}
                    </div>
                </aside>

                <div className="admin-topbar">
                    <div className="admin-search">
                        <i className="fas fa-search"></i>
                        <span><FormattedMessage id={this.getCurrentWorkspaceTitle(links, fallbackTitle)} /></span>
                    </div>

                    <div className="languages">
                        <span className="welcome">
                            <FormattedMessage id="homeheader.welcome" />,
                            {userInfo && userInfo.firstName ? ` ${userInfo.firstName}` : ''}!
                        </span>

                        <span
                            className={language === LANGUAGES.VI ? "language-vi active" : "language-vi"}
                            onClick={() => this.handleChangeLanguage(LANGUAGES.VI)}
                        >
                            VN
                        </span>

                        <span
                            className={language === LANGUAGES.EN ? "language-en active" : "language-en"}
                            onClick={() => this.handleChangeLanguage(LANGUAGES.EN)}
                        >
                            EN
                        </span>

                        <div
                            className="btn btn-logout"
                            onClick={processLogout}
                            title="Log out"
                        >
                            <i className="fas fa-sign-out-alt"></i>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const { processLogout, language, userInfo } = this.props;
        const isAdmin = userInfo?.roleId === USER_ROLE.ADMIN;
        const isDoctor = userInfo?.roleId === USER_ROLE.DOCTOR;

        if (isAdmin) {
            return this.renderWorkspaceLayout({
                links: this.getAdminLinks(),
                brandMark: 'A',
                eyebrow: 'Admin',
                title: 'Health Dashboard',
                fallbackTitle: 'menu.admin.dashboard',
                shellClass: 'admin-shell',
                getIconClass: this.getWorkspaceIconClass
            });
        }

        if (isDoctor) {
            return this.renderWorkspaceLayout({
                links: this.getDoctorLinks(),
                brandMark: 'D',
                eyebrow: 'Doctor',
                title: 'Doctor Workspace',
                fallbackTitle: 'menu.doctor.manage-schedule',
                shellClass: 'doctor-shell',
                getIconClass: this.getDoctorIconClass
            });
        }

        return (
            <div className="header-container">
                <div className="header-tabs-container">
                    <Navigator menus={this.state.menuApp || []} />
                </div>
                <div className="languages">
                    <span className="welcome">
                        <FormattedMessage id="homeheader.welcome" />,
                        {userInfo && userInfo.firstName ? userInfo.firstName : ''}!
                    </span>

                    <span
                        className={language === LANGUAGES.VI ? "language-vi active" : "language-vi"}
                        onClick={() => this.handleChangeLanguage(LANGUAGES.VI)}
                    >
                        VN
                    </span>

                    <span
                        className={language === LANGUAGES.EN ? "language-en active" : "language-en"}
                        onClick={() => this.handleChangeLanguage(LANGUAGES.EN)}
                    >
                        EN
                    </span>

                    <div
                        className="btn btn-logout"
                        onClick={processLogout}
                        title="Log out"
                    >
                        <i className="fas fa-sign-out-alt"></i>
                    </div>
                </div>
            </div >
        );
    }
}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        userInfo: state.user.userInfo,
        language: state.app.language,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        processLogout: () => dispatch(actions.processLogout()),
        changeLanguageAppRedux: (language) => dispatch(actions.changeLanguageApp(language))
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));
