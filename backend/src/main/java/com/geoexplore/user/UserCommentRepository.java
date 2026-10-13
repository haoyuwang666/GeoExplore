package com.geoexplore.user;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserCommentRepository extends JpaRepository<UserComment, Long> {

    @EntityGraph(attributePaths = {"user", "place"})
    List<UserComment> findByPlaceIdOrderByCreatedAtDesc(Long placeId);

    @EntityGraph(attributePaths = {"user", "place"})
    List<UserComment> findByUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"user", "place"})
    Optional<UserComment> findWithUserAndPlaceById(Long id);
}
