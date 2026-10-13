package com.geoexplore.user;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserTipRepository extends JpaRepository<UserTip, Long> {

    @EntityGraph(attributePaths = {"user", "place"})
    List<UserTip> findByPlaceIdOrderByCreatedAtDesc(Long placeId);

    @EntityGraph(attributePaths = {"user", "place"})
    List<UserTip> findByUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"user", "place"})
    Optional<UserTip> findWithUserAndPlaceById(Long id);
}
