package com.geoexplore.place;

public record PlacePhotoResponse(
        Long id,
        String src,
        String alt,
        Integer displayOrder
) {
    static PlacePhotoResponse from(PlacePhoto photo) {
        return new PlacePhotoResponse(
                photo.getId(),
                photo.getImageUrl(),
                photo.getAltText(),
                photo.getDisplayOrder()
        );
    }
}
