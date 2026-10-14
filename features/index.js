import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice";
import authReducer from "./auth/authSlice";
import hoostaReducer from "./hoosta/hoostaSlice";
import hangoutReducer from "./hangout/hangoutSlice";
import hollaReducer from "./hollaPostNotification/hollaSlice";
import discountReducer from "./hookupDiscount/discountSlice";
import whatshappeningReducer from "./whatshappening/whatshappeningSlice";
import organizationReducer from "./organization/organizationSlice";
import groupReducer from "./group/groupSlice";
import businessReducer from "./business/businessSlice";


const appReducer = combineReducers({
        auth:authReducer,
        user:userReducer,
        hoosta:hoostaReducer,
        hangout:hangoutReducer,
        holla:hollaReducer,
        discount:discountReducer,
        whatshappening:whatshappeningReducer,
        organization:organizationReducer,
        group:groupReducer,
        business:businessReducer
});

export const store = configureStore({
  reducer: (state, action) => appReducer(action.type === "session/reset" ? undefined : state, action),
});
