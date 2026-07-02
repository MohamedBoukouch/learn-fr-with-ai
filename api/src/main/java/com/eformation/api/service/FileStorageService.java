package com.eformation.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;



import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
@Service
public class FileStorageService {

    private final Path root;

    public FileStorageService(@Value("${file.upload-dir}") String uploadDir) {
        try {
            this.root = Paths.get(uploadDir);
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload directory", e);
        }
    }

    public String save(MultipartFile file) {
        try {
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Files.copy(file.getInputStream(), root.resolve(filename));
            return filename;
        } catch (Exception e) {
            throw new RuntimeException("Could not store the file", e);
        }
    }
}