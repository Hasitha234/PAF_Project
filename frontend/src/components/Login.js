import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import AuthService from "../services/auth.service";
import "./auth.css";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [redirect, setRedirect] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setRedirect("/wall");
    }
    
    // Check if the server is reachable
    fetch('http://localhost:8080/api/test/status')
      .then(response => {
        console.log('Server status check:', response.status);
        if (!response.ok) {
          setMessage('Server is not responding correctly. Status: ' + response.status);
        }
      })
      .catch(error => {
        console.error('Server check error:', error);
        setMessage('Cannot connect to server: ' + (error?.message || 'Unknown error'));
      });
  }, []);

  // If already logged in, redirect to profile
  if (redirect) {
    return <Navigate to="/wall" />;
  }

  const initialValues = {
    username: "testuser",
    password: "password",
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string().required("This field is required!"),
    password: Yup.string().required("This field is required!"),
  });

  const handleLogin = (formValue) => {
    const { username, password } = formValue;
    setMessage("");
    setLoading(true);

    console.log("Login attempt for:", username);

    // For testing, try direct fetch first
    fetch('http://localhost:8080/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    })
    .then(response => {
      console.log('Direct fetch response:', response);
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`Server responded with ${response.status}: ${text}`);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Login successful via direct fetch:', data);
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/wall");
      window.location.reload();
    })
    .catch(error => {
      console.error('Direct fetch error:', error);
      setMessage(error?.message || 'Login failed. Please try again.');
      setLoading(false);
      
      // Fall back to AuthService if direct fetch fails
      AuthService.login(username, password)
        .then(data => {
          console.log('Login successful via AuthService:', data);
          navigate("/wall");
          window.location.reload();
        })
        .catch(authError => {
          console.error('AuthService error:', authError);
          const resMessage = 
            (authError?.response?.data?.message) || 
            (authError?.message) || 
            'An error occurred during login. Please try again.';

          setLoading(false);
          setMessage(resMessage);
        });
    });
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-background"></div>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} className="auth-container">
            <div className="logo-area text-center mb-4">
              <h1 className="brand-name">CALISTHENIC<span>FLOW</span></h1>
              <p className="brand-tagline">Elevate Your Bodyweight Journey</p>
            </div>
            
            <Card className="auth-card">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <h2 className="auth-title">Welcome Back</h2>
                  <p className="auth-subtitle">Sign in to continue your training journey</p>
                  <p className="text-muted">Use testuser/password for testing</p>
                </div>

                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleLogin}
                >
                  {({ errors, touched }) => (
                    <Form>
                      <div className="form-group mb-4">
                        <label htmlFor="username" className="auth-label">Username</label>
                        <div className="input-icon-wrapper">
                          <i className="input-icon fas fa-user"></i>
                          <Field
                            name="username"
                            type="text"
                            className={
                              "form-control auth-input" +
                              (errors.username && touched.username
                                ? " is-invalid"
                                : "")
                            }
                            placeholder="Enter your username"
                          />
                        </div>
                        <ErrorMessage
                          name="username"
                          component="div"
                          className="invalid-feedback"
                        />
                      </div>

                      <div className="form-group mb-4">
                        <label htmlFor="password" className="auth-label">Password</label>
                        <div className="input-icon-wrapper">
                          <i className="input-icon fas fa-lock"></i>
                          <Field
                            name="password"
                            type="password"
                            className={
                              "form-control auth-input" +
                              (errors.password && touched.password
                                ? " is-invalid"
                                : "")
                            }
                            placeholder="Enter your password"
                          />
                        </div>
                        <ErrorMessage
                          name="password"
                          component="div"
                          className="invalid-feedback"
                        />
                      </div>

                      <div className="form-group mt-4">
                        <Button
                          type="submit"
                          variant="primary"
                          className="btn-auth-submit w-100"
                          disabled={loading}
                        >
                          {loading ? (
                            <span className="spinner-border spinner-border-sm me-2"></span>
                          ) : (
                            <><i className="fas fa-sign-in-alt me-2"></i></>
                          )}
                          <span>Sign In</span>
                        </Button>
                      </div>

                      {message && (
                        <div className="form-group mt-3">
                          <Alert variant="danger" className="auth-alert">
                            <i className="fas fa-exclamation-circle me-2"></i>
                            {message}
                          </Alert>
                        </div>
                      )}
                    </Form>
                  )}
                </Formik>
                <div className="mt-4 text-center auth-footer">
                  <p>Don't have an account? <a href="/register" className="auth-link">Join Now</a></p>
                </div>
              </Card.Body>
            </Card>
            <div className="auth-benefits mt-4 text-center">
              <p>Join thousands of athletes transforming their bodies with calisthenics</p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login; 