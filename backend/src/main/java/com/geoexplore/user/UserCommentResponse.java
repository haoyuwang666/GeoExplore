package com.geoexplore.user;

import java.time.Instant;

public record UserCommentResponse(
        Long id,
        Long placeId,
        String placeName,
        Long authorId,
        String authorName,
        String body,
        Instant createdAt,
        Instant updatedAt
) {
    static UserCommentResponse from(UserComment comment) {
        return new UserCommentResponse(
                comment.getId(),
                comment.getPlace().getId(),
                comment.getPlace().getName(),
                comment.getUser().getId(),
                comment.getUser().getDisplayName(),
                comment.getBody(),
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }
}
