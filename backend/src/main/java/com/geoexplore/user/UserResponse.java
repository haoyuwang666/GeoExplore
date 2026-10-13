package com.geoexplore.user;

import java.time.Instant;
import java.util.List;

public record UserResponse(
        Long id,
        String displayName,
        String email,
        String bio,
        String location,
        Instant memberSince,
        List<Long> likedPlaceIds,
        List<UserCommentResponse> comments,
        List<UserTipResponse> tips
) {
    static UserResponse from(AppUser user, List<UserComment> comments, List<UserTip> tips) {
        return new UserResponse(
                user.getId(),
                user.getDisplayName(),
                user.getEmail(),
                user.getBio(),
                user.getLocation(),
                user.getCreatedAt(),
                user.getLikedPlaces().stream().map(place -> place.getId()).sorted().toList(),
                comments.stream().map(UserCommentResponse::from).toList(),
                tips.stream().map(UserTipResponse::from).toList()
        );
    }
}
