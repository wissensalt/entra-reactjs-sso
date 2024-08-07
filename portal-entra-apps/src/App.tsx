import {Alert, Button, Col, Container, Row} from "react-bootstrap";
import {
    ApplicationConfig,
    ConfigAppA,
    ConfigAppB,
    msalAppAInstance,
    msalAppBInstance,
    msalPlaygroundInstance
} from "./MsalConfig.ts";
import {useLocation, useNavigate} from "react-router";
import {useIsAuthenticated} from "@azure/msal-react";
import {AccountInfo} from "@azure/msal-browser";
import {useCookies} from "react-cookie";
import {useEffect, useState} from "react";

function App() {
    const navigate = useNavigate();
    const isAuthenticated = useIsAuthenticated();
    const location = useLocation();
    const logoutParam: string = new URLSearchParams(location.search).get('logout');
    const [cookies, setCookie, removeCookie] = useCookies(['activeAccount']);

    const chooseApp = (config: ApplicationConfig) => {
        if (isAuthenticated) {
            if (config.appName === ConfigAppA.appName) {
                console.log("Redirecting to App A")
                const activeAccount = getActiveAccount();
                if (activeAccount) {
                    msalAppAInstance.setActiveAccount(activeAccount);
                    msalAppBInstance.setActiveAccount(activeAccount);
                    window.location = "http://localhost:3000?username=" + activeAccount.username;
                }
            } else {
                console.log("Redirecting to App B")
                const activeAccount = getActiveAccount();
                if (activeAccount) {
                    msalAppAInstance.setActiveAccount(activeAccount);
                    msalAppBInstance.setActiveAccount(activeAccount);
                    window.location = "http://localhost:3001?username=" + activeAccount.username;
                }
            }
        } else {
            console.log("Config: ", config);
            const loginPath = config === ConfigAppA ? "/login-app-a" : "/login-app-b";
            navigate(loginPath, {state: {appConfig: config}})
        }
    }

    function drainLocalStorage() {
        console.log("Draining Local Storage...")
        const items = {...localStorage};
        for (const key in items) {
            localStorage.removeItem(key);
        }
        console.log("cleaning cookies...")
        removeCookie('activeAccount');
    }

    function logout() {
        console.log("Logout...")
        if (isAuthenticated) {
            console.log("Logging Out...")
            msalPlaygroundInstance.logoutRedirect()
                .then(response => {
                    console.log("Logout Response: ", response)
                }).catch(error => {
                console.error("Logout Error: ", error)
            });
        }
    }

    const [activeAccount, setActiveAccount] = useState<AccountInfo | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            const account = getActiveAccount();
            setActiveAccount(account);
            if (account) {
                setCookie('activeAccount', account);
            }
        }
    }, [isAuthenticated]);

    function getActiveAccount(): AccountInfo | null {

        return msalAppAInstance.getActiveAccount()
            ?? msalAppBInstance.getActiveAccount()
            ?? msalAppAInstance.getAllAccounts()[0]
            ?? msalAppBInstance.getAllAccounts()[0]
            ?? null;
    }

    return (
        <>
            {logoutParam === "true" && drainLocalStorage()}
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
