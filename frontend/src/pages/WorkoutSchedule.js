import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Modal, ListGroup, Badge } from "react-bootstrap";
import { toast } from "react-toastify";
import WorkoutScheduleService from "../services/workout-schedule.service";
import "../styles/WorkoutSchedule.css";

const WorkoutSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduleDays, setScheduleDays] = useState([]);
  const [exercises, setExercises] = useState([{ name: "", sets: 3, reps: 10, completed: false }]);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await WorkoutScheduleService.getAll();
      setSchedules(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load workout schedules");
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setScheduleDays([]);
    setExercises([{ name: "", sets: 3, reps: 10, completed: false }]);
    setCurrentSchedule(null);
  };

  const handleShowAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  const handleEditSchedule = (schedule) => {
    setCurrentSchedule(schedule);
    setTitle(schedule.title);
    setDescription(schedule.description);
    setScheduleDays(schedule.days || []);
    setExercises(schedule.exercises || []);
    setShowAddModal(true);
  };

  const handleAddExercise = () => {
    setExercises([...exercises, { name: "", sets: 3, reps: 10, completed: false }]);
  };

  const handleRemoveExercise = (index) => {
    const newExercises = [...exercises];
    newExercises.splice(index, 1);
    setExercises(newExercises);
  };

  const handleExerciseChange = (index, field, value) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };

  const handleDayToggle = (day) => {
    if (scheduleDays.includes(day)) {
      setScheduleDays(scheduleDays.filter(d => d !== day));
    } else {
      setScheduleDays([...scheduleDays, day]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || exercises.some(ex => !ex.name)) {
      toast.error("Please fill all required fields");
      return;
    }

    const scheduleData = {
      title,
      description,
      days: scheduleDays,
      exercises
    };

    try {
      if (currentSchedule) {
        await WorkoutScheduleService.update(currentSchedule.id, scheduleData);
        toast.success("Workout schedule updated successfully");
      } else {
        await WorkoutScheduleService.create(scheduleData);
        toast.success("Workout schedule created successfully");
      }
      
      handleCloseModal();
      fetchSchedules();
    } catch (error) {
      toast.error(currentSchedule ? "Failed to update schedule" : "Failed to create schedule");
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm("Are you sure you want to delete this workout schedule?")) {
      try {
        await WorkoutScheduleService.remove(id);
        toast.success("Workout schedule deleted successfully");
        fetchSchedules();
      } catch (error) {
        toast.error("Failed to delete workout schedule");
      }
    }
  };

  const handleCompleteExercise = async (scheduleId, exerciseId) => {
    try {
      await WorkoutScheduleService.completeExercise(scheduleId, exerciseId);
      toast.success("Exercise marked as complete");
      fetchSchedules();
    } catch (error) {
      toast.error("Failed to update exercise status");
    }
  };

  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <h3>Loading your workout schedules...</h3>
      </Container>
    );
  }

  return (
    <Container className="mt-4 workout-schedule-container">
      <Row className="mb-4">
        <Col>
          <h2 className="page-title">Workout Schedule</h2>
          <p className="page-subtitle">Track your fitness journey and stay on schedule</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={handleShowAddModal} className="add-workout-btn">
            <i className="fas fa-plus"></i> Create New Workout
          </Button>
        </Col>
      </Row>

      {schedules.length === 0 ? (
        <Card className="text-center p-5 empty-state">
          <Card.Body>
            <i className="fas fa-dumbbell fa-3x mb-3"></i>
            <h4>No workout schedules yet</h4>
            <p>Create your first workout schedule to get started on your fitness journey!</p>
            <Button variant="primary" onClick={handleShowAddModal}>Create Workout Schedule</Button>
          </Card.Body>
        </Card>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {schedules.map((schedule) => (
            <Col key={schedule.id}>
              <Card className="h-100 workout-card">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{schedule.title}</h5>
                  <div>
                    <Button variant="light" size="sm" onClick={() => handleEditSchedule(schedule)}>
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button variant="light" size="sm" onClick={() => handleDeleteSchedule(schedule.id)}>
                      <i className="fas fa-trash-alt"></i>
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <p>{schedule.description}</p>
                  
                  <h6>Schedule Days:</h6>
                  <div className="mb-3 days-container">
                    {weekdays.map(day => (
                      <Badge 
                        key={day} 
                        bg={schedule.days && schedule.days.includes(day) ? "primary" : "secondary"}
                        className="me-1 mb-1"
                      >
                        {day.substring(0, 3)}
                      </Badge>
                    ))}
                  </div>

                  <h6>Exercises:</h6>
                  <ListGroup variant="flush" className="exercise-list">
                    {schedule.exercises && schedule.exercises.map((exercise, index) => (
                      <ListGroup.Item 
                        key={index}
                        className={`d-flex justify-content-between align-items-center ${exercise.completed ? 'completed-exercise' : ''}`}
                      >
                        <div>
                          <span className="exercise-name">{exercise.name}</span>
                          <small className="d-block text-muted">
                            {exercise.sets} sets × {exercise.reps} reps
                          </small>
                        </div>
                        <Form.Check 
                          type="checkbox"
                          checked={exercise.completed}
                          onChange={() => handleCompleteExercise(schedule.id, exercise.id)}
                          label=""
                        />
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Add/Edit Workout Schedule Modal */}
      <Modal show={showAddModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{currentSchedule ? "Edit" : "Create"} Workout Schedule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g., Upper Body Workout" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2} 
                placeholder="Brief description of this workout schedule" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Schedule Days</Form.Label>
              <div className="d-flex flex-wrap">
                {weekdays.map(day => (
                  <Form.Check
                    key={day}
                    inline
                    type="checkbox"
                    id={`day-${day}`}
                    label={day}
                    checked={scheduleDays.includes(day)}
                    onChange={() => handleDayToggle(day)}
                    className="me-3 mb-2"
                  />
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Exercises</Form.Label>
              {exercises.map((exercise, index) => (
                <Row key={index} className="mb-2 align-items-end">
                  <Col xs={12} sm={5}>
                    <Form.Control 
                      type="text" 
                      placeholder="Exercise name" 
                      value={exercise.name}
                      onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                      required
                    />
                  </Col>
                  <Col xs={6} sm={2}>
                    <Form.Control 
                      type="number" 
                      placeholder="Sets" 
                      value={exercise.sets}
                      onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value))}
                      min="1"
                    />
                    <small className="text-muted">Sets</small>
                  </Col>
                  <Col xs={6} sm={2}>
                    <Form.Control 
                      type="number" 
                      placeholder="Reps" 
                      value={exercise.reps}
                      onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value))}
                      min="1"
                    />
                    <small className="text-muted">Reps</small>
                  </Col>
                  <Col xs={12} sm={3} className="d-flex justify-content-end">
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleRemoveExercise(index)}
                      disabled={exercises.length === 1}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </Button>
                  </Col>
                </Row>
              ))}
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={handleAddExercise}
                className="mt-2"
              >
                <i className="fas fa-plus"></i> Add Exercise
              </Button>
            </Form.Group>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {currentSchedule ? "Update" : "Create"} Workout Schedule
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default WorkoutSchedule; 