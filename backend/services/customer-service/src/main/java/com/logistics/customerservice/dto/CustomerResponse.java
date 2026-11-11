package com.logistics.customerservice.dto;

import java.time.Instant;

public record CustomerResponse(
    Long id,
    String fullName,
    String email,
    String phone,
    String address,
    Instant createdAt
) {}
