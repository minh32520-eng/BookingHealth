import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { toast } from 'react-toastify';
import { CommonUtils } from '../../utils';
import { createNewClinic, deleteClinic, editClinic, getAllClinic } from '../../services/userService';
import './ManageClinic.scss';

class ManageClinic extends Component {
    state = {
        editingClinicId: null,
        name: '',
        address: '',
        description: '',
        imageBase64: '',
        clinics: [],
    };

    componentDidMount() {
        this.loadClinics();
    }

    loadClinics = async () => {
        try {
            const res = await getAllClinic();
            if (res && res.errCode === 0) {
                this.setState({ clinics: res.data || [] });
            }
        } catch (e) {
            toast.error(this.props.intl.formatMessage({ id: 'admin.manage-clinic.messages.load-error' }));
        }
    };

    handleOnChangeInput = (e, key) => {
        this.setState({ [key]: e.target.value });
    };

    handleOnchangeImage = async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        const base64 = await CommonUtils.getBase64(file);
        this.setState({ imageBase64: base64 });
    };

    normalizeImageSrc = (value) => {
        if (!value) return '';
        return value.startsWith('data:image') ? value : `data:image/jpeg;base64,${value}`;
    };

    resetForm = () => {
        this.setState({
            editingClinicId: null,
            name: '',
            address: '',
            description: '',
            imageBase64: '',
        });
    };

    handleSave = async () => {
        const { editingClinicId, name, address, description, imageBase64 } = this.state;
        const payload = { id: editingClinicId, name, address, description, imageBase64 };
        const res = editingClinicId
            ? await editClinic(payload)
            : await createNewClinic(payload);

        if (res && res.errCode === 0) {
            toast.success(this.props.intl.formatMessage({
                id: editingClinicId
                    ? 'admin.manage-clinic.messages.update-success'
                    : 'admin.manage-clinic.messages.create-success'
            }));
            this.resetForm();
            await this.loadClinics();
        } else {
            toast.error((res && res.errMessage) || this.props.intl.formatMessage({ id: 'admin.manage-clinic.messages.save-failed' }));
        }
    };

    handleEditClinic = (clinic) => {
        this.setState({
            editingClinicId: clinic.id,
            name: clinic.name || '',
            address: clinic.address || '',
            description: clinic.description || '',
            imageBase64: clinic.image || '',
        });
    };

    handleDeleteClinic = async (clinic) => {
        if (!window.confirm(`${this.props.intl.formatMessage({ id: 'admin.manage-clinic.messages.delete-confirm' })} "${clinic.name}"?`)) return;

        try {
            const res = await deleteClinic(clinic.id);
            if (res && res.errCode === 0) {
                toast.success(this.props.intl.formatMessage({ id: 'admin.manage-clinic.messages.delete-success' }));
                if (this.state.editingClinicId === clinic.id) {
                    this.resetForm();
                }
                await this.loadClinics();
            } else {
                toast.error((res && res.errMessage) || this.props.intl.formatMessage({ id: 'admin.manage-clinic.messages.delete-failed' }));
            }
        } catch (e) {
            toast.error(this.props.intl.formatMessage({ id: 'admin.manage-clinic.messages.delete-network' }));
        }
    };

    renderPreviewImage = () => {
        const { imageBase64 } = this.state;
        if (!imageBase64) return null;

        const src = this.normalizeImageSrc(imageBase64);

        return (
            <div className="mc-preview">
                <img src={src} alt="preview" />
            </div>
        );
    };

    render() {
        const { clinics, editingClinicId, name, address, description } = this.state;

        return (
            <div className="manage-clinic-container">
                <div className="mc-title"><FormattedMessage id="admin.manage-clinic.title" /></div>

                <div className="add-new-clinic row">
                    <div className="col-6 form-group">
                        <label><FormattedMessage id="admin.manage-clinic.form.name" /></label>
                        <input
                            className="form-control"
                            value={name}
                            onChange={(e) => this.handleOnChangeInput(e, 'name')}
                        />
                    </div>

                    <div className="col-6 form-group">
                        <label><FormattedMessage id="admin.manage-clinic.form.address" /></label>
                        <input
                            className="form-control"
                            value={address}
                            onChange={(e) => this.handleOnChangeInput(e, 'address')}
                        />
                    </div>

                    <div className="col-12 form-group">
                        <label><FormattedMessage id="admin.manage-clinic.form.description" /></label>
                        <textarea
                            className="form-control"
                            rows="4"
                            value={description}
                            onChange={(e) => this.handleOnChangeInput(e, 'description')}
                        />
                    </div>

                    <div className="col-12 form-group">
                        <label><FormattedMessage id="admin.manage-clinic.form.image" /></label>
                        <input
                            className="form-control-file"
                            type="file"
                            onChange={this.handleOnchangeImage}
                        />
                        {this.renderPreviewImage()}
                    </div>

                    <div className="col-12 form-actions">
                        <button className="btn-save-clinic" onClick={this.handleSave}>
                            <FormattedMessage id={editingClinicId ? 'admin.manage-clinic.actions.update' : 'admin.manage-clinic.actions.save'} />
                        </button>
                        {editingClinicId && (
                            <button className="btn-cancel-clinic" onClick={this.resetForm}><FormattedMessage id="admin.manage-clinic.actions.cancel" /></button>
                        )}
                    </div>
                </div>

                <div className="mc-list mt-4">
                    <h5><FormattedMessage id="admin.manage-clinic.list.title" /></h5>
                    <div className="table-responsive admin-table-wrap">
                        <table className="table admin-info-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '70px' }}><FormattedMessage id="admin.manage-clinic.table.id" /></th>
                                    <th><FormattedMessage id="admin.manage-clinic.table.name" /></th>
                                    <th><FormattedMessage id="admin.manage-clinic.table.address" /></th>
                                    <th><FormattedMessage id="admin.manage-clinic.table.description" /></th>
                                    <th style={{ width: '120px' }}><FormattedMessage id="admin.manage-clinic.table.actions" /></th>
                                </tr>
                            </thead>
                            <tbody>
                                {clinics.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.name}</td>
                                        <td>{item.address}</td>
                                        <td className="cell-multiline">{item.description}</td>
                                        <td>
                                            <div className="action-group">
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => this.handleEditClinic(item)}
                                                >
                                                    <i className="fas fa-pencil-alt"></i>
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => this.handleDeleteClinic(item)}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {clinics.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center empty-row"><FormattedMessage id="admin.manage-clinic.table.empty" /></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({ language: state.app.language });
export default injectIntl(connect(mapStateToProps)(ManageClinic));
