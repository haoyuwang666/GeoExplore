package com.geoexplore.place;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/places")
public class PlaceController {

    private final PlaceService placeService;

    public PlaceController(PlaceService placeService) {
        this.placeService = placeService;
    }

    @GetMapping
    public List<PlaceResponse> findAll() {
        return placeService.findAll();
    }

    @GetMapping("/{id}")
    public PlaceResponse findById(@PathVariable Long id) {
        return placeService.findById(id);
    }
}
