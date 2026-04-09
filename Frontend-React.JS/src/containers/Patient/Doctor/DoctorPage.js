
import React, { Component } from 'react';
import './DoctorPage.scss';
import { getAllDoctors } from '../../../services/userService';
import { path } from '../../../utils';
import '@fortawesome/fontawesome-free/css/all.min.css';

class DoctorPage extends Component {

    state = {
        dataDoctors: []
    }

    async componentDidMount() {
        let res = await getAllDoctors();
        if (res && res.errCode === 0) {
            this.setState({
                dataDoctors: res.data
            });
        }
    }

    handleViewDetail = (item) => {
        this.props.history.push(`/detail-doctor/${item.id}`);
    }

    goToHome = () => {
        this.props.history.push(path.HOMEPAGE);
    }

    render() {
        const { dataDoctors } = this.state;

        return (
            <div className="doctor-page-container">

                {/* breadcrumb */}
                <div className="breadcrumb">
                    <span className="home-icon" onClick={this.goToHome}>
                        <i className="fa-solid fa-house"></i>
                    </span>
                    <span> / Bác sĩ</span>
                </div>

                <h2 className="title">Danh sách bác sĩ</h2>

                <div className="doctor-list">
                    {dataDoctors && dataDoctors.map((item, index) => {

                        let imageBase64 = item.image
                            ? `data:image/jpeg;base64,${item.image}`
                            : '';

                        return (
                            <div
                                className="doctor-item"
                                key={index}
                                onClick={() => this.handleViewDetail(item)}
                            >

                                <div className="doctor-image">
                                    <img src={imageBase64} alt="" />
                                </div>

                                <div className="doctor-info">
                                    <div className="doctor-name">
                                        {item.positionData?.valueVi}, {item.lastName} {item.firstName}
                                    </div>

                                    <div className="doctor-desc">
                                        {item.Markdown?.description || 'Chưa có mô tả'}
                                    </div>
                                </div>

                            </div>
                        )
                    })}
                </div>

            </div>
        );
    }
}

export default DoctorPage;
