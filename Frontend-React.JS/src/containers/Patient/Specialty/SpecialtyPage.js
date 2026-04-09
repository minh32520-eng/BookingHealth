
import React, { Component } from 'react';
import './SpecialtyPage.scss';
import { getAllSpecialty } from '../../../services/userService';
import { path } from '../../../utils';
import '@fortawesome/fontawesome-free/css/all.min.css';
class SpecialtyPage extends Component {

    state = {
        dataSpecialty: []
    }

    async componentDidMount() {
        let res = await getAllSpecialty();
        if (res && res.errCode === 0) {
            this.setState({
                dataSpecialty: res.data
            });
        }
    }

    handleViewDetail = (item) => {
        this.props.history.push(`/detail-specialty/${item.id}`);
    }

    goToHome = () => {
        this.props.history.push(path.HOMEPAGE);
    }

    render() {
        const { dataSpecialty } = this.state;

        return (
            <div className="specialty-page-container">

                <div className="breadcrumb">
                    <span className="home-icon" onClick={this.goToHome}>
                        <i className="fa-solid fa-house"></i>
                    </span>
                    <span> / Chuyên khoa</span>
                </div>

                <h2 className="title">Chuyên khoa</h2>

                <div className="specialty-list">
                    {dataSpecialty && dataSpecialty.map((item, index) => {

                        let imageBase64 = '';
                        if (item.image) {
                            imageBase64 = `data:image/jpeg;base64,${item.image}`;
                        }

                        return (
                            <div
                                className="specialty-item"
                                key={index}
                                onClick={() => this.handleViewDetail(item)}
                            >

                                <div className="specialty-image">
                                    <img src={imageBase64} alt="" />
                                </div>

                                <div className="specialty-info">
                                    <div className="specialty-name">
                                        {item.name}
                                    </div>
                                </div>

                            </div>
                        )
                    })}
                </div>

            </div>
        );
    }
}

export default SpecialtyPage;

