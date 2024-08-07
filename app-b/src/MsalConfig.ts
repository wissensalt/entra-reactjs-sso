import {Configuration, LogLevel, PublicClientApplication} from "@azure/msal-browser";

export const defaultScopes: Array<string> = ['User.Read']
const authority: string = process.env.REACT_APP_AUTHORITY as string;
const appClientId: string = process.env.REACT_APP_CLIENT_ID as string;

export interface ApplicationConfig {
    appName: string,
    scopes: Array<string>,
    authority: string,
    redirectUri: string,
    clientId: string
}

export const ConfigAppA: ApplicationConfig = {
    appName: "App A",
    scopes: defaultScopes,
    authority: authority,
    redirectUri: "http://localhost:3000/",
    clientId: appClientId
}

export const ConfigAppB: ApplicationConfig = {
    appName: "App B",
    scopes: defaultScopes,
    authority: authority,
    redirectUri: "http://localhost:3001/",
    clientId: appClientId
}


export const MsalConfig = (appConfig: ApplicationConfig): Configuration => {
    return {
        auth: {
            clientId: appConfig.clientId,
            authority: appConfig.authority,
            redirectUri: appConfig.redirectUri,
            postLogoutRedirectUri: "http://localhost:3001?logout=true",
        },
        cache: {
            cacheLocation: 'localStorage',
            storeAuthStateInCookie: false,
        },
        system: {
            loggerOptions: {
                loggerCallback(logLevel, message) {
                    console.log(message);
                },
                logLevel: LogLevel.Verbose,
                piiLoggingEnabled: false
            }
        }
    }
};

export const msalAppBInstance: PublicClientApplication = new PublicClientApplication(MsalConfig(ConfigAppB));
export const msalAppAInstance: PublicClientApplication = new PublicClientApplication(MsalConfig(ConfigAppA));