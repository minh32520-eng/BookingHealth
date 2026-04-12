import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import moment from 'moment';
import { BookingUtils, LANGUAGES, USER_ROLE } from '../../../utils';
import { getListPatientForDoctor } from '../../../services/userService';
import './DoctorDashboard.scss';

class DoctorDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            bookings: []
        };
    }

    componentDidMount() {
        this.loadDashboardData();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.userInfo?.id !== this.props.userInfo?.id || prevProps.language !== this.props.language) {
            this.loadDashboardData();
        }
    }

    getDoctorId = () => {
        const { userInfo } = this.props;
        if (userInfo && userInfo.roleId === USER_ROLE.DOCTOR) {
            return userInfo.id;
        }
        return null;
    };

    loadDashboardData = async () => {
        const doctorId = this.getDoctorId();
        if (!doctorId) {
            this.setState({ loading: false, bookings: [] });
            return;
        }

        this.setState({ loading: true });
        const today = moment().startOf('day').valueOf();
        try {
            const res = await getListPatientForDoctor(doctorId, today);
            this.setState({
                bookings: res?.errCode === 0 ? (res.data || []) : [],
                loading: false
            });
        } catch (error) {
            this.setState({ loading: false, bookings: [] });
        }
    };

    getTimeLabel = (booking) => {
        return BookingUtils.getTimeLabel(booking?.timeTypeDataPatient, this.props.language, booking?.timeType || '--');
    };

    renderBookingRows = () => {
        const { bookings } = this.state;
        if (!bookings.length) {
            return (
                <div className="doctor-dashboard-empty">
                    <FormattedMessage id="doctor.dashboard.empty" />
                </div>
            );
        }

        return bookings
            .slice()
            .sort((a, b) => String(a.timeType).localeCompare(String(b.timeType)))
            .map((booking) => {
                const patient = booking.patientData || {};
                const fullName = BookingUtils.getUserDisplayName(
                    patient,
                    this.props.language,
                    this.props.intl.formatMessage({ id: 'doctor.dashboard.patient-fallback' })
                );

                return (
                    <div className="doctor-dashboard-booking-item" key={booking.id}>
                        <div className="booking-time-chip">{this.getTimeLabel(booking)}</div>
                        <div className="booking-copy">
                            <strong>{fullName}</strong>
                            <span>{patient.phoneNumber || patient.email || '--'}</span>
                        </div>
                    </div>
                );
            });
    };

    render() {
        const { userInfo } = this.props;
        const { bookings, loading } = this.state;
        const confirmedBookings = bookings.filter((item) => item.statusId === 'S2').length;
        const examinedBookings = bookings.filter((item) => item.statusId === 'S3').length;
        const pendingBookings = bookings.filter((item) => item.statusId === 'S1').length;
        const doctorName = [userInfo?.lastName, userInfo?.firstName].filter(Boolean).join(' ').trim();

        return (
            <div className="doctor-dashboard-container">
                <div className="doctor-dashboard-hero">
                    <div>
                        <div className="dashboard-eyebrow">
                            <FormattedMessage id="doctor.dashboard.eyebrow" />
                        </div>
                        <h1>
                            <FormattedMessage id="doctor.dashboard.title" />
                        </h1>
                        <p>
                            <FormattedMessage id="doctor.dashboard.subtitle" />
                        </p>
                    </div>
                    <div className="doctor-dashboard-meta">
                        <span><FormattedMessage id="doctor.dashboard.today" /></span>
                        <strong>{moment().format('DD/MM/YYYY')}</strong>
                        <small>{doctorName || '--'}</small>
                    </div>
                </div>

                <div className="doctor-dashboard-stats">
                    <div className="doctor-stat-card total">
                        <span><FormattedMessage id="doctor.dashboard.stats.total" /></span>
                        <strong>{bookings.length}</strong>
                    </div>
                    <div className="doctor-stat-card pending">
                        <span><FormattedMessage id="doctor.dashboard.stats.pending" /></span>
                        <strong>{pendingBookings}</strong>
                    </div>
                    <div className="doctor-stat-card confirmed">
                        <span><FormattedMessage id="doctor.dashboard.stats.confirmed" /></span>
                        <strong>{confirmedBookings}</strong>
                    </div>
                    <div className="doctor-stat-card examined">
                        <span><FormattedMessage id="doctor.dashboard.stats.examined" /></span>
                        <strong>{examinedBookings}</strong>
                    </div>
                </div>

                <div className="doctor-dashboard-panel">
                    <div className="panel-head">
                        <div>
                            <h3><FormattedMessage id="doctor.dashboard.schedule-title" /></h3>
                            <p><FormattedMessage id="doctor.dashboard.schedule-subtitle" /></p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="doctor-dashboard-empty">
                            <FormattedMessage id="doctor.dashboard.loading" />
                        </div>
                    ) : (
                        <div className="doctor-dashboard-bookings">
                            {this.renderBookingRows()}
                        </div>
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

export default injectIntl(connect(mapStateToProps)(DoctorDashboard));
