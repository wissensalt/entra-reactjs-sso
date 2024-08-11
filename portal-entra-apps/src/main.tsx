import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import App from './App.tsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {LoginPage} from "./LoginPage.tsx";
import {msalAppAInstance, msalAppBInstance} from "./MsalConfig.ts";
import {MsalProvider} from "@azure/msal-react";
import {PublicClientApplication} from "@azure/msal-browser";
const loginWrapper = (instance: PublicClientApplication) => {
    return <MsalProvider instance={instance}>
        <LoginPage/>
    </MsalProvider>
}


ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App/>}/>
                <Route path="/login-app-a" element={loginWrapper(msalAppAInstance)}/>
                <Route path="/login-app-b" element={loginWrapper(msalAppBInstance)}/>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>,
)
