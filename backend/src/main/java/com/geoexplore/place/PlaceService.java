package com.geoexplore.place;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class PlaceService {

    private final PlaceRepository placeRepository;

    public PlaceService(PlaceRepository placeRepository) {
        this.placeRepository = placeRepository;
    }

    public List<PlaceResponse> findAll() {
        return placeRepository.findAllByOrderByNameAsc().stream()
                .map(PlaceResponse::from)
                .toList();
    }

    public PlaceResponse findById(Long id) {
        return placeRepository.findById(id)
                .map(PlaceResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Place not found"));
    }
}
