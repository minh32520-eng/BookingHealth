import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { emitter } from '../../utils/emitter';
class ModalUser extends Component {

    constructor(props) {
        super(props);
        this.state = {

            email: '',
            password: '',
            firstName: '',
            lastName: '',
            address: '',
            phoneNumber: '',
            gender: '',
            roleId: '',
            positionId: ''
        }
        this.listenToEmiiter();
    }
    listenToEmiiter() {
        emitter.on('EVENT_CLEAR_MODAL_DATA', () => {
            this.setState({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                address: '',
                phoneNumber: '',
                gender: '',
                roleId: '',
                positionId: ''
            })
        })
    }// bus event 
    componentDidMount() {
        console.log('mouting')
    }

    toggle = () => {
        this.props.toggleFromParent();
    }

    handleOnchangeInput = (event, id) => {
        this.setState({
            [id]: event.target.value
        });
    }

    checkValidateInput = () => {
        let isValid = true;
        let arrInput = ['email', 'password', 'firstName', 'lastName', 'address'];

        for (let i = 0; i < arrInput.length; i++) {
            if (!this.state[arrInput[i]]) {
                isValid = false;
                alert('Missing parameter: ' + arrInput[i]);
                break;
            }
        }
        return isValid;
    }

    handleAddNewUser = () => {
        let isValid = this.checkValidateInput();
        if (isValid) {
            // gửi data lên component cha
            this.props.createNewuser(this.state);
            console.log('data modal:', this.state);
        }
    }

    render() {
        return (
            <Modal
                isOpen={this.props.isOpen}
                toggle={this.toggle}
                className="modal-user-container"
                size="lg"
            >
                <ModalHeader toggle={this.toggle}>
                    Create a new user
                </ModalHeader>

                <ModalBody>
                    <div className="modal-user-body">

                        <div className="input-container">
                            <label>Email</label>
                            <input
                                type="text"
                                value={this.state.email}
                                onChange={(event) => this.handleOnchangeInput(event, 'email')}
                            />
                        </div>

                        <div className="input-container">
                            <label>Password</label>
                            <input
                                type="password"
                                value={this.state.password}
                                onChange={(event) => this.handleOnchangeInput(event, 'password')}
                            />
                        </div>

                        <div className="input-container">
                            <label>First name</label>
                            <input
                                type="text"
                                value={this.state.firstName}
                                onChange={(event) => this.handleOnchangeInput(event, 'firstName')}
                            />
                        </div>

                        <div className="input-container">
                            <label>Last name</label>
                            <input
                                type="text"
                                value={this.state.lastName}
                                onChange={(event) => this.handleOnchangeInput(event, 'lastName')}
                            />
                        </div>

                        <div className="input-container">
                            <label>Address</label>
                            <input
                                type="text"
                                value={this.state.address}
                                onChange={(event) => this.handleOnchangeInput(event, 'address')}
                            />
                        </div>

                        <div className="input-container">
                            <label>Phone number</label>
                            <input
                                type="text"
                                value={this.state.phoneNumber}
                                onChange={(event) => this.handleOnchangeInput(event, 'phoneNumber')}
                            />
                        </div>

                        <div className="input-container">
                            <label>Gender</label>
                            <select
                                value={this.state.gender}
                                onChange={(event) => this.handleOnchangeInput(event, 'gender')}
                            >
                                <option value="">Choose...</option>
                                <option value="1">Male</option>
                                <option value="0">Female</option>
                            </select>
                        </div>

                        <div className="input-container">
                            <label>Role</label>
                            <select
                                value={this.state.roleId}
                                onChange={(event) => this.handleOnchangeInput(event, 'roleId')}
                            >
                                <option value="">Choose...</option>
                                <option value="R1">Admin</option>
                                <option value="R2">Doctor</option>
                                <option value="R3">Patient</option>
                            </select>
                        </div>

                        <div className="input-container">
                            <label>Position</label>
                            <input
                                type="text"
                                value={this.state.positionId}
                                onChange={(event) => this.handleOnchangeInput(event, 'positionId')}
                            />
                        </div>

                    </div>
                </ModalBody>

                <ModalFooter>
                    <Button
                        color="primary"
                        className="px-3"
                        onClick={this.handleAddNewUser}
                    >
                        Save changes
                    </Button>

                    <Button
                        color="secondary"
                        className="px-3"
                        onClick={this.toggle}
                    >
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ModalUser);