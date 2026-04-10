import React, { Component } from 'react';
import { connect } from 'react-redux';
import Slider from "react-slick";
import { withRouter } from 'react-router';
import { getAllHandbook } from '../../../services/userService';

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
            let res = await getAllHandbook();

            if (res && res.errCode === 0) {
                this.setState({
                    arrHandbooks: res.data || []
                });
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

    buildImageSrc = (image) => {
        if (!image) return '';
        return image.startsWith('data:image') ? image : `data:image/jpeg;base64,${image}`;
    };

    render() {
        const { arrHandbooks } = this.state;
        const { settings } = this.props;

        return (
            <div className="section-share section-handbook">
                <div className="section-container">

                    <div className="section-header">
                        <span className="title-section">
                            Cẩm nang
                        </span>

                        <button
                            className="btn-section"
                            onClick={this.handleViewMore}
                        >
                            Xem thêm
                        </button>
                    </div>

                    <div className="section-body">
                        {arrHandbooks?.length > 0 ? (
                            <Slider {...settings}>
                                {arrHandbooks.map((item) => {

                                    // xử lý ảnh base64 nếu có
                                    let imageBase64 = this.buildImageSrc(item.image);

                                    return (
                                        <div
                                            className="section-customize"
                                            key={item.id}
                                            onClick={() =>
                                                this.handleViewDetailHandbook(item)
                                            }
                                        >
                                            <div className="customize-border">

                                                {/* IMAGE */}
                                                <div
                                                    className="bg-image section-handbook"
                                                    style={{
                                                        backgroundImage: `url(${imageBase64 || '/default-handbook.jpg'})`,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center',
                                                        height: '150px'
                                                    }}
                                                ></div>

                                                {/* TITLE */}
                                                <div className="handbook-name">
                                                    {item.title}
                                                </div>

                                                {/* CONTENT (cắt ngắn) */}
                                                <div className="handbook-content">
                                                    {item.content
                                                        ? item.content.slice(0, 100) + '...'
                                                        : ''}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </Slider>
                        ) : (
                            <div className="no-data">
                                Chưa có dữ liệu cẩm nang
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    isLoggedIn: state.user.isLoggedIn
});

export default withRouter(connect(mapStateToProps)(HandBook));
