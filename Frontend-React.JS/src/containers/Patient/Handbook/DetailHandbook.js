import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { FormattedMessage, injectIntl } from 'react-intl';
import './DetailHandbook.scss';

import HomeHeader from '../../HomePage/HomeHeader';
import { getDetailHandbookById } from '../../../services/userService';
import { path } from '../../../utils';

class DetailHandBook extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataDetail: {}
        };
    }

    async componentDidMount() {
        if (this.props.match && this.props.match.params.id) {
            // Load the handbook article from the route id when the page first opens.
            let id = this.props.match.params.id;

            let res = await getDetailHandbookById(id);

            if (res && res.errCode === 0) {
                this.setState({
                    dataDetail: res.data
                });
            }
        }
    }

    buildImageSrc = (image) => {
        // Handbook images may be stored either as raw base64 or as a ready-to-use data URL.
        if (!image) return '';
        return image.startsWith('data:image') ? image : `data:image/jpeg;base64,${image}`;
    }

    render() {
        let { dataDetail } = this.state;
        const { intl } = this.props;

        // Prepare a safe image src before render so the JSX only decides whether the image block should appear.
        let imageBase64 = this.buildImageSrc(dataDetail?.image);

        return (
            <div className="blog-wrapper">
                <HomeHeader isShowBanner={false} />

                <div className="blog-header">
                    <div className="blog-breadcrumb">
                        <Link to={path.HOMEPAGE}><FormattedMessage id="patient.detail-common.home" /></Link>
                        <span> / </span>
                        <span><FormattedMessage id="patient.detail-handbook.page-title" /></span>
                    </div>
                    <h2><FormattedMessage id="patient.detail-handbook.hero-title" /></h2>
                    <p className="blog-subtitle"><FormattedMessage id="patient.detail-handbook.hero-subtitle" /></p>
                </div>

                <div className="blog-row">
                    <div className="leftcolumn">
                        <div className="card">
                            <div className="back-btn">
                                <button onClick={() => this.props.history.goBack()}>
                                    <FormattedMessage id="patient.detail-common.back" />
                                </button>
                            </div>

                            <div className="article-label">
                                <FormattedMessage id="patient.detail-handbook.article-label" />
                            </div>
                            <h2>{dataDetail.title}</h2>

                            {imageBase64 &&
                                <div className="image">
                                    <img src={imageBase64} alt="handbook" />
                                </div>
                            }

                            <div
                                className="content"
                                dangerouslySetInnerHTML={{
                                    __html: dataDetail.content || `<p>${intl.formatMessage({ id: 'patient.detail-common.no-description' })}</p>`
                                }}
                            />
                        </div>
                    </div>

                    <div className="rightcolumn">
                        <div className="card side-card">
                            <h3><FormattedMessage id="patient.detail-handbook.about-title" /></h3>
                            <p><FormattedMessage id="patient.detail-handbook.about-text" /></p>
                        </div>

                        <div className="card side-card">
                            <h3><FormattedMessage id="patient.detail-handbook.featured-title" /></h3>
                            <p><FormattedMessage id="patient.detail-handbook.featured-1" /></p>
                            <p><FormattedMessage id="patient.detail-handbook.featured-2" /></p>
                            <p><FormattedMessage id="patient.detail-handbook.featured-3" /></p>
                        </div>

                        <div className="card side-card">
                            <h3><FormattedMessage id="patient.detail-handbook.connect-title" /></h3>
                            <p><FormattedMessage id="patient.detail-handbook.connect-text" /></p>
                        </div>

                    </div>
                </div>

                <div className="footer">
                    <h2><FormattedMessage id="patient.detail-handbook.footer" /></h2>
                </div>

            </div>
        );
    }
}

const mapStateToProps = state => {
    return {};
};

export default withRouter(injectIntl(connect(mapStateToProps)(DetailHandBook)));
