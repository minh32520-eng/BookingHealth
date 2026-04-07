import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import './TableManageUser.scss';
import * as actions from "../../../store/actions";
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import './ManageDoctor.scss';
import Select from 'react-select';
import { LANGUAGES, CRUD_ACTIONS } from '../../../utils/constant';
import { getDetailInforDoctor, getAllClinic } from '../../../services/userService';

// convert markdown sang HTML
const markdownParser = new MarkdownIt();

class ManageDoctor extends Component {

    constructor(props) {
        super(props);

        this.state = {
            contentMarkdown: '',
            contentHTML: '',

            selectedDoctor: null, // doctor đang chọn
            description: '',
            doctorOptions: [],
            hasExistingData: false, // phân biệt create hay edit

            priceOptions: [],
            paymentOptions: [],
            provinceOptions: [],
            selectedPrice: null,
            selectedPayment: null,
            selectedProvince: null,

            clinicOptions: [], // danh sách clinic từ DB
            selectedClinic: null,

            clinicName: '',
            clinicAddress: '',
            note: ''
        };
    }

    async componentDidMount() {
        this.props.fetchAllDoctors();
        this.props.getAllRequiredDoctorInfor();

        // load clinic từ database
        const clinicResponse = await getAllClinic();

        if (clinicResponse && clinicResponse.errCode === 0) {
            this.setState({
                clinicOptions: this.buildSelectOptions(clinicResponse.data, 'CLINIC')
            });
        }
    }

    componentDidUpdate(prevProps) {

        if (prevProps.allDoctors !== this.props.allDoctors) {
            this.setState({
                doctorOptions: this.buildSelectOptions(this.props.allDoctors, 'DOCTOR')
            });
        }

        if (prevProps.allRequiredDoctorInfor !== this.props.allRequiredDoctorInfor) {
            const { resPayment, resPrice, resProvince } = this.props.allRequiredDoctorInfor;

            this.setState({
                priceOptions: this.buildSelectOptions(resPrice, 'PRICE'),
                paymentOptions: this.buildSelectOptions(resPayment, 'PAYMENT'),
                provinceOptions: this.buildSelectOptions(resProvince, 'PROVINCE')
            });
        }

        if (prevProps.language !== this.props.language) {
            const { resPayment, resPrice, resProvince } = this.props.allRequiredDoctorInfor;

            this.setState({
                doctorOptions: this.buildSelectOptions(this.props.allDoctors, 'DOCTOR'),
                priceOptions: this.buildSelectOptions(resPrice, 'PRICE'),
                paymentOptions: this.buildSelectOptions(resPayment, 'PAYMENT'),
                provinceOptions: this.buildSelectOptions(resProvince, 'PROVINCE')
            });
        }
    }

    buildSelectOptions = (inputData, type) => {
        const result = [];
        const { language } = this.props;

        if (!inputData) return result;

        if (type === 'DOCTOR') {
            inputData.forEach(doctor => {
                result.push({
                    label: language === LANGUAGES.VI
                        ? `${doctor.lastName} ${doctor.firstName}`
                        : `${doctor.firstName} ${doctor.lastName}`,
                    value: doctor.id
                });
            });
        }

        if (type === 'PRICE') {
            inputData.forEach(price => {
                result.push({
                    label: language === LANGUAGES.VI
                        ? price.valueVi
                        : `${price.valueEn} USD`,
                    value: price.keyMap
                });
            });
        }

        if (type === 'PAYMENT' || type === 'PROVINCE') {
            inputData.forEach(item => {
                result.push({
                    label: language === LANGUAGES.VI ? item.valueVi : item.valueEn,
                    value: item.keyMap
                });
            });
        }

        if (type === 'CLINIC') {
            inputData.forEach(clinic => {
                result.push({
                    label: `${clinic.name} - ${clinic.address}`,
                    value: clinic.id,
                    address: clinic.address
                });
            });
        }

        return result;
    }

    handleEditorChange = ({ html, text }) => {
        this.setState({
            contentMarkdown: text,
            contentHTML: html
        });
    }

    handleSaveDoctorInformation = () => {

        // bắt buộc phải chọn doctor
        if (!this.state.selectedDoctor) {
            alert("Please select a doctor!");
            return;
        }

        this.props.saveDetailDoctor({
            contentHTML: this.state.contentHTML,
            contentMarkdown: this.state.contentMarkdown,
            description: this.state.description,

            doctorId: this.state.selectedDoctor?.value,
            action: this.state.hasExistingData ? CRUD_ACTIONS.EDIT : CRUD_ACTIONS.CREATE,

            selectedPrice: this.state.selectedPrice?.value,
            selectedPayment: this.state.selectedPayment?.value,
            selectedProvince: this.state.selectedProvince?.value,

            clinicId: this.state.selectedClinic?.value,
            clinicName: this.state.clinicName,
            clinicAddress: this.state.clinicAddress,

            note: this.state.note
        });
    }

