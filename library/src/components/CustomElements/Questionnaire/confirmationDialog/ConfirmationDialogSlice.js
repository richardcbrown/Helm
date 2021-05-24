import { createSlice } from '@reduxjs/toolkit';

const ConfirmationDialogSlice = createSlice({
    name: "confirmationDialog",
    initialState: {
        open: false
    },
    reducers: {
        setOpen: (state, action) => {
            state.open = Boolean(action.payload)
        }
    }
})

export const selectOpen = (state) => state.confirmationDialog.open;

export const { setOpen } = ConfirmationDialogSlice.actions;

export default ConfirmationDialogSlice.reducer;