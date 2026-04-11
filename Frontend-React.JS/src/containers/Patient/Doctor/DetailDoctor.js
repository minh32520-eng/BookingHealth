import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import HomeHeader from '../../HomePage/HomeHeader';
import './DetailDoctor.scss';
import { getDetailInforDoctor } from '../../../services/userService';
import { LANGUAGES } from '../../../utils';
import DoctorSchedule from './DoctorSchedule';
import DoctorExtrainfor from './DoctorExtrainfor';

class DetailDoctor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            detailDoctor: {},
            currentDoctorId: -1
        }
    }

    async componentDidMount() {
        if (this.props.match && this.props.match.params && this.props.match.params.id) {

            // Read the doctor id from the route so this page can be opened directly by URL.
            let id = this.props.match.params.id;

            this.setState({
                currentDoctorId: id
            });

            let res = await getDetailInforDoctor(id);

            if (res && res.errCode === 0) {
                // Keep the whole response because the child schedule/info blocks read different parts of it.
                this.setState({
                    detailDoctor: res.data,
                })
            }
        }
    }

    componentDidUpdate(prevProps) {
        const prevId = prevProps.match?.params?.id;
        const currentId = this.props.match?.params?.id;

        if (currentId && currentId !== prevId) {
            // Reload the page data when the route changes to another doctor without a full remount.
            this.componentDidMount();
        }
    }

    render() {
        let { language } = this.props;
        let { detailDoctor } = this.state;

        let imageBase64 = '';
        if (detailDoctor && detailDoctor.image) {
            // Doctor images still come back as base64 from the API, so convert them to a browser-safe src here.
            imageBase64 = `data:image/jpeg;base64,${detailDoctor.image}`;
        }

        let nameVi = '', nameEn = '';
        if (detailDoctor && detailDoctor.positionData) {
            nameVi = `${detailDoctor.positionData.valueVi}, ${detailDoctor.lastName} ${detailDoctor.firstName}`;
            nameEn = `${detailDoctor.positionData.valueEn}, ${detailDoctor.firstName} ${detailDoctor.lastName}`;
        }

        return (
            <>
                <HomeHeader isShowBanner={false} />

                <div className="doctor-detail-container">
                    <div className="intro-doctor">
                        <div
                            className="content-left"
                            style={{
                                backgroundImage: `url(${imageBase64})`
                            }}
                        >
                        </div>

                        <div className="content-right">
                            <div className="doctor-detail-badge">
                                <FormattedMessage id="patient.detail-doctor.profile" />
                            </div>

                            <div className="up">
                                {language === LANGUAGES.VI ? nameVi : nameEn}
                            </div>

                            <div className="down">
                                {detailDoctor && detailDoctor.Markdown
                                    && detailDoctor.Markdown.description &&
                                    <span>
                                        {detailDoctor.Markdown.description}
                                    </span>
                                }
                            </div>

                        </div>
                    </div>

                    <div className="schedule-doctor">
                        <div className="content-left">
                            <div className="detail-card-title">
                                <FormattedMessage id="patient.detail-doctor.schedule-title" />
                            </div>
                            <DoctorSchedule
                                doctorIdFromParent={this.state.currentDoctorId}
                            />
                        </div>

                        <div className="content-right">
                            <div className="detail-card-title">
                                <FormattedMessage id="patient.detail-doctor.extrainfo-title" />
                            </div>
                            <DoctorExtrainfor
                                doctorIdFromParent={this.state.currentDoctorId}
                            />
                        </div>

                    </div>

                    <div className="detail-infor-doctor">
                        <div className="detail-content-title">
                            <FormattedMessage id="patient.detail-doctor.information-title" />
                        </div>
                        {detailDoctor && detailDoctor.Markdown && detailDoctor.Markdown.contentHTML &&
                            <div
                                dangerouslySetInnerHTML={{ __html: detailDoctor.Markdown.contentHTML }}
                            />
                        }
                    </div>

                    <div className="comment-doctor">
                    </div>

                </div>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language
    };
};

export default connect(mapStateToProps)(DetailDoctor);
