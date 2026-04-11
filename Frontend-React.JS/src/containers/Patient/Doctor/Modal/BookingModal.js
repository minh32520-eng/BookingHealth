import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import './BookingModal.scss';
import { Modal } from 'reactstrap';
import ProfileDoctor from '../ProfileDoctor';
import _ from 'lodash';

import DatePicker from '../../../../components/Input/DatePicker';

import * as actions from '../../../../store/actions'
import { LANGUAGES } from '../../../../utils';
import Select from 'react-select';

import { getAllCodeService, postPatientBookAppointment } from '../../../../services/userService';
import { toast } from 'react-toastify';
import moment from 'moment';

const DEFAULT_DOCTOR_NAME = {
    vi: 'Bac si',
    en: 'Doctor'
};

class BookingModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            fullName: '',
            phoneNumber: '',
            email: '',
            address: '',
            reason: '',
            birthday: '',
            selectedGender: null,
            genders: []
        }
    }

    async componentDidMount() {
        this.props.getGenders();
        await this.loadGenderOptions();

        const { userInfo } = this.props;
        if (userInfo) {
            const fullName = [userInfo.lastName, userInfo.firstName].filter(Boolean).join(' ').trim();
            const selectedGender = userInfo.gender
                ? { value: userInfo.gender, label: userInfo.gender }
                : null;

            this.setState({
                fullName: fullName || '',
                phoneNumber: userInfo.phoneNumber || '',
                email: userInfo.email || '',
                address: userInfo.address || '',
                selectedGender
            });
        }
    }

    loadGenderOptions = async () => {
        try {
            const res = await getAllCodeService('GENDER');
            if (res && res.errCode === 0) {
                this.setState({
                    genders: this.buildDataGender(res.data || [])
                });
            }
        } catch (error) {
            console.log('loadGenderOptions failed:', error);
        }
    }

    buildDataGender = (data) => {
        let result = [];
        let language = this.props.language;

        if (data && data.length > 0) {
            data.forEach(item => {
                result.push({
                    label: language === LANGUAGES.VI ? item.valueVi : item.valueEn,
                    value: item.keyMap
                });
            });
        }

        return result;
    }

    async componentDidUpdate(prevProps) {

        if (this.props.language !== prevProps.language) {
            this.setState({
                genders: this.buildDataGender(this.props.genders)
            })
        }

        if (this.props.genders !== prevProps.genders) {
            const nextGenders = this.buildDataGender(this.props.genders);
            this.setState({
                genders: nextGenders
            }, async () => {
                if (this.state.selectedGender?.value) {
                    const matchedGender = nextGenders.find(item => item.value === this.state.selectedGender.value);
                    if (matchedGender) {
                        this.setState({ selectedGender: matchedGender });
                    }
                }

                if (!nextGenders || nextGenders.length === 0) {
                    await this.loadGenderOptions();
                }
            })
        }

    }

    handleOnchangeInput = (event, id) => {

        this.setState({
            [id]: event.target.value
        })
    }

    handleOnchangeDatePicker = (date) => {

        this.setState({
            birthday: date[0]
        })
    }

    handleChangeSelect = (selectedOption) => {

        this.setState({
            selectedGender: selectedOption
        });
    }

    buildTimeBooking = (dataTime) => {
        let { language } = this.props;

        if (dataTime && !_.isEmpty(dataTime) && dataTime.timeTypeData && dataTime.date) {

            let time = language === LANGUAGES.VI
                ? dataTime.timeTypeData.valueVi
                : dataTime.timeTypeData.valueEn;

            let date = language === LANGUAGES.VI
                ? moment.unix(+dataTime.date / 1000).format('dddd - DD/MM/YYYY')
                : moment.unix(+dataTime.date / 1000).locale('en').format('ddd - MM/DD/YYYY');

            return `${time} - ${date}`;
        }

        return '';
    }

    buildDoctorName = (dataTime) => {
        let { language } = this.props;

        if (dataTime && !_.isEmpty(dataTime) && dataTime.doctorData) {
            const firstName = dataTime.doctorData.firstName || '';
            const lastName = dataTime.doctorData.lastName || '';

            return language === LANGUAGES.VI
                ? `${lastName} ${firstName}`.trim()
                : `${firstName} ${lastName}`.trim();
        }

        return language === LANGUAGES.VI ? DEFAULT_DOCTOR_NAME.vi : DEFAULT_DOCTOR_NAME.en;
    }
    handleConfirmBooking = async () => {
        const currentDataTime = this.props.dataTime || {};
        const doctorId = currentDataTime.doctorId;
        const timeType = currentDataTime.timeType;

        if (!this.state.fullName || !this.state.phoneNumber || !this.state.email || !this.state.address || !this.state.reason) {
            toast.error('Please fill in all required information!');
            return;
        }

        if (!this.state.birthday) {
            toast.error('Please choose your birthday!');
            return;
        }

        if (!this.state.selectedGender) {
            toast.error('Please choose your gender!');
            return;
        }

        if (!doctorId || !timeType || _.isEmpty(currentDataTime)) {
            toast.error('Schedule information is missing!');
            return;
        }

        let scheduleDate = currentDataTime.date;
        let timeString = this.buildTimeBooking(currentDataTime);

        if (!timeString) {
            toast.error('Schedule information is missing!');
            return;
        }

        if (!scheduleDate) {
            toast.error('Schedule information is missing!');
            return;
        }

        let res = await postPatientBookAppointment({
            patientId: this.props.userInfo?.id,
            fullName: this.state.fullName,
            phoneNumber: this.state.phoneNumber,
            email: this.state.email.trim().toLowerCase(),
            address: this.state.address,
            reason: this.state.reason,
            birthday: new Date(this.state.birthday).getTime(),
            date: scheduleDate,
            selectedGender: this.state.selectedGender?.value,
            doctorId: doctorId,
            timeType: timeType,
            language: this.props.language,
            timeString: timeString,
            doctorName: this.buildDoctorName(currentDataTime)
        });

        if (res && res.errCode === 0) {

            toast.success('Booking a new appointment succeed!');
            if (this.props.reloadSchedule) {
                await this.props.reloadSchedule();
            }
            this.props.closeBookingClose();

        } else {
            const errMessage = res?.errMessage || 'Booking a new appointment error!';

            if (
                errMessage === 'Selected schedule is not available' ||
                errMessage === 'Cannot book past schedules' ||
                errMessage === 'This schedule is fully booked'
            ) {
                toast.error('This schedule is no longer available. Please choose another time slot.');

                if (this.props.reloadSchedule) {
                    await this.props.reloadSchedule();
                }

                this.props.closeBookingClose();
                return;
            }

            toast.error(errMessage);
        }
    }

    render() {

        let { isOpenModal, closeBookingClose, dataTime } = this.props;

        let doctorId = '';

        if (dataTime && !_.isEmpty(dataTime)) {

            doctorId = dataTime.doctorId;
        }

        return (

            <Modal
                isOpen={isOpenModal}
                className={'booking-modal-container'}
                size="lg"
                centered
            >

                <div className="booking-modal-content">

                    <div className="booking-modal-header">

                        <span className="left">

                            <FormattedMessage id="patient.booking-modal.title" />

                        </span>

                        <span
                            className="right"
                            onClick={closeBookingClose}
                        >

                            <i className="fas fa-times"></i>

                        </span>

                    </div>

                    <div className="booking-modal-body">

                        <div className="doctor-infor booking-summary-card">

                            <ProfileDoctor
                                doctorId={doctorId}
                                isShowDescriptionDoctor={false}
                                dataTime={dataTime}
                            />

                        </div>

                        <div className="price booking-price-tag">

                            <FormattedMessage id="patient.booking-modal.priceBooking" />

                        </div>

                        <div className="row booking-form-grid">

                            <div className="col-6 form-group">

                                <label>

                                    <FormattedMessage id="patient.booking-modal.fullName" />

                                </label>

                                <input
                                    className="form-control"
                                    value={this.state.fullName}
                                    onChange={(event) => this.handleOnchangeInput(event, 'fullName')}
                                />

                            </div>

                            <div className="col-6 form-group">

                                <label>

                                    <FormattedMessage id="patient.booking-modal.phoneNumber" />

                                </label>

                                <input
                                    className="form-control"
                                    value={this.state.phoneNumber}
                                    onChange={(event) => this.handleOnchangeInput(event, 'phoneNumber')}
                                />

                            </div>

                            <div className="col-6 form-group">

                                <label>

                                    <FormattedMessage id="patient.booking-modal.email" />

                                </label>

                                <input
                                    className="form-control"
                                    value={this.state.email}
                                    onChange={(event) => this.handleOnchangeInput(event, 'email')}
                                />

                            </div>

                            <div className="col-6 form-group">

                                <label>

                                    <FormattedMessage id="patient.booking-modal.address" />

                                </label>

                                <input
                                    className="form-control"
                                    value={this.state.address}
                                    onChange={(event) => this.handleOnchangeInput(event, 'address')}
                                />

                            </div>

                            <div className="col-12 form-group">

                                <label>

                                    <FormattedMessage id="patient.booking-modal.reason" />

                                </label>

                                <input
                                    className="form-control"
                                    onChange={(event) => this.handleOnchangeInput(event, 'reason')}
                                />

                            </div>

                            <div className="col-6 form-group">

                                <label>

                                    <FormattedMessage id="patient.booking-modal.birthday" />

                                </label>

                                <DatePicker
                                    onChange={this.handleOnchangeDatePicker}
                                    className="form-control"
                                />

                            </div>

                            <div className="col-6 form-group">

                                <label>

                                    <FormattedMessage id="patient.booking-modal.gender" />

                                </label>

                                <Select
                                    value={this.state.selectedGender}
                                    onChange={this.handleChangeSelect}
                                    options={this.state.genders}
                                />

                            </div>

                        </div>

                        <div className="booking-modal-footer">

                            <button
                                className="btn-booking-confirm"
                                onClick={this.handleConfirmBooking}
                            >

                                <FormattedMessage id="patient.booking-modal.btnConfirm" />

                            </button>

                            <button
                                className="btn-booking-cancel"
                                onClick={closeBookingClose}
                            >

                                <FormattedMessage id="patient.booking-modal.btnCancel" />

                            </button>

                        </div>

                    </div>

                </div>

            </Modal>

        )
    }
}

const mapStateToProps = state => {

    return {

        language: state.app.language,
        genders: state.admin.genders,
        userInfo: state.user.userInfo

    };
};

const mapDispatchToProps = dispatch => {

    return {

        getGenders: () => dispatch(actions.fetchGenderStart())

    };
};

export default connect(mapStateToProps, mapDispatchToProps)(BookingModal);
