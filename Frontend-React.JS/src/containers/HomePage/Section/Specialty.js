import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import './Specialty.scss';
import Slider from 'react-slick';
import { getAllSpecialty } from '../../../services/userService';
import { path } from '../../../utils';

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
                    loadError: 'Không tải được danh sách chuyên khoa'
                });
            }
        } catch (e) {
            this.setState({
                listSpecialty: [],
                loading: false,
                loadError: 'Lỗi kết nối máy chủ'
            });
        }
    }

    render() {
        const { listSpecialty, loading, loadError } = this.state;

        return (
            <div className="section-share section-specialty">
                <div className="section-container">
                    <div className="section-header">
                        <span className="title-section">
                            Chuyên khoa khám bệnh
                        </span>
                        <Link to={path.HOMEPAGE} className="btn-section">
                            Về trang chủ
                        </Link>
                    </div>
                    <div className="section-body specialty-slider-wrap">
                        {loadError && (
                            <div className="specialty-load-message">
                                {loadError}
                            </div>
                        )}
                        {loading && (
                            <div className="specialty-load-message">
                                Đang tải...
                            </div>
                        )}
                        {!loading &&
                            listSpecialty.length > 0 && (
                                <Slider {...this.props.settings}>
                                    {listSpecialty.map((item) => (
                                        <div key={item.id} className="section-customize">
                                            <Link
                                                to={path.DETAIL_SPECIALTY.replace(
                                                    ':id',
                                                    item.id
                                                )}
                                                className="specialty-card-link"
                                            >
                                                <div
                                                    className="bg-image section-specialty specialty-card-bg"
                                                    style={{
                                                        backgroundImage: item.image
                                                            ? `url(${item.image})`
                                                            : undefined
                                                    }}
                                                >
                                                    <div className="specialty-card-title">
                                                        {item.name}
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </Slider>
                            )}
                        {!loading && listSpecialty.length === 0 && !loadError && (
                            <div className="specialty-load-message">
                                Chưa có dữ liệu chuyên khoa. Vui lòng chạy seeder
                                hoặc thêm từ trang quản trị.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        language: state.app.language
    };
};

const mapDispatchToProps = () => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Specialty);
