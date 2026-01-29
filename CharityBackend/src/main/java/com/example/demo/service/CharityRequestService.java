package com.example.demo.service;

import com.example.demo.dto.CharityRequestDto;
import com.example.demo.entity.CharityRequest;
import com.example.demo.mapper.CharityReqMapper;
import com.example.demo.repo.CharityRequestRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CharityRequestService {

    @Autowired
    private CharityRequestRepo charityRequestRepo;
    @Autowired
    ImageService imageService;

    @Autowired
    private JavaMailSender jms;

    public CharityRequest saveRequest(CharityRequest charityRequest) {
        return charityRequestRepo.save(charityRequest);
    }

    public List<CharityRequestDto> getAllCharities() {
        List<CharityRequest> clist = charityRequestRepo.findAll();
        return clist.stream().map(CharityReqMapper::mapToDto).collect(Collectors.toList());
    }

    public CharityRequestDto getCharityById(long charityId) {
        CharityRequest charityRequest = charityRequestRepo.getReferenceById(charityId);
        return CharityReqMapper.mapToDto(charityRequest);

    }

    public CharityRequestDto updateCharityByIdByUser(long charityId, CharityRequestDto charityRequestDto, boolean logoChange) {

        CharityRequest charityRequest = charityRequestRepo.getReferenceById(charityId);
        if (logoChange) {
            String logoUrl = charityRequest.getLogoUrl();
            System.out.println(charityRequest);
            imageService.deleteImage(logoUrl);
        }
        CharityReqMapper.mapToExisting(charityRequestDto, charityRequest);

        charityRequest.setLogoUrl(charityRequestDto.getLogoUrl());
        System.out.println(charityRequest);

        return CharityReqMapper.mapToDto(charityRequestRepo.save(charityRequest));

    }

    @Transactional
    public void approve(long charityId) {
        CharityRequest cr = charityRequestRepo.getReferenceById(charityId);

        cr.setStatus(CharityRequest.RequestStatus.APPROVED);
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(cr.getEmail());
        mail.setSubject("Welcome to Charity App");
        mail.setText("Congratulations your request to register charity has been approved.");
        jms.send(mail);
    }

    @Transactional
    public void reject(long charityId) {
        CharityRequest cr = charityRequestRepo.getReferenceById(charityId);
        cr.setStatus(CharityRequest.RequestStatus.REJECTED);
    }

    @Transactional
    public CharityRequestDto updateChairtyByAdmin(long charityId, CharityRequest.RequestStatus status) {
        CharityRequest charityRequest = charityRequestRepo.getReferenceById(charityId);
        charityRequest.setStatus(status);
        return CharityReqMapper.mapToDto(charityRequest);
    }


    public void deleteCharityById(long charityId) {

        CharityRequest charityRequest = charityRequestRepo.findById(charityId).orElseThrow(() -> new RuntimeException("Charity not found"));
        charityRequestRepo.deleteById(charityId);
    }

    public boolean checkPhotoUrlChange(long charityId, String logoUrl) {
        if (logoUrl == null) {
            return false;
        }
        CharityRequest charityRequest = charityRequestRepo.getReferenceById(charityId);
        String lU = charityRequest.getLogoUrl();
        if (lU == logoUrl) {
            return true;
        }
        return false;
    }
}
