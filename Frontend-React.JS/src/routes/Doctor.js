import React, { Component } from 'react';
import { connect } from "react-redux";
import { Redirect, Route, Switch } from 'react-router-dom';
import DoctorDashboard from '../containers/System/Doctor/DoctorDashboard';
import ManageSchedule from '../containers/System/Doctor/ManageSchedule';
import DoctorMedicalRecords from '../containers/System/Doctor/DoctorMedicalRecords';
import DoctorProfile from '../containers/System/Doctor/DoctorProfile';
import Header from '../containers/Header/Header';

class Doctor extends Component {

    render() {
        const { isLoggedIn, userInfo } = this.props;
        const isDoctor = userInfo?.roleId === 'R2';

        return (
            <React.Fragment>
                {isLoggedIn && <Header />}
                <div className={isDoctor ? "system-container admin-system-layout doctor-system-layout" : "system-container"}>
                    <div className="system-list">
                        <Switch>
                            <Route path="/doctor/dashboard" component={DoctorDashboard} />
                            <Route path="/doctor/manage-schedule" component={ManageSchedule} />
                            <Route path="/doctor/medical-records" component={DoctorMedicalRecords} />
                            <Route path="/doctor/profile" component={DoctorProfile} />
                            <Route component={() => { return (<Redirect to="/doctor/dashboard" />) }} />
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
        isLoggedIn: state.user.isLoggedIn,
        userInfo: state.user.userInfo
    };
};
const mapDispatchToProps = dispatch => {
    return {

    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Doctor);
