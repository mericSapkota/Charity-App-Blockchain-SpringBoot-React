package com.example.demo.controller;

import com.example.demo.dto.CharityRequestDto;
import com.example.demo.entity.CharityRequest;
import com.example.demo.mapper.CharityReqMapper;
import com.example.demo.service.CharityRequestService;
import com.example.demo.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.function.EntityResponse;

import java.awt.*;
import java.io.File;
import java.io.IOException;
import java.util.List;

@RestController
@CrossOrigin("*")
public class CharityRequestController {

    @Autowired
    private CharityRequestService charityRequestService;

    @Autowired
    private ImageService imageService;

    @PostMapping("/api/charity/register")
    public ResponseEntity<CharityRequest> saveEmployee(@ModelAttribute CharityRequestDto charityRequest) {
        MultipartFile file = charityRequest.getLogo();
        MultipartFile verificationDocument = charityRequest.getVerification();
        String logoUrl = imageService.uploadImage(file);
        String verificationUrl = imageService.uploadImage(verificationDocument);
        CharityRequest charityRequest1 = CharityReqMapper.mapToReq(charityRequest);
        charityRequest1.setLogoUrl(logoUrl);
        charityRequest1.setVerificationDocumentUrl(verificationUrl);
        CharityRequest cr = charityRequestService.saveRequest(charityRequest1);
        return new ResponseEntity<>(cr, HttpStatus.CREATED);
    }

    @PostMapping("/api/charityRequests/{charityId}/approve")
    public ResponseEntity<?> approveCharity(@PathVariable("charityId") long charityId) {
        charityRequestService.approve(charityId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/api/charityRequests/{charityId}/reject")
    public ResponseEntity<?> rejectCharity(@PathVariable("charityId") long charityId) {
        charityRequestService.reject(charityId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/charityRequests")
    public ResponseEntity<List<CharityRequestDto>> getAllCharities() {
        List<CharityRequestDto> allCharities = charityRequestService.getAllCharities();
        return ResponseEntity.ok(allCharities);
    }

    @GetMapping("/api/charityRequests/{id}")
    public ResponseEntity<CharityRequestDto> getCharityById(@PathVariable("id") long charityId) {
        CharityRequestDto returnedCharity = charityRequestService.getCharityById(charityId);
        return ResponseEntity.ok(returnedCharity);
    }

    @PutMapping("/api/charityRequests/{id}")
    public ResponseEntity<CharityRequestDto> updateCharityReq(@PathVariable("id") long charityId, @ModelAttribute CharityRequestDto dto) {

        if (charityRequestService.checkPhotoUrlChange(charityId, dto.getLogoUrl())) {
            charityRequestService.updateCharityByIdByUser(charityId, dto, false);
        }
        MultipartFile file = dto.getLogo();
        if (file == null | file.isEmpty()) {
            throw new IllegalArgumentException("No file to upload");
        }
        String logoUrl = imageService.uploadImage(file);
        System.out.println("logourl " + logoUrl);
        dto.setLogoUrl(logoUrl);
        CharityRequestDto returnedCharity = charityRequestService.updateCharityByIdByUser(charityId, dto, true);
        return ResponseEntity.ok(returnedCharity);
    }

    @PatchMapping("/api/charityRequests/adminapprove/{id}")
    public ResponseEntity<CharityRequestDto> updateCharityReqByAdmin(@PathVariable("id") long charityId, @RequestParam CharityRequest.RequestStatus status) {

        CharityRequestDto c = charityRequestService.updateChairtyByAdmin(charityId, status);
        return ResponseEntity.ok(c);
    }

    @DeleteMapping("/api/charityRequests/delete/{id}")
    public void deleteCharity(@PathVariable("id") long id) {
        charityRequestService.deleteCharityById(id);
    }
}
