import React, { Component } from 'react';
import { connect } from "react-redux";
import './ManageSchedule.scss';
import { FormattedMessage } from 'react-intl';
import * as actions from "../../../store/actions";
import { LANGUAGES, USER_ROLE } from '../../../utils';
import DatePicker from '../../../components/Input/DatePicker';
import moment from 'moment';
import { toast } from 'react-toastify';
import { saveBulkScheduleDoctor, getExtraInforDoctorById, getListPatientForDoctor, getScheduleDoctorByDate } from '../../../services/userService';

class ManageSchedule extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currentDate: new Date(),
            rangeTime: [],
            doctorExtraInfo: null,
            patientBookings: []
        }
    }

    async componentDidMount() {
        this.props.fetchAllScheduleTime();
        await this.loadDoctorExtraInfo();
        await this.loadPatientBookings(new Date());
    }

    async componentDidUpdate(prevProps, prevState) {
        if (prevProps.allScheduleTime !== this.props.allScheduleTime) {
            let data = this.props.allScheduleTime;

            if (data && data.length > 0) {
                data = data.map(item => ({
                    ...item,
                    isSelected: false
                }))
            }

            this.setState({
                rangeTime: data || []
            }, () => {
                this.loadExistingSchedule(this.state.currentDate);
            })
        }

        if (prevProps.userInfo?.id !== this.props.userInfo?.id && this.props.userInfo?.roleId === USER_ROLE.DOCTOR) {
            await this.loadDoctorExtraInfo();
            await this.loadExistingSchedule(this.state.currentDate);
            await this.loadPatientBookings(this.state.currentDate);
        }

        if (prevState.currentDate !== this.state.currentDate) {
            await this.loadExistingSchedule(this.state.currentDate);
            await this.loadPatientBookings(this.state.currentDate);
        }
    }

    getDoctorId = () => {
        const { userInfo } = this.props;
        if (userInfo && userInfo.roleId === USER_ROLE.DOCTOR) {
            return userInfo.id;
        }
        return null;
    }

    loadDoctorExtraInfo = async () => {
        const doctorId = this.getDoctorId();
        if (!doctorId) return;

        const res = await getExtraInforDoctorById(doctorId);
        if (res && res.errCode === 0) {
            this.setState({
                doctorExtraInfo: res.data || null
            });
        }
    }

    loadExistingSchedule = async (dateInput) => {
        const doctorId = this.getDoctorId();
        const { rangeTime } = this.state;

        if (!doctorId || !dateInput || !rangeTime || rangeTime.length === 0) {
            return;
        }

        const dateValue = new Date(dateInput).getTime();
        const res = await getScheduleDoctorByDate(doctorId, dateValue);
        const activeTimeTypes = new Set((res?.data || []).map(item => item.timeType));

        this.setState({
            rangeTime: rangeTime.map(item => ({
                ...item,
                isSelected: activeTimeTypes.has(item.keyMap)
            }))
        });
    }

    loadPatientBookings = async (dateInput = this.state.currentDate) => {
        const doctorId = this.getDoctorId();

        if (!doctorId || !dateInput) {
            this.setState({ patientBookings: [] });
            return;
        }

        const dateValue = new Date(dateInput).getTime();
        const res = await getListPatientForDoctor(doctorId, dateValue);
        if (res && res.errCode === 0) {
            this.setState({
                patientBookings: res.data || []
            });
        }
    }

    handleOnchangeDatePicker = (date) => {
        this.setState({
            currentDate: date[0]
        })
    }

    handleClickBtnTime = (time) => {

        let { rangeTime } = this.state;

        if (rangeTime && rangeTime.length > 0) {
            rangeTime = rangeTime.map(item => {

                if (item.id === time.id) {
                    item.isSelected = !item.isSelected;
                }

                return item;
            })

            this.setState({
                rangeTime: rangeTime
            })
        }
    }

    handleSaveSchedule = async () => {

        let { rangeTime, currentDate } = this.state;
        let result = [];
        const doctorId = this.getDoctorId();

        if (!doctorId) {
            toast.error("Doctor account is required!");
            return;
        }

        if (!currentDate) {
            toast.error("Invalid date!");
            return;
        }

        let formatedDate = new Date(currentDate).getTime();

        if (rangeTime && rangeTime.length > 0) {

            let selectedTime = rangeTime.filter(item => item.isSelected === true);

            if (selectedTime && selectedTime.length > 0) {

                selectedTime.forEach(schedule => {

                    let object = {};

                    object.doctorId = doctorId;
                    object.date = formatedDate;
                    object.timeType = schedule.keyMap;

                    result.push(object);
                })
            }
        }

        let res = await saveBulkScheduleDoctor({
            arrSchedule: result,
            doctorId: doctorId,
            formatedDate: formatedDate
        })

        if (res && res.errCode === 0) {
            toast.success("Save Infor succeed!");
            await this.loadExistingSchedule(currentDate);
            await this.loadPatientBookings(currentDate);
        } else {
            toast.error("error saveBulkScheduleDoctor");
            console.log("error saveBulkScheduleDoctor >>> res: ", res);
        }
    }

    renderBookingRows = () => {
        const { patientBookings } = this.state;
        const { language } = this.props;

        if (!patientBookings || patientBookings.length === 0) {
            return (
                <tr>
                    <td colSpan="5" className="empty-booking-row">No patient bookings for this date.</td>
                </tr>
            );
        }

        return patientBookings.map((item, index) => {
            const patient = item.patientData || {};
            const fullName = [patient.lastName, patient.firstName].filter(Boolean).join(' ').trim() || 'Patient';
            const timeLabel = language === LANGUAGES.VI
                ? item.timeTypeDataPatient?.valueVi
                : item.timeTypeDataPatient?.valueEn;
            const statusLabel = item.statusId === 'S2' ? 'Confirmed' : 'Pending';

            return (
                <tr key={`${item.patientId}-${item.timeType}-${index}`}>
                    <td>{fullName}</td>
                    <td>{patient.email || '--'}</td>
                    <td>{patient.phoneNumber || '--'}</td>
                    <td>{timeLabel || item.timeType}</td>
                    <td>
                        <span className={item.statusId === 'S2' ? 'booking-status confirmed' : 'booking-status pending'}>
                            {statusLabel}
                        </span>
                    </td>
                </tr>
            );
        });
    }

    render() {

        let { rangeTime, doctorExtraInfo, currentDate } = this.state;
        let { language, userInfo } = this.props;
        let yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
        const doctorName = [userInfo?.lastName, userInfo?.firstName].filter(Boolean).join(' ').trim();
        const selectedDateLabel = currentDate ? moment(currentDate).format('DD/MM/YYYY') : '--';

        return (
            <div className="manage-schedule-container">

                <div className="schedule-page-shell">
                    <div className="schedule-page-hero">
                        <div>
                            <div className="schedule-eyebrow">Doctor workspace</div>
                            <div className="m-s-title">
                                <FormattedMessage id="manage-schedule.title" />
                            </div>
                            <div className="schedule-subtitle">
                                Review your clinic information, open your available hours, and see which patients booked you on each day.
                            </div>
                        </div>
                    </div>

                    <div className="schedule-top-grid">
                        <div className="schedule-info-card doctor-card">
                            <span className="card-label">Doctor account</span>
                            <strong>{doctorName || '--'}</strong>
                            <p>Only this doctor account can create and review its own schedule.</p>
                        </div>
                        <div className="schedule-info-card clinic-card">
                            <span className="card-label">Clinic</span>
                            <strong>{doctorExtraInfo?.nameClinic || '--'}</strong>
                            <p>{doctorExtraInfo?.addressClinic || 'Clinic address is not updated yet.'}</p>
                        </div>
                        <div className="schedule-info-card date-card">
                            <span className="card-label">Selected date</span>
                            <strong>{selectedDateLabel}</strong>
                            <p>Bookings below will refresh after you pick a date.</p>
                        </div>
                    </div>

                    <div className="schedule-config-card">
                        <div className="card-head">
                            <h3>Open clinic schedule</h3>
                            <p>Choose the date and time slots you want patients to book at your clinic.</p>
                        </div>

                        <div className="schedule-form-grid">
                            <div className="form-group full-width read-only-field">
                                <label>Doctor</label>
                                <div className="static-field">{doctorName || '--'}</div>
                            </div>

                            <div className="form-group full-width">
                                <label>
                                    <FormattedMessage id="manage-schedule.choose-date" />
                                </label>

                                <DatePicker
                                    onChange={this.handleOnchangeDatePicker}
                                    className="form-control"
                                    value={this.state.currentDate}
                                    minDate={yesterday}
                                />
                            </div>
                        </div>

                        <div className="pick-hour-container">
                            {rangeTime && rangeTime.length > 0 &&
                                rangeTime.map((item, index) => {

                                    return (
                                        <button
                                            key={index}
                                            className={item.isSelected
                                                ? "btn btn-schedule active"
                                                : "btn btn-schedule"}
                                            onClick={() => this.handleClickBtnTime(item)}
                                        >
                                            {language === LANGUAGES.VI ? item.valueVi : item.valueEn}
                                        </button>
                                    )
                                })
                            }
                        </div>

                        <div className="save-actions-row">
                            <button
                                className="btn btn-primary btn-save-schedule"
                                onClick={this.handleSaveSchedule}
                            >
                                Save schedule
                            </button>
                        </div>
                    </div>

                    <div className="booking-table-card">
                        <div className="card-head">
                            <h3>Patients booked with you</h3>
                            <p>Appointments shown here belong only to the current doctor account on the selected date.</p>
                        </div>

                        <div className="booking-table-wrap">
                            <table className="doctor-booking-table">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Time</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.renderBookingRows()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        userInfo: state.user.userInfo,
        language: state.app.language,
        allScheduleTime: state.admin.allScheduleTime,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchAllScheduleTime: () => dispatch(actions.fetchAllScheduleTime()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageSchedule);
