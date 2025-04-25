package com.gym.auth.controller;

import com.gym.auth.model.Post;
import com.gym.auth.model.User;
import com.gym.auth.model.dto.PostRequest;
import com.gym.auth.model.dto.PostResponse;
import com.gym.auth.repository.UserRepository;
import com.gym.auth.security.UserDetailsImpl;
import com.gym.auth.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User currentUser = userRepository.findById(userDetails.getId()).orElseThrow();
        
        List<Post> posts = postService.getAllPosts();
        
        List<PostResponse> postResponses = posts.stream()
            .map(post -> PostResponse.fromPost(post, postService.isPostLikedByUser(post.getId(), currentUser)))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(postResponses);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PostResponse> getPostById(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User currentUser = userRepository.findById(userDetails.getId()).orElseThrow();
        
        Post post = postService.getPostById(id);
        boolean likedByUser = postService.isPostLikedByUser(id, currentUser);
        
        return ResponseEntity.ok(PostResponse.fromPost(post, likedByUser));
    }
    
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PostResponse>> getPostsByUser(@PathVariable Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User currentUser = userRepository.findById(userDetails.getId()).orElseThrow();
        
        User user = userRepository.findById(userId).orElseThrow();
        List<Post> posts = postService.getPostsByUser(user);
        
        List<PostResponse> postResponses = posts.stream()
            .map(post -> PostResponse.fromPost(post, postService.isPostLikedByUser(post.getId(), currentUser)))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(postResponses);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PostResponse> createPost(
            @RequestParam(value = "text", required = false) String text,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "video", required = false) MultipartFile video) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        Post post = postService.createPost(text, user, images, video);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(new PostResponse(post));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable Long id,
            @RequestBody PostRequest postRequest) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        Post post = postService.updatePost(id, postRequest.getText(), user);
        
        return ResponseEntity.ok(new PostResponse(post));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        postService.deletePost(id, user);
        
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/like")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> likePost(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        postService.likePost(id, user);
        
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/unlike")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> unlikePost(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        postService.unlikePost(id, user);
        
        return ResponseEntity.ok().build();
    }
} 