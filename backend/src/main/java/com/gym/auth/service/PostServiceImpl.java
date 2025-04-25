package com.gym.auth.service;

import com.gym.auth.model.*;
import com.gym.auth.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.persistence.EntityNotFoundException;
import javax.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostServiceImpl implements PostService {

    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Value("${app.api.url:http://localhost:8080}")
    private String apiUrl;

    @Override
    @Transactional
    public Post createPost(String text, User user, List<MultipartFile> images, MultipartFile video) {
        Post post = new Post(text, user);
        
        // Save post first to get the ID
        post = postRepository.save(post);
        
        // Process images (max 3)
        if (images != null && !images.isEmpty()) {
            int imageCount = Math.min(images.size(), 3); // Limit to max 3 images
            
            for (int i = 0; i < imageCount; i++) {
                MultipartFile imageFile = images.get(i);
                if (!imageFile.isEmpty()) {
                    String fileName = fileStorageService.storeFile(imageFile, "images");
                    String fileUrl = ServletUriComponentsBuilder.fromHttpUrl(apiUrl)
                        .path("/api/files/images/")
                        .path(fileName)
                        .toUriString();
                    
                    PostImage postImage = new PostImage(
                        post, 
                        fileName, 
                        imageFile.getContentType(), 
                        fileUrl
                    );
                    
                    post.addImage(postImage);
                }
            }
        }
        
        // Process video (only one allowed)
        if (video != null && !video.isEmpty()) {
            String fileName = fileStorageService.storeFile(video, "videos");
            String fileUrl = ServletUriComponentsBuilder.fromHttpUrl(apiUrl)
                .path("/api/files/videos/")
                .path(fileName)
                .toUriString();
            
            PostVideo postVideo = new PostVideo(
                post, 
                fileName, 
                video.getContentType(), 
                fileUrl,
                30 // Default to max duration of 30 seconds
            );
            
            post.setVideo(postVideo);
        }
        
        return postRepository.save(post);
    }

    @Override
    public Post getPostById(Long id) {
        return postRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Post not found with id: " + id));
    }

    @Override
    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public List<Post> getPostsByUser(User user) {
        return postRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Override
    @Transactional
    public Post updatePost(Long id, String text, User user) {
        Post post = getPostById(id);
        
        // Check if the user is the owner of the post
        if (!post.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("You are not authorized to update this post");
        }
        
        post.setText(text);
        return postRepository.save(post);
    }

    @Override
    @Transactional
    public void deletePost(Long id, User user) {
        Post post = getPostById(id);
        
        // Check if the user is the owner of the post
        if (!post.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("You are not authorized to delete this post");
        }
        
        // Delete associated files
        post.getImages().forEach(image -> {
            fileStorageService.deleteFile("images/" + image.getFileName());
        });
        
        if (post.getVideo() != null) {
            fileStorageService.deleteFile("videos/" + post.getVideo().getFileName());
        }
        
        postRepository.delete(post);
    }

    @Override
    @Transactional
    public void likePost(Long postId, User user) {
        Post post = getPostById(postId);
        
        // Check if the user already liked the post
        boolean alreadyLiked = post.getLikes().stream()
            .anyMatch(like -> like.getUser().getId().equals(user.getId()));
        
        if (!alreadyLiked) {
            PostLike like = new PostLike(post, user);
            post.getLikes().add(like);
            postRepository.save(post);
        }
    }

    @Override
    @Transactional
    public void unlikePost(Long postId, User user) {
        Post post = getPostById(postId);
        
        List<PostLike> updatedLikes = post.getLikes().stream()
            .filter(like -> !like.getUser().getId().equals(user.getId()))
            .collect(Collectors.toList());
        
        post.setLikes(updatedLikes);
        postRepository.save(post);
    }

    @Override
    public boolean isPostLikedByUser(Long postId, User user) {
        Post post = getPostById(postId);
        
        return post.getLikes().stream()
            .anyMatch(like -> like.getUser().getId().equals(user.getId()));
    }

    @Override
    public long getPostLikesCount(Long postId) {
        Post post = getPostById(postId);
        return post.getLikes().size();
    }
} 