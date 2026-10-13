package com.geoexplore.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TipRequest(
        @NotNull(message = "Choose a tip category")
        TipCategory category,
        @NotBlank(message = "Tip cannot be empty")
        @Size(max = 500, message = "Tip must be 500 characters or fewer")
        String body
) {
}
