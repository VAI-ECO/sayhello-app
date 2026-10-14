import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import requests from "../../Services/httpservice";

const initialState = {
    organizationData: {},
    loading: false,
    error: null,
};

export const createOrganization = createAsyncThunk(
    "Organization/createOrganization",
    async (body, { rejectWithValue }) => {
        try {
            const data = await requests.post(`api/v1/origination`, body);
            console.log(data, "createOrganization data")
            return data;
        } catch (error) {
            console.log("Error ::", error?.response?.data)
            return rejectWithValue(error?.response?.data || error.message);
        }
    }
);

const organizationSlice = createSlice({
    name: "organization",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createOrganization.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrganization.fulfilled, (state, action) => {
                state.organizationData = action.payload;
                state.loading = false;
            })
            .addCase(createOrganization.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

    }
})

export default organizationSlice.reducer;
