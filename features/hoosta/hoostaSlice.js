import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import requests from "../../Services/httpservice";
import axios from "axios";

const initialState = {
    hoostaData: {},
    loading: false,
    error: null,
};


export const createHoosta = createAsyncThunk(
    "hoosta/createHoosta",
    async (body, { rejectWithValue }) => {
        try {
            const data = await requests.post(`api/v1/hoosta/create`, body);
            console.log(data, "Hoosta data")
            return data;
        } catch (error) {
            console.log("Error", error?.response?.data)
            return rejectWithValue(error?.response?.data);
        }
    }
);

const hoostaSlice = createSlice({
    name: "hoosta",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createHoosta.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createHoosta.fulfilled, (state, action) => {
                state.hoostaData = action.payload;
                state.loading = false;
            })
            .addCase(createHoosta.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

    }
})

export default hoostaSlice.reducer;
