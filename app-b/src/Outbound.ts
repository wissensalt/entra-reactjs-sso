import {AccountInfo, AuthenticationResult} from "@azure/msal-browser";
import {defaultScopes, msalAppAInstance} from "./MsalConfig";
export interface Profile {
    businessPhones: string[],
    displayName: string,
    givenName: string,
    jobTitle: string,
    mail: string,
    mobilePhone: string,
    officeLocation: string,
    preferredLanguage: string,
    surname: string,
    userPrincipalName: string,
    id: string
}
export async function getProfile(account: AccountInfo|null): Promise<any> {
    if (account) {
        const response: AuthenticationResult = await msalAppAInstance.acquireTokenSilent({
            scopes: defaultScopes,
            account: account
        });
        const profileResponse: Response = await fetch("https://graph.microsoft.com/v1.0/me", {
            headers: {
                Authorization: `Bearer ${response.accessToken}`
            }
        });

        return await profileResponse.json();
    }

    return null;
}