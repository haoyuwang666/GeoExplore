package com.geoexplore.place;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "places")
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 80)
    private String country;

    @Column(name = "country_code", nullable = false, length = 2)
    private String countryCode;

    @Column(nullable = false, length = 8)
    private String flag;

    @Column(nullable = false, length = 40)
    private String region;

    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal longitude;

    @Column(nullable = false, length = 180)
    private String eyebrow;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(name = "best_time", nullable = false, length = 60)
    private String bestTime;

    @Column(nullable = false, precision = 2, scale = 1)
    private BigDecimal rating;

    @Column(name = "tip_count", nullable = false)
    private Integer tipCount;

    @Column(nullable = false, length = 7)
    private String accent;

    @Column(name = "visit_length", nullable = false, length = 40)
    private String visitLength;

    @Column(name = "wikipedia_title", nullable = false, length = 180)
    private String wikipediaTitle;

    @Column(name = "source_url", nullable = false, length = 500)
    private String sourceUrl;

    @OneToMany(mappedBy = "place")
    @OrderBy("displayOrder ASC")
    private List<PlacePhoto> photos = new ArrayList<>();

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private Instant updatedAt;

    protected Place() {
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCountry() { return country; }
    public String getCountryCode() { return countryCode; }
    public String getFlag() { return flag; }
    public String getRegion() { return region; }
    public BigDecimal getLatitude() { return latitude; }
    public BigDecimal getLongitude() { return longitude; }
    public String getEyebrow() { return eyebrow; }
    public String getDescription() { return description; }
    public String getBestTime() { return bestTime; }
    public BigDecimal getRating() { return rating; }
    public Integer getTipCount() { return tipCount; }
    public String getAccent() { return accent; }
    public String getVisitLength() { return visitLength; }
    public String getWikipediaTitle() { return wikipediaTitle; }
    public String getSourceUrl() { return sourceUrl; }
    public List<PlacePhoto> getPhotos() { return photos; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
