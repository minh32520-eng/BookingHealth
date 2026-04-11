import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import './ManageSpecialty.scss';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import { createNewSpecialty, deleteSpecialty, editSpecialty, getAllSpecialty, getDetailSpecialtyById } from '../../services/userService';
import { toast } from 'react-toastify';
import { CommonUtils } from '../../utils';

const mdParser = new MarkdownIt();

class ManageSpecialty extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editingSpecialtyId: null,
            name: '',
            imageBase64: '',
            descriptionHTML: '',
            descriptionMarkdown: '',
            specialties: [],
        };
    }

    async componentDidMount() {
        // Load the specialty table before the admin starts creating or editing records.
        await this.loadSpecialties();
    }

    loadSpecialties = async () => {
        let res = await getAllSpecialty();
        if (res && res.errCode === 0) {
            this.setState({
                specialties: res.data || []
            });
        }
    }

    handleOnChangeInput = (event, id) => {
        // Reuse one handler because every plain input just maps directly into component state.
        this.setState({
            [id]: event.target.value
        });
    }

    handleEditorChange = ({ html, text }) => {
        // Keep both HTML and Markdown because the patient pages render HTML while admin edits Markdown.
        this.setState({
            descriptionHTML: html,
            descriptionMarkdown: text,
        });
    }

    handleOnchangeImage = async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        // Convert uploads to base64 because the backend specialty API stores image data directly.
        const base64 = await CommonUtils.getBase64(file);
        this.setState({ imageBase64: base64 });
    }

    normalizeImageSrc = (value) => {
        // Support both freshly uploaded data URLs and older raw base64 values from the database.
        if (!value) return '';
        return value.startsWith('data:image') ? value : `data:image/jpeg;base64,${value}`;
    }

    resetForm = () => {
        // Clear edit mode and field values after save/cancel so the next create starts clean.
        this.setState({
            editingSpecialtyId: null,
            name: '',
            imageBase64: '',
            descriptionHTML: '',
            descriptionMarkdown: '',
        });
    }

    handleSaveNewSpecialty = async () => {
        const { editingSpecialtyId, name, imageBase64, descriptionHTML, descriptionMarkdown } = this.state;
        // Use one payload for both create and update so the admin form only has one save flow.
        const payload = { id: editingSpecialtyId, name, imageBase64, descriptionHTML, descriptionMarkdown };
        let res = editingSpecialtyId
            ? await editSpecialty(payload)
            : await createNewSpecialty(payload);

        if (res && res.errCode === 0) {
            toast.success(this.props.intl.formatMessage({
                id: editingSpecialtyId
                    ? 'admin.manage-specialty.messages.update-success'
                    : 'admin.manage-specialty.messages.create-success'
            }));
            this.resetForm();
            await this.loadSpecialties();
        } else {
            toast.error((res && res.errMessage) || this.props.intl.formatMessage({ id: 'admin.manage-specialty.messages.save-failed' }));
        }
    }

    handleEditSpecialty = async (specialty) => {
        // Load detail by id so the edit form gets the full markdown/html body, not only table summary fields.
        const res = await getDetailSpecialtyById(specialty.id);
        if (res && res.errCode === 0 && res.data) {
            const data = res.data;
            this.setState({
                editingSpecialtyId: data.id,
                name: data.name || '',
                imageBase64: data.image || '',
                descriptionHTML: data.descriptionHTML || '',
                descriptionMarkdown: data.descriptionMarkdown || ''
            });
        }
    }

    handleDeleteSpecialty = async (specialty) => {
        if (!window.confirm(`${this.props.intl.formatMessage({ id: 'admin.manage-specialty.messages.delete-confirm' })} "${specialty.name}"?`)) return;

        const res = await deleteSpecialty(specialty.id);
        if (res && res.errCode === 0) {
            toast.success(this.props.intl.formatMessage({ id: 'admin.manage-specialty.messages.delete-success' }));
            if (this.state.editingSpecialtyId === specialty.id) {
                this.resetForm();
            }
            await this.loadSpecialties();
        } else {
            toast.error((res && res.errMessage) || this.props.intl.formatMessage({ id: 'admin.manage-specialty.messages.delete-failed' }));
        }
    }

    renderPreviewImage = () => {
        const { imageBase64 } = this.state;
        if (!imageBase64) return null;

        // Preview the currently selected image before the admin saves the specialty.
        const src = this.normalizeImageSrc(imageBase64);

        return (
            <div className="ms-preview">
                <img src={src} alt="specialty preview" />
            </div>
        );
    }

    render() {
        const { name, descriptionMarkdown, specialties, editingSpecialtyId } = this.state;

        return (
            <div className="manage-specialty-container">
                <div className="ms-title"><FormattedMessage id="admin.manage-specialty.title" /></div>
                <div className="add-new-specialty row">
                    <div className="col-6 form-group">
                        <label><FormattedMessage id="admin.manage-specialty.form.name" /></label>
                        <input
                            className="form-control"
                            type="text"
                            value={name}
                            onChange={(event) => this.handleOnChangeInput(event, 'name')}
                        />
                    </div>

                    <div className="col-6 form-group">
                        <label><FormattedMessage id="admin.manage-specialty.form.image" /></label>
                        <input
                            className="form-control-file"
                            type="file"
                            onChange={(event) => this.handleOnchangeImage(event)}
                        />
                        {this.renderPreviewImage()}
                    </div>
                    <div className="col-12">
                        <MdEditor
                            style={{ height: '300px' }}
                            renderHTML={text => mdParser.render(text)}
                            onChange={this.handleEditorChange}
                            value={descriptionMarkdown}
                        />
                    </div>
                    <div className="col-12 form-actions">
                        <button
                            className="btn-save-specialty"
                            onClick={() => this.handleSaveNewSpecialty()}
                        >
                            <FormattedMessage id={editingSpecialtyId ? 'admin.manage-specialty.actions.update' : 'admin.manage-specialty.actions.save'} />
                        </button>
                        {editingSpecialtyId && (
                            <button className="btn-cancel-specialty" onClick={this.resetForm}><FormattedMessage id="admin.manage-specialty.actions.cancel" /></button>
                        )}
                    </div>
                </div>

                <div className="ms-list mt-4">
                    <h5><FormattedMessage id="admin.manage-specialty.list.title" /></h5>
                    <div className="table-responsive admin-table-wrap">
                        <table className="table admin-info-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '70px' }}><FormattedMessage id="admin.manage-specialty.table.id" /></th>
                                    <th style={{ width: '220px' }}><FormattedMessage id="admin.manage-specialty.table.name" /></th>
                                    <th><FormattedMessage id="admin.manage-specialty.table.description" /></th>
                                    <th style={{ width: '120px' }}><FormattedMessage id="admin.manage-specialty.table.actions" /></th>
                                </tr>
                            </thead>
                            <tbody>
                                {specialties.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.name}</td>
                                        <td className="cell-multiline">{item.descriptionMarkdown || ''}</td>
                                        <td>
                                            <div className="action-group">
                                                <button className="btn-edit" onClick={() => this.handleEditSpecialty(item)}>
                                                    <i className="fas fa-pencil-alt"></i>
                                                </button>
                                                <button className="btn-delete" onClick={() => this.handleDeleteSpecialty(item)}>
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {specialties.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center empty-row"><FormattedMessage id="admin.manage-specialty.table.empty" /></td>
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
const mapStateToProps = state => {
    return {
        language: state.app.language,
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(ManageSpecialty));
