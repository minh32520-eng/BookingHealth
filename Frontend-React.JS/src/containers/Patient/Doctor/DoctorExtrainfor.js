import React, { Component } from 'react';
import { connect } from "react-redux";
import './DoctorExtrainfor.scss';
import { LANGUAGES } from '../../../utils';
import { FormattedMessage } from 'react-intl';
import { NumericFormat } from 'react-number-format';
import { getExtraInforDoctorById } from '../../../services/userService';

class DoctorExtrainfor extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isShowDetailInfor: false,
            extraInfor: {}
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.doctorIdFromParent !== prevProps.doctorIdFromParent) {

            // FIX: check tồn tại
            if (this.props.doctorIdFromParent) {

                // reset UI trước khi call API
                this.setState({
                    extraInfor: {}
                });

                this.fetchExtraInfor(this.props.doctorIdFromParent);
            }
        }
    }

    //  tách async ra function riêng
    fetchExtraInfor = async (doctorId) => {
        try {
            let res = await getExtraInforDoctorById(doctorId);

            if (res && res.errCode === 0) {
                this.setState({
                    extraInfor: res.data || {}
                })
            }
        } catch (e) {
            console.log("getExtraInforDoctorById error:", e);
        }
    }

    showHideDetailInfor = (status) => {
        this.setState({
            isShowDetailInfor: status
        })
    }

    render() {
        let { isShowDetailInfor, extraInfor } = this.state;
        let { language } = this.props;

        return (
            <div className="doctor-extra-infor-container">

                <div className="content-up">

                    <div className="text-address">
                        <FormattedMessage id="patient.extra-infor-doctor.text-address" />
                    </div>

                    <div className="name-clinic">
                        {extraInfor?.nameClinic || ''}
                    </div>

                    <div className="detail-address">
                        {extraInfor?.addressClinic || ''}
                    </div>

                </div>

                <div className="content-down">

                    {!isShowDetailInfor &&
                        <>
                            <div className="short-infor">

                                <FormattedMessage id="patient.extra-infor-doctor.price" />

                                {extraInfor?.priceTypeData && language === LANGUAGES.VI &&
                                    <NumericFormat
                                        className="currency"
                                        value={extraInfor.priceTypeData.valueVi}
                                        displayType={'text'}
                                        thousandSeparator={true}
                                        suffix={' VND'}
                                    />
                                }

                                {extraInfor?.priceTypeData && language === LANGUAGES.EN &&
                                    <NumericFormat
                                        className="currency"
                                        value={extraInfor.priceTypeData.valueEn}
                                        displayType={'text'}
                                        thousandSeparator={true}
                                    />
                                }

                            </div>

                            <span
                                className="detail"
                                onClick={() => this.showHideDetailInfor(true)}
                            >
                                <FormattedMessage id="patient.extra-infor-doctor.detail" />
                            </span>
                        </>
                    }

                    {isShowDetailInfor &&
                        <>
                            <div className="title-price">
                                <FormattedMessage id="patient.extra-infor-doctor.price" />
                            </div>

                            <div className="detail-infor">

                                <div className="price">

                                    <span className="left">
                                        <FormattedMessage id="patient.extra-infor-doctor.price" />
                                    </span>

                                    <span className="right">

                                        {extraInfor?.priceTypeData && language === LANGUAGES.VI &&
                                            <NumericFormat
                                                className="currency"
                                                value={extraInfor.priceTypeData.valueVi}
                                                displayType={'text'}
                                                thousandSeparator={true}
                                                suffix={' VND'}
                                            />
                                        }

                                        {extraInfor?.priceTypeData && language === LANGUAGES.EN &&
                                            <NumericFormat
                                                className="currency"
                                                value={extraInfor.priceTypeData.valueEn}
                                                displayType={'text'}
                                                thousandSeparator={true}
                                            />
                                        }

                                    </span>

                                </div>

                                <div className="note">
                                    {extraInfor?.note || ''}
                                </div>

                                <div className="payment">

                                    <FormattedMessage id="patient.extra-infor-doctor.payment" />

                                    {extraInfor?.paymentTypeData && language === LANGUAGES.VI
                                        ? extraInfor.paymentTypeData.valueVi
                                        : ''}

                                    {extraInfor?.paymentTypeData && language === LANGUAGES.EN
                                        ? extraInfor.paymentTypeData.valueEn
                                        : ''}

                                </div>

                            </div>

                            <div className="hide-price">
                                <span onClick={() => this.showHideDetailInfor(false)}>
                                    <FormattedMessage id="patient.extra-infor-doctor.hide-price" />
                                </span>
                            </div>

                        </>
                    }

                </div>

            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language
    };
};

export default connect(mapStateToProps)(DoctorExtrainfor);