import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import moment from 'moment';
import { toast } from 'react-toastify';
import { LANGUAGES, USER_ROLE } from '../../../utils';
import { getDoctorMedicalRecords, saveDoctorMedicalRecord } from '../../../services/userService';
import './DoctorMedicalRecords.scss';

class DoctorMedicalRecords extends Component {
    state = {
        loading: true,
        saving: false,
        error: '',
        pendingAppointments: [],
        historyRecords: [],
        selectedBookingId: '',
        description: ''
    };

    componentDidMount() {
        this.loadData();
    }

    getDoctorId = () => {
        const { userInfo } = this.props;
        if (userInfo && userInfo.roleId === USER_ROLE.DOCTOR) {
            return userInfo.id;
        }
        return null;
    }

    loadData = async () => {
        const doctorId = this.getDoctorId();
        if (!doctorId) {
            this.setState({
                loading: false,
                error: this.props.intl.formatMessage({ id: 'doctor.medical-records.messages.invalid-doctor' })
            });
            return;
        }

        this.setState({ loading: true, error: '' });

        try {
            const res = await getDoctorMedicalRecords(doctorId);
            if (res && res.errCode === 0) {
                const pendingAppointments = res.data?.pendingAppointments || [];
                this.setState({
                    loading: false,
                    pendingAppointments,
                    historyRecords: res.data?.historyRecords || [],
                    selectedBookingId: pendingAppointments[0]?.id ? String(pendingAppointments[0].id) : '',
                    description: pendingAppointments.length ? this.state.description : ''
                });
                return;
            }

            this.setState({
                loading: false,
                error: res?.errMessage || this.props.intl.formatMessage({ id: 'doctor.medical-records.messages.load-error' })
            });
        } catch (error) {
            this.setState({
                loading: false,
                error: this.props.intl.formatMessage({ id: 'doctor.medical-records.messages.load-error' })
            });
        }
    }

    handleChangeBooking = (event) => {
        this.setState({
            selectedBookingId: event.target.value
        });
    }

    handleChangeDescription = (event) => {
        this.setState({
            description: event.target.value
        });
    }

    getSelectedBooking = () => {
        const { pendingAppointments, selectedBookingId } = this.state;
        return pendingAppointments.find(item => String(item.id) === String(selectedBookingId));
    }

