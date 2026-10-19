package com.travelgo.util;

import com.travelgo.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED = Set.of("image/jpeg", "image/png", "image/webp");

    private final Path uploadRoot;

    public FileStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    public String storeAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File ảnh không được rỗng");
        }
        if (file.getContentType() == null || !ALLOWED.contains(file.getContentType())) {
            throw new BadRequestException("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP");
        }
        try {
            Path avatarDir = uploadRoot.resolve("avatars");
            Files.createDirectories(avatarDir);
            String extension = file.getOriginalFilename() != null && file.getOriginalFilename().contains(".")
                    ? file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf('.'))
                    : ".jpg";
            String filename = UUID.randomUUID() + extension;
            Files.copy(file.getInputStream(), avatarDir.resolve(filename));
            return "/uploads/avatars/" + filename;
        } catch (IOException ex) {
            throw new BadRequestException("Không thể lưu file");
        }
    }
}
