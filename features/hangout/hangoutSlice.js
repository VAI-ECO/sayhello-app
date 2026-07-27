import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { ApiKey } from '@env';

const initialState = {
    hangoutData: {},
    iAmHearData: {},
    loading: false,
    error: null,
};

export const getIAmHear = createAsyncThunk(
    "IAmHear/getIAmHear",
    async (body, { rejectWithValue }) => {
        try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${body?.latitude},${body?.longitude}&key=${ApiKey}`;
            
            const response = await axios.get(url);
            const data =  response?.data;
            console.log(data, "IAmHear data")
            return data;
        } catch (error) {
            console.log("Error22", error?.response?.data)
            return rejectWithValue(error?.response?.data || error.message);
        }
    }
);

const hangoutSlice = createSlice({
    name: "hangout",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getIAmHear.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getIAmHear.fulfilled, (state, action) => {
                state.iAmHearData = action.payload;
                state.loading = false;
            })
            .addCase(getIAmHear.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

    }
})

export default hangoutSlice.reducer;
