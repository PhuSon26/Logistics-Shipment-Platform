package com.logistics.authservice.dto;

public record AuthResponse(
    String accessToken,
    String tokenType,
    long expiresIn
) {}