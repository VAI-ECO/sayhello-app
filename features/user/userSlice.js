import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import requests from "../../Services/httpservice";

const initialState = {
    HomeAdvertisement: [],
    HomePoints: [],
    Connections: [],
    loading: false,
    error: null,
};

const homeAdvertisement = createAsyncThunk(
    "Advertisement/homeAdvertisement",
    async (body, { rejectWithValue }) => {
        try {
            const data = await requests.get(`api/v1/advertisement/all`);
            console.log(data, "Advertisement data")
            return data;
        } catch (error) {
            console.log("Error", error?.response?.data)
            return rejectWithValue(error?.response?.data);
        }
    }
);

const getUserHomePoints = createAsyncThunk(
    "HomePoints/homeAdvertisement",
    async (id, { rejectWithValue }) => {
        try {
            const data = await requests.get(`api/v1/users/homepoints/${id}`);
            console.log(data, "HomePoints data")
            return data;
        } catch (error) {
            console.log("Error", error?.response?.data)
            return rejectWithValue(error?.response?.data);
        }
    }
);

const getUserConnections = createAsyncThunk(
    "Connections/getUserConnections",
    async (id, { rejectWithValue }) => {
        try {
            const data = await requests.get(`api/v1/userConnection/${id}`)
            console.log(data, "Connections data")
            return data;
        } catch (error) {
            console.log("Error", error?.response?.data)
            return rejectWithValue(error?.response?.data);
        }
    }
);



const userSlice = createSlice({
    name: "Home",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(homeAdvertisement.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(homeAdvertisement.fulfilled, (state, action) => {
                state.loading = false;
                state.HomeAdvertisement = action.payload;
            })
            .addCase(homeAdvertisement.rejected, (state, action) => {
                state.error = action.error.message;
                state.loading = false;
            })

            .addCase(getUserHomePoints.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserHomePoints.fulfilled, (state, action) => {
                state.loading = false;
                state.HomePoints = action.payload;
            })
            .addCase(getUserHomePoints.rejected, (state, action) => {
                state.error = action.error.message;
                state.loading = false;
            })

            .addCase(getUserConnections.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserConnections.fulfilled, (state, action) => {
                state.loading = false;
                state.Connections = action.payload;
            })
            .addCase(getUserConnections.rejected, (state, action) => {
                state.error = action.error.message;
                state.loading = false;
            })


    }
})

export default userSlice.reducer;
