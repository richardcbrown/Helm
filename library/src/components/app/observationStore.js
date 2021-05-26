import { configureStore } from '@reduxjs/toolkit';
import observationReducer from '../React/Observation/tabs/ObservationTabsSlice';

export const store = configureStore({
    reducer: {
        observation: observationReducer
    }
})