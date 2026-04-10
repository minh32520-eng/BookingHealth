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
            selectedDate: '',
            isOpenModalBooking: false,
            dataScheduleTimeModal: {}
        }
    }

    async componentDidMount() {
        let { language, doctorIdFromParent } = this.props;
        let allDays = this.getArrDays(language);

        this.setState({
            allDays: allDays,
            selectedDate: allDays[0]?.value || '',
        });


        if (doctorIdFromParent && doctorIdFromParent !== -1) {
            await this.fetchSchedule(doctorIdFromParent, allDays[0].value);
        }
    }

    async componentDidUpdate(prevProps) {

        // đổi ngôn ngữ
        if (this.props.language !== prevProps.language) {
            let allDays = this.getArrDays(this.props.language);

            this.setState({
                allDays: allDays,
                selectedDate: allDays[0]?.value || ''
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

        this.setState({
            selectedDate: date
        });

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

    reloadCurrentSchedule = async () => {
        const { doctorIdFromParent } = this.props;
        const { selectedDate } = this.state;

        if (!doctorIdFromParent || doctorIdFromParent === -1 || !selectedDate) {
            return;
        }

        await this.fetchSchedule(doctorIdFromParent, selectedDate);
    }

    parseScheduleStart = (value = '') => {
        const normalized = String(value).trim().toUpperCase();
        const match = normalized.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/);

        if (!match) {
            return null;
        }

        let hours = Number(match[1]);
        const minutes = Number(match[2]);
        const meridiem = match[3];

        if (meridiem === 'AM' && hours === 12) hours = 0;
        if (meridiem === 'PM' && hours < 12) hours += 12;

        return { hours, minutes };
    }

    getScheduleStartTimestamp = (schedule) => {
        const parsed =
            this.parseScheduleStart(schedule?.timeTypeData?.valueEn) ||
            this.parseScheduleStart(schedule?.timeTypeData?.valueVi);

        if (!parsed) {
            return moment(Number(schedule?.date)).valueOf();
        }

        return moment(Number(schedule?.date))
            .startOf('day')
            .hour(parsed.hours)
            .minute(parsed.minutes)
            .second(0)
            .millisecond(0)
            .valueOf();
    }

    render() {

        let { allDays, allAvailableTime, selectedDate } = this.state;
        let { language } = this.props;
        const filteredTimes = (allAvailableTime || []).filter((item) => this.getScheduleStartTimestamp(item) > moment().valueOf());

        return (
            <>
                <div className="doctor-schedule-container">

                    <div className="all-schedule">

                        <select value={selectedDate} onChange={this.handleOnChangeSelect}>
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
                                filteredTimes && filteredTimes.length > 0 ? (
                                    filteredTimes.map((item, index) => {

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
                    reloadSchedule={this.reloadCurrentSchedule}
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
