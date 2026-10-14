import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import requests from "../../Services/httpservice";

const initialState = {
    businessData: {},
    loading: false,
    error: null,
};

export const createBusiness = createAsyncThunk(
    "Business/createBusiness",
    async (body, { rejectWithValue }) => {
        try {
            const data = await requests.post(`api/v1/business/create`, body);
            console.log(data, "createBusiness data")
            return data;
        } catch (error) {
            console.log("Error", error?.response?.data);
            return rejectWithValue(error?.response?.data);
        }
    }
);


const businessSlice = createSlice({
    name: "business",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createBusiness.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createBusiness.fulfilled, (state, action) => {
                state.businessData = action.payload;
                state.loading = false;
            })
            .addCase(createBusiness.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

    }
})

export default businessSlice.reducer;
