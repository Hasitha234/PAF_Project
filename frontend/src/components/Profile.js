import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Container, Card, Row, Col } from "react-bootstrap";
import AuthService from "../services/auth.service";

const Profile = () => {
  const [redirect, setRedirect] = useState(null);
  const [userReady, setUserReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();

    if (!currentUser) {
      setRedirect("/login");
    } else {
      setCurrentUser(currentUser);
      setUserReady(true);
    }
  }, []);

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <Container className="mt-5">
      {userReady ? (
        <Card className="shadow">
          <Card.Header as="h3" className="text-center py-3 bg-primary text-white">
            User Profile
          </Card.Header>
          <Card.Body>
            <Row className="mb-3">
              <Col md={4} className="fw-bold">Username:</Col>
              <Col md={8}>{currentUser.username}</Col>
            </Row>
            <Row className="mb-3">
              <Col md={4} className="fw-bold">Email:</Col>
              <Col md={8}>{currentUser.email}</Col>
            </Row>
            <Row className="mb-3">
              <Col md={4} className="fw-bold">ID:</Col>
              <Col md={8}>{currentUser.id}</Col>
            </Row>
            <Row className="mb-3">
              <Col md={4} className="fw-bold">Token:</Col>
              <Col md={8} className="text-truncate">
                {currentUser.token.substring(0, 20)} ... {" "}
                {currentUser.token.substr(currentUser.token.length - 20)}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ) : null}
    </Container>
  );
};

export default Profile; 