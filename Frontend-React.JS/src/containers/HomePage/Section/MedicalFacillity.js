import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Slider from "react-slick";
import './MedicalFacillity.scss';
import { getAllClinic } from '../../../services/userService';
import CommonUtils from '../../../utils/CommonUtils';

class MedicalFacillity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            arrClinics: []
        };
    }

    async componentDidMount() {
        await this.loadClinics();
    }

    loadClinics = async () => {
        try {
            let res = await getAllClinic();

            if (res && res.errCode === 0) {
                this.setState({
                    arrClinics: res.data || []
                });
            }
        } catch (error) {
            console.log('Load clinic error:', error);
        }
    };

    handleViewDetailClinic = (clinic) => {
        if (this.props.history) {
            this.props.history.push(`/detail-clinic/${clinic.id}`);
        }
    };

    handleViewMore = () => {
        if (this.props.history) {
            this.props.history.push('/clinic');
        }
    };

    buildImageSrc = (image) => {
        return CommonUtils.buildImageSrc(image);
    };

    render() {
        let { arrClinics } = this.state;
        let { settings } = this.props;

        return (
            <div className="section-share section-medical-facility">
                <div className="section-container">

                    <div className="section-header">
                        <span className="title-section">
                            Cơ sở y tế nổi bật
                        </span>

                        <button
                            className="btn-section"
                            onClick={this.handleViewMore}
                        >
                            Xem thêm
                        </button>
                    </div>

                    <div className="section-body">
                        {arrClinics && arrClinics.length > 0 ? (
                            <Slider {...settings}>
                                {arrClinics.map((item, index) => {
                                    const imageBase64 = this.buildImageSrc(item.image);
                                    return (
                                        <div
                                            className="section-customize"
                                            key={item.id || index}
                                            onClick={() =>
                                                this.handleViewDetailClinic(item)
                                            }
                                            >
                                                <div className="customize-border">
                                                <div className="bg-image section-medical-facility">
                                                    <img
                                                        src={imageBase64 || '/default-clinic.jpg'}
                                                        alt={item.name || 'clinic'}
                                                        className="section-image-el"
                                                    />
                                                </div>

                                                <div className="clinic-name">
                                                    {item.name}
                                                </div>

                                                <div className="clinic-address">
                                                    {item.address}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </Slider>
                        ) : (
                            <div className="no-data">
                                Chưa có dữ liệu cơ sở y tế
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn
    };
};

export default withRouter(connect(mapStateToProps)(MedicalFacillity));
