import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { toast } from 'react-toastify';
import HomeHeader from '../../HomePage/HomeHeader';
import { BookingUtils, path } from '../../../utils';
import { createVnpayPayment, getBookingHistoryByPatient } from '../../../services/userService';
import './BookingHistory.scss';

class BookingHistory extends Component {
    state = {
        bookings: [],
        loading: true,
        error: '',
        paymentLoadingId: null
    };

    async componentDidMount() {
        const { isLoggedIn, userInfo, history } = this.props;
        if (!isLoggedIn || !userInfo?.id) {
            history.push(path.LOGIN);
            return;
        }
        this.handlePaymentResult();
        await this.loadHistory();
    }

    handlePaymentResult = () => {
        const params = new URLSearchParams(this.props.location.search);
        const paymentStatus = params.get('vnpay');
        if (!paymentStatus) return;

        if (paymentStatus === 'success') {
            toast.success('Thanh toan VNPAY thanh cong');
        } else if (paymentStatus === 'failed') {
            toast.error('Thanh toan VNPAY that bai');
        } else if (paymentStatus === 'invalid-signature') {
            toast.error('Chu ky thanh toan khong hop le');
        } else if (paymentStatus === 'not-found') {
            toast.error('Khong tim thay booking de thanh toan');
        }

        this.props.history.replace(path.PATIENT_BOOKING_HISTORY);
    }

    loadHistory = async () => {
        const { userInfo } = this.props;
        this.setState({ loading: true, error: '' });
        try {
            const res = await getBookingHistoryByPatient(userInfo.id);
            if (res && res.errCode === 0) {
                this.setState({
                    bookings: res.data || [],
                    loading: false
                });
                return;
            }
            this.setState({
                loading: false,
                error: res?.errMessage || 'Khong the tai lich su dat lich'
            });
        } catch (error) {
            this.setState({
                loading: false,
                error: 'Khong the tai lich su dat lich'
            });
        }
    };

    getDoctorName = (booking) => {
        return BookingUtils.getUserDisplayName(booking?.doctorData, this.props.language);
    };

    getTimeLabel = (booking) => {
        return BookingUtils.getTimeLabel(booking?.timeTypeData, this.props.language);
    };

    getStatusLabel = (booking) => {
        return BookingUtils.getLocalizedValue(booking?.statusData, this.props.language, booking?.statusId || '--');
    };

    getPaymentStatusLabel = (booking) => {
        return BookingUtils.getPaymentStatusLabel(booking?.paymentStatus, { language: this.props.language });
    };

    formatDate = (date) => {
        return BookingUtils.formatDate(date);
    };

    handlePayWithVnpay = async (bookingId) => {
        const { userInfo, language } = this.props;
        this.setState({ paymentLoadingId: bookingId });
        try {
            const res = await createVnpayPayment({
                bookingId,
                patientId: userInfo.id,
                language
            });

            if (res && res.errCode === 0 && res.data?.paymentUrl) {
                window.location.href = res.data.paymentUrl;
                return;
            }

            toast.error(res?.errMessage || 'Khong tao duoc link thanh toan VNPAY');
        } catch (error) {
            toast.error('Khong tao duoc link thanh toan VNPAY');
        } finally {
            this.setState({ paymentLoadingId: null });
        }
    };

    renderContent = () => {
        const { bookings, loading, error, paymentLoadingId } = this.state;

        if (loading) {
            return <div className="booking-history-state">Dang tai lich su dat lich...</div>;
        }

        if (error) {
            return <div className="booking-history-state error">{error}</div>;
        }

        if (!bookings.length) {
            return <div className="booking-history-state">Ban chua co lich dat kham nao.</div>;
        }

        return (
            <div className="booking-history-table-card">
                <table className="booking-history-table">
                    <thead>
                        <tr>
                            <th>Bac sy</th>
                            <th>Ngay kham</th>
                            <th>Gio kham</th>
                            <th>Trang thai lich</th>
                            <th>Trang thai thanh toan</th>
                            <th>Thanh toan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((item) => (
                            <tr key={item.id}>
                                <td>{this.getDoctorName(item)}</td>
                                <td>{this.formatDate(item.date)}</td>
                                <td>{this.getTimeLabel(item)}</td>
                                <td>
                                    <span className={`status-badge status-${(item.statusId || '').toLowerCase()}`}>
                                        {this.getStatusLabel(item)}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge payment-${(item.paymentStatus || 'pending').toLowerCase()}`}>
                                        {this.getPaymentStatusLabel(item)}
                                    </span>
                                </td>
                                <td>
                                    {item.paymentStatus !== 'paid' && item.statusId !== 'S3' ? (
                                        <button
                                            type="button"
                                            className="pay-vnpay-btn"
                                            onClick={() => this.handlePayWithVnpay(item.id)}
                                            disabled={paymentLoadingId === item.id}
                                        >
                                            {paymentLoadingId === item.id ? 'Dang tao link...' : 'Thanh toan VNPAY'}
                                        </button>
                                    ) : (
                                        <span className="payment-done">Da xu ly</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    render() {
        return (
            <div className="booking-history-page">
                <HomeHeader isShowBanner={false} />
                <div className="booking-history-shell">
                    <div className="booking-history-hero">
                        <div>
                            <div className="eyebrow">Patient account</div>
                            <h1>Lich su dat lich kham</h1>
                            <p>Theo doi toan bo lich hen ma ban da tao tren he thong.</p>
                        </div>
                        <button type="button" onClick={this.loadHistory}>
                            Tai lai
                        </button>
                    </div>
                    {this.renderContent()}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    isLoggedIn: state.user.isLoggedIn,
    userInfo: state.user.userInfo,
    language: state.app.language
});

export default withRouter(connect(mapStateToProps)(BookingHistory));
