import React, { Component } from 'react';
import { connect } from "react-redux";
import { Redirect, Route, Switch } from 'react-router-dom';
import UserManage from '../containers/System/UserManage';
import Header from '../containers/Header/Header';
import ManageDoctor from "../containers/System/Admin/ManageDoctor";
import RevenueDashboard from "../containers/System/Admin/RevenueDashboard";
import ManageBooking from "../containers/System/Admin/ManageBooking";
import ManagePayment from "../containers/System/Admin/ManagePayment";
import PaymentConfig from "../containers/System/Admin/PaymentConfig";
import ManageSpecialty from '../containers/System/ManageSpecialty';
import ManageClinic from '../containers/System/ManageClinic';
import ManageHandbook from '../containers/System/ManageHandbook';

class System extends Component {
    render() {
        const { systemMenuPath, isLoggedIn, userInfo } = this.props;
        const isAdmin = userInfo?.roleId === 'R1';
        return (
            <React.Fragment>
                {isLoggedIn && <Header />}
                <div className={isAdmin ? "system-container admin-system-layout" : "system-container"}>
                    <div className="system-list">
                        <Switch>
                            <Route path="/system/revenue-dashboard" component={RevenueDashboard} />
                            <Route path="/system/user-manage" component={UserManage} />
                            <Route path="/system/manage-booking" component={ManageBooking} />
                            <Route path="/system/manage-payment" component={ManagePayment} />
                            <Route path="/system/payment-config" component={PaymentConfig} />
                            <Route path="/system/manage-doctor" component={ManageDoctor} />
                            <Route path="/system/manage-specialty" component={ManageSpecialty} />
                            <Route path="/system/manage-clinic" component={ManageClinic} />
                            <Route path="/system/manage-handbook" component={ManageHandbook} />
                            <Route component={() => { return (<Redirect to={systemMenuPath} />) }} />
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

export default connect(mapStateToProps)(System);
