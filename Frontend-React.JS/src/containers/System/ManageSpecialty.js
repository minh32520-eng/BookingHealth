import React, { Component } from 'react';
import { connect } from 'react-redux';
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
        this.setState({
            [id]: event.target.value
        });
    }

    handleEditorChange = ({ html, text }) => {
        this.setState({
            descriptionHTML: html,
            descriptionMarkdown: text,
        });
    }

    handleOnchangeImage = async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        const base64 = await CommonUtils.getBase64(file);
        this.setState({ imageBase64: base64 });
    }

    resetForm = () => {
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
        const payload = { id: editingSpecialtyId, name, imageBase64, descriptionHTML, descriptionMarkdown };
        let res = editingSpecialtyId
            ? await editSpecialty(payload)
            : await createNewSpecialty(payload);

        if (res && res.errCode === 0) {
            toast.success(editingSpecialtyId ? 'Update specialty succeeds!' : 'Add new specialty succeeds!');
            this.resetForm();
            await this.loadSpecialties();
        } else {
            toast.error((res && res.errMessage) || 'Something wrongs....');
        }
    }

    handleEditSpecialty = async (specialty) => {
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
        if (!window.confirm(`Delete specialty "${specialty.name}"?`)) return;

        const res = await deleteSpecialty(specialty.id);
        if (res && res.errCode === 0) {
            toast.success('Delete specialty succeeds!');
            if (this.state.editingSpecialtyId === specialty.id) {
                this.resetForm();
            }
            await this.loadSpecialties();
        } else {
            toast.error((res && res.errMessage) || 'Delete specialty failed');
        }
    }

    renderPreviewImage = () => {
        const { imageBase64 } = this.state;
        if (!imageBase64) return null;

        const src = imageBase64.startsWith('data:image')
            ? imageBase64
            : `data:image/jpeg;base64,${imageBase64}`;

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
                <div className="ms-title">Quan ly chuyen khoa</div>
                <div className="add-new-specialty row">
                    <div className="col-6 form-group">
                        <label>Ten chuyen khoa</label>
                        <input
                            className="form-control"
                            type="text"
                            value={name}
                            onChange={(event) => this.handleOnChangeInput(event, 'name')}
                        />
                    </div>

                    <div className="col-6 form-group">
                        <label>Anh chuyen khoa</label>
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
                            {editingSpecialtyId ? 'Update' : 'Save'}
                        </button>
                        {editingSpecialtyId && (
                            <button className="btn-cancel-specialty" onClick={this.resetForm}>
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                <div className="ms-list mt-4">
                    <h5>Danh sach chuyen khoa</h5>
                    <div className="table-responsive admin-table-wrap">
                        <table className="table admin-info-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '70px' }}>ID</th>
                                    <th style={{ width: '220px' }}>Ten</th>
                                    <th>Mo ta</th>
                                    <th style={{ width: '120px' }}>Actions</th>
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
const mapStateToProps = state => {
    return {
        language: state.app.language,
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageSpecialty);
