import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { getAdminPayments } from '../../../services/userService';
import { BookingUtils, LANGUAGES } from '../../../utils';
import './ManagePayment.scss';

const PAYMENT_STATUS_OPTIONS = [
    { value: '', labelId: 'admin.manage-payment.filters.all' },
    { value: 'pending', labelId: 'admin.manage-payment.filters.pending' },
    { value: 'paid', labelId: 'admin.manage-payment.filters.paid' },
    { value: 'failed', labelId: 'admin.manage-payment.filters.failed' }
];

class ManagePayment extends Component {
    state = {
        loading: true,
        error: '',
        selectedStatus: '',
        payments: []
    };

    componentDidMount() {
        // Load the first payment snapshot immediately when the admin opens the screen.
        this.loadPayments();
    }

    loadPayments = async () => {
        this.setState({ loading: true, error: '' });
        try {
            // Ask the backend for one filtered payment snapshot instead of filtering after download.
            const res = await getAdminPayments(this.state.selectedStatus);
            if (res && res.errCode === 0) {
                this.setState({
                    loading: false,
                    payments: res.data || []
                });
                return;
            }

            this.setState({
                loading: false,
                error: res?.errMessage || this.props.intl.formatMessage({ id: 'admin.manage-payment.messages.load-error' })
            });
        } catch (error) {
            this.setState({
                loading: false,
                error: this.props.intl.formatMessage({ id: 'admin.manage-payment.messages.load-error' })
            });
        }
    };

    handleFilterChange = (event) => {
        // The payment list reloads every time the status filter changes.
        this.setState({ selectedStatus: event.target.value }, this.loadPayments);
    };

    getDoctorName = (payment) => {
        return BookingUtils.getUserDisplayName(payment?.doctorData, LANGUAGES.VI);
    };

    getPatientName = (payment) => {
        return BookingUtils.getUserDisplayName(payment?.patientData, LANGUAGES.VI);
    };

    getPaymentStatusLabel = (status) => {
        return BookingUtils.getPaymentStatusLabel(status, {
            intl: this.props.intl,
            pendingId: 'admin.manage-payment.filters.pending',
            paidId: 'admin.manage-payment.filters.paid',
            failedId: 'admin.manage-payment.filters.failed'
        });
    };

    formatAmount = (amount) => {
        return BookingUtils.formatCurrency(
            amount,
            this.props.language === 'vi' ? LANGUAGES.VI : LANGUAGES.EN
        );
    };

    formatDate = (date) => {
        return BookingUtils.formatDate(date);
    };

    getTimeLabel = (payment) => {
        return BookingUtils.getTimeLabel(
            payment?.timeTypeData,
            this.props.language === 'vi' ? LANGUAGES.VI : LANGUAGES.EN
        );
    };

    render() {
        const { loading, error, payments, selectedStatus } = this.state;

        return (
            <div className="manage-payment-page">
                <div className="payment-page-shell">
                    <div className="payment-page-hero">
                        <div>
                            <div className="payment-page-eyebrow"><FormattedMessage id="admin.manage-payment.eyebrow" /></div>
                            <h1><FormattedMessage id="admin.manage-payment.title" /></h1>
                            <p><FormattedMessage id="admin.manage-payment.subtitle" /></p>
                        </div>
                        <div className="payment-filter">
                            <label><FormattedMessage id="admin.manage-payment.filter-label" /></label>
                            <select value={selectedStatus} onChange={this.handleFilterChange}>
                                {PAYMENT_STATUS_OPTIONS.map((item) => (
                                    <option key={item.value || 'all'} value={item.value}>
                                        {this.props.intl.formatMessage({ id: item.labelId })}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loading && <div className="payment-state"><FormattedMessage id="admin.manage-payment.loading" /></div>}
                    {!loading && error && <div className="payment-state error">{error}</div>}

                    {!loading && !error && (
                        <div className="payment-grid">
                            <div className="payment-table-card">
                                <div className="payment-table-head">
                                    <h3><FormattedMessage id="admin.manage-payment.list-title" /></h3>
                                    <p>{payments.length} <FormattedMessage id="admin.manage-payment.total-suffix" /></p>
                                </div>
                                <div className="payment-table-wrap">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th><FormattedMessage id="admin.manage-payment.table.booking" /></th>
                                                <th><FormattedMessage id="admin.manage-payment.table.patient" /></th>
                                                <th><FormattedMessage id="admin.manage-payment.table.doctor" /></th>
                                                <th><FormattedMessage id="admin.manage-payment.table.schedule" /></th>
                                                <th><FormattedMessage id="admin.manage-payment.table.amount" /></th>
                                                <th><FormattedMessage id="admin.manage-payment.table.status" /></th>
                                                <th><FormattedMessage id="admin.manage-payment.table.reference" /></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.map((item) => (
                                                <tr key={item.id}>
                                                    <td>#{item.id}</td>
                                                    <td>
                                                        <div className="name-cell">{this.getPatientName(item)}</div>
                                                        <div className="sub-cell">{item.patientData?.email || '--'}</div>
                                                    </td>
                                                    <td>{this.getDoctorName(item)}</td>
                                                    <td>
                                                        <div className="name-cell">{this.formatDate(item.date)}</div>
                                                        <div className="sub-cell">{this.getTimeLabel(item)}</div>
                                                    </td>
                                                    <td>{this.formatAmount(item.paymentAmount)}</td>
                                                    <td>
                                                        <span className={`status-badge status-${String(item.paymentStatus || '').toLowerCase()}`}>
                                                            {this.getPaymentStatusLabel(item.paymentStatus)}
                                                        </span>
                                                    </td>
                                                    <td>{item.paymentRef || item.transferText || '--'}</td>
                                                </tr>
                                            ))}
                                            {payments.length === 0 && (
                                                <tr>
                                                    <td colSpan="7" className="empty-payments"><FormattedMessage id="admin.manage-payment.table.empty" /></td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="payment-side">
                                {payments.slice(0, 6).map((item) => (
                                    // Show a short QR preview list so admins can quickly inspect recent payment instructions.
                                    <div className="payment-qr-card" key={`qr-${item.id}`}>
                                        <div className="payment-qr-header">
                                            <div>
                                                <div className="payment-qr-booking">#{item.id}</div>
                                                <div className="payment-qr-patient">{this.getPatientName(item)}</div>
                                            </div>
                                            <span className={`status-badge status-${String(item.paymentStatus || '').toLowerCase()}`}>
                                                {this.getPaymentStatusLabel(item.paymentStatus)}
                                            </span>
                                        </div>
                                        <div className="payment-qr-meta">
                                            <span>{this.formatAmount(item.paymentAmount)}</span>
                                            <span>{this.formatDate(item.date)} · {this.getTimeLabel(item)}</span>
                                        </div>
                                        <div className="payment-qr-note">{item.transferText || '--'}</div>
                                        {item.qrUrl ? (
                                            <a href={item.qrUrl} target="_blank" rel="noreferrer" className="payment-qr-preview">
                                                <img src={item.qrUrl} alt={`QR booking ${item.id}`} />
                                            </a>
                                        ) : (
                                            <div className="payment-qr-empty">
                                                <FormattedMessage id="admin.manage-payment.qr-empty" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {payments.length === 0 && (
                                    <div className="payment-qr-empty standalone">
                                        <FormattedMessage id="admin.manage-payment.table.empty" />
                                    </div>
                                )}
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

export default injectIntl(connect(mapStateToProps)(ManagePayment));
