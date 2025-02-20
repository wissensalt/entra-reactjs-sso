import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {MsalProvider} from "@azure/msal-react";
import {msalAppAInstance} from "./MsalConfig";
import {PublicClientApplication} from "@azure/msal-browser";
import {Route, Routes} from "react-router";
import {BrowserRouter} from "react-router-dom";
import {CookiesProvider} from "react-cookie";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const appWrapper = (instance: PublicClientApplication) => {
    return <MsalProvider instance={instance}>
        <CookiesProvider>
            <App/>
        </CookiesProvider>
    </MsalProvider>
}
root.render(
  <React.StrictMode>
      <BrowserRouter>
          <Routes>
              <Route path="/" element={appWrapper(msalAppAInstance)}/>
          </Routes>
      </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
