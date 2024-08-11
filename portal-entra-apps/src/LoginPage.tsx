import {Alert, Button, Col, Container, Row} from "react-bootstrap";
import {
    ApplicationConfig,
    ConfigAppA, msalAppAInstance,
    msalAppBInstance,
} from "./MsalConfig.ts";
import {useLocation} from "react-router";
import {Location} from "react-router-dom";
import {useIsAuthenticated} from "@azure/msal-react";
import {
    AccountInfo,
    PopupRequest,
    RedirectRequest
} from "@azure/msal-browser";
import * as React from "react";
import {useCookies} from "react-cookie";
import {useEffect} from "react";


enum LoginType {
    POPUP = "popup",
    REDIRECT = "redirect",
}

export const LoginPage = () => {
    const location: Location = useLocation();
    const appConfig: ApplicationConfig = location.state?.appConfig;
    const isAuthenticated: boolean = useIsAuthenticated();
    const [, setCookie] = useCookies(['activeAccount']);

    useEffect(() => {
        if (!appConfig) {
            return;
        }

        if (isAuthenticated) {
            const account = getActiveAccount();
            if (account) {
                setCookie('activeAccount', account, {path: '/', secure: true, sameSite: 'none'});
            }
        }
    }, [appConfig, isAuthenticated, setCookie]);

    if (!appConfig) {

        return <>
            <Container>
                <Row>
                    <Alert variant={"danger"}>
                        Error: No App Config Provided
                    </Alert>
                </Row>
                <Row>
                    <Button href={"/"}>Go Back</Button>
                </Row>
            </Container>
        </>
    }

    function getActiveAccount(): AccountInfo | null {

        return msalAppAInstance.getActiveAccount()
            ?? msalAppBInstance.getActiveAccount()
            ?? msalAppAInstance.getAllAccounts()[0]
            ?? msalAppBInstance.getAllAccounts()[0]
            ?? null;
    }


    const handleLogin = (loginType: LoginType) => {
        console.log("Starting Login...");

        if (loginType === LoginType.POPUP) {
            console.log("Login Using Popup")
            const loginRequest: PopupRequest = {
                scopes: appConfig.scopes,
                redirectUri: "http://localhost:5173/",
            }
            console.log("App Config: ", appConfig.appName)
            if (appConfig.appName === ConfigAppA.appName) {
                console.log("Initialized App A")
                msalAppAInstance.loginPopup(loginRequest)
                    .then(response => {
                        const activeAccount: AccountInfo = response.account;
                        msalAppAInstance.setActiveAccount(activeAccount);
                    }).catch(error => {
                    console.error("LOG Login Error: ", error)
                });
            } else {
                console.log("Initialized App B")
                msalAppBInstance.loginPopup(loginRequest)
                    .then(response => {
                        const activeAccount: AccountInfo = response.account;
                        msalAppBInstance.setActiveAccount(activeAccount);
                    }).catch(error => {
                    console.error("LOG Login Error: ", error)
                });
            }
        }

        if (loginType === LoginType.REDIRECT) {
            console.log("Login Using Redirect")
            const loginRequest: RedirectRequest = {
                scopes: appConfig.scopes,
                redirectUri: appConfig.redirectUri,
                redirectStartPage: appConfig.redirectStartPage
            }
            if (appConfig.appName === ConfigAppA.appName) {
                msalAppAInstance.loginRedirect(loginRequest)
                    .then(response => {
                        console.log("Login Response: ", response)
                    }).catch(error => {
                    console.error("Login Error: ", error)
                });
            }
            //
            //     else {
            //         msalAppBInstance.loginRedirect(loginRequest)
            //             .then(response => {
            //                 console.log("Login Response: ", response)
            //             }).catch(error => {
            //             console.error("Login Error: ", error)
            //         });
            //     }
        }
    }

    const redirectSuccess = () => {
        console.log("Redirecting to App...")
        const activeAccount = getActiveAccount();
        if (activeAccount) {
            if (appConfig.appName === ConfigAppA.appName) {
                console.log("Redirecting to App A");
                window.location = "http://localhost:3000?username=" + activeAccount.username;
            } else {
                console.log("Redirecting to App B");
                window.location = "http://localhost:3000?username=" + activeAccount.username;
            }
        } else {
            console.error("No Active Account Found");
        }
    }

    return (
        <>
            {!isAuthenticated &&
                <Container>
                    <Row className={"justify-content-center"}>
                        <Col xs lg={5}>
                            <Alert variant={"info"}>Login Using {appConfig.appName}</Alert>
                        </Col>
                    </Row>
                    <Row className={"justify-content-center mb-3"}>
                        <Col xs lg={5}>
                            <Button onClick={() => handleLogin(LoginType.POPUP)}>Login Using Popup</Button>
                        </Col>
                    </Row>
                    <Row className={"justify-content-center mb-3"}>
                        <Col xs lg={5}>
                            <Button onClick={() => handleLogin(LoginType.REDIRECT)}>Login Using Redirect</Button>
                        </Col>
                    </Row>
                    <Row className={"justify-content-center mb-3"}>
                        <Col xs lg={5}>
                            <Button variant={"danger"} href={"/"}>Back</Button>
                        </Col>
                    </Row>
                </Container>
            }

            {isAuthenticated &&
                <Container>
                    <Row className={"justify-content-center"}>
                        <Col xs lg={5}>
                            <Alert variant={"success"}>You are Authenticated</Alert>
                        </Col>
                    </Row>
                    <Row className={"justify-content-center"}>
                        <Col xs lg={5}>
                            <Button variant={"primary"} onClick={() => redirectSuccess()}>Go to
                                App {appConfig.appName}</Button>
                        </Col>
                    </Row>
                </Container>
            }
        </>
    )
}