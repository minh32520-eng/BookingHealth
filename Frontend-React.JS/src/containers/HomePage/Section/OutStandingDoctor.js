import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Slider from "react-slick";
import * as actions from '../../../store/actions';
import { LANGUAGES } from '../../../utils/constant';
import { withRouter } from 'react-router';

class OutStandingDoctor extends Component {

    componentDidMount() {
        this.props.loadTopDoctors();
    }

    handleViewDetailDoctor = (doctor) => {
        if (this.props.history) {
            this.props.history.push(`/detail-doctor/${doctor.id}`);
        }
    }

    render() {

        let { topDoctorsRedux, language } = this.props;
        return (
            <div>
                <div className="section-share section-outstanding-doctor">
                    <div className="section-container">

                        <div className="section-header">
                            <span className="title-section">
                                <FormattedMessage id="homepage.outstanding-doctor" />
                            </span>

                            <button className="btn-section">
                                <FormattedMessage id="homepage.more-infor" />
                            </button>
                        </div>

                        <div className="section-body">
                            <Slider {...this.props.settings}>
                                {topDoctorsRedux &&
                                    topDoctorsRedux.length > 0 &&
                                    topDoctorsRedux.map((item) => {

                                        let imageBase64 = '';

                                        if (item.image) {
                                            imageBase64 = `data:image/jpeg;base64,${item.image}`;
                                        }

                                        let nameVi = `${item.positionData?.valueVi || ''}, ${item.lastName} ${item.firstName}`;
                                        let nameEn = `${item.positionData?.valueEn || ''}, ${item.firstName} ${item.lastName}`;

                                        return (
                                            <div
                                                className="section-customize"
                                                key={item.id}
                                                onClick={() => this.handleViewDetailDoctor(item)}
                                            >
                                                <div className="customize-border">

                                                    <div className="outer-bg">
                                                        <div
                                                            className="bg-image section-outstanding"
                                                            style={{
                                                                backgroundImage: `url(${imageBase64})`
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="section-card-content doctor-card-content">
                                                        <div className="section-card-title position text-center">
                                                            {language === LANGUAGES.VI
                                                                ? nameVi
                                                                : nameEn}
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        );
                                    })}
                            </Slider>
                        </div>

                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
        isLoggedIn: state.user.isLoggedIn,
        topDoctorsRedux: state.admin.topDoctors
    };
};

const mapDispatchToProps = dispatch => {
    return {
        loadTopDoctors: () => dispatch(actions.fetchTopDoctor())
    };
};

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(OutStandingDoctor)
);




