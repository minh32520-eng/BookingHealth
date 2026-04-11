import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { toast } from 'react-toastify';
import { CommonUtils, USER_ROLE } from '../../../utils';
import * as actions from '../../../store/actions';
import { getAllCodeService, getProfileDoctorById, updateDoctorProfile } from '../../../services/userService';
import './DoctorProfile.scss';

class DoctorProfile extends Component {
    state = {
        loading: true,
        saving: false,
        genderOptions: [],
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        gender: '',
        image: '',
        previewImageUrl: ''
    };

    async componentDidMount() {
        // Load static select data first, then hydrate the doctor profile bound to the logged-in account.
        await this.loadGenderOptions();
        await this.loadProfile();
    }

    getDoctorId = () => {
        const { userInfo } = this.props;
        // This page is doctor-only, so always resolve the active profile from the logged-in doctor account.
        if (userInfo && userInfo.roleId === USER_ROLE.DOCTOR) {
            return userInfo.id;
        }
        return null;
    }

    loadGenderOptions = async () => {
        // Gender options still come from the shared allcode table to stay consistent with the rest of the app.
        const res = await getAllCodeService('GENDER');
        if (res && res.errCode === 0) {
            this.setState({
                genderOptions: res.data || []
            });
        }
    }

    loadProfile = async () => {
        const doctorId = this.getDoctorId();
        if (!doctorId) {
            this.setState({ loading: false });
            return;
        }

        this.setState({ loading: true });
        try {
            const res = await getProfileDoctorById(doctorId);
            if (res && res.errCode === 0) {
                const data = res.data || {};
                // Convert the stored base64 avatar into a browser-friendly preview URL for the profile card.
                const image = data.image ? `data:image/jpeg;base64,${data.image}` : '';
                this.setState({
                    loading: false,
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    email: data.email || '',
                    phoneNumber: data.phoneNumber || '',
                    address: data.address || '',
                    gender: data.gender || '',
                    previewImageUrl: image,
                    image: data.image || ''
                });
                return;
            }
            this.setState({ loading: false });
        } catch (error) {
            this.setState({ loading: false });
        }
    }

    handleOnChangeInput = (event, field) => {
        // A generic handler is enough because the form fields map directly to state keys.
        this.setState({
            [field]: event.target.value
        });
    }

    handleOnChangeImage = async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        // Keep both base64 and object URL: base64 for saving, object URL for instant local preview.
        const base64 = await CommonUtils.getBase64(file);
        const objectUrl = URL.createObjectURL(file);

        this.setState({
            image: base64,
            previewImageUrl: objectUrl
        });
    }

    handleSaveProfile = async () => {
        const doctorId = this.getDoctorId();
        const { firstName, lastName, email, phoneNumber, address, gender, image } = this.state;

        if (!doctorId || !firstName || !lastName || !email) {
            toast.error(this.props.intl.formatMessage({ id: 'doctor.profile.messages.missing-fields' }));
            return;
        }

        this.setState({ saving: true });
        try {
            // Update the backend profile, then mirror the essential fields into the auth user snapshot.
            const res = await updateDoctorProfile({
                id: doctorId,
                firstName,
                lastName,
                email,
                phoneNumber,
                address,
                gender,
                image
            });

            if (res && res.errCode === 0) {
                const userPayload = {
                    ...this.props.userInfo,
                    firstName: res.data?.firstName || firstName,
                    lastName: res.data?.lastName || lastName,
                    email: res.data?.email || email,
                    image: res.data?.image || image
                };
                // Refresh Redux auth data so headers and account widgets immediately show the new profile info.
                this.props.userLoginSuccess(userPayload);
                toast.success(this.props.intl.formatMessage({ id: 'doctor.profile.messages.save-success' }));
                await this.loadProfile();
            } else {
                toast.error(res?.errMessage || this.props.intl.formatMessage({ id: 'doctor.profile.messages.save-failed' }));
            }
        } catch (error) {
            toast.error(this.props.intl.formatMessage({ id: 'doctor.profile.messages.save-failed' }));
        } finally {
            this.setState({ saving: false });
        }
    }

    render() {
        const { loading, saving, genderOptions, firstName, lastName, email, phoneNumber, address, gender, previewImageUrl } = this.state;
        const { language } = this.props;

        return (
            <div className="doctor-profile-page">
                <div className="doctor-profile-shell">
                    <div className="doctor-profile-hero">
                        <div>
                            <div className="doctor-profile-eyebrow"><FormattedMessage id="doctor.profile.eyebrow" /></div>
                            <h1><FormattedMessage id="doctor.profile.title" /></h1>
                            <p><FormattedMessage id="doctor.profile.subtitle" /></p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="doctor-profile-state"><FormattedMessage id="doctor.profile.loading" /></div>
                    ) : (
                        <div className="doctor-profile-card">
                            <div className="doctor-profile-grid">
                                <div className="profile-avatar-panel">
                                    <div
                                        className="profile-avatar-preview"
                                        style={previewImageUrl ? { backgroundImage: `url(${previewImageUrl})` } : {}}
                                    />
                                    <label className="upload-avatar-btn">
                                        <FormattedMessage id="doctor.profile.form.image" />
                                        <input type="file" hidden accept="image/*" onChange={this.handleOnChangeImage} />
                                    </label>
                                </div>

                                <div className="profile-form-panel">
                                    <div className="profile-form-grid">
                                        <div className="form-group">
                                            <label><FormattedMessage id="doctor.profile.form.first-name" /></label>
                                            <input value={firstName} onChange={(event) => this.handleOnChangeInput(event, 'firstName')} />
                                        </div>
                                        <div className="form-group">
                                            <label><FormattedMessage id="doctor.profile.form.last-name" /></label>
                                            <input value={lastName} onChange={(event) => this.handleOnChangeInput(event, 'lastName')} />
                                        </div>
                                        <div className="form-group">
                                            <label><FormattedMessage id="doctor.profile.form.email" /></label>
                                            <input value={email} disabled />
                                        </div>
                                        <div className="form-group">
                                            <label><FormattedMessage id="doctor.profile.form.phone" /></label>
                                            <input value={phoneNumber} onChange={(event) => this.handleOnChangeInput(event, 'phoneNumber')} />
                                        </div>
                                        <div className="form-group full-width">
                                            <label><FormattedMessage id="doctor.profile.form.address" /></label>
                                            <input value={address} onChange={(event) => this.handleOnChangeInput(event, 'address')} />
                                        </div>
                                        <div className="form-group">
                                            <label><FormattedMessage id="doctor.profile.form.gender" /></label>
                                            <select value={gender} onChange={(event) => this.handleOnChangeInput(event, 'gender')}>
                                                <option value="">
                                                    {this.props.intl.formatMessage({ id: 'doctor.profile.form.choose-gender' })}
                                                </option>
                                                {genderOptions.map((item) => (
                                                    <option key={item.keyMap} value={item.keyMap}>
                                                        {language === 'vi' ? item.valueVi : item.valueEn}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="profile-actions">
                                        <button type="button" className="btn btn-primary" onClick={this.handleSaveProfile} disabled={saving}>
                                            <FormattedMessage id="doctor.profile.form.save" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.app.language,
    userInfo: state.user.userInfo
});

const mapDispatchToProps = (dispatch) => ({
    userLoginSuccess: (userInfo) => dispatch(actions.userLoginSuccess(userInfo))
});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(DoctorProfile));
