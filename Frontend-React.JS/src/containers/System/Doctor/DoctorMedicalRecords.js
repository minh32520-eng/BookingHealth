import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import moment from 'moment';
import { toast } from 'react-toastify';
import { BookingUtils, CommonUtils, USER_ROLE } from '../../../utils';
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
        description: '',
        prescriptionFile: '',
        prescriptionFileName: '',
        prescriptionFileType: ''
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
                    description: pendingAppointments.length ? this.state.description : '',
                    prescriptionFile: pendingAppointments.length ? this.state.prescriptionFile : '',
                    prescriptionFileName: pendingAppointments.length ? this.state.prescriptionFileName : '',
                    prescriptionFileType: pendingAppointments.length ? this.state.prescriptionFileType : ''
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
            selectedBookingId: event.target.value,
            prescriptionFile: '',
            prescriptionFileName: '',
            prescriptionFileType: ''
        });
    }

    handleChangeDescription = (event) => {
        this.setState({
            description: event.target.value
        });
    }

    handleChangePrescriptionFile = async (event) => {
        const file = event.target.files && event.target.files[0];

        if (!file) {
            this.setState({
                prescriptionFile: '',
                prescriptionFileName: '',
                prescriptionFileType: ''
            });
            return;
        }

        const base64 = await CommonUtils.getBase64(file);
        this.setState({
            prescriptionFile: base64,
            prescriptionFileName: file.name,
            prescriptionFileType: file.type || 'application/octet-stream'
        });
    }

    getSelectedBooking = () => {
        const { pendingAppointments, selectedBookingId } = this.state;
        return pendingAppointments.find(item => String(item.id) === String(selectedBookingId));
    }

    getPatientName = (patient) => {
        return BookingUtils.getUserDisplayName(patient, this.props.language);
    }

    getTimeLabel = (booking) => {
        return BookingUtils.getTimeLabel(booking?.timeTypeData, this.props.language, booking?.timeType || '--');
    }

    formatDate = (date) => {
        return BookingUtils.formatDate(date);
    }

    handleSaveRecord = async () => {
        const doctorId = this.getDoctorId();
        const selectedBooking = this.getSelectedBooking();
        const {
            description,
            prescriptionFile,
            prescriptionFileName,
            prescriptionFileType
        } = this.state;
        const trimmedDescription = description.trim();

        if (!doctorId || !selectedBooking) {
            toast.error(this.props.intl.formatMessage({ id: 'doctor.medical-records.messages.select-booking' }));
            return;
        }

        if (!trimmedDescription) {
            toast.error(this.props.intl.formatMessage({ id: 'doctor.medical-records.messages.missing-description' }));
            return;
        }

        if (!prescriptionFile || !prescriptionFileName) {
            toast.error(this.props.intl.formatMessage({ id: 'doctor.medical-records.messages.missing-prescription-file' }));
            return;
        }

        this.setState({ saving: true });
        try {
            const res = await saveDoctorMedicalRecord({
                doctorId,
                patientId: selectedBooking.patientId,
                bookingId: selectedBooking.id,
                description: trimmedDescription,
                file: prescriptionFile,
                fileName: prescriptionFileName,
                fileType: prescriptionFileType,
                language: this.props.language
            });

            if (res && res.errCode === 0) {
                toast.success(this.props.intl.formatMessage({ id: 'doctor.medical-records.messages.save-success' }));
                if (res.warningMessage) {
                    toast.warn(this.props.intl.formatMessage({ id: 'doctor.medical-records.messages.email-warning' }));
                }
                this.setState({
                    description: '',
                    prescriptionFile: '',
                    prescriptionFileName: '',
                    prescriptionFileType: ''
                });
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
                <td>{BookingUtils.formatDateTime(item.createdAt)}</td>
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

                                    <div className="form-group">
                                        <label><FormattedMessage id="doctor.medical-records.form.prescription-file" /></label>
                                        <label className={`prescription-upload ${!pendingAppointments.length ? 'disabled' : ''}`}>
                                            <input
                                                key={`${selectedBookingId}-${this.state.prescriptionFileName || 'empty'}`}
                                                type="file"
                                                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                                                onChange={this.handleChangePrescriptionFile}
                                                disabled={!pendingAppointments.length}
                                            />
                                            <span>
                                                {this.state.prescriptionFileName
                                                    || this.props.intl.formatMessage({ id: 'doctor.medical-records.form.choose-prescription-file' })}
                                            </span>
                                        </label>
                                        <div className="record-empty-note">
                                            <FormattedMessage id="doctor.medical-records.form.prescription-file-note" />
                                        </div>
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
