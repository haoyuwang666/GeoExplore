package com.geoexplore.place;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.mock;

@ExtendWith(MockitoExtension.class)
class PlaceServiceTest {

    @Mock
    private PlaceRepository placeRepository;

    @InjectMocks
    private PlaceService placeService;

    @Test
    void returnsAnEmptyListWhenNoPlacesExist() {
        when(placeRepository.findAllByOrderByNameAsc()).thenReturn(List.of());

        assertThat(placeService.findAll()).isEmpty();
    }

    @Test
    void returnsNotFoundWhenPlaceDoesNotExist() {
        when(placeRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> placeService.findById(999L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404 NOT_FOUND");
    }

    @Test
    void returnsPersistedMetadataAndGallery() {
        Place place = mock(Place.class);
        PlacePhoto photo = mock(PlacePhoto.class);

        when(place.getId()).thenReturn(1L);
        when(place.getName()).thenReturn("Machu Picchu");
        when(place.getVisitLength()).thenReturn("Full day");
        when(place.getWikipediaTitle()).thenReturn("Machu Picchu");
        when(place.getSourceUrl()).thenReturn("https://en.wikipedia.org/wiki/Machu_Picchu");
        when(place.getPhotos()).thenReturn(List.of(photo));
        when(photo.getId()).thenReturn(10L);
        when(photo.getImageUrl()).thenReturn("https://example.com/machu-picchu.jpg");
        when(photo.getAltText()).thenReturn("Machu Picchu, Peru");
        when(photo.getDisplayOrder()).thenReturn(0);
        when(placeRepository.findById(1L)).thenReturn(Optional.of(place));

        PlaceResponse response = placeService.findById(1L);

        assertThat(response.visitLength()).isEqualTo("Full day");
        assertThat(response.sourceUrl()).isEqualTo("https://en.wikipedia.org/wiki/Machu_Picchu");
        assertThat(response.gallery()).singleElement().satisfies(item -> {
            assertThat(item.src()).isEqualTo("https://example.com/machu-picchu.jpg");
            assertThat(item.displayOrder()).isZero();
        });
    }
}
