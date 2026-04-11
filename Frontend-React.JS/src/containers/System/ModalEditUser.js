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
        // Reuse the shared emitter so parent screens can reset modal data without extra prop callbacks.
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
        // Fill the edit form once from the row selected in the parent table.
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
        // A single generic handler works because each input id matches one state field.
        this.setState({
            [id]: event.target.value
        });
    }

    checkValidateInput = () => {
        let isValid = true;
        let arrInput = ['email', 'firstName', 'lastName', 'address'];

        // Stop on the first missing field so the alert stays specific.
        for (let i = 0; i < arrInput.length; i++) {
            if (!this.state[arrInput[i]]) {
                isValid = false;
                alert('Missing parameter: ' + arrInput[i]);
                break;
            }
        }
        return isValid;
    }

    // The parent owns the real API update, so this modal only validates and forwards the edited snapshot.
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
                                // Email is read-only in edit mode because this modal only updates profile fields.
                                disabled
                            />
                        </div>

                        <div className="input-container">
                            <label>Password</label>
                            <input
                                type="password"
                                value={this.state.password}

                                onChange={(event) => this.handleOnchangeInput(event, 'password')}
                                // Password stays locked here to avoid accidental credential changes from the profile modal.
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

