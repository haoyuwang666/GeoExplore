package com.geoexplore.user;

import java.time.Instant;

public record UserTipResponse(
        Long id,
        Long placeId,
        String placeName,
        Long authorId,
        String authorName,
        TipCategory category,
        String body,
        Instant createdAt,
        Instant updatedAt
) {
    static UserTipResponse from(UserTip tip) {
        return new UserTipResponse(
                tip.getId(),
                tip.getPlace().getId(),
                tip.getPlace().getName(),
                tip.getUser().getId(),
                tip.getUser().getDisplayName(),
                tip.getCategory(),
                tip.getBody(),
                tip.getCreatedAt(),
                tip.getUpdatedAt()
        );
    }
}
