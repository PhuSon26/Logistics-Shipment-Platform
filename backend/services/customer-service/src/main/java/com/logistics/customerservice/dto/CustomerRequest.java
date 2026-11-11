
package com.logistics.customerservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CustomerRequest(

    @NotBlank(message = "Full name is required")
    @Size(max = 120, message = "Full name must not exceed 120 characters")
    String fullName,

    @NotBlank(message = "Email is required")
    @Email(message = "Email format is invalid")
    @Size(max = 254, message = "Email must not exceed 254 characters")
    String email,

    @Pattern(
        regexp = "^$|^[0-9+() .-]{7,20}$",
        message = "Phone number format is invalid"
    )
    String phone,

    @Size(max = 500, message = "Address must not exceed 500 characters")
    String address

) {}
