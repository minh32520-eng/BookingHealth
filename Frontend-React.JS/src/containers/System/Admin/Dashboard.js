import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    getAllUsers,
    getAllDoctors,
    getAllSpecialty,
    getAllClinic,
    getAllHandbook
} from '../../../services/userService';
import './Dashboard.scss';

class Dashboard extends Component {
    state = {
        loading: true,
        totalUsers: 0,
        totalDoctors: 0,
        totalSpecialties: 0,
        totalClinics: 0,
        totalHandbooks: 0
    };

    async componentDidMount() {
        await this.loadDashboard();
    }

    loadDashboard = async () => {
        this.setState({ loading: true });
        try {
            const [usersRes, doctorsRes, specialtiesRes, clinicsRes, handbooksRes] = await Promise.all([
                getAllUsers('ALL'),
                getAllDoctors(),
                getAllSpecialty(),
                getAllClinic(),
                getAllHandbook()
            ]);

            this.setState({
                totalUsers: Array.isArray(usersRes?.users) ? usersRes.users.length : 0,
                totalDoctors: Array.isArray(doctorsRes?.data) ? doctorsRes.data.length : 0,
                totalSpecialties: Array.isArray(specialtiesRes?.data) ? specialtiesRes.data.length : 0,
                totalClinics: Array.isArray(clinicsRes?.data) ? clinicsRes.data.length : 0,
                totalHandbooks: Array.isArray(handbooksRes?.data) ? handbooksRes.data.length : 0,
                loading: false
            });
        } catch (e) {
            this.setState({ loading: false });
        }
    };

    renderCard = (title, value, link, linkText) => (
        <div className="col-md-4 mb-3">
            <div className="dash-card">
                <div className="dash-title">{title}</div>
                <div className="dash-value">{value}</div>
                <Link className="dash-link" to={link}>
                    {linkText}
                </Link>
            </div>
        </div>
    );

    render() {
        const {
            loading,
            totalUsers,
            totalDoctors,
            totalSpecialties,
            totalClinics,
            totalHandbooks
        } = this.state;

        return (
            <div className="admin-dashboard-container">
                <div className="dashboard-header">
                    <h3>Dashboard</h3>
                    <button className="btn btn-sm btn-primary" onClick={this.loadDashboard}>
                        Reload
                    </button>
                </div>

                {loading ? (
                    <div className="dash-loading">Loading data...</div>
                ) : (
                    <div className="row">
                        {this.renderCard('Tổng người dùng', totalUsers, '/system/user-manage', 'Đi tới quản lý user')}
                        {this.renderCard('Bác sĩ', totalDoctors, '/system/manage-doctor', 'Đi tới quản lý bác sĩ')}
                        {this.renderCard('Chuyên khoa', totalSpecialties, '/system/manage-specialty', 'Đi tới chuyên khoa')}
                        {this.renderCard('Phòng khám', totalClinics, '/system/manage-clinic', 'Đi tới phòng khám')}
                        {this.renderCard('Cẩm nang', totalHandbooks, '/system/manage-handbook', 'Đi tới cẩm nang')}
                    </div>
                )}
            </div>
        );
    }
}

export default connect()(Dashboard);

