import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { getAllClinic, getAllDoctors, getRevenueDashboard } from '../../../services/userService';
import './RevenueDashboard.scss';

const currency = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
});

class RevenueDashboard extends Component {
    state = {
        year: new Date().getFullYear(),
        loading: true,
        error: '',
        stats: null,
        doctors: [],
        clinics: [],
        selectedDoctorId: '',
        selectedClinicId: ''
    };

    async componentDidMount() {
        await this.loadFilterData();
        await this.loadDashboard();
    }

    loadFilterData = async () => {
        try {
            const [doctorRes, clinicRes] = await Promise.all([
                getAllDoctors(),
                getAllClinic()
            ]);

            const doctors = Array.isArray(doctorRes?.data) ? doctorRes.data : Array.isArray(doctorRes) ? doctorRes : [];
            const clinics = clinicRes?.data || [];

            this.setState({
                doctors,
                clinics
            });
        } catch (error) {
        }
    };

    loadDashboard = async () => {
        this.setState({ loading: true, error: '' });
        try {
            const res = await getRevenueDashboard(this.state.year, {
                doctorId: this.state.selectedDoctorId,
                clinicId: this.state.selectedClinicId
            });
            if (res && res.errCode === 0) {
                this.setState({
                    loading: false,
                    stats: res.data || null
                });
                return;
            }
            this.setState({
                loading: false,
                error: res?.errMessage || 'Khong the tai thong ke doanh thu'
            });
        } catch (error) {
            this.setState({
                loading: false,
                error: 'Khong the tai thong ke doanh thu'
            });
        }
    };

    handleYearChange = (event) => {
        this.setState({ year: Number(event.target.value) || new Date().getFullYear() }, this.loadDashboard);
    };

    handleFilterChange = (event, field) => {
        this.setState({ [field]: event.target.value }, this.loadDashboard);
    };

    buildBarChartBars = () => {
        const monthly = this.state.stats?.monthlyRevenue || [];
        const maxRevenue = Math.max(...monthly.map((item) => item.revenue), 1);

        return monthly.map((item, index) => {
            const barHeight = Math.max((item.revenue / maxRevenue) * 240, item.revenue > 0 ? 10 : 0);
            const x = 18 + index * 62;
            const y = 270 - barHeight;

            return (
                <g key={item.month}>
                    <rect
                        x={x}
                        y={y}
                        width="34"
                        height={barHeight}
                        rx="10"
                        fill="url(#revenueBar)"
                    />
                    <text x={x + 17} y="292" textAnchor="middle" className="month-label">
                        T{item.month}
                    </text>
                    <text x={x + 17} y={y - 8} textAnchor="middle" className="value-label">
                        {item.revenue ? `${Math.round(item.revenue / 1000000)}tr` : '0'}
                    </text>
                </g>
            );
        });
    };

