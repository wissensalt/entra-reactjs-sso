import {Alert, Button, Col, Container, Row} from "react-bootstrap";
import {
    ApplicationConfig,
    ConfigAppA,
    ConfigAppB,
    msalAppAInstance,
    msalAppBInstance
} from "./MsalConfig.ts";
import {useLocation, useNavigate} from "react-router";
import {useIsAuthenticated} from "@azure/msal-react";
import {AccountInfo} from "@azure/msal-browser";
import {useCookies} from "react-cookie";
import {useEffect} from "react";

function App() {
    const navigate = useNavigate();
    const isAuthenticated = useIsAuthenticated();
    const location = useLocation();
    const logoutParam: string = new URLSearchParams(location.search).get('logout');
    const [, setCookie, removeCookie] = useCookies(['activeAccount']);

    const chooseApp = (config: ApplicationConfig) => {
        if (isAuthenticated) {
            const activeAccount = getActiveAccount();
            if (activeAccount) {
                if (config.appName === ConfigAppA.appName) {
                    console.log("Redirecting to App A");
                    window.location = "http://localhost:3000?username=" + activeAccount.username;
                } else {
                    console.log("Redirecting to App B");
                    window.location = "http://localhost:3000?username=" + activeAccount.username;
                }
            } else {
                console.error("No Active Account Found");
            }
        } else {
            const loginPath = config === ConfigAppA ? "/login-app-a" : "/login-app-b";
            navigate(loginPath, {state: {appConfig: config}})
        }
    }

    function logout() {
        console.log("Logout...")
        if (isAuthenticated) {
            console.log("Logging Out APP A...")
            msalAppAInstance.logoutRedirect()
                .then(response => {
                    console.log("Logout Response: ", response)
                }).catch(errorLogoutAppA => {
                console.log("Error logging out: ", errorLogoutAppA);
            });

            console.log("Logging Out APP B...")
            msalAppBInstance.logoutRedirect().then(response => {
                console.log("Logout Response: ", response)
            }).catch(errorLogoutAppB => {
                console.error("Error logging out: ", errorLogoutAppB);
            });
        }
    }

    useEffect(() => {
        if (isAuthenticated) {
            const account = getActiveAccount();
            if (account) {
                setCookie('activeAccount', account, {path: '/', secure: true, sameSite: 'none'});
            }
        }
    }, [isAuthenticated, setCookie]);

    useEffect(() => {
        if (logoutParam === 'true') {
            console.log("LOG Draining Local Storage...")
            const items = {...localStorage};
            for (const key in items) {
                localStorage.removeItem(key);
            }
            console.log("LOG cleaning cookies...")
            removeCookie('activeAccount');
        }
    }, [logoutParam, removeCookie]);

    function getActiveAccount(): AccountInfo | null {

        return msalAppAInstance.getActiveAccount()
            ?? msalAppBInstance.getActiveAccount()
            ?? msalAppAInstance.getAllAccounts()[0]
            ?? msalAppBInstance.getAllAccounts()[0]
            ?? null;
    }

    return (
        <>
            <Container fluid={"lg"}>
                {isAuthenticated ?
                    <Row className={"justify-content-center"}>
                        <Col xs lg={5}>
                            <Alert variant={"success"}>You already Authenticated</Alert>
                        </Col>
                    </Row>
                    :
                    <Row className={"justify-content-center"}>
                        <Col xs lg={5}>
                            <Alert variant={"info"}>Choose an application to login</Alert>
                        </Col>
                    </Row>
                }
                <Row className={"justify-content-center mb-3"}>
                    <Col lg={5}>
                        <Button variant="primary" onClick={() => chooseApp(ConfigAppA)}>Application A</Button>
                    </Col>
                </Row>
                <Row className={"justify-content-center mb-3"}>
                    <Col xs lg={5}>
                        <Button variant="warning" onClick={() => chooseApp(ConfigAppB)}>Application B</Button>
                    </Col>
                </Row>

                {isAuthenticated &&
                    <Row className={"justify-content-center"}>
                        <Col xs lg={5}>
                            <Button variant="danger" onClick={() => logout()}>Logout</Button>
                        </Col>
                    </Row>
                }
            </Container>
        </>
    )
}

export default App
