import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import './DetailHandbook.scss';

import HomeHeader from '../../HomePage/HomeHeader'; // header giống homepage
import { getDetailHandbookById } from '../../../services/userService';

class DetailHandBook extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataDetail: {}
        };
    }

    async componentDidMount() {
        if (this.props.match && this.props.match.params.id) {
            let id = this.props.match.params.id;

            let res = await getDetailHandbookById(id);

            if (res && res.errCode === 0) {
                this.setState({
                    dataDetail: res.data
                });
            }
        }
    }

    render() {
        let { dataDetail } = this.state;

        let imageBase64 = '';
        if (dataDetail && dataDetail.image) {
            imageBase64 = `data:image/jpeg;base64,${dataDetail.image}`;
        }

        return (
            <div className="blog-wrapper">

                <HomeHeader />

                {/* HEADER BLOG */}
                <div className="blog-header">
                    <h2>Health Handbook</h2>
                </div>

                <div className="blog-row">

                    {/* LEFT COLUMN */}
                    <div className="leftcolumn">

                        <div className="card">

                            <div className="back-btn">
                                <button onClick={() => this.props.history.goBack()}>
                                    ← Quay lại
                                </button>
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
                                    __html: dataDetail.content || ''
                                }}
                            />
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="rightcolumn">

                        <div className="card">
                            <h3>About</h3>
                            <p>Chia sẻ kiến thức sức khỏe hữu ích mỗi ngày.</p>
                        </div>

                        <div className="card">
                            <h3>Bài nổi bật</h3>
                            <p>• Chăm sóc tim mạch</p>
                            <p>• Dinh dưỡng hợp lý</p>
                            <p>• Sức khỏe tinh thần</p>
                        </div>

                        <div className="card">
                            <h3>Theo dõi</h3>
                            <p>Facebook | Youtube | TikTok</p>
                        </div>

                    </div>
                </div>

                {/* FOOTER */}
                <div className="footer">
                    <h2>Health Blog © 2026</h2>
                </div>

            </div>
        );
    }
}

const mapStateToProps = state => {
    return {};
};

export default withRouter(connect(mapStateToProps)(DetailHandBook));