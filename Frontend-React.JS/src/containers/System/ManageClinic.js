import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { CommonUtils } from '../../utils';
import { createNewClinic, getAllClinic } from '../../services/userService';
import './ManageClinic.scss';

class ManageClinic extends Component {
    state = {
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
            toast.error('Không tải được danh sách phòng khám');
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

    handleSave = async () => {
        const { name, address, description, imageBase64 } = this.state;
        const res = await createNewClinic({ name, address, description, imageBase64 });

        if (res && res.errCode === 0) {
            toast.success('Tạo phòng khám thành công');
            this.setState({
                name: '',
                address: '',
                description: '',
                imageBase64: '',
            });
            await this.loadClinics();
        } else {
            toast.error((res && res.errMessage) || 'Tạo phòng khám thất bại');
        }
    };

    render() {
        return (
            <div className="manage-clinic-container">
                <div className="mc-title">Quản lý phòng khám</div>

                <div className="add-new-clinic row">
                    <div className="col-6 form-group">
                        <label>Tên phòng khám</label>
                        <input
                            className="form-control"
                            value={this.state.name}
                            onChange={(e) => this.handleOnChangeInput(e, 'name')}
                        />
                    </div>

                    <div className="col-6 form-group">
                        <label>Địa chỉ</label>
                        <input
                            className="form-control"
                            value={this.state.address}
                            onChange={(e) => this.handleOnChangeInput(e, 'address')}
                        />
                    </div>

                    <div className="col-12 form-group">
                        <label>Mô tả</label>
                        <textarea
                            className="form-control"
                            rows="4"
                            value={this.state.description}
                            onChange={(e) => this.handleOnChangeInput(e, 'description')}
                        />
                    </div>

                    <div className="col-12 form-group">
                        <label>Ảnh phòng khám</label>
                        <input
                            className="form-control-file"
                            type="file"
                            onChange={this.handleOnchangeImage}
                        />
                        {this.state.imageBase64 && (
                            <div className="mc-preview">
                                <img src={this.state.imageBase64} alt="preview" />
                            </div>
                        )}
                    </div>

                    <div className="col-12">
                        <button className="btn-save-clinic" onClick={this.handleSave}>
                            Save
                        </button>
                    </div>
                </div>

                <div className="mc-list mt-4">
                    <h5>Danh sách phòng khám</h5>
                    <div className="table-responsive">
                        <table className="table table-bordered table-sm">
                            <thead>
                                <tr>
                                    <th style={{ width: '70px' }}>ID</th>
                                    <th>Tên</th>
                                    <th>Địa chỉ</th>
                                    <th>Mô tả</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.clinics.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.name}</td>
                                        <td>{item.address}</td>
                                        <td>{item.description}</td>
                                    </tr>
                                ))}
                                {this.state.clinics.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center">Chưa có dữ liệu</td>
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

