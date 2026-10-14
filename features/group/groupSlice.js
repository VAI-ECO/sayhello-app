import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import requests from "../../Services/httpservice";

const initialState = {
    groupData: {},
    loading: false,
    error: null,
};

export const createGroup = createAsyncThunk(
    "group/groupData",
    async (body, { rejectWithValue }) => {
        try {
            const data = await requests.post(`api/v1/group`, body);
            console.log(data, "createGroup data")
            return data;
        } catch (error) {
            console.log("Error ::", error?.response?.data)
            return rejectWithValue(error?.response?.data || error.message);
        }
    }
);

const groupSlice = createSlice({
    name: "group",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createGroup.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createGroup.fulfilled, (state, action) => {
                state.groupData = action.payload;
                state.loading = false;
            })
            .addCase(createGroup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

    }
})

export default groupSlice.reducer;
