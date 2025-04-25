import React, { useState, useEffect } from "react";
import { Container, Card, Row, Col, Button, Form, Badge, Spinner, Modal, Dropdown } from "react-bootstrap";
import { Navigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import WallService from "../services/wall.service";
import "./Wall.css";

const Wall = () => {
  const [redirect, setRedirect] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // For post creation
  const [postText, setPostText] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [error, setError] = useState("");
  
  // For post editing
  const [editingPost, setEditingPost] = useState(null);
  const [editText, setEditText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    
    if (!user) {
      setRedirect("/login");
    } else {
      setCurrentUser(user);
      loadPosts();
    }
  }, []);

  const loadPosts = () => {
    setLoading(true);
    WallService.getAllPosts()
      .then((response) => {
        setPosts(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading posts:", error);
        setLoading(false);
      });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate number of images (max 3)
    if (selectedImages.length + files.length > 3) {
      setError("You can upload a maximum of 3 images in total");
      return;
    }

    // Add new images to existing selection
    const newSelectedImages = [...selectedImages, ...files];
    setSelectedImages(newSelectedImages);
    
    // Create preview URLs for new images and add to existing previews
    const newImagePreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newImagePreviews]);
    setError("");
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if already has a video
    if (selectedVideo) {
      // Clear the old video first
      URL.revokeObjectURL(previewVideo);
    }

    // Create a video element to check duration
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = function() {
      window.URL.revokeObjectURL(video.src);
      
      // Check if video is less than 30 seconds
      if (video.duration > 30) {
        setError("Video must be 30 seconds or less");
        setSelectedVideo(null);
        setPreviewVideo(null);
      } else {
        setSelectedVideo(file);
        setPreviewVideo(URL.createObjectURL(file));
        setError("");
      }
    };
    
    video.src = URL.createObjectURL(file);
  };

  const clearMediaSelections = () => {
    // Clear preview URLs to prevent memory leaks
    previewImages.forEach(url => URL.revokeObjectURL(url));
    if (previewVideo) URL.revokeObjectURL(previewVideo);
    
    setSelectedImages([]);
    setSelectedVideo(null);
    setPreviewImages([]);
    setPreviewVideo(null);
    setPostText("");
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!postText && selectedImages.length === 0 && !selectedVideo) {
      setError("Please enter text or add media to your post");
      return;
    }

    // Validate total media (max should be 4 - 3 images and 1 video)
    if (selectedImages.length > 3) {
      setError("You can upload a maximum of 3 images");
      return;
    }
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append("text", postText);
    
    selectedImages.forEach((image, index) => {
      formData.append(`images`, image);
    });
    
    if (selectedVideo) {
      formData.append("video", selectedVideo);
    }
    
    WallService.createPost(formData)
      .then(() => {
        clearMediaSelections();
        loadPosts();
        setUploading(false);
      })
      .catch((error) => {
        console.error("Error creating post:", error);
        setError("Failed to create post. Please try again.");
        setUploading(false);
      });
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditText(post.text || "");
  };

  const cancelEditPost = () => {
    setEditingPost(null);
    setEditText("");
  };

  const submitEditPost = () => {
    if (!editingPost) return;
    
    setUploading(true);
    
    WallService.updatePost(editingPost.id, { text: editText })
      .then(() => {
        loadPosts();
        setEditingPost(null);
        setEditText("");
        setUploading(false);
      })
      .catch((error) => {
        console.error("Error updating post:", error);
        setError("Failed to update post. Please try again.");
        setUploading(false);
      });
  };

  const confirmDeletePost = (post) => {
    setPostToDelete(post);
    setShowDeleteConfirm(true);
  };

  const cancelDeletePost = () => {
    setPostToDelete(null);
    setShowDeleteConfirm(false);
  };

  const deletePost = () => {
    if (!postToDelete) return;
    
    setUploading(true);
    
    WallService.deletePost(postToDelete.id)
      .then(() => {
        loadPosts();
        setShowDeleteConfirm(false);
        setPostToDelete(null);
        setUploading(false);
      })
      .catch((error) => {
        console.error("Error deleting post:", error);
        setError("Failed to delete post. Please try again.");
        setUploading(false);
      });
  };

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => {
    return (
      <Modal show={showDeleteConfirm} onHide={cancelDeletePost} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this post? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDeletePost}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deletePost} disabled={uploading}>
            {uploading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  return (
    <div className="wall-container">
      <Container>
        {/* Create Post Card */}
        <Card className="create-post-card mb-4 shadow-sm">
          <Card.Body>
            <h4 className="mb-3">Create Post</h4>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder={`What's on your mind, ${currentUser?.username}?`}
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  className="post-textarea"
                />
              </Form.Group>
              
              {/* Preview for selected media */}
              {(previewImages.length > 0 || previewVideo) && (
                <div className="media-preview mb-3">
                  {previewImages.length > 0 && (
                    <div className="media-preview-section">
                      {previewVideo && <span className="media-preview-label">Images ({previewImages.length}/3)</span>}
                      <Row>
                        {previewImages.map((src, index) => (
                          <Col key={index} xs={4} className="mb-2">
                            <div className="preview-container">
                              <img src={src} alt={`Preview ${index}`} className="img-preview" />
                              <Button 
                                variant="danger" 
                                size="sm" 
                                className="remove-btn"
                                onClick={() => {
                                  URL.revokeObjectURL(src);
                                  setPreviewImages(previewImages.filter((_, i) => i !== index));
                                  setSelectedImages(selectedImages.filter((_, i) => i !== index));
                                }}
                              >
                                ×
                              </Button>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
                  
                  {previewImages.length > 0 && previewVideo && <div className="media-divider"></div>}
                  
                  {previewVideo && (
                    <div className="media-preview-section">
                      {previewImages.length > 0 && <span className="media-preview-label">Video</span>}
                      <div className="preview-container">
                        <video 
                          src={previewVideo} 
                          controls 
                          className="video-preview"
                        />
                        <Button 
                          variant="danger" 
                          size="sm" 
                          className="remove-btn"
                          onClick={() => {
                            URL.revokeObjectURL(previewVideo);
                            setPreviewVideo(null);
                            setSelectedVideo(null);
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {error && <div className="text-danger mb-3">{error}</div>}
              
              <div className="d-flex justify-content-between align-items-center">
                <div className="upload-options">
                  <Form.Label 
                    htmlFor="image-upload" 
                    className={`mb-0 me-3 upload-btn ${selectedImages.length >= 3 || uploading ? 'disabled' : ''}`}
                    style={{ pointerEvents: selectedImages.length >= 3 || uploading ? 'none' : 'auto' }}
                  >
                    <i className="fas fa-image me-1"></i> 
                    {selectedImages.length > 0 ? `Photo (${selectedImages.length}/3)` : 'Photo'}
                  </Form.Label>
                  <Form.Control
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="d-none"
                    disabled={uploading || selectedImages.length >= 3}
                  />
                  
                  <Form.Label 
                    htmlFor="video-upload" 
                    className={`mb-0 upload-btn ${selectedVideo !== null || uploading ? 'disabled' : ''}`}
                    style={{ pointerEvents: selectedVideo !== null || uploading ? 'none' : 'auto' }}
                  >
                    <i className="fas fa-video me-1"></i> 
                    {selectedVideo ? 'Video Added' : 'Video'}
                  </Form.Label>
                  <Form.Control
                    type="file"
                    id="video-upload"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="d-none"
                    disabled={uploading || selectedVideo !== null}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="post-btn"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Posting...
                    </>
                  ) : (
                    "Post"
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
        
        {/* Posts Feed */}
        <div className="posts-container">
          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center my-5">
              <p className="empty-feed-message">No posts yet. Be the first to share something!</p>
            </div>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="post-card mb-4 shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div className="avatar-container me-3">
                      <div className="avatar">
                        {post.user.username.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="mb-0">{post.user.username}</h5>
                      <small className="text-muted">
                        {new Date(post.createdAt).toLocaleString()}
                      </small>
                    </div>
                    {currentUser && post.user.id === currentUser.id && (
                      <div className="post-actions-dropdown">
                        <Dropdown>
                          <Dropdown.Toggle variant="light" size="sm" id={`dropdown-${post.id}`}>
                            <i className="fas fa-ellipsis-h"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu align="end">
                            <Dropdown.Item onClick={() => handleEditPost(post)}>
                              <i className="fas fa-edit me-2"></i> Edit
                            </Dropdown.Item>
                            <Dropdown.Item className="text-danger" onClick={() => confirmDeletePost(post)}>
                              <i className="fas fa-trash-alt me-2"></i> Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    )}
                  </div>
                  
                  {editingPost && editingPost.id === post.id ? (
                    <div className="edit-post-form mb-3">
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="mb-2 post-textarea"
                      />
                      <div className="d-flex justify-content-end">
                        <Button variant="secondary" size="sm" className="me-2" onClick={cancelEditPost}>
                          Cancel
                        </Button>
                        <Button variant="primary" size="sm" onClick={submitEditPost} disabled={uploading}>
                          {uploading ? (
                            <>
                              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    post.text && <Card.Text>{post.text}</Card.Text>
                  )}
                  
                  {/* Post Media */}
                  {post.images && post.images.length > 0 && (
                    <div className="post-media mb-3">
                      <Row>
                        {post.images.map((image, index) => (
                          <Col key={index} xs={12} md={post.images.length > 1 ? 6 : 12} className="mb-2">
                            <img 
                              src={image.url} 
                              alt={`Post ${post.id} image ${index}`} 
                              className="post-image"
                            />
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
                  
                  {post.video && (
                    <div className="post-media mb-3">
                      <video 
                        src={post.video.url} 
                        controls 
                        className="post-video w-100"
                      />
                    </div>
                  )}
                  
                  {/* Post Actions */}
                  <div className="post-actions">
                    <Button variant="light" className="action-btn">
                      <i className="far fa-heart me-1"></i> Like
                    </Button>
                    <Button variant="light" className="action-btn">
                      <i className="far fa-comment me-1"></i> Comment
                    </Button>
                    <Button variant="light" className="action-btn">
                      <i className="fas fa-share me-1"></i> Share
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </div>
      </Container>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal />
    </div>
  );
};

export default Wall; 