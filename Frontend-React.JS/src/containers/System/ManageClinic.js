import React, { Component } from 'react';
import { connect } from 'react-redux';
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
            toast.error('Khong tai duoc danh sach phong kham');
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
            toast.success(editingClinicId ? 'Cap nhat phong kham thanh cong' : 'Tao phong kham thanh cong');
            this.resetForm();
            await this.loadClinics();
        } else {
            toast.error((res && res.errMessage) || 'Luu phong kham that bai');
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
        if (!window.confirm(`Xoa phong kham "${clinic.name}"?`)) return;

        try {
            const res = await deleteClinic(clinic.id);
            if (res && res.errCode === 0) {
                toast.success('Xoa phong kham thanh cong');
                if (this.state.editingClinicId === clinic.id) {
                    this.resetForm();
                }
                await this.loadClinics();
            } else {
                toast.error((res && res.errMessage) || 'Xoa phong kham that bai');
            }
        } catch (e) {
            toast.error('Khong the xoa phong kham');
        }
    };

    renderPreviewImage = () => {
        const { imageBase64 } = this.state;
        if (!imageBase64) return null;

        const src = imageBase64.startsWith('data:image')
            ? imageBase64
            : `data:image/jpeg;base64,${imageBase64}`;

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
                <div className="mc-title">Quan ly phong kham</div>

                <div className="add-new-clinic row">
                    <div className="col-6 form-group">
                        <label>Ten phong kham</label>
                        <input
                            className="form-control"
                            value={name}
                            onChange={(e) => this.handleOnChangeInput(e, 'name')}
                        />
                    </div>

                    <div className="col-6 form-group">
                        <label>Dia chi</label>
                        <input
                            className="form-control"
                            value={address}
                            onChange={(e) => this.handleOnChangeInput(e, 'address')}
                        />
                    </div>

                    <div className="col-12 form-group">
                        <label>Mo ta</label>
                        <textarea
                            className="form-control"
                            rows="4"
                            value={description}
                            onChange={(e) => this.handleOnChangeInput(e, 'description')}
                        />
                    </div>

                    <div className="col-12 form-group">
                        <label>Anh phong kham</label>
                        <input
                            className="form-control-file"
                            type="file"
                            onChange={this.handleOnchangeImage}
                        />
                        {this.renderPreviewImage()}
                    </div>

                    <div className="col-12 form-actions">
                        <button className="btn-save-clinic" onClick={this.handleSave}>
                            {editingClinicId ? 'Update' : 'Save'}
                        </button>
                        {editingClinicId && (
                            <button className="btn-cancel-clinic" onClick={this.resetForm}>
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                <div className="mc-list mt-4">
                    <h5>Danh sach phong kham</h5>
                    <div className="table-responsive admin-table-wrap">
                        <table className="table admin-info-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '70px' }}>ID</th>
                                    <th>Ten</th>
                                    <th>Dia chi</th>
                                    <th>Mo ta</th>
                                    <th style={{ width: '120px' }}>Actions</th>
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
                                        <td colSpan="5" className="text-center empty-row">Chua co du lieu</td>
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
export default connect(mapStateToProps)(ManageClinic);
