package com.geoexplore.place;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;
import java.util.Optional;

public interface PlaceRepository extends JpaRepository<Place, Long> {

    @EntityGraph(attributePaths = "photos")
    List<Place> findAllByOrderByNameAsc();

    @Override
    @EntityGraph(attributePaths = "photos")
    Optional<Place> findById(Long id);
}
