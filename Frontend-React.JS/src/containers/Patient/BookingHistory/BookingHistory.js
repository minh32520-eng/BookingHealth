import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import moment from 'moment';
import HomeHeader from '../../HomePage/HomeHeader';
import { LANGUAGES, path } from '../../../utils';
import { getBookingHistoryByPatient } from '../../../services/userService';
import './BookingHistory.scss';

class BookingHistory extends Component {
    state = {
        bookings: [],
        loading: true,
        error: ''
    };

    async componentDidMount() {
        const { isLoggedIn, userInfo, history } = this.props;
        if (!isLoggedIn || !userInfo?.id) {
            history.push(path.LOGIN);
            return;
        }
        await this.loadHistory();
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
        const doctor = booking?.doctorData;
        if (!doctor) return '--';
        if (this.props.language === LANGUAGES.VI) {
            return `${doctor.lastName || ''} ${doctor.firstName || ''}`.trim();
        }
        return `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
    };

    getTimeLabel = (booking) => {
        if (!booking?.timeTypeData) return '--';
        return this.props.language === LANGUAGES.VI
            ? booking.timeTypeData.valueVi
            : booking.timeTypeData.valueEn;
    };

    getStatusLabel = (booking) => {
        if (!booking?.statusData) return booking?.statusId || '--';
        return this.props.language === LANGUAGES.VI
            ? booking.statusData.valueVi
            : booking.statusData.valueEn;
    };

    formatDate = (date) => {
        if (!date) return '--';
        return moment(Number(date)).format('DD/MM/YYYY');
    };

    renderContent = () => {
        const { bookings, loading, error } = this.state;

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
                            <th>Trang thai</th>
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
