package com.geoexplore.place;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "place_photos")
public class PlacePhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "place_id", nullable = false)
    private Place place;

    @Column(name = "image_url", nullable = false, length = 2000)
    private String imageUrl;

    @Column(name = "alt_text", nullable = false, length = 300)
    private String altText;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    protected PlacePhoto() {
    }

    public Long getId() { return id; }
    public String getImageUrl() { return imageUrl; }
    public String getAltText() { return altText; }
    public Integer getDisplayOrder() { return displayOrder; }
}
