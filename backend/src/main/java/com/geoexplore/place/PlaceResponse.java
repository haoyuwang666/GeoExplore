package com.geoexplore.place;

import java.math.BigDecimal;
import java.util.List;

public record PlaceResponse(
        Long id,
        String name,
        String country,
        String countryCode,
        String flag,
        String region,
        BigDecimal latitude,
        BigDecimal longitude,
        String eyebrow,
        String description,
        String bestTime,
        BigDecimal rating,
        Integer tipCount,
        String accent,
        String visitLength,
        String wikipediaTitle,
        String sourceUrl,
        List<PlacePhotoResponse> gallery
) {
    static PlaceResponse from(Place place) {
        return new PlaceResponse(
                place.getId(),
                place.getName(),
                place.getCountry(),
                place.getCountryCode(),
                place.getFlag(),
                place.getRegion(),
                place.getLatitude(),
                place.getLongitude(),
                place.getEyebrow(),
                place.getDescription(),
                place.getBestTime(),
                place.getRating(),
                place.getTipCount(),
                place.getAccent(),
                place.getVisitLength(),
                place.getWikipediaTitle(),
                place.getSourceUrl(),
                place.getPhotos().stream().map(PlacePhotoResponse::from).toList()
        );
    }
}
