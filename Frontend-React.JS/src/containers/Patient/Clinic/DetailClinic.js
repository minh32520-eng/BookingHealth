import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { FormattedMessage, injectIntl } from 'react-intl';
import HomeHeader from '../../HomePage/HomeHeader';
import { getDetailClinicById } from '../../../services/userService';
import { path } from '../../../utils';
import './DetailClinic.scss';

class DetailClinic extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            errMessage: '',
            dataDetailClinic: null
        };
    }

    getClinicId = () => {
        return this.props.match?.params?.id;
    }

    buildClinicImage = (image) => {
        if (!image) return '';
        if (image.startsWith('data:image')) return image;
        return `data:image/jpeg;base64,${image}`;
    }

    loadClinicDetail = async () => {
        const id = this.getClinicId();

        if (!id) {
            this.setState({
                loading: false,
                errMessage: 'missing_clinic_id',
                dataDetailClinic: null
            });
            return;
        }

        this.setState({
            loading: true,
            errMessage: '',
            dataDetailClinic: null
        });

        try {
            const res = await getDetailClinicById(id);
            if (res && res.errCode === 0 && res.data) {
                this.setState({
                    loading: false,
                    errMessage: '',
                    dataDetailClinic: res.data
                });
            } else {
                this.setState({
                    loading: false,
                    errMessage: (res && res.errMessage) || 'clinic_load_failed',
                    dataDetailClinic: null
                });
            }
        } catch (e) {
            this.setState({
                loading: false,
                errMessage: 'server_connection_error',
                dataDetailClinic: null
            });
        }
    }

    componentDidMount() {
        this.loadClinicDetail();
    }

    componentDidUpdate(prevProps) {
        const prevId = prevProps.match?.params?.id;
        const currentId = this.getClinicId();

        if (currentId && currentId !== prevId) {
            this.loadClinicDetail();
        }
    }

    renderDoctors = (doctors) => {
        if (!doctors || doctors.length === 0) {
            return (
                <div className="doctor-item">
                    <div className="doctor-desc"><FormattedMessage id="patient.detail-clinic.no-doctors" /></div>
                </div>
            );
        }

        return doctors.map((item, index) => {
            const doctor = item?.doctorData;
            const doctorName = [doctor?.firstName, doctor?.lastName].filter(Boolean).join(' ').trim();

            return (
                <div key={index} className="doctor-item">
                    <div className="doctor-name">
                        {doctorName || <FormattedMessage id="patient.detail-clinic.doctor-fallback" />}
                    </div>

                    <div className="doctor-desc">
                        {doctor?.Markdown?.description || <FormattedMessage id="patient.detail-common.no-description" />}
                    </div>
                </div>
            );
        });
    }

    render() {
        const { loading, errMessage, dataDetailClinic } = this.state;
        const clinicImage = this.buildClinicImage(dataDetailClinic?.image);
        const clinicDescription =
            dataDetailClinic?.descriptionHTML ||
            dataDetailClinic?.descriptionMarkdown ||
            dataDetailClinic?.description ||
            '';

        const errorMessageIdMap = {
            missing_clinic_id: 'patient.detail-clinic.missing-id',
            clinic_load_failed: 'patient.detail-clinic.load-failed',
            server_connection_error: 'patient.detail-common.server-error'
        };
        const errorMessageId = errorMessageIdMap[errMessage];

        return (
            <>
                <HomeHeader isShowBanner={false} />

                <div className="detail-clinic-container">
                    <div className="detail-clinic-breadcrumb">
                        <Link to={path.HOMEPAGE}><FormattedMessage id="patient.detail-common.home" /></Link>
                        <span> / </span>
                        <span><FormattedMessage id="patient.detail-clinic.page-title" /></span>
                        {!loading && dataDetailClinic?.name && (
                            <>
                                <span> / </span>
                                <span>{dataDetailClinic.name}</span>
                            </>
                        )}
                    </div>
                    {loading && <div className="clinic-state-message"><FormattedMessage id="patient.detail-common.loading" /></div>}

                    {!loading && errMessage && <div className="clinic-state-message clinic-state-error">{errorMessageId ? <FormattedMessage id={errorMessageId} /> : errMessage}</div>}

                    {!loading && !errMessage && dataDetailClinic && (
                        <>
                            <div
                                className="clinic-banner"
                                style={{
                                    backgroundImage: clinicImage ? `url(${clinicImage})` : undefined
                                }}
                            >
                                <div className="clinic-banner-content">
                                    <div className="clinic-label">
                                        <FormattedMessage id="patient.detail-clinic.page-title" />
                                    </div>
                                    <div className="clinic-name">
                                        {dataDetailClinic.name || ''}
                                    </div>
                                </div>
                            </div>

                            <div className="clinic-description">
                                <div className="clinic-section-head">
                                    <div className="clinic-section-title">
                                        <FormattedMessage id="patient.detail-clinic.about-title" />
                                    </div>
                                </div>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: clinicDescription || `<p>${this.props.intl.formatMessage({ id: 'patient.detail-common.no-description' })}</p>`
                                    }}
                                />
                            </div>

                            <div className="clinic-doctor-list">
                                <div className="clinic-section-title"><FormattedMessage id="patient.detail-clinic.doctors-title" /></div>
                                {this.renderDoctors(dataDetailClinic.doctorClinic)}
                            </div>
                        </>
                    )}
                </div>
            </>
        );
    }
}

export default injectIntl(connect(null, null)(DetailClinic));
