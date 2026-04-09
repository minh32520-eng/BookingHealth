import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { createNewHandbook, deleteHandbook, editHandbook, getAllHandbook } from '../../services/userService';
import './ManageHandbook.scss';

class ManageHandbook extends Component {
    state = {
        editingHandbookId: null,
        title: '',
        content: '',
        handbooks: [],
    };

    componentDidMount() {
        this.loadHandbooks();
    }

    loadHandbooks = async () => {
        try {
            const res = await getAllHandbook();
            if (res && res.errCode === 0) {
                this.setState({ handbooks: res.data || [] });
            }
        } catch (e) {
            toast.error('Khong tai duoc danh sach cam nang');
        }
    };

    handleOnChangeInput = (e, key) => {
        this.setState({ [key]: e.target.value });
    };

    resetForm = () => {
        this.setState({
            editingHandbookId: null,
            title: '',
            content: '',
        });
    };

    handleSave = async () => {
        const { editingHandbookId, title, content } = this.state;
        const payload = { id: editingHandbookId, title, content };
        const res = editingHandbookId
            ? await editHandbook(payload)
            : await createNewHandbook(payload);

        if (res && res.errCode === 0) {
            toast.success(editingHandbookId ? 'Cap nhat cam nang thanh cong' : 'Tao cam nang thanh cong');
            this.resetForm();
            await this.loadHandbooks();
        } else {
            toast.error((res && res.errMessage) || 'Luu cam nang that bai');
        }
    };

    handleEditHandbook = (handbook) => {
        this.setState({
            editingHandbookId: handbook.id,
            title: handbook.title || '',
            content: handbook.content || '',
        });
    };

    handleDeleteHandbook = async (handbook) => {
        if (!window.confirm(`Xoa cam nang "${handbook.title}"?`)) return;

        try {
            const res = await deleteHandbook(handbook.id);
            if (res && res.errCode === 0) {
                toast.success('Xoa cam nang thanh cong');
                if (this.state.editingHandbookId === handbook.id) {
                    this.resetForm();
                }
                await this.loadHandbooks();
            } else {
                toast.error((res && res.errMessage) || 'Xoa cam nang that bai');
            }
        } catch (e) {
            toast.error('Khong the xoa cam nang');
        }
    };

    render() {
        const { handbooks, editingHandbookId, title, content } = this.state;

        return (
            <div className="manage-handbook-container">
                <div className="mh-title">Quan ly cam nang</div>

                <div className="row">
                    <div className="col-12 form-group">
                        <label>Tieu de</label>
                        <input
                            className="form-control"
                            value={title}
                            onChange={(e) => this.handleOnChangeInput(e, 'title')}
                        />
                    </div>
                    <div className="col-12 form-group">
                        <label>Noi dung</label>
                        <textarea
                            className="form-control"
                            rows="8"
                            value={content}
                            onChange={(e) => this.handleOnChangeInput(e, 'content')}
                        />
                    </div>
                    <div className="col-12 form-actions">
                        <button className="btn-save-handbook" onClick={this.handleSave}>
                            {editingHandbookId ? 'Update' : 'Save'}
                        </button>
                        {editingHandbookId && (
                            <button className="btn-cancel-handbook" onClick={this.resetForm}>
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                <div className="mh-list mt-4">
                    <h5>Danh sach cam nang</h5>
                    <div className="table-responsive admin-table-wrap">
                        <table className="table admin-info-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '70px' }}>ID</th>
                                    <th style={{ width: '220px' }}>Tieu de</th>
                                    <th>Noi dung</th>
                                    <th style={{ width: '120px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {handbooks.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.title}</td>
                                        <td className="cell-multiline">{item.content}</td>
                                        <td>
                                            <div className="action-group">
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => this.handleEditHandbook(item)}
                                                >
                                                    <i className="fas fa-pencil-alt"></i>
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => this.handleDeleteHandbook(item)}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {handbooks.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center empty-row">Chua co du lieu</td>
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
export default connect(mapStateToProps)(ManageHandbook);
