import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { createNewHandbook, getAllHandbook } from '../../services/userService';
import './ManageHandbook.scss';

class ManageHandbook extends Component {
    state = {
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
            toast.error('Không tải được danh sách cẩm nang');
        }
    };

    handleOnChangeInput = (e, key) => {
        this.setState({ [key]: e.target.value });
    };

    handleSave = async () => {
        const { title, content } = this.state;
        const res = await createNewHandbook({ title, content });

        if (res && res.errCode === 0) {
            toast.success('Tạo cẩm nang thành công');
            this.setState({
                title: '',
                content: '',
            });
            await this.loadHandbooks();
        } else {
            toast.error((res && res.errMessage) || 'Tạo cẩm nang thất bại');
        }
    };

    render() {
        return (
            <div className="manage-handbook-container">
                <div className="mh-title">Quản lý cẩm nang</div>

                <div className="row">
                    <div className="col-12 form-group">
                        <label>Tiêu đề</label>
                        <input
                            className="form-control"
                            value={this.state.title}
                            onChange={(e) => this.handleOnChangeInput(e, 'title')}
                        />
                    </div>
                    <div className="col-12 form-group">
                        <label>Nội dung</label>
                        <textarea
                            className="form-control"
                            rows="8"
                            value={this.state.content}
                            onChange={(e) => this.handleOnChangeInput(e, 'content')}
                        />
                    </div>
                    <div className="col-12">
                        <button className="btn-save-handbook" onClick={this.handleSave}>
                            Save
                        </button>
                    </div>
                </div>

                <div className="mh-list mt-4">
                    <h5>Danh sách cẩm nang</h5>
                    <div className="table-responsive">
                        <table className="table table-bordered table-sm">
                            <thead>
                                <tr>
                                    <th style={{ width: '70px' }}>ID</th>
                                    <th style={{ width: '220px' }}>Tiêu đề</th>
                                    <th>Nội dung</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.handbooks.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.title}</td>
                                        <td>{item.content}</td>
                                    </tr>
                                ))}
                                {this.state.handbooks.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="text-center">Chưa có dữ liệu</td>
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