    getPatientName = (patient) => {
        if (!patient) return '--';
        if (this.props.language === LANGUAGES.VI) {
            return `${patient.lastName || ''} ${patient.firstName || ''}`.trim() || patient.email || '--';
        }
        return `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || patient.email || '--';
    }

    getTimeLabel = (booking) => {
        const timeType = booking?.timeTypeData;
        if (!timeType) return booking?.timeType || '--';
        return this.props.language === LANGUAGES.VI ? timeType.valueVi : timeType.valueEn;
    }

    formatDate = (date) => {
        if (!date) return '--';
        return moment(Number(date)).format('DD/MM/YYYY');
    }

    handleSaveRecord = async () => {
        const doctorId = this.getDoctorId();
        const selectedBooking = this.getSelectedBooking();
        const description = this.state.description.trim();

        if (!doctorId || !selectedBooking) {
            toast.error(this.props.intl.formatMessage({ id: 'doctor.medical-records.messages.select-booking' }));
            return;
        }

        if (!description) {
            toast.error(this.props.intl.formatMessage({ id: 'doctor.medical-records.messages.missing-description' }));
            return;
        }

        this.setState({ saving: true });
        try {
            const res = await saveDoctorMedicalRecord({
                doctorId,
                patientId: selectedBooking.patientId,
                bookingId: selectedBooking.id,
                description
            });

            if (res && res.errCode === 0) {
                toast.success(this.props.intl.formatMessage({ id: 'doctor.medical-records.messages.save-success' }));
                this.setState({ description: '' });
                await this.loadData();
            } else {
                toast.error(res?.errMessage || this.props.intl.formatMessage({ id: 'doctor.medical-records.messages.save-failed' }));
            }
        } catch (error) {
            toast.error(this.props.intl.formatMessage({ id: 'doctor.medical-records.messages.save-failed' }));
        } finally {
            this.setState({ saving: false });
        }
    }

    renderPendingOptions = () => {
        const { pendingAppointments } = this.state;

        return pendingAppointments.map((item) => {
            const patientName = this.getPatientName(item.patientData);
            return (
                <option key={item.id} value={item.id}>
                    {`${patientName} - ${this.formatDate(item.date)} - ${this.getTimeLabel(item)}`}
                </option>
            );
        });
    }

    renderHistoryRows = () => {
        const { historyRecords } = this.state;

        if (!historyRecords.length) {
            return (
                <tr>
                    <td colSpan="4" className="empty-history-row">
                        <FormattedMessage id="doctor.medical-records.table.empty" />
                    </td>
                </tr>
            );
        }

        return historyRecords.map((item) => (
            <tr key={item.id}>
                <td>{this.getPatientName(item.patientData)}</td>
                <td>{item.patientData?.phoneNumber || '--'}</td>
                <td>{moment(item.createdAt).format('DD/MM/YYYY HH:mm')}</td>
                <td className="record-description">{item.description || '--'}</td>
            </tr>
        ));
    }

    render() {
        const { loading, error, pendingAppointments, selectedBookingId, description, saving } = this.state;
        const selectedBooking = this.getSelectedBooking();

        return (
            <div className="doctor-medical-records-page">
                <div className="doctor-record-shell">
                    <div className="doctor-record-hero">
                        <div>
                            <div className="doctor-record-eyebrow"><FormattedMessage id="doctor.medical-records.eyebrow" /></div>
                            <h1><FormattedMessage id="doctor.medical-records.title" /></h1>
                            <p><FormattedMessage id="doctor.medical-records.subtitle" /></p>
                        </div>
                    </div>

                    {loading && <div className="doctor-record-state"><FormattedMessage id="doctor.medical-records.loading" /></div>}
                    {!loading && error && <div className="doctor-record-state error">{error}</div>}

                    {!loading && !error && (
                        <>
                            <div className="doctor-record-grid">
                                <div className="record-form-card">
                                    <div className="card-head">
                                        <h3><FormattedMessage id="doctor.medical-records.form.title" /></h3>
                                        <p><FormattedMessage id="doctor.medical-records.form.subtitle" /></p>
                                    </div>

                                    <div className="form-group">
                                        <label><FormattedMessage id="doctor.medical-records.form.booking" /></label>
                                        <select value={selectedBookingId} onChange={this.handleChangeBooking} disabled={!pendingAppointments.length}>
                                            <option value="">
                                                {this.props.intl.formatMessage({ id: 'doctor.medical-records.form.choose-booking' })}
                                            </option>
                                            {this.renderPendingOptions()}
                                        </select>
                                        {!pendingAppointments.length && (
                                            <div className="record-empty-note">
                                                <FormattedMessage id="doctor.medical-records.form.no-pending" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="booking-summary-card">
                                        <div>
                                            <span><FormattedMessage id="doctor.medical-records.form.patient" /></span>
                                            <strong>{this.getPatientName(selectedBooking?.patientData)}</strong>
                                        </div>
                                        <div>
                                            <span><FormattedMessage id="doctor.medical-records.form.time" /></span>
                                            <strong>{selectedBooking ? `${this.formatDate(selectedBooking.date)} - ${this.getTimeLabel(selectedBooking)}` : '--'}</strong>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label><FormattedMessage id="doctor.medical-records.form.description" /></label>
                                        <textarea
                                            rows="6"
                                            value={description}
                                            onChange={this.handleChangeDescription}
                                            disabled={!pendingAppointments.length}
                                            placeholder={this.props.intl.formatMessage({ id: 'doctor.medical-records.form.description-placeholder' })}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-primary save-record-btn"
                                        onClick={this.handleSaveRecord}
                                        disabled={saving || !pendingAppointments.length}
                                    >
                                        <FormattedMessage id="doctor.medical-records.form.save" />
                                    </button>
                                </div>

                                <div className="record-summary-card">
                                    <div className="summary-metric">
                                        <span><FormattedMessage id="doctor.medical-records.summary.pending" /></span>
                                        <strong>{pendingAppointments.length}</strong>
                                    </div>
                                    <div className="summary-metric">
                                        <span><FormattedMessage id="doctor.medical-records.summary.examined" /></span>
                                        <strong>{this.state.historyRecords.length}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="record-history-card">
                                <div className="card-head">
                                    <h3><FormattedMessage id="doctor.medical-records.table.title" /></h3>
                                    <p><FormattedMessage id="doctor.medical-records.table.subtitle" /></p>
                                </div>
                                <div className="record-table-wrap">
                                    <table className="doctor-record-table">
                                        <thead>
                                            <tr>
                                                <th><FormattedMessage id="doctor.medical-records.table.patient" /></th>
                                                <th><FormattedMessage id="doctor.medical-records.table.phone" /></th>
                                                <th><FormattedMessage id="doctor.medical-records.table.exam-date" /></th>
                                                <th><FormattedMessage id="doctor.medical-records.table.description" /></th>
                                            </tr>
                                        </thead>
                                        <tbody>{this.renderHistoryRows()}</tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.app.language,
    userInfo: state.user.userInfo
});

export default injectIntl(connect(mapStateToProps)(DoctorMedicalRecords));
