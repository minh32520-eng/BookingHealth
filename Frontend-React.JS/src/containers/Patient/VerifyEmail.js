import React, { Component } from 'react';
import { postVerifyBookAppointment } from '../../services/userService';
import HomeHeader from '../HomePage/HomeHeader';
import './VerifyEmail.scss';

class VerifyEmail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            statusVerify: false,
            errCode: 0
        }
    }
    async componentDidMount() {
        if (this.props.location && this.props.location.search) {
            let urlParams = new URLSearchParams(this.props.location.search);
            let token = urlParams.get('token');
            let doctorId = urlParams.get('doctorId');

            let res = await postVerifyBookAppointment({
                token: token,
                doctorId: doctorId
            })

            if (res && res.errCode === 0) {
                this.setState({
                    statusVerify: true,
                    errCode: res.errCode
                })
            } else {
                this.setState({
                    statusVerify: true,
                    errCode: res && res.errCode ? res.errCode : -1
                })
            }
        }
    }
    render() {
        let { statusVerify, errCode } = this.state;
        console.log('>>> hoi dan it check state : ', this.state)
        return (
            <>
                <HomeHeader />
                <div className="verify-email-container">
                    {statusVerify === false ?
                        <div>
                            Loading data...
                        </div>
                        :
                        <div>
                            {+errCode === 0 ?
                                <div className="infor-booking"> Xác nhận lịch hẹn thành công! </div>
                                :
                                <div className="infor-booking"> Lịch hẹn không tồn tại hoặc đã được xác nhận! </div>
                            }
                        </div>
                    }
                </div>
            </>
        );
    }
}

export default VerifyEmail;