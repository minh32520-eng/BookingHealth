
import React, { Component } from 'react';
import { connect } from 'react-redux';
import './HomeHeader.scss';
import { FormattedMessage, injectIntl } from 'react-intl';
import { LANGUAGES, path } from '../../utils';
import { changeLanguageApp, processLogout } from '../../store/actions';
import { withRouter } from 'react-router';

const logoSvg = encodeURIComponent(
    `< svg xmlns = "http://www.w3.org/2000/svg" width = "160" height = "60" viewBox = "0 0 160 60" >
        <defs>
            <linearGradient id="g" x1="0" x2="1">
                <stop offset="0" stop-color="#49bce2"/>
                <stop offset="1" stop-color="#2a8fbd"/>
            </linearGradient>
        </defs>
        <rect x="0" y="0" width="160" height="60" rx="12" fill="url(#g)"/>
        <text x="80" y="38" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" text-anchor="middle" fill="#fff">HEALTH</text>
    </svg > `
);
const logoUrl = `data: image / svg + xml; charset = utf - 8, ${logoSvg} `;

class HomeHeader extends Component {
    state = {
        isAccountMenuOpen: false
    };

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    changeLanguage = (language) => {
        this.props.changeLanguageAppRedux(language);
    }

    returnToHome = () => {
        this.props.history.push(path.HOMEPAGE);
    }

    goToLogin = () => {
        this.props.history.push(path.LOGIN);
    }

    goToPage = (route) => {
        this.props.history.push(route);
    }

    getUserInitial = () => {
        const fullName = `${this.props.userInfo?.firstName || ''} ${this.props.userInfo?.lastName || ''}`.trim();
        if (!fullName) return 'U';
        return fullName.charAt(0).toUpperCase();
    }

    toggleAccountMenu = () => {
        this.setState(prevState => ({
            isAccountMenuOpen: !prevState.isAccountMenuOpen
        }));
    }

    closeAccountMenu = () => {
        this.setState({ isAccountMenuOpen: false });
    }

    handleClickOutside = (event) => {
        if (this.accountMenuRef && !this.accountMenuRef.contains(event.target)) {
            this.closeAccountMenu();
        }
    }

    goToBookingHistory = () => {
        this.closeAccountMenu();
        this.props.history.push(path.PATIENT_BOOKING_HISTORY);
    }

    handleLogout = () => {
        this.closeAccountMenu();
        this.props.processLogoutRedux();
        this.props.history.push(path.HOMEPAGE);
    }

