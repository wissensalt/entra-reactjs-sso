import {Configuration, LogLevel, PublicClientApplication} from "@azure/msal-browser";

const scopes: Array<string> = ['User.Read', 'openid', 'email', 'profile'];
const env: ImportMetaEnv = await import.meta.env;
const authority = env.VITE_AUTHORITY;
const appClientId = env.VITE_APP_CLIENT_ID;

export interface ApplicationConfig {
    appName: string,
    scopes: Array<string>,
    authority: string,
    redirectUri: string,
    clientId: string
    redirectStartPage: string
}

export const ConfigAppPlayground: ApplicationConfig = {
    appName: "Playground",
    scopes: scopes,
    authority: authority,
    redirectUri: "http://localhost:5173/",
    clientId: appClientId,
    redirectStartPage: "http://localhost:5173"
}

export const ConfigAppA: ApplicationConfig = {
    appName: "App A",
    scopes: scopes,
    authority: authority,
    redirectUri: "http://localhost:3000/",
    clientId: appClientId,
    redirectStartPage: "http://localhost:3000/"
}

export const ConfigAppB: ApplicationConfig = {
    appName: "App B",
    scopes: scopes,
    authority: authority,
    redirectUri: "http://localhost:3001/",
    clientId: appClientId,
    redirectStartPage: "http://localhost:3001"
}


export const MsalConfig = (appConfig: ApplicationConfig): Configuration => {
    return {
        auth: {
            clientId: appConfig.clientId,
            authority: appConfig.authority,
            redirectUri: appConfig.redirectUri,
            navigateToLoginRequestUrl: true,
            postLogoutRedirectUri:'http://localhost:5173?logout=true',
        },
        cache: {
            cacheLocation: 'localStorage',
            storeAuthStateInCookie: true,
        },
        system: {
            loggerOptions: {
                loggerCallback: function (logLevel, message) {
                    console.log(message);
                },
                logLevel: LogLevel.Verbose,
                piiLoggingEnabled: false
            }
        }
    }
};

export const msalPlaygroundInstance: PublicClientApplication = new PublicClientApplication(MsalConfig(ConfigAppPlayground));
export const msalAppAInstance: PublicClientApplication = new PublicClientApplication(MsalConfig(ConfigAppA));
export const msalAppBInstance: PublicClientApplication = new PublicClientApplication(MsalConfig(ConfigAppB));