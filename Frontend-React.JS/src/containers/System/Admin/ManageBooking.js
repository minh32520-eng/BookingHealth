import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { getAdminBookings } from '../../../services/userService';
import { BookingUtils, LANGUAGES } from '../../../utils';
import './ManageBooking.scss';

const STATUS_OPTIONS = [
    { value: '', labelId: 'admin.manage-booking.filters.all' },
    { value: 'unpaid', labelId: 'admin.manage-booking.filters.unpaid' },
    { value: 'paid', labelId: 'admin.manage-booking.filters.paid' },
    { value: 'examined', labelId: 'admin.manage-booking.filters.examined' }
];

class ManageBooking extends Component {
    state = {
        loading: true,
        error: '',
        selectedStatus: '',
        bookings: []
    };

    componentDidMount() {
        // Load the first booking snapshot as soon as the admin screen opens.
        this.loadBookings();
    }

    loadBookings = async () => {
        this.setState({ loading: true, error: '' });
        try {
            // Send the current UI filter to the backend so the server can return only the relevant rows.
            const res = await getAdminBookings(this.state.selectedStatus);
            if (res && res.errCode === 0) {
                this.setState({
                    loading: false,
                    bookings: res.data || []
                });
                return;
            }
            this.setState({
                loading: false,
                error: res?.errMessage || this.props.intl.formatMessage({ id: 'admin.manage-booking.messages.load-error' })
            });
        } catch (error) {
            this.setState({
                loading: false,
                error: this.props.intl.formatMessage({ id: 'admin.manage-booking.messages.load-error' })
            });
        }
    };

    handleFilterChange = (event) => {
        // Reuse one small handler because the filter always follows "update state then reload data".
        this.setState({ selectedStatus: event.target.value }, this.loadBookings);
    };

    getBookingStatusLabel = (statusId) => {
        return BookingUtils.getBookingStatusLabel(statusId, this.props.intl);
    };

    getPaymentStatusLabel = (paymentStatus) => {
        return BookingUtils.getPaymentStatusLabel(paymentStatus, { intl: this.props.intl });
    };

    getDoctorName = (booking) => {
        return BookingUtils.getUserDisplayName(booking?.doctorData, LANGUAGES.VI);
    };

    getPatientName = (booking) => {
        return BookingUtils.getUserDisplayName(booking?.patientData, LANGUAGES.VI);
    };

    formatDate = (date) => {
        return BookingUtils.formatDate(date);
    };

    getTimeLabel = (booking) => {
        return BookingUtils.getTimeLabel(
            booking?.timeTypeData,
            this.props.language === 'vi' ? LANGUAGES.VI : LANGUAGES.EN
        );
    };

    formatAmount = (amount) => {
        return BookingUtils.formatCurrency(
            amount,
            this.props.language === 'vi' ? LANGUAGES.VI : LANGUAGES.EN
        );
    };

    render() {
        const { loading, error, bookings, selectedStatus } = this.state;

        return (
            <div className="manage-booking-page">
                <div className="booking-page-shell">
                    <div className="booking-page-hero">
                        <div>
                            <div className="booking-page-eyebrow"><FormattedMessage id="admin.manage-booking.eyebrow" /></div>
                            <h1><FormattedMessage id="admin.manage-booking.title" /></h1>
                            <p><FormattedMessage id="admin.manage-booking.subtitle" /></p>
                        </div>
                        <div className="booking-filter">
                            <label><FormattedMessage id="admin.manage-booking.filter-label" /></label>
                            <select value={selectedStatus} onChange={this.handleFilterChange}>
                                {STATUS_OPTIONS.map((item) => (
                                    <option key={item.value || 'all'} value={item.value}>
                                        {this.props.intl.formatMessage({ id: item.labelId })}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loading && <div className="booking-state"><FormattedMessage id="admin.manage-booking.loading" /></div>}
                    {!loading && error && <div className="booking-state error">{error}</div>}

                    {!loading && !error && (
                        <div className="booking-table-card">
                            <div className="booking-table-head">
                                <h3><FormattedMessage id="admin.manage-booking.list-title" /></h3>
                                <p>{bookings.length} <FormattedMessage id="admin.manage-booking.total-suffix" /></p>
                            </div>
                            <div className="booking-table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th><FormattedMessage id="admin.manage-booking.table.id" /></th>
                                            <th><FormattedMessage id="admin.manage-booking.table.patient" /></th>
                                            <th><FormattedMessage id="admin.manage-booking.table.doctor" /></th>
                                            <th><FormattedMessage id="admin.manage-booking.table.date" /></th>
                                            <th><FormattedMessage id="admin.manage-booking.table.time" /></th>
                                            <th><FormattedMessage id="admin.manage-booking.table.status" /></th>
                                            <th><FormattedMessage id="admin.manage-booking.table.payment-status" /></th>
                                            <th><FormattedMessage id="admin.manage-booking.table.amount" /></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map((item) => (
                                            <tr key={item.id}>
                                                {/* Each row merges booking data with patient, doctor and time labels that were resolved in the backend. */}
                                                <td>{item.id}</td>
                                                <td>
                                                    <div className="name-cell">{this.getPatientName(item)}</div>
                                                    <div className="sub-cell">{item.patientData?.email || '--'}</div>
                                                </td>
                                                <td>{this.getDoctorName(item)}</td>
                                                <td>{this.formatDate(item.date)}</td>
                                                <td>{this.getTimeLabel(item)}</td>
                                                <td>
                                                    <span className={`status-badge status-${String(item.statusId || '').toLowerCase()}`}>
                                                        {this.getBookingStatusLabel(item.statusId)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge payment-${String(item.paymentStatus || 'pending').toLowerCase()}`}>
                                                        {this.getPaymentStatusLabel(item.paymentStatus)}
                                                    </span>
                                                </td>
                                                <td>{this.formatAmount(item.paymentAmount)}</td>
                                            </tr>
                                        ))}
                                        {bookings.length === 0 && (
                                            <tr>
                                                <td colSpan="8" className="empty-bookings"><FormattedMessage id="admin.manage-booking.table.empty" /></td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.app.language
});

export default injectIntl(connect(mapStateToProps)(ManageBooking));
