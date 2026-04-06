import React, { Component } from 'react';
import { connect } from 'react-redux';
import './HomeHeader.scss';
import { FormattedMessage } from 'react-intl';
import { LANGUAGES, path } from '../../utils';
import { changeLanguageApp } from '../../store/actions';
import { withRouter } from 'react-router';

const logoSvg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="60" viewBox="0 0 160 60">
        <defs>
            <linearGradient id="g" x1="0" x2="1">
                <stop offset="0" stop-color="#49bce2"/>
                <stop offset="1" stop-color="#2a8fbd"/>
            </linearGradient>
        </defs>
        <rect x="0" y="0" width="160" height="60" rx="12" fill="url(#g)"/>
        <text x="80" y="38" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" text-anchor="middle" fill="#fff">HEALTH</text>
    </svg>`
);
const logoUrl = `data:image/svg+xml;charset=utf-8,${logoSvg}`;

class HomeHeader extends Component {

    changeLanguage = (language) => {
        this.props.changeLanguageAppRedux(language);
    }
    returnToHome = () => {
        window.location.href = path.HOMEPAGE;
    }

    goToLogin = () => {
        window.location.href = path.LOGIN;
    }

    goToSection = (sectionId) => {
        // User yêu cầu bấm menu Home thì reload lại trang.
        window.location.href = `${path.HOMEPAGE}#${sectionId}`;
    }
    render() {
        const { language } = this.props;

        return (
            <React.Fragment>
                <div className="home-header-container">
                    <div className="home-header-content">

                        <div className="left-content">
                            <i className="fas fa-bars"></i>
                            <div
                                className="header-logo"
                                style={{ backgroundImage: `url('${logoUrl}')` }}
                                onClick={() => this.returnToHome()}
                            />
                        </div>

                        <div className="center-content">
                            <div className="child-content" onClick={() => this.goToSection('specialty-section')}>
                                <div>
                                    <b>
                                        <FormattedMessage id="homeheader.speciality" />
                                    </b>
                                </div>
                                <div className="subs-title">
                                    <FormattedMessage id="homeheader.searchdoctor" />
                                </div>
                            </div>

                            <div className="child-content" onClick={() => this.goToSection('medical-facility-section')}>
                                <div><b>
                                    <FormattedMessage id="homeheader.health-facility" />
                                </b></div>
                                <div className="subs-title">
                                    <FormattedMessage id="homeheader.select-room" />
                                </div>
                            </div>

                            <div className="child-content" onClick={() => this.goToSection('outstanding-doctor-section')}>
                                <div><b> <FormattedMessage id="homeheader.doctor" /></b></div>
                                <div className="subs-title">
                                    <FormattedMessage id="homeheader.select-doctor" />
                                </div>
                            </div>

                            <div className="child-content" onClick={() => this.goToSection('handbook-section')}>
                                <div><b> <FormattedMessage id="homeheader.fee" /></b></div>
                                <div className="subs-title">
                                    <FormattedMessage id="homeheader.check-health" />
                                </div>
                            </div>

                            <div className="child-content" onClick={this.goToLogin}>
                                <div><b><FormattedMessage id="homeheader.login" /></b></div>
                                <div className="subs-title">Login</div>
                            </div>
                        </div>

                        <div className="right-content">
                            <div className="support">
                                <i className="fas fa-question"></i>
                            </div>

                            {!this.props.isLoggedIn && (
                                <button
                                    type="button"
                                    className="btn-login"
                                    onClick={this.goToLogin}
                                >
                                    <i className="fas fa-sign-in-alt" aria-hidden="true" />
                                    <FormattedMessage id="homeheader.login" />
                                </button>
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
                            <div className="title1"> <FormattedMessage id="banner.title1" /></div>
                            <div className="title2"><FormattedMessage id="banner.title2" /></div>

                            <div className="search">
                                <i className="fas fa-search"></i>
                                <input
                                    type="text"
                                    placeholder="Tìm chuyên gia khám bệnh"
                                // <FormattedMessage id="banner.title1" />
                                />
                            </div>
                        </div>

                        <div className="content-down">
                            <div className="options">
                                <div className="option-child" onClick={() => this.goToSection('specialty-section')}>
                                    <div className="icon-child">
                                        <i className="fas fa-hospital"></i>
                                    </div>
                                    <div className="text-child">
                                        <FormattedMessage id="banner.child1" />
                                    </div>
                                </div>

                                <div className="option-child" onClick={() => this.goToSection('outstanding-doctor-section')}>
                                    <div className="icon-child">
                                        <i className="fas fa-phone"></i>
                                    </div>
                                    <div className="text-child">
                                        <FormattedMessage id="banner.child2" />
                                    </div>
                                </div>

                                <div className="option-child" onClick={() => this.goToSection('handbook-section')}>
                                    <div className="icon-child">
                                        <i className="fas fa-bed"></i>
                                    </div>
                                    <div className="text-child">
                                        <FormattedMessage id="banner.child3" />
                                    </div>
                                </div>

                                <div className="option-child" onClick={() => this.goToSection('handbook-section')}>
                                    <div className="icon-child">
                                        <i className="fas fa-flask"></i>
                                    </div>
                                    <div className="text-child">
                                        <FormattedMessage id="banner.child4" />
                                    </div>
                                </div>

                                <div className="option-child" onClick={() => this.goToSection('about-section')}>
                                    <div className="icon-child">
                                        <i className="fas fa-bed"></i>
                                    </div>
                                    <div className="text-child">
                                        <FormattedMessage id="banner.child5" />
                                    </div>
                                </div>

                                <div className="option-child" onClick={() => this.goToSection('about-section')}>
                                    <div className="icon-child">
                                        <i className="fas fa-bed"></i>
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
    changeLanguageAppRedux: (language) => dispatch(changeLanguageApp(language))
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HomeHeader));