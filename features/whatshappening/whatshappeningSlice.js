import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import AppConfig from "../../AppConfig";

const initialState = {
    whatshappeningData: {},
    loading: false,
    error: null,
};


export const getWhatshappeningAll = createAsyncThunk(
    "watshappening/getWhatshappeningAll",
    async (param, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${AppConfig.ApiUrl}api/v1/whatshappening/all?page=${param?.pageNum}&limit=10`);
            const data =  response?.data;
            console.log(data, "getWhatshappeningAll data")
            return data;
        } catch (error) {
            console.log("Error", error?.response?.data)
            return rejectWithValue(error?.response?.data);
        }
    }
);

const whatshappeningSlice = createSlice({
    name: "whatshappening",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getWhatshappeningAll.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getWhatshappeningAll.fulfilled, (state, action) => {
                state.whatshappeningData = action.payload;
                state.loading = false;
            })
            .addCase(getWhatshappeningAll.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

    }
})

export default whatshappeningSlice.reducer;
