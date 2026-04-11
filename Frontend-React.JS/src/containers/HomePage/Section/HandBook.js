import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Slider from 'react-slick';
import { withRouter } from 'react-router';
import { getAllHandbook } from '../../../services/userService';
import CommonUtils from '../../../utils/CommonUtils';

class HandBook extends Component {
    constructor(props) {
        super(props);
        this.state = {
            arrHandbooks: []
        };
    }

    async componentDidMount() {
        this.loadHandbooks();
    }

    loadHandbooks = async () => {
        try {
            const res = await getAllHandbook();
            if (res && res.errCode === 0) {
                this.setState({ arrHandbooks: res.data || [] });
            }
        } catch (error) {
            console.error('Load handbook error:', error);
        }
    };

    handleViewDetailHandbook = (item) => {
        this.props.history?.push(`/detail-handbook/${item.id}`);
    };

    handleViewMore = () => {
        this.props.history?.push('/handbook');
    };

    render() {
        const { arrHandbooks } = this.state;
        const { settings } = this.props;

        return (
            <div className="section-share section-handbook">
                <div className="section-container">
                    <div className="section-header">
                        <span className="title-section">
                            <FormattedMessage id="homepage.handbook.title" />
                        </span>

                        <button className="btn-section" onClick={this.handleViewMore}>
                            <FormattedMessage id="homepage.more-infor" />
                        </button>
                    </div>

                    <div className="section-body">
                        {arrHandbooks?.length > 0 ? (
                            <Slider {...settings}>
                                {arrHandbooks.map((item) => (
                                    <div
                                        className="section-customize"
                                        key={item.id}
                                        onClick={() => this.handleViewDetailHandbook(item)}
                                    >
                                        <div className="customize-border">
                                            <div className="bg-image section-handbook">
                                                <img
                                                    src={CommonUtils.buildImageSrc(item.image) || '/default-handbook.jpg'}
                                                    alt={item.title || 'handbook'}
                                                    className="section-image-el"
                                                />
                                            </div>

                                            <div className="section-card-content handbook-card-content">
                                                <div className="section-card-title handbook-name">
                                                    {item.title}
                                                </div>

                                                <div className="section-card-description handbook-content">
                                                    {item.content ? `${item.content.slice(0, 100)}...` : ''}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </Slider>
                        ) : (
                            <div className="no-data">
                                <FormattedMessage id="homepage.handbook.empty" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(HandBook);
