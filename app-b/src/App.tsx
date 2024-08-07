import React, {useEffect, useState} from 'react';
import {MsalProvider, useIsAuthenticated, useMsal} from '@azure/msal-react';
import {Alert, Button, Col, Container, Form, Modal, Row} from "react-bootstrap";
import {defaultScopes, msalAppAInstance, msalAppBInstance} from "./MsalConfig";
import {AccountInfo, InteractionStatus, RedirectRequest, SilentRequest} from "@azure/msal-browser";
import {useCookies} from "react-cookie";
import {useLocation} from "react-router";
import {getProfile, Profile} from "./Outbound";

enum LogoutType {
    POPUP = "popup",
    REDIRECT = "redirect"
}

function App() {
    const isAuthenticated = useIsAuthenticated();
    const location = useLocation();
    const usernameParam: string|null = new URLSearchParams(location.search).get('username');
    const logoutParam: string | null = new URLSearchParams(location.search).get('logout');
    const [cookies, setCookie, removeCookie] = useCookies(['activeAccount']);
    const [showModal, setShowModal] = useState(false);
    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => setShowModal(true);
    const [profileData, setProfileData] = useState<Profile>();



    const handleLogout = (logoutType: LogoutType) => {
        console.log("Starting Logout...");
        if (logoutType === LogoutType.POPUP) {
            console.log("Logout Using Popup")
            msalAppBInstance.logoutPopup()
                .then(response => {
                    console.log("Logout Response: ", response)
                }).catch(error => {
                console.error("Logout Error: ", error)
            });
        }

        if (logoutType === LogoutType.REDIRECT) {
            console.log("Logout Using Redirect")
            msalAppBInstance.initialize().then(() => {
                msalAppBInstance.logoutRedirect()
                    .then(response => {
                        console.log("Logout Response: ", response)
                    }).catch(error => {
                    console.error("Logout Error: ", error)
                });
            }).catch(error => {
                console.error("Initialize Error: ", error)
            });
        }
    }

    function gotoAppA() {
        console.log("Redirecting to App A")
        let activeAccount = getActiveAccount();
        console.log("Active Account: ", activeAccount);
        window.location.href = "http://localhost:3000?username=" + activeAccount?.username;
    }

    function login(username: string|null) {
        if (!isAuthenticated) {
            console.log("Login via Query Param: ", username);
            const loginRequest: RedirectRequest = {
                scopes: defaultScopes,
                redirectUri: "http://localhost:3001/",
                loginHint: username ? username : undefined,
            };
            msalAppBInstance.loginRedirect(loginRequest).then(r => {
                console.log("Login Response: ", r)
            }).catch(e => {
                console.error("Redirect Login Error: ", e)
            })
        }
    }

    const { inProgress } = useMsal();

    useEffect(() => {
        console.log("LOG isAuthenticated: ", isAuthenticated)
        if (!isAuthenticated) {
            if (inProgress === InteractionStatus.None) {
                const account = getActiveAccount();
                if (account) {
                    msalAppBInstance.initialize().then(() => {
                        msalAppBInstance.loginPopup({
                            loginHint: account.username,
                            scopes: defaultScopes,
                        }).then(response => {
                            console.log("LOG login Response: ", response)
                        }).catch(error => {
                            console.error("LOG login Error: ", error)
                        });
                    });
                }
            }
        } else {
            const account = getActiveAccount();
            console.log("LOG Account: ", account)
            if (account && !getCookieActiveAccount()) {
                console.log("LOG assign cookie")
                setCookie('activeAccount', account);
            }
        }
    }, [inProgress, isAuthenticated]);

    function drainLocalStorage() {
        console.log("Draining Local Storage...")
        const items = {...localStorage};
        for (const key in items) {
            localStorage.removeItem(key);
        }
        console.log("cleaning cookies...")
        removeCookie('activeAccount');
        window.location.href = "http://localhost:5173?logout=true";
    }

    function getCookieActiveAccount() : AccountInfo | null {
        if (cookies['activeAccount'] && cookies['activeAccount'] !== "undefined") {
            return cookies['activeAccount'];
        }

        return null;
    }

    function getActiveAccount(): AccountInfo | null {

        return msalAppBInstance.getActiveAccount()
            ?? msalAppBInstance.getAllAccounts()[0]
            ?? cookies['activeAccount'];
    }

    function showMyProfile() {
        getProfile(getActiveAccount()).then(response => {
            // console.log("Profile Response: ", response)
            //convert response to Profile type
            const profile: Profile = {
                displayName: response.displayName,
                givenName: response.givenName,
                surname: response.surname,
                userPrincipalName: response.userPrincipalName,
                id: response.id,
                businessPhones: response.businessPhones,
                jobTitle: response.jobTitle,
                mail: response.mail,
                mobilePhone: response.mobilePhone,
                officeLocation: response.officeLocation,
                preferredLanguage: response.preferredLanguage
            }
            setProfileData(profile)
            handleShowModal();
        });
    }

    return (
        <>
            {isAuthenticated && !getCookieActiveAccount() && drainLocalStorage()}
            {logoutParam === "true" && drainLocalStorage()}
            {isAuthenticated
                ?
                <Container>
                    <Row className={"justify-content-center"}>
                        <Col xs lg={5}>
                            <Alert variant={"success"}>You are authenticated IN APP B</Alert>
                        </Col>
                    </Row>
                    <Row className={"justify-content-center mb-3"}>
                        <Col xs lg={5}>
                            <MsalProvider instance={msalAppAInstance}>
                                <Button variant={"primary"} onClick={() => gotoAppA()}>Go To App A</Button>
                            </MsalProvider>
                        </Col>
                    </Row>
                    <Row className={"justify-content-center mb-3"}>
                        <Col xs lg={5}>
                            <MsalProvider instance={msalAppBInstance}>
                                <Button variant={"primary"} onClick={() => showMyProfile()}>Show My Profile</Button>
                            </MsalProvider>
                        </Col>
                    </Row>
                    <Modal show={showModal} onHide={handleCloseModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Profile Data</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>{profileData
                            ?
                            <Container>
                                <Row>
                                    <Col>
                                        <Form.Label>Display Name</Form.Label>
                                        <Form.Control type="text" value={profileData.displayName} readOnly/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Form.Label>Mail</Form.Label>
                                        <Form.Control type="text" value={profileData.mail} readOnly/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Form.Label>User Principal Name</Form.Label>
                                        <Form.Control type="text" value={profileData.userPrincipalName} readOnly/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Form.Label>ID</Form.Label>
                                        <Form.Control type="text" value={profileData.id} readOnly/>
                                    </Col>
                                </Row>
                            </Container>
                            : "Failed to call MS Graph"}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                    <Row className={"justify-content-center"}>
                        <Col xs lg={5}>
                            <MsalProvider instance={msalAppBInstance}>
                                <Button variant={"danger"}
                                        onClick={() => handleLogout(LogoutType.REDIRECT)}>Logout</Button>
                            </MsalProvider>
                        </Col>
                    </Row>
                </Container>
                :
                <Container>
                    <Row className={"justify-content-center"}>
                        <Col xs lg={5}>
                            <Alert variant={"danger"}>You are not authenticated</Alert>
                        </Col>
                    </Row>
                    <Row className={"justify-content-center"}>
                        <Col xs lg={5}>
                            <Button variant={"info"} onClick={() => login(usernameParam)}>Login</Button>
                        </Col>
                    </Row>
                </Container>
            }
        </>
    );
}

export default App;
