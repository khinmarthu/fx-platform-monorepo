import React, { FC } from "react";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { BlotterTable } from "./BlotterTable";

export const App: FC = () => {
    return (
        <Provider store={store}>
            <BlotterTable />
        </Provider>
    )
}