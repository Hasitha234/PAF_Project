package com.gym.auth.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/files")
public class FileController {
    
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    
    @GetMapping("/images/{fileName:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String fileName) {
        return getFileResource(fileName, "images");
    }
    
    @GetMapping("/videos/{fileName:.+}")
    public ResponseEntity<Resource> getVideo(@PathVariable String fileName) {
        return getFileResource(fileName, "videos");
    }
    
    private ResponseEntity<Resource> getFileResource(String fileName, String subDirectory) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(subDirectory).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                String contentType;
                
                if (subDirectory.equals("images")) {
                    contentType = "image/jpeg";
                    if (fileName.toLowerCase().endsWith(".png")) {
                        contentType = "image/png";
                    } else if (fileName.toLowerCase().endsWith(".gif")) {
                        contentType = "image/gif";
                    }
                } else {
                    contentType = "video/mp4";
                }
                
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException ex) {
            return ResponseEntity.badRequest().build();
        }
    }
} 