import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {MsalProvider} from "@azure/msal-react";
import {msalAppBInstance} from "./MsalConfig";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {PublicClientApplication} from "@azure/msal-browser";
import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const appWrapper = (instance: PublicClientApplication) => {
 return <MsalProvider instance={instance}>
        <App/>
    </MsalProvider>
}
root.render(
  <React.StrictMode>
      <BrowserRouter>
          <Routes>
              <Route path="/" element={appWrapper(msalAppBInstance)}/>
          </Routes>
      </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
