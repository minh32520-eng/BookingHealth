import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router';
import Slider from 'react-slick';
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
            const res = await getAllClinic();
            if (res && res.errCode === 0) {
                this.setState({ arrClinics: res.data || [] });
            }
        } catch (error) {
            console.log('Load clinic error:', error);
        }
    };

    handleViewDetailClinic = (clinic) => {
        this.props.history?.push(`/detail-clinic/${clinic.id}`);
    };

    handleViewMore = () => {
        this.props.history?.push('/clinic');
    };

    render() {
        const { arrClinics } = this.state;
        const { settings } = this.props;

        return (
            <div className="section-share section-medical-facility">
                <div className="section-container">
                    <div className="section-header">
                        <span className="title-section">
                            <FormattedMessage id="homepage.clinic.title" />
                        </span>

                        <button className="btn-section" onClick={this.handleViewMore}>
                            <FormattedMessage id="homepage.more-infor" />
                        </button>
                    </div>

                    <div className="section-body">
                        {arrClinics && arrClinics.length > 0 ? (
                            <Slider {...settings}>
                                {arrClinics.map((item, index) => (
                                    <div
                                        className="section-customize"
                                        key={item.id || index}
                                        onClick={() => this.handleViewDetailClinic(item)}
                                    >
                                        <div className="customize-border">
                                            <div className="bg-image section-medical-facility">
                                                <img
                                                    src={CommonUtils.buildImageSrc(item.image) || '/default-clinic.jpg'}
                                                    alt={item.name || 'clinic'}
                                                    className="section-image-el"
                                                />
                                            </div>

                                            <div className="section-card-content clinic-card-content">
                                                <div className="section-card-title clinic-name">
                                                    {item.name}
                                                </div>

                                                <div className="section-card-description clinic-address">
                                                    {item.address}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </Slider>
                        ) : (
                            <div className="no-data">
                                <FormattedMessage id="homepage.clinic.empty" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(MedicalFacillity);
