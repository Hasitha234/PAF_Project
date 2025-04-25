import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Container, Card, Row, Col, Alert } from "react-bootstrap";
import AuthService from "../services/auth.service";

const Profile = () => {
  const [redirect, setRedirect] = useState(null);
  const [userReady, setUserReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const currentUser = AuthService.getCurrentUser();

      if (!currentUser) {
        setRedirect("/login");
      } else {
        setCurrentUser(currentUser);
        setUserReady(true);
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
      setError("Error loading profile. Please log in again.");
      setRedirect("/login");
    }
  }, []);

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <Container className="mt-5">
      {error && (
        <Alert variant="danger">{error}</Alert>
      )}
      
      {userReady && currentUser && (
        <Card className="shadow">
          <Card.Header as="h3" className="text-center py-3 bg-primary text-white">
            User Profile
          </Card.Header>
          <Card.Body>
            <Row className="mb-3">
              <Col md={4} className="fw-bold">Username:</Col>
              <Col md={8}>{currentUser.username || "N/A"}</Col>
            </Row>
            <Row className="mb-3">
              <Col md={4} className="fw-bold">Email:</Col>
              <Col md={8}>{currentUser.email || "N/A"}</Col>
            </Row>
            <Row className="mb-3">
              <Col md={4} className="fw-bold">ID:</Col>
              <Col md={8}>{currentUser.id || "N/A"}</Col>
            </Row>
            <Row className="mb-3">
              <Col md={4} className="fw-bold">Token:</Col>
              <Col md={8} className="text-truncate">
                {currentUser.token ? (
                  <>
                    {currentUser.token.substring(0, 20)} ... {" "}
                    {currentUser.token.substr(currentUser.token.length - 20)}
                  </>
                ) : (
                  "Token not available"
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default Profile; 