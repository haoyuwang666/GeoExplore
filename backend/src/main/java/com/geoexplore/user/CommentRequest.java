package com.geoexplore.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentRequest(
        @NotBlank(message = "Comment cannot be empty")
        @Size(max = 500, message = "Comment must be 500 characters or fewer")
        String body
) {
}
