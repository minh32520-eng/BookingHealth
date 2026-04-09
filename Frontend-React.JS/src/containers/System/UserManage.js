import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Usermanage.scss';
import { getAllUsers, createNewUserService, deleteUserService, editUserService } from '../../services/userService';
import ModalUser from './ModalUser';
import { emitter } from "../../utils/emitter";
import ModalEditUser from './ModalEditUser';

class UserManage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            arrUser: [],
            isOpenModalUser: false,
            isOpenModalEditUser: false,
            userEdit: {}
        };
    }

    async componentDidMount() {
        await this.getAllUsersFromReact();
    }

    getAllUsersFromReact = async () => {
        let response = await getAllUsers('ALL');
        if (response && response.errCode === 0) {
            this.setState({
                arrUser: response.users || []
            });
        }
    }

    handleAddNewUser = () => {
        this.setState({
            isOpenModalUser: true
        });
    }

    toggleUserModal = () => {
        this.setState(prevState => ({
            isOpenModalUser: !prevState.isOpenModalUser
        }));
    }

    toggleUserEditModal = () => {
        this.setState(prevState => ({
            isOpenModalEditUser: !prevState.isOpenModalEditUser
        }));
    }

    createNewuser = async (data) => {
        try {
            let response = await createNewUserService(data);
            if (response && response.errCode !== 0) {
                alert(response.errMessage);
            } else {
                await this.getAllUsersFromReact();
                this.setState({
                    isOpenModalUser: false
                });
                emitter.emit('EVENT_CLEAR_MODAL_DATA', { 'id': 'your id' })
            }
        } catch (e) {
            console.error(e);
        }
    }

    handleDeleteUser = async (user) => {
        if (!window.confirm(`Delete user ${user.email}?`)) {
            return;
        }

        try {
            let res = await deleteUserService(user.id)
            if (res && res.errCode === 0) {
                await this.getAllUsersFromReact();
            } else {
                alert(res.errMessage)
            }
        } catch (error) {
            console.log(error);
        }
    }

    handleEditUser = (user) => {
        this.setState({
            isOpenModalEditUser: true,
            userEdit: user
        })
    }

    doEditUser = async (user) => {
        try {
            let res = await editUserService(user);
            if (res && res.errCode === 0) {
                this.setState({
                    isOpenModalEditUser: false
                })
                await this.getAllUsersFromReact()
            } else {
                alert(res.errCode)
            }
        } catch (error) {
            console.log(error)
        }
    }

    render() {
        let arrUsers = this.state.arrUser;
        const adminCount = arrUsers.filter(item => item.roleId === 'R1').length;
        const doctorCount = arrUsers.filter(item => item.roleId === 'R2').length;
        const patientCount = arrUsers.filter(item => item.roleId === 'R3').length;

        return (
            <div className="user-container">

                <ModalUser
                    isOpen={this.state.isOpenModalUser}
                    toggleFromParent={this.toggleUserModal}
                    createNewuser={this.createNewuser}
                />

                {this.state.isOpenModalEditUser &&
                    <ModalEditUser
                        isOpen={this.state.isOpenModalEditUser}
                        toggleFromParent={this.toggleUserEditModal}
                        currentUser={this.state.userEdit}
                        editUser={this.doEditUser}
                    />
                }

                <div className="user-page-shell">
                    <div className="user-page-hero">
                        <div>
                            <div className="user-page-eyebrow">Admin panel</div>
                            <div className="title">Manage Users</div>
                            <div className="user-page-subtitle">
                                View, create and update system accounts in one place.
                            </div>
                        </div>

                        <button
                            className="btn-add-user"
                            onClick={this.handleAddNewUser}
                        >
                            <i className="fas fa-plus"></i>
                            <span>Add new user</span>
                        </button>
                    </div>

                    <div className="user-stats-grid">
                        <div className="user-stat-card">
                            <span className="label">Total users</span>
                            <strong>{arrUsers.length}</strong>
                        </div>
                        <div className="user-stat-card">
                            <span className="label">Admins</span>
                            <strong>{adminCount}</strong>
                        </div>
                        <div className="user-stat-card">
                            <span className="label">Doctors</span>
                            <strong>{doctorCount}</strong>
                        </div>
                        <div className="user-stat-card">
                            <span className="label">Patients</span>
                            <strong>{patientCount}</strong>
                        </div>
                    </div>

                    <div className="user-table-card">
                        <div className="user-table-head">
                            <div>
                                <h3>User list</h3>
                                <p>Basic account information currently stored in the system.</p>
                            </div>
                        </div>

                        <div className="user-table-wrap">
                            <table id="customers">
                                <thead>
                                    <tr>
                                        <th>Email</th>
                                        <th>First name</th>
                                        <th>Last name</th>
                                        <th>Address</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {arrUsers && arrUsers.length > 0 ? arrUsers.map((item, index) => (
                                        <tr key={index}>
                                            <td className="email-cell">{item.email}</td>
                                            <td>{item.firstName}</td>
                                            <td>{item.lastName}</td>
                                            <td>{item.address}</td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="btn-edit"
                                                        onClick={() => this.handleEditUser(item)}
                                                    >
                                                        <i className="fas fa-pencil-alt"></i>
                                                    </button>

                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => this.handleDeleteUser(item)}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="empty-users">
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                            </table>
                        </div>
                    </div>
                </div>

            </div>
        );
    }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(UserManage);