    render() {
        const { language, isLoggedIn, userInfo } = this.props;

        return (
            <React.Fragment>
                <div className="home-header-container">
                    <div className="home-header-content">

                        <div className="left-content">
                            <i className="fas fa-bars"></i>
                            <div
                                className="header-logo"
                                style={{ backgroundImage: `url('${logoUrl}')` }}
                                onClick={this.returnToHome}
                            />
                        </div>

                        <div className="center-content">

                            <div className="child-content" onClick={() => this.goToPage(path.SPECIALTY)}>
                                <div>
                                    <b><FormattedMessage id="homeheader.speciality" /></b>
                                </div>
                                <div className="subs-title">
                                    <FormattedMessage id="homeheader.searchdoctor" />
                                </div>
                            </div>

                            <div className="child-content" onClick={() => this.goToPage(path.CLINIC)}>
                                <div>
                                    <b><FormattedMessage id="homeheader.health-facility" /></b>
                                </div>
                                <div className="subs-title">
                                    <FormattedMessage id="homeheader.select-room" />
                                </div>
                            </div>

                            <div className="child-content" onClick={() => this.goToPage(path.DOCTOR)}>
                                <div>
                                    <b><FormattedMessage id="homeheader.doctor" /></b>
                                </div>
                                <div className="subs-title">
                                    <FormattedMessage id="homeheader.select-doctor" />
                                </div>
                            </div>

                            <div className="child-content" onClick={() => this.goToPage(path.HANDBOOK)}>
                                <div>
                                    <b><FormattedMessage id="homeheader.fee" /></b>
                                </div>
                                <div className="subs-title">
                                    <FormattedMessage id="homeheader.check-health" />
                                </div>
                            </div>

                        </div>

                        <div className="right-content">
                            <div className="support">
                                <i className="fas fa-question"></i>
                            </div>

                            {!isLoggedIn && (
                                <button
                                    type="button"
                                    className="btn-login"
                                    onClick={this.goToLogin}
                                >
                                    <i className="fas fa-sign-in-alt" />
                                    <FormattedMessage id="homeheader.login" />
                                </button>
                            )}

                            {isLoggedIn && (
                                <div
                                    className="account-menu-wrapper"
                                    ref={(node) => { this.accountMenuRef = node; }}
                                >
                                    <button
                                        type="button"
                                        className="account-trigger"
                                        onClick={this.toggleAccountMenu}
                                    >
                                        <span className="avatar-circle">{this.getUserInitial()}</span>
                                        <span className="account-name">
                                            {userInfo?.firstName || userInfo?.email || 'User'}
                                        </span>
                                        <i className="fas fa-chevron-down"></i>
                                    </button>

                                    {this.state.isAccountMenuOpen && (
                                        <div className="account-dropdown">
                                            <button type="button" onClick={this.goToBookingHistory}>
                                                <i className="far fa-calendar-check"></i>
                                                <span><FormattedMessage id="homeheader.booking-history" /></span>
                                            </button>
                                            <button type="button" onClick={this.handleLogout}>
                                                <i className="fas fa-sign-out-alt"></i>
                                                <span><FormattedMessage id="homeheader.logout" /></span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div
                                className={language === LANGUAGES.VI ? 'language-vi active' : 'language-vi'}
                                onClick={() => this.changeLanguage(LANGUAGES.VI)}
                            >
                                VN
                            </div>

                            <div
                                className={language === LANGUAGES.EN ? 'language-en active' : 'language-en'}
                                onClick={() => this.changeLanguage(LANGUAGES.EN)}
                            >
                                EN
                            </div>
                        </div>

                    </div>
                </div>

                {this.props.isShowBanner === true &&
                    <div className="home-header-banner">

                        <div className="content-up">
                            <div className="title1">
                                <FormattedMessage id="banner.title1" />
                            </div>
                            <div className="title2">
                                <FormattedMessage id="banner.title2" />
                            </div>

                            <div className="search">
                                <i className="fas fa-search"></i>
                                <input
                                    type="text"
                                    placeholder={this.props.intl ? this.props.intl.formatMessage({ id: 'banner.search' }) : 'Find a medical specialist'}
                                />
                            </div>
                        </div>

                        <div className="content-down">
                            <div className="options">

                                <div className="option-child" onClick={() => this.goToPage(path.SPECIALTY)}>
                                    <div className="icon-child">
                                        <i className="fas fa-stethoscope"></i>
                                    </div>
                                    <div className="text-child">
                                        <FormattedMessage id="banner.child1" />
                                    </div>
                                </div>

                                <div className="option-child" onClick={() => this.goToPage(path.DOCTOR)}>
                                    <div className="icon-child">
                                        <i className="fas fa-user-md"></i>
                                    </div>
                                    <div className="text-child">
                                        <FormattedMessage id="banner.child2" />
                                    </div>
                                </div>

                                <div className="option-child" onClick={() => this.goToPage(path.HANDBOOK)}>
                                    <div className="icon-child">
                                        <i className="fas fa-book-medical"></i>
                                    </div>
                                    <div className="text-child">
                                        <FormattedMessage id="banner.child3" />
                                    </div>
                                </div>

                                <div className="option-child" onClick={() => this.goToPage(path.HANDBOOK)}>
                                    <div className="icon-child">
                                        <i className="fas fa-flask"></i>
                                    </div>
                                    <div className="text-child">
                                        <FormattedMessage id="banner.child4" />
                                    </div>
                                </div>

                                <div className="option-child" onClick={() => this.goToPage(path.CLINIC)}>
                                    <div className="icon-child">
                                        <i className="fas fa-hospital"></i>
                                    </div>
                                    <div className="text-child">
                                        <FormattedMessage id="banner.child5" />
                                    </div>
                                </div>

                                <div className="option-child" onClick={() => this.goToPage(path.CLINIC)}>
                                    <div className="icon-child">
                                        <i className="fas fa-hospital"></i>
                                    </div>
                                    <div className="text-child">
                                        <FormattedMessage id="banner.child6" />
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                }
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    isLoggedIn: state.user.isLoggedIn,
    userInfo: state.user.userInfo,
    language: state.app.language,
});

const mapDispatchToProps = (dispatch) => ({
    changeLanguageAppRedux: (language) => dispatch(changeLanguageApp(language)),
    processLogoutRedux: () => dispatch(processLogout())
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(injectIntl(HomeHeader)));









