
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { ConnectedRouter as Router } from 'connected-react-router';
import { history } from '../redux'
import { ToastContainer } from 'react-toastify';
import { userIsAdmin, userIsDoctor, userIsNotAuthenticated, userIsPatient } from '../hoc/authentication';
import { path } from '../utils'
import Home from '../routes/Home';
import Login from './Auth/Login';
import System from '../routes/System';
import CustomScrollbars from '../components/CustomScrollbars.js';
import HomePage from './HomePage/HomePage.js';
import DetailDoctor from './Patient/Doctor/DetailDoctor.js';
import DetailSpecialty from './Patient/Specialty/DetailSpecialty.js';
import VerifyEmail from './Patient/VerifyEmail';
import Doctor from '../routes/Doctor.js';
import DetailHandbook from './Patient/Handbook/DetailHandbook.js';
import SpecialtyPage from './Patient/Specialty/SpecialtyPage.js';
import ClinicPage from './Patient/Clinic/ClinicPage.js';
import DoctorPage from './Patient/Doctor/DoctorPage.js';
import DetailClinic from './Patient/Clinic/DetailClinic';
import BookingHistory from './Patient/BookingHistory/BookingHistory';
class App extends Component {

    handlePersistorState = () => {
        const { persistor } = this.props;
        let { bootstrapped } = persistor.getState();
        // Wait until persisted redux state is restored before protected routes read auth data.
        if (bootstrapped) {
            if (this.props.onBeforeLift) {
                Promise.resolve(this.props.onBeforeLift())
                    .then(() => this.setState({ bootstrapped: true }))
                    .catch(() => this.setState({ bootstrapped: true }));
            } else {
                this.setState({ bootstrapped: true });
            }
        }
    };

    componentDidMount() {
        this.handlePersistorState();
    }

    render() {
        return (
            <Fragment>
                <Router history={history}>
                    <div className="main-container">

                        <div className="content-container">
                            <CustomScrollbars style={{ height: '100vh', width: '100%' }}>
                                <Switch>
                                    {/* Public list/detail pages */}
                                    <Route path="/specialty" exact component={SpecialtyPage} />
                                    <Route path="/clinic" exact component={ClinicPage} />
                                    <Route path="/doctor" exact component={DoctorPage} />
                                    <Route path="/detail-handbook/:id" component={DetailHandbook} />
                                    <Route path={path.PATIENT_BOOKING_HISTORY} exact component={userIsPatient(BookingHistory)} />
                                    <Route path={path.HOME} exact component={Home} />

                                    {/* Auth and role-based areas */}
                                    <Route path={path.LOGIN} component={userIsNotAuthenticated(Login)} />
                                    <Route path={path.SYSTEM} component={userIsAdmin(System)} />
                                    <Route path={'/doctor/'} component={userIsDoctor(Doctor)} />

                                    {/* Main homepage and remaining patient routes */}
                                    <Route path={path.HOMEPAGE} component={HomePage} />
                                    <Route path={path.DETAIL_DOCTOR} exact component={DetailDoctor} />
                                    <Route path={path.DETAIL_SPECIALTY} exact component={DetailSpecialty} />
                                    <Route path="/detail-clinic/:id" exact component={DetailClinic} />
                                    <Route path={path.VERIFY_EMAIL_BOOKING} component={VerifyEmail} />
                                </Switch>
                            </CustomScrollbars>
                        </div>

                        <ToastContainer
                            position="bottom-right"
                            autoClose={5000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                        />
                    </div>
                </Router>
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        started: state.app.started,
        isLoggedIn: state.user.isLoggedIn
    };
};

const mapDispatchToProps = dispatch => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
