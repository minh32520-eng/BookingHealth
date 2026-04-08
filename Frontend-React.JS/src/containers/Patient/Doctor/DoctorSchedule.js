import React, { Component } from 'react';
import { connect } from 'react-redux';
import './DoctorSchedule.scss';
import moment from 'moment';
import 'moment/locale/vi';
import { LANGUAGES } from '../../../utils';
import { getScheduleDoctorByDate } from '../../../services/userService';
import { FormattedMessage } from 'react-intl';
import BookingModal from './Modal/BookingModal';

class DoctorSchedule extends Component {

    constructor(props) {
        super(props);
        this.state = {
            allDays: [],
            allAvailableTime: [],
            isOpenModalBooking: false,
            dataScheduleTimeModal: {}
        }
    }

    async componentDidMount() {
        let { language, doctorIdFromParent } = this.props;
        let allDays = this.getArrDays(language);

        this.setState({
            allDays: allDays,
        });

        // 🔥 CALL API NGAY KHI LOAD
        if (doctorIdFromParent && doctorIdFromParent !== -1) {
            await this.fetchSchedule(doctorIdFromParent, allDays[0].value);
        }
    }

    async componentDidUpdate(prevProps) {

        // đổi ngôn ngữ
        if (this.props.language !== prevProps.language) {
            let allDays = this.getArrDays(this.props.language);

            this.setState({
                allDays: allDays
            });
        }

        // đổi doctor
        if (this.props.doctorIdFromParent !== prevProps.doctorIdFromParent) {
            let allDays = this.getArrDays(this.props.language);

            if (this.props.doctorIdFromParent && this.props.doctorIdFromParent !== -1) {
                await this.fetchSchedule(this.props.doctorIdFromParent, allDays[0].value);
            }
        }
    }

    // 🔥 tách riêng API cho gọn
    fetchSchedule = async (doctorId, date) => {
        try {
            let res = await getScheduleDoctorByDate(doctorId, date);

            console.log("API schedule:", res);
            console.log("DATE gửi lên:", date);

            if (res && res.errCode === 0) {

                // 🔥 remove duplicate nếu có
                let unique = Array.from(
                    new Map((res.data || []).map(item => [item.id, item])).values()
                );

                this.setState({
                    allAvailableTime: unique
                });
            }
        } catch (e) {
            console.error("Error fetch schedule:", e);
        }
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    getArrDays = (language) => {
        let allDays = [];

        for (let i = 0; i < 7; i++) {
            let object = {};

            if (language === LANGUAGES.VI) {

                if (i === 0) {
                    let ddMM = moment().format('DD/MM');
                    object.label = `Hôm nay - ${ddMM}`;
                } else {
                    let labelVi = moment()
                        .add(i, 'days')
                        .format('dddd - DD/MM');

                    object.label = this.capitalizeFirstLetter(labelVi);
                }

            } else {

                if (i === 0) {
                    let ddMM = moment().format('DD/MM');
                    object.label = `Today - ${ddMM}`;
                } else {
                    object.label = moment()
                        .add(i, 'days')
                        .locale('en')
                        .format('ddd - DD/MM');
                }
            }

            // 🔥 FIX DATE (quan trọng)
            object.value = moment()
                .add(i, 'days')
                .startOf('day')
                .valueOf();

            allDays.push(object);
        }

        return allDays;
    }

    handleOnChangeSelect = async (event) => {

        let { doctorIdFromParent } = this.props;
        let date = event.target.value;

        if (doctorIdFromParent && doctorIdFromParent !== -1) {
            await this.fetchSchedule(doctorIdFromParent, date);
        }
    }

    handleClickScheduleTime = (time) => {

        this.setState({
            isOpenModalBooking: true,
            dataScheduleTimeModal: time
        });

    }

    closeBookingClose = () => {

        this.setState({
            isOpenModalBooking: false
        });

    }

    render() {

        let { allDays, allAvailableTime } = this.state;
        let { language } = this.props;

        return (
            <>
                <div className="doctor-schedule-container">

                    <div className="all-schedule">

                        <select onChange={this.handleOnChangeSelect}>
                            {allDays && allDays.length > 0 &&
                                allDays.map((item, index) => (
                                    <option value={item.value} key={index}>
                                        {item.label}
                                    </option>
                                ))
                            }
                        </select>

                    </div>

                    <div className='all-avaiable-time'>

                        <div className="text-calendar">
                            <i className="fas fa-calendar-alt">
                                <span>
                                    <FormattedMessage id="patient.detail-doctor.schedule" />
                                </span>
                            </i>
                        </div>

                        <div className="time-content-btns">

                            {
                                allAvailableTime && allAvailableTime.length > 0 ? (
                                    allAvailableTime.map((item, index) => {

                                        let timeDisplay = language === LANGUAGES.VI
                                            ? item.timeTypeData.valueVi
                                            : item.timeTypeData.valueEn;

                                        return (
                                            <button
                                                key={index}
                                                className={language === LANGUAGES.VI ? 'btn-vie' : 'btn-eng'}
                                                onClick={() => this.handleClickScheduleTime(item)}
                                            >
                                                {timeDisplay}
                                            </button>
                                        )
                                    })
                                ) : (
                                    <div className="no-schedule">
                                        <FormattedMessage id="patient.detail-doctor.no-schedule" />
                                    </div>
                                )
                            }

                            <div className="book-free">
                                <span>
                                    <FormattedMessage id="patient.detail-doctor.choose" />
                                    <i className="far fa-hand-point-up"></i>
                                    <FormattedMessage id="patient.detail-doctor.book-free" />
                                </span>
                            </div>

                        </div>

                    </div>

                </div>

                <BookingModal
                    isOpenModal={this.state.isOpenModalBooking}
                    closeBookingClose={this.closeBookingClose}
                    dataTime={this.state.dataScheduleTimeModal}
                />
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language
    };
};

export default connect(mapStateToProps)(DoctorSchedule);