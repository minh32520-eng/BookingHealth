import React, { Component } from 'react';
import { connect } from "react-redux";
import './ManageSchedule.scss';
import { FormattedMessage, injectIntl } from 'react-intl';
import * as actions from "../../../store/actions";
import { LANGUAGES, USER_ROLE } from '../../../utils';
import DatePicker from '../../../components/Input/DatePicker';
import moment from 'moment';
import { toast } from 'react-toastify';
import { saveBulkScheduleDoctor, getExtraInforDoctorById, getListPatientForDoctor, getScheduleDoctorByDate, confirmFinishedBooking } from '../../../services/userService';

class ManageSchedule extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currentDate: new Date(),
            rangeTime: [],
            doctorExtraInfo: null,
            patientBookings: [],
            completingBookingId: null
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
            toast.error(this.props.intl.formatMessage({ id: 'doctor.manage-schedule.messages.invalid-doctor' }));
            return;
        }

        if (!currentDate) {
            toast.error(this.props.intl.formatMessage({ id: 'doctor.manage-schedule.messages.invalid-date' }));
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
            toast.success(this.props.intl.formatMessage({ id: 'doctor.manage-schedule.messages.save-success' }));
            await this.loadExistingSchedule(currentDate);
            await this.loadPatientBookings(currentDate);
        } else {
            toast.error(this.props.intl.formatMessage({ id: 'doctor.manage-schedule.messages.save-failed' }));
            console.log("error saveBulkScheduleDoctor >>> res: ", res);
        }
    }

    handleConfirmFinished = async (bookingId) => {
        const doctorId = this.getDoctorId();
        if (!doctorId || !bookingId) return;

        this.setState({ completingBookingId: bookingId });
        try {
            const res = await confirmFinishedBooking({
                doctorId,
                bookingId
            });

            if (res && res.errCode === 0) {
                toast.success(this.props.intl.formatMessage({ id: 'doctor.manage-schedule.messages.complete-success' }));
                await this.loadPatientBookings(this.state.currentDate);
                return;
            }

            toast.error(res?.errMessage || this.props.intl.formatMessage({ id: 'doctor.manage-schedule.messages.complete-failed' }));
        } catch (error) {
            toast.error(this.props.intl.formatMessage({ id: 'doctor.manage-schedule.messages.complete-failed' }));
        } finally {
            this.setState({ completingBookingId: null });
        }
    }

    renderBookingRows = () => {
        const { patientBookings, completingBookingId } = this.state;
        const { language } = this.props;

        if (!patientBookings || patientBookings.length === 0) {
            return (
                <tr>
                    <td colSpan="6" className="empty-booking-row">
                        <FormattedMessage id="doctor.manage-schedule.table.empty" />
                    </td>
                </tr>
            );
        }

        return patientBookings.map((item, index) => {
            const patient = item.patientData || {};
            const fullName = [patient.lastName, patient.firstName].filter(Boolean).join(' ').trim()
                || this.props.intl.formatMessage({ id: 'doctor.manage-schedule.table.patient-fallback' });
            const timeLabel = language === LANGUAGES.VI
                ? item.timeTypeDataPatient?.valueVi
                : item.timeTypeDataPatient?.valueEn;
            const statusLabel = item.statusId === 'S3'
                ? this.props.intl.formatMessage({ id: 'doctor.manage-schedule.status.examined' })
                : item.statusId === 'S2'
                    ? this.props.intl.formatMessage({ id: 'doctor.manage-schedule.status.confirmed' })
                    : this.props.intl.formatMessage({ id: 'doctor.manage-schedule.status.pending' });

            return (
                <tr key={`${item.patientId}-${item.timeType}-${index}`}>
                    <td>{fullName}</td>
                    <td>{patient.email || '--'}</td>
                    <td>{patient.phoneNumber || '--'}</td>
                    <td>{timeLabel || item.timeType}</td>
                    <td>
                        <span className={
                            item.statusId === 'S3'
                                ? 'booking-status examined'
                                : item.statusId === 'S2'
                                    ? 'booking-status confirmed'
                                    : 'booking-status pending'
                        }>
                            {statusLabel}
                        </span>
                    </td>
                    <td>
                        {item.statusId === 'S2' ? (
                            <button
                                type="button"
                                className="btn-finish-booking"
                                onClick={() => this.handleConfirmFinished(item.id)}
                                disabled={completingBookingId === item.id}
                            >
                                {completingBookingId === item.id
                                    ? this.props.intl.formatMessage({ id: 'doctor.manage-schedule.actions.updating' })
                                    : this.props.intl.formatMessage({ id: 'doctor.manage-schedule.actions.complete' })}
                            </button>
                        ) : item.statusId === 'S1' ? (
                            <button
                                type="button"
                                className="btn-finish-booking waiting"
                                disabled
                            >
                                <FormattedMessage id="doctor.manage-schedule.actions.waiting" />
                            </button>
                        ) : item.statusId === 'S3' ? (
                            <span className="booking-action-done">
                                <FormattedMessage id="doctor.manage-schedule.actions.done" />
                            </span>
                        ) : (
                            <span className="booking-action-done">--</span>
                        )}
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
                                <FormattedMessage id="doctor.manage-schedule.subtitle" />
                            </div>
                        </div>
                    </div>

                    <div className="schedule-top-grid">
                        <div className="schedule-info-card doctor-card">
                            <span className="card-label"><FormattedMessage id="doctor.manage-schedule.cards.doctor-label" /></span>
                            <strong>{doctorName || '--'}</strong>
                            <p><FormattedMessage id="doctor.manage-schedule.cards.doctor-note" /></p>
                        </div>
                        <div className="schedule-info-card clinic-card">
                            <span className="card-label"><FormattedMessage id="doctor.manage-schedule.cards.clinic-label" /></span>
                            <strong>{doctorExtraInfo?.nameClinic || '--'}</strong>
                            <p>{doctorExtraInfo?.addressClinic || this.props.intl.formatMessage({ id: 'doctor.manage-schedule.cards.clinic-empty' })}</p>
                        </div>
                        <div className="schedule-info-card date-card">
                            <span className="card-label"><FormattedMessage id="doctor.manage-schedule.cards.date-label" /></span>
                            <strong>{selectedDateLabel}</strong>
                            <p><FormattedMessage id="doctor.manage-schedule.cards.date-note" /></p>
                        </div>
                    </div>

                    <div className="schedule-config-card">
                        <div className="card-head">
                            <h3><FormattedMessage id="doctor.manage-schedule.form.title" /></h3>
                            <p><FormattedMessage id="doctor.manage-schedule.form.subtitle" /></p>
                        </div>

                        <div className="schedule-form-grid">
                            <div className="form-group full-width read-only-field">
                                <label><FormattedMessage id="doctor.manage-schedule.form.doctor" /></label>
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
                                <FormattedMessage id="doctor.manage-schedule.actions.save-schedule" />
                            </button>
                        </div>
                    </div>

                    <div className="booking-table-card">
                        <div className="card-head">
                            <h3><FormattedMessage id="doctor.manage-schedule.table.title" /></h3>
                            <p><FormattedMessage id="doctor.manage-schedule.table.subtitle" /></p>
                        </div>

                        <div className="booking-table-wrap">
                            <table className="doctor-booking-table">
                                <thead>
                                    <tr>
                                        <th><FormattedMessage id="doctor.manage-schedule.table.patient" /></th>
                                        <th><FormattedMessage id="doctor.manage-schedule.table.email" /></th>
                                        <th><FormattedMessage id="doctor.manage-schedule.table.phone" /></th>
                                        <th><FormattedMessage id="doctor.manage-schedule.table.time" /></th>
                                        <th><FormattedMessage id="doctor.manage-schedule.table.status" /></th>
                                        <th><FormattedMessage id="doctor.manage-schedule.table.action" /></th>
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

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(ManageSchedule));
