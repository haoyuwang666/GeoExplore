package com.geoexplore.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthRequest(
        @Size(max = 80, message = "Name must be 80 characters or fewer")
        String displayName,
        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        @Size(max = 254, message = "Email is too long")
        String email,
        @NotBlank(message = "Password is required")
        @Size(max = 72, message = "Password must be 72 characters or fewer")
        String password
) {
}
