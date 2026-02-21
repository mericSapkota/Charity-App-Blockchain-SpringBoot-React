package com.example.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@Service
public class ImageService {
    private final String uploadDir;

    public ImageService(@Value("${app.upload.dir}") String uploadDir) {
        this.uploadDir = uploadDir;
    }

    public String uploadImage(MultipartFile file) {

        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        String fileName = System.currentTimeMillis() + file.getOriginalFilename();
        File destination = new File(dir, fileName);
        try {
            file.transferTo(destination);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return fileName;
    }

    public void deleteImage(String fileName) {
        if (fileName == null) {
            return;
        }
        File file = new File(uploadDir, fileName);

        if (file.exists()) {
            file.delete();
        }

    }
}
