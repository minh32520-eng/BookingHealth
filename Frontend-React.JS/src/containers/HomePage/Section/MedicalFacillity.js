import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import './MedicalFacillity.scss';
import Slider from "react-slick";
class MedicalFacillity extends Component {

    render() {
        return (
            <div>
                <div className=" section-share section-medical-facility">
                    <div className="section-container">
                        <div className="section-header">
                            <span className="title-section">Co so y te noi bat </span>
                            <button className="btn-section">Xem them </button>
                        </div>
                        <div className="section-body">
                            <Slider {...this.props.settings}>
                                <div className="section-customize">
                                    <div className="bg-image section-medical-facility">
                                        <div>He thong y te  </div>
                                    </div>
                                </div>
                                <div className="section-customize">
                                    <div className="bg-image section-medical-facility">
                                        <div>He thong y te </div>
                                    </div>
                                </div>
                                <div className="section-customize">
                                    <div className="bg-image section-medical-facility">
                                        <div>He thong y te  </div>
                                    </div>
                                </div>
                                <div className="section-customize">
                                    <div className="bg-image section-medical-facility">
                                        <div>He thong y te  </div>
                                    </div>
                                </div>
                                <div className="section-customize">
                                    <div className="bg-image section-medical-facility">
                                        <div>He thong y te </div>
                                    </div>
                                </div>
                                <div className="section-customize">
                                    <div className="bg-image section-medical-facility">
                                        <div>He thong y te  </div>
                                    </div>
                                </div>


                            </Slider>
                        </div>
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

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MedicalFacillity);
