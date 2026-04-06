import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import HomeHeader from '../../HomePage/HomeHeader';
import { getDetailSpecialtyById } from '../../../services/userService';
import { path } from '../../../utils';
import './DetailSpecialty.scss';

class DetailSpecialty extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            specialty: {},
            errMessage: ''
        };
    }

    getSpecialtyId() {
        return (
            this.props.match &&
            this.props.match.params &&
            this.props.match.params.id
        );
    }

    async loadSpecialtyDetail() {
        const id = this.getSpecialtyId();

        if (!id) {
            this.setState({
                loading: false,
                specialty: {},
                errMessage: 'Thiếu mã chuyên khoa'
            });
            return;
        }

        this.setState({
            loading: true,
            errMessage: '',
            specialty: {}
        });

        try {
            const res = await getDetailSpecialtyById(id);
            if (res && res.errCode === 0 && res.data) {
                this.setState({
                    loading: false,
                    specialty: res.data,
                    errMessage: ''
                });
            } else {
                this.setState({
                    loading: false,
                    specialty: {},
                    errMessage:
                        (res && res.errMessage) ||
                        'Không tìm thấy chuyên khoa'
                });
            }
        } catch (e) {
            this.setState({
                loading: false,
                specialty: {},
                errMessage: 'Lỗi kết nối máy chủ'
            });
        }
    }

    componentDidMount() {
        this.loadSpecialtyDetail();
    }

    componentDidUpdate(prevProps) {
        const prevId = prevProps.match && prevProps.match.params && prevProps.match.params.id;
        const id = this.getSpecialtyId();
        if (id && id !== prevId) {
            this.loadSpecialtyDetail();
        }
    }

    renderLoadingSections() {
        return (
            <div className="detail-specialty-body detail-specialty-loading" aria-busy="true">
                <div className="detail-specialty-section">
                    <div className="skeleton skeleton-cover" />
                </div>
                <div className="detail-specialty-section">
                    <div className="skeleton skeleton-title" />
                </div>
                <div className="detail-specialty-section">
                    <div className="skeleton skeleton-line" />
                    <div className="skeleton skeleton-line" />
                    <div className="skeleton skeleton-line skeleton-line-short" />
                </div>
            </div>
        );
    }

    render() {
        const { loading, specialty, errMessage } = this.state;
        const html =
            specialty.descriptionHTML ||
            specialty.description ||
            '';

        return (
            <>
                <HomeHeader isShowBanner={false} />
                <div className="detail-specialty-page">
                    <div className="detail-specialty-breadcrumb">
                        <Link to={path.HOMEPAGE}>Trang chủ</Link>
                        <span> / </span>
                        <span>Chuyên khoa</span>
                        {loading ? (
                            <>
                                <span> / </span>
                                <span className="breadcrumb-loading">Đang tải…</span>
                            </>
                        ) : (
                            specialty.name && (
                                <>
                                    <span> / </span>
                                    <span>{specialty.name}</span>
                                </>
                            )
                        )}
                    </div>

                    {loading && this.renderLoadingSections()}

                    {!loading && errMessage && (
                        <div className="detail-specialty-error">{errMessage}</div>
                    )}

                    {!loading && !errMessage && (
                        <div className="detail-specialty-body">
                            <section className="detail-specialty-section detail-specialty-section-hero">
                                <div
                                    className="detail-specialty-cover"
                                    style={{
                                        backgroundImage: specialty.image
                                            ? `url(${specialty.image})`
                                            : undefined
                                    }}
                                />
                            </section>
                            <section className="detail-specialty-section detail-specialty-section-heading">
                                <h1 className="detail-specialty-title">
                                    {specialty.name}
                                </h1>
                            </section>
                            <section className="detail-specialty-section detail-specialty-section-content">
                                <div
                                    className="detail-specialty-content markdown-body"
                                    dangerouslySetInnerHTML={{ __html: html }}
                                />
                            </section>
                        </div>
                    )}
                </div>
            </>
        );
    }
}

const mapStateToProps = () => ({});

export default connect(mapStateToProps)(DetailSpecialty);
