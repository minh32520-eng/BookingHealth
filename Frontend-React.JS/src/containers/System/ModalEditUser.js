import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { emitter } from '../../utils/emitter';
import _ from 'lodash';
class ModalUser extends Component {

    constructor(props) {
        super(props);
        this.state = {
            id: '',
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            address: ''
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
                address: ''
            })
        })
    }// bus event 
    componentDidMount() {
        let user = this.props.currentUser;
        if (user && !_.isEmpty(user)) {
            this.setState({
                id: user.id,
                email: user.email,
                password: '',
                firstName: user.firstName,
                lastName: user.lastName,
                address: user.address
            })
        }
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
        let arrInput = ['email', 'firstName', 'lastName', 'address'];

        for (let i = 0; i < arrInput.length; i++) {
            if (!this.state[arrInput[i]]) {
                isValid = false;
                alert('Missing parameter: ' + arrInput[i]);
                break;
            }
        }
        return isValid;
    }

    handleSaveUser = () => {
        let isValid = this.checkValidateInput();
        if (isValid) {
            // gửi data lên component cha
            this.props.editUser(this.state);

        }
    }

    render() {
        console.log('check props from parents:', this.props)
        return (
            <Modal
                isOpen={this.props.isOpen}
                toggle={this.toggle}
                className="modal-user-container"
                size="lg"
            >
                <ModalHeader toggle={this.toggle}>
                    Edit a user
                </ModalHeader>

                <ModalBody>
                    <div className="modal-user-body">

                        <div className="input-container">
                            <label>Email</label>
                            <input
                                type="text"
                                value={this.state.email}
                                onChange={(event) => this.handleOnchangeInput(event, 'email')

                                }
                                disabled
                            />
                        </div>

                        <div className="input-container">
                            <label>Password</label>
                            <input
                                type="password"
                                value={this.state.password}

                                onChange={(event) => this.handleOnchangeInput(event, 'password')}
                                disabled
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

                    </div>
                </ModalBody>

                <ModalFooter>
                    <Button
                        color="primary"
                        className="px-3"
                        onClick={this.handleSaveUser}
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