    handleDoctorSelection = async (selectedDoctor) => {

        this.setState({ selectedDoctor });

        const response = await getDetailInforDoctor(selectedDoctor.value);

        // nếu có dữ liệu thì fill lại form
        if (response && response.errCode === 0 && response.data) {

            const doctorInfo = response.data.Doctor_Infor || {};

            const selectedPrice = this.state.priceOptions.find(item => item.value === doctorInfo.priceId);
            const selectedPayment = this.state.paymentOptions.find(item => item.value === doctorInfo.paymentId);
            const selectedProvince = this.state.provinceOptions.find(item => item.value === doctorInfo.provinceId);
            const selectedClinic = this.state.clinicOptions.find(item => item.value === doctorInfo.clinicId);

            this.setState({
                contentHTML: response.data.Markdown?.contentHTML || '',
                contentMarkdown: response.data.Markdown?.contentMarkdown || '',
                description: response.data.Markdown?.description || '',
                hasExistingData: true,

                clinicName: doctorInfo.nameClinic || '',
                clinicAddress: doctorInfo.addressClinic || '',
                note: doctorInfo.note || '',

                selectedPrice,
                selectedPayment,
                selectedProvince,
                selectedClinic
            });

        } else {
            // reset form khi chưa có dữ liệu
            this.setState({
                contentHTML: '',
                contentMarkdown: '',
                description: '',
                hasExistingData: false,

                clinicName: '',
                clinicAddress: '',
                note: '',

                selectedPrice: null,
                selectedPayment: null,
                selectedProvince: null,
                selectedClinic: null
            });
        }
    }

    handleClinicSelection = (selectedClinic) => {
        this.setState({
            selectedClinic,
            clinicName: selectedClinic?.label,
            clinicAddress: selectedClinic?.address
        });
    }

    handleSelectChange = (selectedOption, fieldName) => {
        this.setState({
            [fieldName.name]: selectedOption
        });
    }

    handleInputChange = (event, fieldName) => {
        this.setState({
            [fieldName]: event.target.value
        });
    }

    render() {

        const { hasExistingData } = this.state;

        return (
            <div className="manage-doctor-container">

                <div className="manage-doctor-title">
                    <FormattedMessage id="admin.manage-doctor.title" />
                </div>

                <div className="more-infor">

                    <div className="content-left form-group">
                        <label><FormattedMessage id="admin.manage-doctor.select-doctor" /></label>
                        <Select
                            value={this.state.selectedDoctor}
                            onChange={this.handleDoctorSelection}
                            options={this.state.doctorOptions}
                        />
                    </div>

                    <div className="content-right">
                        <label><FormattedMessage id="admin.manage-doctor.intro" /></label>
                        <textarea
                            className="form-control"
                            value={this.state.description}
                            onChange={(e) => this.handleInputChange(e, 'description')}
                        />
                    </div>

                </div>

                <div className="row more-infor-extra">

                    <div className="col-4 form-group">
                        <label>Clinic</label>
                        <Select
                            value={this.state.selectedClinic}
                            onChange={this.handleClinicSelection}
                            options={this.state.clinicOptions}
                        />
                    </div>

                    <div className="col-4 form-group">
                        <label><FormattedMessage id="admin.manage-doctor.price" /></label>
                        <Select
                            value={this.state.selectedPrice}
                            onChange={this.handleSelectChange}
                            options={this.state.priceOptions}
                            name="selectedPrice"
                        />
                    </div>

                    <div className="col-4 form-group">
                        <label><FormattedMessage id="admin.manage-doctor.payment" /></label>
                        <Select
                            value={this.state.selectedPayment}
                            onChange={this.handleSelectChange}
                            options={this.state.paymentOptions}
                            name="selectedPayment"
                        />
                    </div>

                    <div className="col-4 form-group">
                        <label><FormattedMessage id="admin.manage-doctor.province" /></label>
                        <Select
                            value={this.state.selectedProvince}
                            onChange={this.handleSelectChange}
                            options={this.state.provinceOptions}
                            name="selectedProvince"
                        />
                    </div>

                    <div className="col-4 form-group">
                        <label><FormattedMessage id="admin.manage-doctor.note" /></label>
                        <input
                            className="form-control"
                            value={this.state.note}
                            onChange={(e) => this.handleInputChange(e, 'note')}
                        />
                    </div>

                </div>

                <MdEditor
                    style={{ height: '500px' }}
                    renderHTML={(text) => markdownParser.render(text)}
                    value={this.state.contentMarkdown}
                    onChange={this.handleEditorChange}
                />

                <button
                    onClick={this.handleSaveDoctorInformation}
                    className={hasExistingData ? "save-content-doctor" : "create-content-doctor"}
                >
                    {hasExistingData ? "Save" : "Add"}
                </button>

            </div>
        );
    }
}

const mapStateToProps = state => ({
    language: state.app.language,
    allDoctors: state.admin.allDoctors,
    allRequiredDoctorInfor: state.admin.allRequiredDoctorInfor
});

const mapDispatchToProps = dispatch => ({
    fetchAllDoctors: () => dispatch(actions.fetchAllDoctors()),
    getAllRequiredDoctorInfor: () => dispatch(actions.getRequiredDoctorInfor()),
    saveDetailDoctor: (data) => dispatch(actions.saveDetailDoctor(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageDoctor);