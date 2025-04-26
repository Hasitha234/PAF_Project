package com.gym.auth.security;

import com.gym.auth.model.*;
import com.gym.auth.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final ProgressRepository progressRepository;
    private final ProgressHistoryRepository progressHistoryRepository;
    private final PostRepository postRepository;

    public DataInitializer(
            UserRepository userRepository,
            PasswordEncoder encoder,
            ProgressRepository progressRepository,
            ProgressHistoryRepository progressHistoryRepository,
            PostRepository postRepository) {
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.progressRepository = progressRepository;
        this.progressHistoryRepository = progressHistoryRepository;
        this.postRepository = postRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Initialize test users if they don't exist
        initUsers();
        
        // Initialize test progress data for test user
        initProgressData();
        
        // Initialize community wall posts
        initWallPosts();
    }

    private void initUsers() {
        if (userRepository.count() == 0) {
            // Create admin user
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@calisthenicflow.com");
            admin.setPassword(encoder.encode("adminpass"));
            userRepository.save(admin);

            // Create moderator
            User moderator = new User();
            moderator.setUsername("moderator");
            moderator.setEmail("mod@calisthenicflow.com");
            moderator.setPassword(encoder.encode("modpass"));
            userRepository.save(moderator);

            // Create test user
            User testUser = new User();
            testUser.setUsername("testuser");
            testUser.setEmail("test@calisthenicflow.com");
            testUser.setPassword(encoder.encode("password"));
            userRepository.save(testUser);

            System.out.println("Test users initialized");
        }
    }

    private void initProgressData() {
        if (progressRepository.count() == 0) {
            // Find test user
            User testUser = userRepository.findByUsername("testuser")
                    .orElseThrow(() -> new RuntimeException("Test user not found"));
            
            // Create weight loss progress
            Progress weightLoss = new Progress();
            weightLoss.setUser(testUser);
            weightLoss.setGoalType("Weight Loss");
            weightLoss.setGoalDescription("Lose weight for summer");
            weightLoss.setInitialValue(85.0);
            weightLoss.setCurrentValue(82.5);
            weightLoss.setTargetValue(75.0);
            weightLoss.setUnit("kg");
            
            // Set target date to 3 months from now
            Calendar targetDate = Calendar.getInstance();
            targetDate.add(Calendar.MONTH, 3);
            weightLoss.setTargetDate(targetDate.getTime());
            
            weightLoss.setIsCompleted(false);
            Progress savedWeightLoss = progressRepository.save(weightLoss);
            
            // Create initial history entry
            ProgressHistory initialWeight = new ProgressHistory();
            initialWeight.setProgress(savedWeightLoss);
            initialWeight.setMeasurementValue(85.0);
            initialWeight.setNotes("Initial measurement");
            
            // Create current history entry (1 month later)
            ProgressHistory currentWeight = new ProgressHistory();
            currentWeight.setProgress(savedWeightLoss);
            currentWeight.setMeasurementValue(82.5);
            currentWeight.setNotes("After 1 month of training");
            
            // Adjust recorded date for the current entry to be 1 month after start
            Calendar oneMonthLater = Calendar.getInstance();
            oneMonthLater.add(Calendar.MONTH, -1);
            currentWeight.setRecordedAt(oneMonthLater.getTime());
            
            progressHistoryRepository.save(initialWeight);
            progressHistoryRepository.save(currentWeight);
            
            // Create strength training progress
            Progress pushUps = new Progress();
            pushUps.setUser(testUser);
            pushUps.setGoalType("Strength");
            pushUps.setGoalDescription("Increase max push-ups");
            pushUps.setInitialValue(10.0);
            pushUps.setCurrentValue(15.0);
            pushUps.setTargetValue(30.0);
            pushUps.setUnit("reps");
            
            // Set target date to 2 months from now
            Calendar pushUpTarget = Calendar.getInstance();
            pushUpTarget.add(Calendar.MONTH, 2);
            pushUps.setTargetDate(pushUpTarget.getTime());
            
            pushUps.setIsCompleted(false);
            Progress savedPushUps = progressRepository.save(pushUps);
            
            // Create initial history entry
            ProgressHistory initialPushUps = new ProgressHistory();
            initialPushUps.setProgress(savedPushUps);
            initialPushUps.setMeasurementValue(10.0);
            initialPushUps.setNotes("Initial max push-ups");
            
            // Create current history entry (2 weeks later)
            ProgressHistory currentPushUps = new ProgressHistory();
            currentPushUps.setProgress(savedPushUps);
            currentPushUps.setMeasurementValue(15.0);
            currentPushUps.setNotes("After 2 weeks of training");
            
            // Adjust recorded date for the current entry to be 2 weeks after start
            Calendar twoWeeksLater = Calendar.getInstance();
            twoWeeksLater.add(Calendar.WEEK_OF_YEAR, -2);
            currentPushUps.setRecordedAt(twoWeeksLater.getTime());
            
            progressHistoryRepository.save(initialPushUps);
            progressHistoryRepository.save(currentPushUps);
            
            System.out.println("Progress data initialized");
        }
    }

    private void initWallPosts() {
        if (postRepository.count() == 0) {
            // Get users
            User admin = userRepository.findByUsername("admin")
                    .orElseThrow(() -> new RuntimeException("Admin user not found"));
            
            User mod = userRepository.findByUsername("moderator")
                    .orElseThrow(() -> new RuntimeException("Moderator user not found"));
            
            User testUser = userRepository.findByUsername("testuser")
                    .orElseThrow(() -> new RuntimeException("Test user not found"));
            
            // Create wall posts
            List<Post> posts = new ArrayList<>();
            
            // Admin post
            Post welcomePost = new Post();
            welcomePost.setUser(admin);
            welcomePost.setText("Welcome to CalisthenicFlow! Track your progress and connect with other fitness enthusiasts.");
            posts.add(welcomePost);
            
            // Moderator post
            Post tipPost = new Post();
            tipPost.setUser(mod);
            tipPost.setText("Tip of the day: For better pull-up progression, start with negative pull-ups. Jump to the top position and slowly lower yourself.");
            posts.add(tipPost);
            
            // Test user post
            Post userPost = new Post();
            userPost.setUser(testUser);
            userPost.setText("Just completed my first muscle-up! Hard work pays off!");
            posts.add(userPost);
            
            // Set older dates for the posts
            Calendar twoWeeksAgo = Calendar.getInstance();
            twoWeeksAgo.add(Calendar.WEEK_OF_YEAR, -2);
            welcomePost.setCreatedAt(twoWeeksAgo.getTime());
            
            Calendar oneWeekAgo = Calendar.getInstance();
            oneWeekAgo.add(Calendar.WEEK_OF_YEAR, -1);
            tipPost.setCreatedAt(oneWeekAgo.getTime());
            
            // Save all posts
            postRepository.saveAll(posts);
            
            System.out.println("Wall posts initialized");
        }
    }
} 