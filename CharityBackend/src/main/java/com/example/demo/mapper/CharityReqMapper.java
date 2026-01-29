package com.example.demo.mapper;

import com.example.demo.dto.CharityRequestDto;
import com.example.demo.entity.CharityRequest;

public class CharityReqMapper {

public static CharityRequest mapToReq(CharityRequestDto dto){
        CharityRequest c = new CharityRequest();
        c.setCharityName(dto.getName());
        c.setDescription(dto.getDescription());
        c.setEmail(dto.getEmail());
        c.setWalletAddress(dto.getWallet());
        c.setWebsiteUrl(dto.getWebsiteUrl());
        return c;
}

public static void mapToExisting(CharityRequestDto dto, CharityRequest entity) {
                entity.setCharityName(dto.getName());
                entity.setDescription(dto.getDescription());
                entity.setEmail(dto.getEmail());
                entity.setWalletAddress(dto.getWallet());
        }


public static CharityRequestDto mapToDto(CharityRequest charityRequest){
        CharityRequestDto c = new CharityRequestDto();
        c.setId(charityRequest.getId());
        c.setDescription(charityRequest.getDescription());
        c.setName(charityRequest.getCharityName());
        c.setEmail(charityRequest.getEmail());
        c.setWallet(charityRequest.getWalletAddress());
        c.setLogoUrl("/uploads/"+charityRequest.getLogoUrl()); // send direct this url that we setup in webconfig
        c.setVerificationDocumentUrl("/uploads/"+charityRequest.getVerificationDocumentUrl());
        c.setRequestedTimeStamp(charityRequest.getSubmittedAt());
        c.setStatus(charityRequest.getStatus());
        return c;
}
}
