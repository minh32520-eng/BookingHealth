import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import './Specialty.scss';
import { getAllSpecialty } from '../../../services/userService';
import { path } from '../../../utils';
import CommonUtils from '../../../utils/CommonUtils';

class Specialty extends Component {
    constructor(props) {
        super(props);
        this.state = {
            listSpecialty: [],
            loading: true,
            loadError: ''
        };
    }

    async componentDidMount() {
        try {
            const res = await getAllSpecialty();
            if (res && res.errCode === 0 && Array.isArray(res.data)) {
                this.setState({
                    listSpecialty: res.data,
                    loading: false,
                    loadError: ''
                });
            } else {
                this.setState({
                    listSpecialty: [],
                    loading: false,
                    loadError: 'Unable to load specialties'
                });
            }
        } catch (e) {
            this.setState({
                listSpecialty: [],
                loading: false,
                loadError: 'Server connection error'
            });
        }
    }

    render() {
        const { listSpecialty, loading, loadError } = this.state;
        const { settings } = this.props;

        return (
            <div className="section-share section-specialty">
                <div className="section-container">
                    <div className="section-header">
                        <span className="title-section">
                            <FormattedMessage id="homepage.specialty.title" />
                        </span>
                        <Link to={path.HOMEPAGE} className="btn-section">
                            <FormattedMessage id="homepage.back-home" />
                        </Link>
                    </div>

                    <div className="section-body specialty-slider-wrap">
                        {loadError && (
                            <div className="specialty-load-message">{loadError}</div>
                        )}

                        {loading && (
                            <div className="specialty-load-message">
                                <FormattedMessage id="homepage.loading" />
                            </div>
                        )}

                        {!loading && listSpecialty.length > 0 && (
                            <Slider {...settings}>
                                {listSpecialty.map((item) => (
                                    <div key={item.id} className="section-customize">
                                        <Link
                                            to={path.DETAIL_SPECIALTY.replace(':id', item.id)}
                                            className="specialty-card-link"
                                        >
                                            <div className="customize-border specialty-card-bg">
                                                <div className="bg-image section-specialty">
                                                    <img
                                                        src={CommonUtils.buildImageSrc(item.image) || '/default-specialty.jpg'}
                                                        alt={item.name || 'specialty'}
                                                        className="section-image-el"
                                                    />
                                                </div>
                                                <div className="section-card-content specialty-card-content">
                                                    <div className="section-card-title specialty-card-title">
                                                        {item.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </Slider>
                        )}

                        {!loading && listSpecialty.length === 0 && !loadError && (
                            <div className="specialty-load-message">
                                <FormattedMessage id="homepage.specialty.empty" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default Specialty;
