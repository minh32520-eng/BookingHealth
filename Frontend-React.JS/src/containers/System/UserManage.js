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
                arrUser: response.users
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
        console.log('click delete', user)
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
        console.log('check edit user', user);
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

                <div className="title text-center">
                    Manage Users
                </div>

                <div className="mx-1 my-3">
                    <button
                        className="btn btn-primary px-3"
                        onClick={this.handleAddNewUser}
                    >
                        <i className="fas fa-plus"></i> Add new user
                    </button>
                </div>

                <div className="user-table mt-3 mx-1">
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
                            {arrUsers && arrUsers.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.email}</td>
                                    <td>{item.firstName}</td>
                                    <td>{item.lastName}</td>
                                    <td>{item.address}</td>
                                    <td>
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
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>

            </div>
        );
    }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(UserManage);