import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import requests from "../../Services/httpservice";

const initialState = {
    DiscountData: {},
    loading: false,
    error: null,
};


export const createDiscount = createAsyncThunk(
    "Discount/createDiscount",
    async (body, { rejectWithValue }) => {
        try {
            const data = await requests.post(`api/v1/postdiscount/create`, body);
            console.log(data, "createDiscount data")
            return data;
        } catch (error) {
            console.log("Error ::", error?.response?.data)
            return rejectWithValue(error?.response?.data);
        }
    }
);

const discountSlice = createSlice({
    name: "discount",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createDiscount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createDiscount.fulfilled, (state, action) => {
                state.DiscountData = action.payload;
                state.loading = false;
            })
            .addCase(createDiscount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    }
})

export default discountSlice.reducer;
