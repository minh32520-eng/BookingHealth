
import React, { Component } from 'react';
import './ClinicPage.scss';
import { getAllClinic } from '../../../services/userService';
import { path } from '../../../utils';
import CommonUtils from '../../../utils/CommonUtils';

class ClinicPage extends Component {

    state = {
        dataClinic: []
    }

    async componentDidMount() {
        let res = await getAllClinic();
        if (res && res.errCode === 0) {
            this.setState({
                dataClinic: res.data
            });
        }
    }

    handleViewDetail = (item) => {
        this.props.history.push(`/detail-clinic/${item.id}`);
    }

    goToHome = () => {
        this.props.history.push(path.HOMEPAGE);
    }

    buildImageSrc = (image) => {
        return CommonUtils.buildImageSrc(image);
    }

    render() {
        const { dataClinic } = this.state;

        return (
            <div className="clinic-page-container">

                <div className="breadcrumb">
                    <span className="home-icon" onClick={this.goToHome}>
                        <i className="fa-solid fa-house"></i>
                    </span>
                    <span> / Cơ sở y tế</span>
                </div>

                <h2 className="title">Cơ sở y tế</h2>

                <div className="clinic-list">
                    {dataClinic && dataClinic.map((item, index) => {

                        let imageBase64 = this.buildImageSrc(item.image);

                        return (
                            <div
                                className="clinic-item"
                                key={index}
                                onClick={() => this.handleViewDetail(item)}
                            >

                                <div className="clinic-image">
                                    <img src={imageBase64} alt="" />
                                </div>

                                <div className="clinic-info">
                                    <div className="clinic-name">
                                        {item.name}
                                    </div>
                                    <div className="clinic-address">
                                        {item.address}
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

export default ClinicPage;

