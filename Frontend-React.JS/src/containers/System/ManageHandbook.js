import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { toast } from 'react-toastify';
import { CommonUtils } from '../../utils';
import { createNewHandbook, deleteHandbook, editHandbook, getAllHandbook } from '../../services/userService';
import './ManageHandbook.scss';

class ManageHandbook extends Component {
    state = {
        editingHandbookId: null,
        title: '',
        content: '',
        imageBase64: '',
        handbooks: [],
    };

    componentDidMount() {
        // Load the handbook list once so create/edit/delete can happen on the same screen.
        this.loadHandbooks();
    }

    loadHandbooks = async () => {
        try {
            const res = await getAllHandbook();
            if (res && res.errCode === 0) {
                this.setState({ handbooks: res.data || [] });
            }
        } catch (e) {
            toast.error(this.props.intl.formatMessage({ id: 'admin.manage-handbook.messages.load-error' }));
        }
    };

    handleOnChangeInput = (e, key) => {
        // Reuse one handler because every plain input maps directly into local state.
        this.setState({ [key]: e.target.value });
    };

    handleOnchangeImage = async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        // Convert uploads to base64 because the backend handbook API stores image data directly.
        const base64 = await CommonUtils.getBase64(file);
        this.setState({ imageBase64: base64 });
    };

    normalizeImageSrc = (value) => {
        // Support both freshly uploaded data URLs and older raw base64 values from the database.
        if (!value) return '';
        return value.startsWith('data:image') ? value : `data:image/jpeg;base64,${value}`;
    };

    resetForm = () => {
        // Clear edit mode and field values after save/cancel so the next create starts clean.
        this.setState({
            editingHandbookId: null,
            title: '',
            content: '',
            imageBase64: '',
        });
    };

    handleSave = async () => {
        const { editingHandbookId, title, content, imageBase64 } = this.state;
        // Use one shared payload for both create and update to keep the form flow straightforward.
        const payload = { id: editingHandbookId, title, content, imageBase64 };
        const res = editingHandbookId
            ? await editHandbook(payload)
            : await createNewHandbook(payload);

        if (res && res.errCode === 0) {
            toast.success(this.props.intl.formatMessage({
                id: editingHandbookId
                    ? 'admin.manage-handbook.messages.update-success'
                    : 'admin.manage-handbook.messages.create-success'
            }));
            this.resetForm();
            await this.loadHandbooks();
        } else {
            toast.error((res && res.errMessage) || this.props.intl.formatMessage({ id: 'admin.manage-handbook.messages.save-failed' }));
        }
    };

    handleEditHandbook = (handbook) => {
        // Refill the form from the selected row so the same screen handles editing.
        this.setState({
            editingHandbookId: handbook.id,
            title: handbook.title || '',
            content: handbook.content || '',
            imageBase64: handbook.image || '',
        });
    };

    handleDeleteHandbook = async (handbook) => {
        if (!window.confirm(`${this.props.intl.formatMessage({ id: 'admin.manage-handbook.messages.delete-confirm' })} "${handbook.title}"?`)) return;

        try {
            const res = await deleteHandbook(handbook.id);
            if (res && res.errCode === 0) {
                toast.success(this.props.intl.formatMessage({ id: 'admin.manage-handbook.messages.delete-success' }));
                if (this.state.editingHandbookId === handbook.id) {
                    this.resetForm();
                }
                await this.loadHandbooks();
            } else {
                toast.error((res && res.errMessage) || this.props.intl.formatMessage({ id: 'admin.manage-handbook.messages.delete-failed' }));
            }
        } catch (e) {
            toast.error(this.props.intl.formatMessage({ id: 'admin.manage-handbook.messages.delete-network' }));
        }
    };

    renderPreviewImage = () => {
        const src = this.normalizeImageSrc(this.state.imageBase64);
        if (!src) return null;

        // Preview the selected handbook image before saving it.
        return (
            <div className="mh-preview">
                <img src={src} alt="handbook preview" />
            </div>
        );
    };

    render() {
        const { handbooks, editingHandbookId, title, content } = this.state;

        return (
            <div className="manage-handbook-container">
                <div className="mh-title"><FormattedMessage id="admin.manage-handbook.title" /></div>

                <div className="row">
                    <div className="col-12 form-group">
                        <label><FormattedMessage id="admin.manage-handbook.form.title" /></label>
                        <input
                            className="form-control"
                            value={title}
                            onChange={(e) => this.handleOnChangeInput(e, 'title')}
                        />
                    </div>
                    <div className="col-12 form-group">
                        <label><FormattedMessage id="admin.manage-handbook.form.image" /></label>
                        <input
                            className="form-control-file"
                            type="file"
                            onChange={this.handleOnchangeImage}
                        />
                        {this.renderPreviewImage()}
                    </div>
                    <div className="col-12 form-group">
                        <label><FormattedMessage id="admin.manage-handbook.form.content" /></label>
                        <textarea
                            className="form-control"
                            rows="8"
                            value={content}
                            onChange={(e) => this.handleOnChangeInput(e, 'content')}
                        />
                    </div>
                    <div className="col-12 form-actions">
                        <button className="btn-save-handbook" onClick={this.handleSave}>
                            <FormattedMessage id={editingHandbookId ? 'admin.manage-handbook.actions.update' : 'admin.manage-handbook.actions.save'} />
                        </button>
                        {editingHandbookId && (
                            <button className="btn-cancel-handbook" onClick={this.resetForm}><FormattedMessage id="admin.manage-handbook.actions.cancel" /></button>
                        )}
                    </div>
                </div>

                <div className="mh-list mt-4">
                    <h5><FormattedMessage id="admin.manage-handbook.list.title" /></h5>
                    <div className="table-responsive admin-table-wrap">
                        <table className="table admin-info-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '70px' }}><FormattedMessage id="admin.manage-handbook.table.id" /></th>
                                    <th style={{ width: '220px' }}><FormattedMessage id="admin.manage-handbook.table.title" /></th>
                                    <th><FormattedMessage id="admin.manage-handbook.table.content" /></th>
                                    <th style={{ width: '120px' }}><FormattedMessage id="admin.manage-handbook.table.actions" /></th>
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
                                        <td colSpan="4" className="text-center empty-row"><FormattedMessage id="admin.manage-handbook.table.empty" /></td>
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
export default injectIntl(connect(mapStateToProps)(ManageHandbook));
