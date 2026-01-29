package com.example.demo.dto;

import com.example.demo.entity.CharityRequest;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
public class CharityRequestDto {
    private long id;
    private MultipartFile logo;
    private MultipartFile verification;
    private String name;
    private String wallet;
    private String description;
    private String logoUrl;
    private String verificationDocumentUrl;
    private String websiteUrl;
    private LocalDateTime requestedTimeStamp;
    private CharityRequest.RequestStatus status;
    private String email;
}
