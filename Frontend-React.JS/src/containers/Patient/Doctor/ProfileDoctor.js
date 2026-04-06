import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import './ProfileDoctor.scss';
import _ from 'lodash';
import moment from 'moment';
import { LANGUAGES } from '../../../utils';
import { getProfileDoctorById } from '../../../services/userService'
import { NumericFormat } from 'react-number-format';

class ProfileDoctor extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataProfile: {}
        }
    }

    async componentDidMount() {
        let data = await this.getInforDoctor(this.props.doctorId);
        this.setState({
            dataProfile: data
        })
    }

    async componentDidUpdate(prevProps) {
        if (this.props.doctorId !== prevProps.doctorId) {
            let data = await this.getInforDoctor(this.props.doctorId);
            this.setState({
                dataProfile: data
            })
        }
    }

    getInforDoctor = async (id) => {
        let result = {};

        if (id) {
            let res = await getProfileDoctorById(id);
            if (res && res.errCode === 0) {
                result = res.data;
            }
        }

        return result;
    }

    renderTimeBooking = (dataTime) => {
        let { language } = this.props;

        if (dataTime && !_.isEmpty(dataTime)) {
            let time = language === LANGUAGES.VI
                ? dataTime.timeTypeData.valueVi
                : dataTime.timeTypeData.valueEn;

            let date = language === LANGUAGES.VI
                ? moment.unix(+dataTime.date / 1000).format('dddd - DD/MM/YYYY')
                : moment.unix(+dataTime.date / 1000).locale('en').format('ddd - MM/DD/YYYY');

            return (
                <>
                    <div>{time} - {date}</div>
                    <div>
                        <FormattedMessage id="patient.booking-modal.priceBooking" />
                    </div>
                </>
            )
        }
        return null;
    }

    render() {
        let { dataProfile } = this.state;
        let { language, isShowDescriptionDoctor, dataTime } = this.props;

        let nameVi = '', nameEn = '';

        if (dataProfile && dataProfile.positionData) {
            nameVi = `${dataProfile.positionData.valueVi}, ${dataProfile.lastName} ${dataProfile.firstName}`;
            nameEn = `${dataProfile.positionData.valueEn}, ${dataProfile.firstName} ${dataProfile.lastName}`;
        }

        const priceData = dataProfile?.Doctor_Infor?.priceTypeData;

        return (
            <div className="profile-doctor-container">

                {/* Intro */}
                <div className="intro-doctor">
                    <div
                        className="content-left"
                        style={{
                            backgroundImage: `url(${dataProfile?.image || ''})`
                        }}
                    />

                    <div className="content-right">
                        <div className="up">
                            {language === LANGUAGES.VI ? nameVi : nameEn}
                        </div>

                        <div className="down">
                            {isShowDescriptionDoctor
                                ? (
                                    dataProfile?.Markdown?.description &&
                                    <span>{dataProfile.Markdown.description}</span>
                                )
                                : this.renderTimeBooking(dataTime)
                            }
                        </div>
                    </div>
                </div>

                {/* Price */}
                <div className="price">
                    <FormattedMessage id="patient.booking-modal.priceBooking" />:

                    {priceData &&
                        <NumericFormat
                            className="currency"
                            value={language === LANGUAGES.VI ? priceData.valueVi : priceData.valueEn}
                            displayType="text"
                            thousandSeparator
                            suffix={language === LANGUAGES.VI ? " VND" : " USD"}
                        />
                    }
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    language: state.app.language
});

export default connect(mapStateToProps)(ProfileDoctor);