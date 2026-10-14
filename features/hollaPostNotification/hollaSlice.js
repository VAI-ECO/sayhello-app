import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import requests from "../../Services/httpservice";

const initialState = {
    hollaData: {},
    loading: false,
    error: null,
};


export const createNotification = createAsyncThunk(
    "Notification/createNotification",
    async (body, { rejectWithValue }) => {
        try {
            const data = await requests.post(`api/v1/postnotification/create`, body)
            console.log(data, "createNotification data")
            return data;
        } catch (error) {
            console.log("Error", error?.response?.data)
            return rejectWithValue(error?.response?.data);
        }
    }
);

const hollaSlice = createSlice({
    name: "holla",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createNotification.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createNotification.fulfilled, (state, action) => {
                state.hollaData = action.payload;
                state.loading = false;
            })
            .addCase(createNotification.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

    }
})

export default hollaSlice.reducer;
