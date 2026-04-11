import actionTypes from '../actions/actionTypes';

const AUTH_STORAGE_KEY = 'bookingcare_user_session';
const LEGACY_PERSIST_USER_KEY = 'persist:user';

const getDefaultAuthState = () => ({
    isLoggedIn: false,
    userInfo: null
});

const loadPersistedAuth = () => {
    try {
        // Restore login state after refreshes and OAuth full-page redirects.
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) return getDefaultAuthState();

        const parsed = JSON.parse(raw);
        return {
            isLoggedIn: !!parsed?.isLoggedIn,
            userInfo: parsed?.userInfo || null
        };
    } catch (error) {
        return getDefaultAuthState();
    }
};

const persistAuth = (state) => {
    try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
        // Remove the old redux-persist key so it cannot overwrite the current auth state.
        localStorage.removeItem(LEGACY_PERSIST_USER_KEY);
    } catch (error) { }
};

const clearPersistedAuth = () => {
    try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(LEGACY_PERSIST_USER_KEY);
    } catch (error) { }
};

const initialState = loadPersistedAuth();

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.USER_LOGIN_SUCCESS: {
            // Save the same auth snapshot in redux and local storage on successful login.
            const nextState = {
                ...state,
                isLoggedIn: true,
                userInfo: action.userInfo
            };
            persistAuth(nextState);
            return nextState;
        }

        case actionTypes.USER_LOGIN_FAIL:
            clearPersistedAuth();
            return {
                ...state,
                isLoggedIn: false,
                userInfo: null
            };

        case actionTypes.PROCESS_LOGOUT:
            clearPersistedAuth();
            return {
                ...state,
                isLoggedIn: false,
                userInfo: null
            };

        default:
            return state;
    }
};

export default userReducer;
