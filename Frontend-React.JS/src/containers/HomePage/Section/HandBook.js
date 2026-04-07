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
        await this.loadHandbooks();
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
            console.log('Load handbook error:', error);
        }
    };

    handleViewDetailHandbook = (item) => {
        if (this.props.history) {
            this.props.history.push(`/detail-handbook/${item.id}`);
        }
    };

    handleViewMore = () => {
        if (this.props.history) {
            this.props.history.push('/handbook');
        }
    };

    render() {
        let { arrHandbooks } = this.state;
        let { settings } = this.props;

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
                        {arrHandbooks && arrHandbooks.length > 0 ? (
                            <Slider {...settings}>
                                {arrHandbooks.map((item, index) => {
                                    return (
                                        <div
                                            className="section-customize"
                                            key={item.id || index}
                                            onClick={() =>
                                                this.handleViewDetailHandbook(item)
                                            }
                                        >
                                            <div className="customize-border">

                                                <div className="bg-image section-handbook">
                                                </div>

                                                <div className="handbook-name">
                                                    {item.title}
                                                </div>

                                                <div className="handbook-content">
                                                    {item.content}
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

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn
    };
};

export default withRouter(connect(mapStateToProps)(HandBook));