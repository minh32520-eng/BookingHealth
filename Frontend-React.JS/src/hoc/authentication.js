import locationHelperBuilder from "redux-auth-wrapper/history4/locationHelper";
import { connectedRouterRedirect } from "redux-auth-wrapper/history4/redirect";
import { USER_ROLE } from "../utils/constant";

const locationHelper = locationHelperBuilder({});

const getHomeByRole = (state) => {
    const roleId = state.user?.userInfo?.roleId;

    if (roleId === USER_ROLE.ADMIN) return '/system/user-manage';
    if (roleId === USER_ROLE.DOCTOR) return '/doctor/manage-schedule';
    return '/home';
};

export const userIsAuthenticated = connectedRouterRedirect({
    authenticatedSelector: state => state.user.isLoggedIn,
    wrapperDisplayName: 'UserIsAuthenticated',
    redirectPath: '/login'
});

export const userIsNotAuthenticated = connectedRouterRedirect({
    // Want to redirect the user when they are authenticated
    authenticatedSelector: state => !state.user.isLoggedIn,
    wrapperDisplayName: 'UserIsNotAuthenticated',
    redirectPath: (state, ownProps) => locationHelper.getRedirectQueryParam(ownProps) || '/',
    allowRedirectBack: false
});

export const userIsAdmin = connectedRouterRedirect({
    authenticatedSelector: state =>
        state.user.isLoggedIn && state.user.userInfo?.roleId === USER_ROLE.ADMIN,
    wrapperDisplayName: 'UserIsAdmin',
    redirectPath: state => state.user.isLoggedIn ? getHomeByRole(state) : '/login',
    allowRedirectBack: false
});

export const userIsDoctor = connectedRouterRedirect({
    authenticatedSelector: state =>
        state.user.isLoggedIn && state.user.userInfo?.roleId === USER_ROLE.DOCTOR,
    wrapperDisplayName: 'UserIsDoctor',
    redirectPath: state => state.user.isLoggedIn ? getHomeByRole(state) : '/login',
    allowRedirectBack: false
});

export const userIsPatient = connectedRouterRedirect({
    authenticatedSelector: state =>
        state.user.isLoggedIn && state.user.userInfo?.roleId === USER_ROLE.PATIENT,
    wrapperDisplayName: 'UserIsPatient',
    redirectPath: state => state.user.isLoggedIn ? getHomeByRole(state) : '/login',
    allowRedirectBack: false
});