    buildLineChart = () => {
        const monthly = this.state.stats?.monthlyRevenue || [];
        const maxBookings = Math.max(...monthly.map((item) => item.bookings), 1);

        const points = monthly.map((item, index) => {
            const x = 36 + index * 58;
            const y = 250 - ((item.bookings || 0) / maxBookings) * 200;
            return { ...item, x, y };
        });

        const pointString = points.map((item) => `${item.x},${item.y}`).join(' ');

        return (
            <svg viewBox="0 0 760 300" className="visits-chart" role="img" aria-label="Visits chart by month">
                <line x1="20" y1="250" x2="730" y2="250" className="axis-line" />
                <line x1="20" y1="30" x2="20" y2="250" className="axis-line" />
                <polyline points={pointString} fill="none" stroke="#f28b39" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((item) => (
                    <g key={item.month}>
                        <circle cx={item.x} cy={item.y} r="6" className="line-point" />
                        <text x={item.x} y="274" textAnchor="middle" className="month-label">T{item.month}</text>
                        <text x={item.x} y={item.y - 12} textAnchor="middle" className="value-label bookings">{item.bookings}</text>
                    </g>
                ))}
            </svg>
        );
    };

    exportExcel = () => {
        const { intl } = this.props;
        const monthly = this.state.stats?.monthlyRevenue || [];
        const header = [
            intl.formatMessage({ id: 'admin.revenue-dashboard.table.month' }),
            intl.formatMessage({ id: 'admin.revenue-dashboard.table.bookings' }),
            intl.formatMessage({ id: 'admin.revenue-dashboard.table.revenue' })
        ];
        const rows = monthly.map((item) => [
            `${intl.formatMessage({ id: 'admin.revenue-dashboard.month-prefix' })} ${item.month}`,
            item.bookings,
            item.revenue
        ]);
        const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `revenue-dashboard-${this.state.year}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    exportPdf = () => {
        const { intl } = this.props;
        const monthly = this.state.stats?.monthlyRevenue || [];
        const reportWindow = window.open('', '_blank', 'width=960,height=720');
        if (!reportWindow) return;

        const tableRows = monthly.map((item) => `
            <tr>
                <td>${intl.formatMessage({ id: 'admin.revenue-dashboard.month-prefix' })} ${item.month}</td>
                <td>${item.bookings}</td>
                <td>${currency.format(item.revenue)}</td>
            </tr>
        `).join('');

        reportWindow.document.write(`
            <html>
                <head>
                    <title>Revenue Dashboard ${this.state.year}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 24px; color: #173247; }
                        h1 { margin-bottom: 8px; }
                        p { color: #5d6d7b; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #d8e7ee; padding: 10px 12px; text-align: left; }
                        th { background: #f4fbff; }
                        .summary { margin-top: 18px; display: grid; gap: 8px; }
                    </style>
                </head>
                <body>
                    <h1>${intl.formatMessage({ id: 'admin.revenue-dashboard.title' })} ${this.state.year}</h1>
                    <p>${intl.formatMessage({ id: 'admin.revenue-dashboard.pdf.subtitle' })}</p>
                    <div class="summary">
                        <div><strong>${intl.formatMessage({ id: 'admin.revenue-dashboard.stats.total-revenue' })}:</strong> ${currency.format(this.state.stats?.totalRevenue || 0)}</div>
                        <div><strong>${intl.formatMessage({ id: 'admin.revenue-dashboard.stats.total-bookings' })}:</strong> ${this.state.stats?.totalBookings || 0}</div>
                        <div><strong>${intl.formatMessage({ id: 'admin.revenue-dashboard.stats.avg-booking' })}:</strong> ${currency.format(this.state.stats?.averageRevenuePerBooking || 0)}</div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>${intl.formatMessage({ id: 'admin.revenue-dashboard.table.month' })}</th>
                                <th>${intl.formatMessage({ id: 'admin.revenue-dashboard.table.bookings' })}</th>
                                <th>${intl.formatMessage({ id: 'admin.revenue-dashboard.table.revenue' })}</th>
                            </tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                </body>
            </html>
        `);
        reportWindow.document.close();
        reportWindow.focus();
        reportWindow.print();
    };

    render() {
        const { intl } = this.props;
        const { loading, error, stats, year, doctors, clinics, selectedDoctorId, selectedClinicId } = this.state;
        const monthly = stats?.monthlyRevenue || [];
        const bestMonth = monthly.reduce((best, current) => current.revenue > (best?.revenue || 0) ? current : best, monthly[0] || null);

        return (
            <div className="revenue-dashboard-page">
                <div className="dashboard-shell">
                    <div className="dashboard-hero">
                        <div>
                            <div className="dashboard-eyebrow"><FormattedMessage id="admin.revenue-dashboard.eyebrow" /></div>
                            <h1><FormattedMessage id="admin.revenue-dashboard.title" /></h1>
                            <p><FormattedMessage id="admin.revenue-dashboard.subtitle" /></p>
                        </div>
                        <div className="dashboard-actions stacked">
                            <select value={year} onChange={this.handleYearChange}>
                                {[year - 1, year, year + 1].map((item) => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="dashboard-filter-card">
                        <div className="filter-grid">
                            <div className="filter-group">
                                <label><FormattedMessage id="admin.revenue-dashboard.filters.doctor" /></label>
                                <select value={selectedDoctorId} onChange={(event) => this.handleFilterChange(event, 'selectedDoctorId')}>
                                    <option value="">{intl.formatMessage({ id: 'admin.revenue-dashboard.filters.all-doctors' })}</option>
                                    {doctors.map((item) => (
                                        <option key={item.id} value={item.id}>{`${item.lastName || ''} ${item.firstName || ''}`.trim()}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label><FormattedMessage id="admin.revenue-dashboard.filters.clinic" /></label>
                                <select value={selectedClinicId} onChange={(event) => this.handleFilterChange(event, 'selectedClinicId')}>
                                    <option value="">{intl.formatMessage({ id: 'admin.revenue-dashboard.filters.all-clinics' })}</option>
                                    {clinics.map((item) => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-actions">
                                <button type="button" className="btn-export excel" onClick={this.exportExcel}><FormattedMessage id="admin.revenue-dashboard.actions.export-excel" /></button>
                                <button type="button" className="btn-export pdf" onClick={this.exportPdf}><FormattedMessage id="admin.revenue-dashboard.actions.export-pdf" /></button>
                            </div>
                        </div>
                    </div>

                    {loading && <div className="dashboard-state"><FormattedMessage id="admin.revenue-dashboard.loading" /></div>}
                    {!loading && error && <div className="dashboard-state error">{error}</div>}

                    {!loading && !error && stats && (
                        <>
                            <div className="dashboard-stats-grid">
                                <div className="stat-card">
                                    <span className="label"><FormattedMessage id="admin.revenue-dashboard.stats.total-revenue" /></span>
                                    <strong>{currency.format(stats.totalRevenue || 0)}</strong>
                                </div>
                                <div className="stat-card">
                                    <span className="label"><FormattedMessage id="admin.revenue-dashboard.stats.total-bookings" /></span>
                                    <strong>{stats.totalBookings || 0}</strong>
                                </div>
                                <div className="stat-card">
                                    <span className="label"><FormattedMessage id="admin.revenue-dashboard.stats.avg-booking" /></span>
                                    <strong>{currency.format(stats.averageRevenuePerBooking || 0)}</strong>
                                </div>
                                <div className="stat-card">
                                    <span className="label"><FormattedMessage id="admin.revenue-dashboard.stats.best-month" /></span>
                                    <strong>{bestMonth ? `${intl.formatMessage({ id: 'admin.revenue-dashboard.month-prefix' })} ${bestMonth.month}` : '--'}</strong>
                                </div>
                            </div>

                            <div className="chart-grid">
                                <div className="dashboard-chart-card">
                                    <div className="card-head">
                                        <div>
                                            <h3><FormattedMessage id="admin.revenue-dashboard.charts.revenue-title" /></h3>
                                            <p><FormattedMessage id="admin.revenue-dashboard.charts.revenue-subtitle" /></p>
                                        </div>
                                    </div>

                                    <div className="chart-wrap">
                                        <svg viewBox="0 0 760 320" className="revenue-chart" role="img" aria-label="Revenue chart by month">
                                            <defs>
                                                <linearGradient id="revenueBar" x1="0" x2="0" y1="0" y2="1">
                                                    <stop offset="0%" stopColor="#45c3d2" />
                                                    <stop offset="100%" stopColor="#1f8da0" />
                                                </linearGradient>
                                            </defs>
                                            <line x1="10" y1="270" x2="744" y2="270" className="axis-line" />
                                            <line x1="10" y1="24" x2="10" y2="270" className="axis-line" />
                                            {this.buildBarChartBars()}
                                        </svg>
                                    </div>
                                </div>

                                <div className="dashboard-chart-card visits-card">
                                    <div className="card-head">
                                        <div>
                                            <h3><FormattedMessage id="admin.revenue-dashboard.charts.bookings-title" /></h3>
                                            <p><FormattedMessage id="admin.revenue-dashboard.charts.bookings-subtitle" /></p>
                                        </div>
                                    </div>

                                    <div className="chart-wrap">
                                        {this.buildLineChart()}
                                    </div>
                                </div>
                            </div>

                            <div className="dashboard-table-card">
                                <div className="card-head">
                                    <h3><FormattedMessage id="admin.revenue-dashboard.table.title" /></h3>
                                </div>
                                <div className="table-wrap">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th><FormattedMessage id="admin.revenue-dashboard.table.month" /></th>
                                                <th><FormattedMessage id="admin.revenue-dashboard.table.bookings" /></th>
                                                <th><FormattedMessage id="admin.revenue-dashboard.table.revenue" /></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {monthly.map((item) => (
                                                <tr key={item.month}>
                                                    <td>{intl.formatMessage({ id: 'admin.revenue-dashboard.month-prefix' })} {item.month}</td>
                                                    <td>{item.bookings}</td>
                                                    <td>{currency.format(item.revenue)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
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

export default injectIntl(connect(null, null)(RevenueDashboard));
