import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import requests from "../../Services/httpservice";

const initialState = {
    Auth: {},
    verificationData:{},
    loading: false,
    error: null,
};

// export const handleIndividualSignUp = createAsyncThunk(
//     "IndividualSignUp/handleIndividualSignUp",
//     async (body, { rejectWithValue }) => {
//         try {
//             const data = await requests.post("api/v1/users/create", body);
//             console.log(data, "Signup auth data")
//             return data;
//         } catch (error) {
//             console.log("Error", error?.response?.data)
//             return rejectWithValue(error?.response?.data);
//         }
//     }
// );

//remaining
export const handleSignUp = createAsyncThunk(
    "SignUp/handleSignUp",
    async (body, { rejectWithValue }) => {
        try {
            const data = await requests.post("api/v1/users/create", body);
            console.log(data, "Signup auth data2")
            return data;
        } catch (error) {
            console.log("Error", error?.response?.data)
            return rejectWithValue(error?.response?.data);
        }
    }
);

// export const handleVerifyPhone = createAsyncThunk(
//     "VerifyPhone/handleVerifyPhone",
//     async (body, { rejectWithValue }) => {
//         try {
//             const data = await requests.post("api/v1/users/verifyPhone", body);
//             console.log(data, "VerifyPhone data")
//             return data;
//         } catch (error) {
//             console.log("Error", error?.response?.data)
//             return rejectWithValue(error?.response?.data);
//         }
//     }
// );

const authSlice = createSlice({
    name: "Auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // .addCase(handleIndividualSignUp.pending, (state) => {
            //     state.loading = true;
            //     state.error = null;
            // })
            // .addCase(handleIndividualSignUp.fulfilled, (state, action) => {
            //     state.loading = false;
            //     state.Auth = action.payload;
            // })
            // .addCase(handleIndividualSignUp.rejected, (state, action) => {
            //     state.error = action.error.message;
            //     state.loading = false;
            // })


            .addCase(handleSignUp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(handleSignUp.fulfilled, (state, action) => {
                state.loading = false;
                state.verificationData = action.payload;
            })
            .addCase(handleSignUp.rejected, (state, action) => {
                state.error = action.error.message;
                state.loading = false;
            })

            // .addCase(handleVerifyPhone.pending, (state) => {
            //     state.loading = true;
            //     state.error = null;
            // })
            // .addCase(handleVerifyPhone.fulfilled, (state, action) => {
            //     state.loading = false;
            //     // state.Auth = action.payload;
            // })
            // .addCase(handleVerifyPhone.rejected, (state, action) => {
            //     state.error = action.error.message;
            //     state.loading = false;
            // })
    }
})

export default authSlice.reducer;
