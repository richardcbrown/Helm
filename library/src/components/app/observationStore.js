import { configureStore } from '@reduxjs/toolkit';
import observationTabsReducer from '../React/Observation/tabs/ObservationTabsSlice';
import observationFormReducer from '../React/Observation/form/ObservationFormSlice';
import observationGraphReducer from '../React/Observation/graph/ObservationGraphSlice';
import tableReducer from '../React/Observation/table/TableSlice';
import observationReducer from '../React/Observation/ObservationSlice';
import contentReducer from '../React/Observation/content/ContentSlice';

export const store = configureStore({
    reducer: {
        observationTabs: observationTabsReducer,
        observationForm: observationFormReducer,
        observationGraph: observationGraphReducer,
        table: tableReducer,
        observation: observationReducer,
        content: contentReducer
    }
})