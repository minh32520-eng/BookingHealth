import React, { Component } from 'react';
import { connect } from "react-redux";
import { Redirect, Route, Switch } from 'react-router-dom';
import ManageSchedule from '../containers/System/Doctor/ManageSchedule';
import PaymentQr from '../containers/System/Doctor/PaymentQr';
import DoctorMedicalRecords from '../containers/System/Doctor/DoctorMedicalRecords';
import DoctorProfile from '../containers/System/Doctor/DoctorProfile';
import Header from '../containers/Header/Header';

class Doctor extends Component {

    render() {
        const { isLoggedIn } = this.props;

        return (
            <React.Fragment>
                {isLoggedIn && <Header />}
                <div className="system-container">
                    <div className="system-list">
                        <Switch>
                            <Route path="/doctor/manage-schedule" component={ManageSchedule} />
                            <Route path="/doctor/medical-records" component={DoctorMedicalRecords} />
                            <Route path="/doctor/profile" component={DoctorProfile} />
                            <Route path="/doctor/payment-qr" component={PaymentQr} />
                            <Route component={() => { return (<Redirect to="/doctor/manage-schedule" />) }} />
                        </Switch>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        systemMenuPath: state.app.systemMenuPath,
        isLoggedIn: state.user.isLoggedIn
    };
};
const mapDispatchToProps = dispatch => {
    return {

    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Doctor);
