import React, { Component } from 'react';
import { connect } from "react-redux";
import './ManageSchedule.scss';
import { FormattedMessage } from 'react-intl';
import Select from 'react-select';
import * as actions from "../../../store/actions";
import { LANGUAGES } from '../../../utils';
import DatePicker from '../../../components/Input/DatePicker';
import moment from 'moment';
import { toast } from 'react-toastify';
import _ from 'lodash';
import { saveBulkScheduleDoctor } from '../../../services/userService';

class ManageSchedule extends Component {

    constructor(props) {
        super(props);
        this.state = {
            listDoctors: [],
            selectedDoctor: null, // ✅ FIX
            currentDate: '',
            rangeTime: []
        }
    }

    componentDidMount() {
        this.props.fetchAllDoctors();
        this.props.fetchAllScheduleTime();
    }

    componentDidUpdate(prevProps) {

        // ✅ FIX ALL DOCTORS
        if (prevProps.allDoctors !== this.props.allDoctors) {

            let doctors = this.props.allDoctors;

            // 🔥 normalize data giống ManageDoctor
            if (!Array.isArray(doctors)) {
                doctors = doctors?.data || doctors?.doctors || [];
            }

            let dataSelect = this.buildDataInputSelect(doctors);

            this.setState({
                listDoctors: dataSelect
            })
        }

        // ✅ FIX TIME
        if (prevProps.allScheduleTime !== this.props.allScheduleTime) {
            let data = this.props.allScheduleTime;

            if (data && data.length > 0) {
                data = data.map(item => ({
                    ...item,
                    isSelected: false
                }))
            }

            this.setState({
                rangeTime: data
            })
        }
    }

    buildDataInputSelect = (inputData) => {
        let result = [];
        let { language } = this.props;

        // ✅ chống crash
        if (!Array.isArray(inputData)) return result;

        inputData.forEach((item) => {

            let labelVi = `${item.lastName || ''} ${item.firstName || ''}`;
            let labelEn = `${item.firstName || ''} ${item.lastName || ''}`;

            result.push({
                label: language === LANGUAGES.VI ? labelVi : labelEn,
                value: item.id
            });
        });

        return result;
    }

    handleChangeSelect = (selectedOption) => {
        this.setState({
            selectedDoctor: selectedOption
        })
    }

    handleOnchangeDatePicker = (date) => {
        this.setState({
            currentDate: date[0]
        })
    }

    handleClickBtnTime = (time) => {

        let { rangeTime } = this.state;

        if (rangeTime && rangeTime.length > 0) {

            rangeTime = rangeTime.map(item => {

                if (item.id === time.id) {
                    item.isSelected = !item.isSelected;
                }

                return item;
            })

            this.setState({
                rangeTime: rangeTime
            })
        }
    }

    handleSaveSchedule = async () => {

        let { rangeTime, selectedDoctor, currentDate } = this.state;
        let result = [];

        if (!currentDate) {
            toast.error("Invalid date!");
            return;
        }

        if (!selectedDoctor) { // ✅ FIX
            toast.error("Invalid selected doctor!");
            return;
        }

        let formatedDate = new Date(currentDate).getTime();

        if (rangeTime && rangeTime.length > 0) {

            let selectedTime = rangeTime.filter(item => item.isSelected === true);

            if (selectedTime && selectedTime.length > 0) {

                selectedTime.forEach(schedule => {

                    let object = {};

                    object.doctorId = selectedDoctor.value;
                    object.date = formatedDate;
                    object.timeType = schedule.keyMap;

                    result.push(object);
                })

            } else {
                toast.error("Invalid selected time!");
                return;
            }
        }

        let res = await saveBulkScheduleDoctor({
            arrSchedule: result,
            doctorId: selectedDoctor.value,
            formatedDate: formatedDate
        })

        if (res && res.errCode === 0) {
            toast.success("Save Infor succeed!");
        } else {
            toast.error("error saveBulkScheduleDoctor");
            console.log("error saveBulkScheduleDoctor >>> res: ", res);
        }
    }

    render() {

        let { rangeTime } = this.state;
        let { language } = this.props;
        let yesterday = new Date(new Date().setDate(new Date().getDate() - 1))

        return (
            <div className="manage-schedule-container">

                <div className="m-s-title">
                    <FormattedMessage id="manage-schedule.title" />
                </div>

                <div className="container">
                    <div className="row">

                        <div className="col-6 form-group">
                            <label>
                                <FormattedMessage id="manage-schedule.choose-doctor" />
                            </label>

                            <Select
                                value={this.state.selectedDoctor}
                                onChange={this.handleChangeSelect}
                                options={this.state.listDoctors}
                            />
                        </div>

                        <div className="col-6 form-group">
                            <label>
                                <FormattedMessage id="manage-schedule.choose-date" />
                            </label>

                            <DatePicker
                                onChange={this.handleOnchangeDatePicker}
                                className="form-control"
                                value={this.state.currentDate}
                                minDate={yesterday}
                            />
                        </div>

                        <div className="col-12 pick-hour-container">

                            {rangeTime && rangeTime.length > 0 &&
                                rangeTime.map((item, index) => {

                                    return (
                                        <button
                                            key={index}
                                            className={item.isSelected
                                                ? "btn btn-schedule active"
                                                : "btn btn-schedule"}
                                            onClick={() => this.handleClickBtnTime(item)}
                                        >
                                            {language === LANGUAGES.VI ? item.valueVi : item.valueEn}
                                        </button>
                                    )
                                })
                            }

                        </div>

                        <div className="col-12">

                            <button
                                className="btn btn-primary btn-save-schedule"
                                onClick={this.handleSaveSchedule}
                            >
                                Save
                            </button>

                        </div>

                    </div>
                </div>

            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        language: state.app.language,
        allDoctors: state.admin.allDoctors,
        allScheduleTime: state.admin.allScheduleTime,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchAllDoctors: () => dispatch(actions.fetchAllDoctors()),
        fetchAllScheduleTime: () => dispatch(actions.fetchAllScheduleTime()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageSchedule);