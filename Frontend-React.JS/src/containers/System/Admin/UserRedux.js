import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { LANGUAGES, CRUD_ACTIONS } from '../../../utils/constant';
import { CommonUtils } from '../../../utils';
import * as actions from "../../../store/actions";
import './UserRedux.scss';
import Lightbox from 'react-image-lightbox';
import "react-image-lightbox/style.css";
import TableManageUser from './TableManageUser';

class UserRedux extends Component {

    constructor(props) {
        super(props);
        this.state = {
            genderArr: [],
            positionArr: [],
            roleArr: [],
            previewImgURL: '',
            isOpen: false,

            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            address: '',
            gender: '',
            position: '',
            role: '',
            avatar: '',
            action: CRUD_ACTIONS.CREATE,
            userEditId: '',
        }
    }

    async componentDidMount() {
        this.props.getGenderStart();
        this.props.getPositionStart();
        this.props.getRoleStart();
        this.props.fetchUserRedux();
    }

    componentDidUpdate(prevProps) {

        if (prevProps.roleRedux !== this.props.roleRedux) {
            let arrRoles = this.props.roleRedux;
            this.setState({
                roleArr: arrRoles,
                role: arrRoles && arrRoles.length > 0 ? arrRoles[0].keyMap : '',
            });
        }

        if (prevProps.positionRedux !== this.props.positionRedux) {
            let arrPosition = this.props.positionRedux;
            this.setState({
                positionArr: arrPosition,
                position: arrPosition && arrPosition.length > 0 ? arrPosition[0].keyMap : '',
            });
        }

        if (prevProps.genderRedux !== this.props.genderRedux) {
            let arrGenders = this.props.genderRedux;
            this.setState({
                genderArr: arrGenders,
                gender: arrGenders && arrGenders.length > 0 ? arrGenders[0].keyMap : ''
            });
        }

        if (prevProps.listUsers !== this.props.listUsers) {
            let arrGenders = this.props.genderRedux;
            let arrRoles = this.props.roleRedux;
            let arrPositions = this.props.positionRedux;

            this.setState({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                phoneNumber: '',
                address: '',
                gender: arrGenders && arrGenders.length > 0 ? arrGenders[0].keyMap : '',
                role: arrRoles && arrRoles.length > 0 ? arrRoles[0].keyMap : '',
                position: arrPositions && arrPositions.length > 0 ? arrPositions[0].keyMap : '',
                avatar: '',
                previewImgURL: '',
                action: CRUD_ACTIONS.CREATE,
                userEditId: '',
                previewImgURL: '',
            });
        }
    }

    handleOnchangeImage = async (event) => {
        let file = event.target.files[0];
        if (file) {
            let base64 = await CommonUtils.getBase64(file);
            let objectUrl = URL.createObjectURL(file);
            this.setState({
                previewImgURL: objectUrl,
                avatar: base64
            });
        }
    }

    openPreviewImage = () => {
        if (!this.state.previewImgURL) return;
        this.setState({ isOpen: true });
    }

    handleSaveUser = () => {
        let isValid = this.CheckValidateInput();
        if (!isValid) return;

        let { action } = this.state;

        if (action === CRUD_ACTIONS.CREATE) {
            this.props.createNewUser({
                email: this.state.email,
                password: this.state.password,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                address: this.state.address,
                phoneNumber: this.state.phoneNumber,
                gender: this.state.gender,
                roleId: this.state.role,
                positionId: this.state.position,
                avatar: this.state.avatar
            });
        }

        if (action === CRUD_ACTIONS.EDIT) {
            this.props.editAUserRedux({
                id: this.state.userEditId,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                address: this.state.address,
                phoneNumber: this.state.phoneNumber,
                gender: this.state.gender,
                roleId: this.state.role,
                positionId: this.state.position,
                avatar: this.state.avatar
            });
        }
    }

    CheckValidateInput = () => {
        let arrCheck = [
            'email', 'firstName', 'lastName',
            'phoneNumber', 'address', 'gender',
            'position', 'role'
        ];

        if (this.state.action === CRUD_ACTIONS.CREATE) {
            arrCheck.push('password');
        }

        for (let i = 0; i < arrCheck.length; i++) {
            if (!this.state[arrCheck[i]]) {
                alert('This input is required: ' + arrCheck[i]);
                return false;
            }
        }

        return true;
    }

    onChangeInput = (event, id) => {
        let copyState = { ...this.state };
        copyState[id] = event.target.value;
        this.setState(copyState);
    }

    handleEditUserFromParent = (user) => {
        let imageBase64 = '';
        if (user.image) {
            imageBase64 = new Buffer(user.image, 'base64').toString('binary');
        }
        this.setState({
            email: user.email,
            password: 'HARDCODE',
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            address: user.address,
            gender: user.gender,
            role: user.roleId,
            position: user.positionId,
            avatar: '',
            previewImgURL: imageBase64,
            action: CRUD_ACTIONS.EDIT,
            userEditId: user.id
        });
    }

    render() {

        let { genderArr, positionArr, roleArr } = this.state;
        let { email, password, firstName, lastName,
            phoneNumber, address, gender, position, role } = this.state;

        let language = this.props.language;
        let isGetGenders = this.props.isLoadingGender;

        return (
            <div className="user-redux-container">

                <div className="title">User redux body</div>

                {isGetGenders && <div>Loading genders...</div>}

                <div className="user-redux-body">
                    <div className="container">
                        <div className="row">

                            <div className="col-12 my-3">
                                <FormattedMessage id="manage-user.add" />
                            </div>

                            <div className="col-3">
                                <label>Email</label>
                                <input className="form-control"
                                    value={email}
                                    onChange={(e) => this.onChangeInput(e, 'email')}
                                    disabled={this.state.action === CRUD_ACTIONS.EDIT} />
                            </div>

                            <div className="col-3">
                                <label>Password</label>
                                <input className="form-control"
                                    type="password"
                                    value={password}
                                    onChange={(e) => this.onChangeInput(e, 'password')}
                                    disabled={this.state.action === CRUD_ACTIONS.EDIT} />
                            </div>

                        </div>
                    </div>
                </div>

                <div className="col-12 mb-5">
                    <TableManageUser
                        handleEditUserFromParentKey={this.handleEditUserFromParent}
                        action={this.state.action}
                    />
                </div>

            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    language: state.app.language,
    genderRedux: state.admin.genders,
    roleRedux: state.admin.roles,
    positionRedux: state.admin.positions,
    isLoadingGender: state.admin.isLoadingGender,
    listUsers: state.admin.users
});

const mapDispatchToProps = (dispatch) => ({
    getGenderStart: () => dispatch(actions.fetchGenderStart()),
    getPositionStart: () => dispatch(actions.fetchPositionStart()),
    getRoleStart: () => dispatch(actions.fetchRoleStart()),
    createNewUser: (data) => dispatch(actions.createNewUser(data)),
    fetchUserRedux: () => dispatch(actions.fetchAllUsersStart()),
    editAUserRedux: (data) => dispatch(actions.editAUser(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(UserRedux);