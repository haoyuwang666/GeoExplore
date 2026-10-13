ALTER TABLE places
    ADD COLUMN visit_length VARCHAR(40),
    ADD COLUMN wikipedia_title VARCHAR(180),
    ADD COLUMN source_url VARCHAR(500);

WITH place_metadata(name, wikipedia_title, source_url) AS (
    VALUES
    ('Acropolis of Athens', 'Acropolis of Athens', 'https://en.wikipedia.org/wiki/Acropolis_of_Athens'),
    ('Angkor Wat', 'Angkor Wat', 'https://en.wikipedia.org/wiki/Angkor_Wat'),
    ('Avenue of the Baobabs', 'Avenue of the Baobabs', 'https://en.wikipedia.org/wiki/Avenue_of_the_Baobabs'),
    ('Bagan', 'Bagan', 'https://en.wikipedia.org/wiki/Bagan'),
    ('Banff National Park', 'Banff National Park', 'https://en.wikipedia.org/wiki/Banff_National_Park'),
    ('Big Ben', 'Big Ben', 'https://en.wikipedia.org/wiki/Big_Ben'),
    ('Bora Bora', 'Bora Bora', 'https://en.wikipedia.org/wiki/Bora_Bora'),
    ('Borobudur', 'Borobudur', 'https://en.wikipedia.org/wiki/Borobudur'),
    ('Burj Khalifa', 'Burj Khalifa', 'https://en.wikipedia.org/wiki/Burj_Khalifa'),
    ('Cappadocia', 'Cappadocia', 'https://en.wikipedia.org/wiki/Cappadocia'),
    ('Charles Bridge', 'Charles Bridge', 'https://en.wikipedia.org/wiki/Charles_Bridge'),
    ('Chichén Itzá', 'Chichen Itza', 'https://en.wikipedia.org/wiki/Chichen_Itza'),
    ('Christ the Redeemer', 'Christ the Redeemer (statue)', 'https://en.wikipedia.org/wiki/Christ_the_Redeemer_(statue)'),
    ('Colosseum', 'Colosseum', 'https://en.wikipedia.org/wiki/Colosseum'),
    ('Eiffel Tower', 'Eiffel Tower', 'https://en.wikipedia.org/wiki/Eiffel_Tower'),
    ('Forbidden City', 'Forbidden City', 'https://en.wikipedia.org/wiki/Forbidden_City'),
    ('Galápagos Islands', 'Galápagos Islands', 'https://en.wikipedia.org/wiki/Gal%C3%A1pagos_Islands'),
    ('Golden Gate Bridge', 'Golden Gate Bridge', 'https://en.wikipedia.org/wiki/Golden_Gate_Bridge'),
    ('Grand Canyon', 'Grand Canyon', 'https://en.wikipedia.org/wiki/Grand_Canyon'),
    ('Great Barrier Reef', 'Great Barrier Reef', 'https://en.wikipedia.org/wiki/Great_Barrier_Reef'),
    ('Great Pyramid of Giza', 'Great Pyramid of Giza', 'https://en.wikipedia.org/wiki/Great_Pyramid_of_Giza'),
    ('Great Wall of China', 'Great Wall of China', 'https://en.wikipedia.org/wiki/Great_Wall_of_China'),
    ('Ha Long Bay', 'Hạ Long Bay', 'https://en.wikipedia.org/wiki/H%E1%BA%A1_Long_Bay'),
    ('Hallgrímskirkja', 'Hallgrímskirkja', 'https://en.wikipedia.org/wiki/Hallgr%C3%ADmskirkja'),
    ('Iguazú Falls', 'Iguazu Falls', 'https://en.wikipedia.org/wiki/Iguazu_Falls'),
    ('Jeju Island', 'Jeju Island', 'https://en.wikipedia.org/wiki/Jeju_Island'),
    ('Machu Picchu', 'Machu Picchu', 'https://en.wikipedia.org/wiki/Machu_Picchu'),
    ('Marina Bay', 'Marina Bay, Singapore', 'https://en.wikipedia.org/wiki/Marina_Bay%2C_Singapore'),
    ('Matterhorn', 'Matterhorn', 'https://en.wikipedia.org/wiki/Matterhorn'),
    ('Medina of Marrakesh', 'Marrakesh', 'https://en.wikipedia.org/wiki/Marrakesh'),
    ('Milford Sound', 'Milford Sound', 'https://en.wikipedia.org/wiki/Milford_Sound'),
    ('Mount Everest', 'Mount Everest', 'https://en.wikipedia.org/wiki/Mount_Everest'),
    ('Mount Fuji', 'Mount Fuji', 'https://en.wikipedia.org/wiki/Mount_Fuji'),
    ('Mount Kilimanjaro', 'Mount Kilimanjaro', 'https://en.wikipedia.org/wiki/Mount_Kilimanjaro'),
    ('Neuschwanstein Castle', 'Neuschwanstein Castle', 'https://en.wikipedia.org/wiki/Neuschwanstein_Castle'),
    ('Niagara Falls', 'Niagara Falls', 'https://en.wikipedia.org/wiki/Niagara_Falls'),
    ('Okavango Delta', 'Okavango Delta', 'https://en.wikipedia.org/wiki/Okavango_Delta'),
    ('Petra', 'Petra', 'https://en.wikipedia.org/wiki/Petra'),
    ('Rapa Nui', 'Easter Island', 'https://en.wikipedia.org/wiki/Easter_Island'),
    ('Rock-Hewn Churches of Lalibela', 'Rock-Hewn Churches, Lalibela', 'https://en.wikipedia.org/wiki/Rock-Hewn_Churches%2C_Lalibela'),
    ('Sagrada Família', 'Sagrada Família', 'https://en.wikipedia.org/wiki/Sagrada_Fam%C3%ADlia'),
    ('Salar de Uyuni', 'Salar de Uyuni', 'https://en.wikipedia.org/wiki/Salar_de_Uyuni'),
    ('Santorini Caldera', 'Santorini caldera', 'https://en.wikipedia.org/wiki/Santorini_caldera'),
    ('Serengeti National Park', 'Serengeti National Park', 'https://en.wikipedia.org/wiki/Serengeti_National_Park'),
    ('Statue of Liberty', 'Statue of Liberty', 'https://en.wikipedia.org/wiki/Statue_of_Liberty'),
    ('Stonehenge', 'Stonehenge', 'https://en.wikipedia.org/wiki/Stonehenge'),
    ('Sydney Opera House', 'Sydney Opera House', 'https://en.wikipedia.org/wiki/Sydney_Opera_House'),
    ('Table Mountain', 'Table Mountain', 'https://en.wikipedia.org/wiki/Table_Mountain'),
    ('Taj Mahal', 'Taj Mahal', 'https://en.wikipedia.org/wiki/Taj_Mahal'),
    ('Uluru', 'Uluru', 'https://en.wikipedia.org/wiki/Uluru'),
    ('Victoria Falls', 'Victoria Falls', 'https://en.wikipedia.org/wiki/Victoria_Falls'),
    ('Waitomo Glowworm Caves', 'Waitomo Glowworm Caves', 'https://en.wikipedia.org/wiki/Waitomo_Glowworm_Caves'),
    ('Yellowstone National Park', 'Yellowstone National Park', 'https://en.wikipedia.org/wiki/Yellowstone_National_Park')
)
UPDATE places AS place
SET visit_length = CASE WHEN place.rating >= 4.9 THEN 'Full day' ELSE '2–4 hours' END,
    wikipedia_title = metadata.wikipedia_title,
    source_url = metadata.source_url
FROM place_metadata AS metadata
WHERE place.name = metadata.name;

ALTER TABLE places
    ALTER COLUMN visit_length SET NOT NULL,
    ALTER COLUMN wikipedia_title SET NOT NULL,
    ALTER COLUMN source_url SET NOT NULL;

CREATE TABLE place_photos (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    place_id BIGINT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    image_url VARCHAR(2000) NOT NULL,
    alt_text VARCHAR(300) NOT NULL,
    display_order INTEGER NOT NULL CHECK (display_order >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT place_photos_place_order_unique UNIQUE (place_id, display_order),
    CONSTRAINT place_photos_place_url_unique UNIQUE (place_id, image_url)
);

CREATE INDEX place_photos_place_id_idx ON place_photos (place_id);

WITH place_media(name, image_url) AS (
    VALUES
    ('Acropolis of Athens', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/1029_Acropolis_of_Athens_in_Greece_at_night_Photo_by_Giles_Laurent.jpg/1920px-1029_Acropolis_of_Athens_in_Greece_at_night_Photo_by_Giles_Laurent.jpg'),
    ('Angkor Wat', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/41/Angkor_Wat.jpg/1920px-Angkor_Wat.jpg'),
    ('Avenue of the Baobabs', 'https://upload.wikimedia.org/wikipedia/commons/3/38/Adansonia_grandidieri_Pat_Hooper.jpg'),
    ('Bagan', 'https://upload.wikimedia.org/wikipedia/commons/8/89/Bagan%2C_Burma.jpg'),
    ('Banff National Park', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Moraine_Lake_17092005.jpg/1920px-Moraine_Lake_17092005.jpg'),
    ('Big Ben', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Elizabeth_Tower_and_the_north_front_of_the_Palace_of_Westminster%2C_London.jpg/1920px-Elizabeth_Tower_and_the_north_front_of_the_Palace_of_Westminster%2C_London.jpg'),
    ('Bora Bora', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/Bora_Bora_ISS006.jpg/1920px-Bora_Bora_ISS006.jpg'),
    ('Borobudur', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/25/Pradaksina.jpg/1920px-Pradaksina.jpg'),
    ('Burj Khalifa', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/90/Burj_Khalifa_%28worlds_tallest_building%29_and_the_Dubai_skyline_%2825781049892%29.jpg/1920px-Burj_Khalifa_%28worlds_tallest_building%29_and_the_Dubai_skyline_%2825781049892%29.jpg'),
    ('Cappadocia', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/59/Cappadocia_balloon_trip%2C_Ortahisar_Castle_%2811893715185%29.jpg/1920px-Cappadocia_balloon_trip%2C_Ortahisar_Castle_%2811893715185%29.jpg'),
    ('Charles Bridge', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/Prague_07-2016_view_from_Lesser_Town_Tower_of_Charles_Bridge_img3.jpg/1920px-Prague_07-2016_view_from_Lesser_Town_Tower_of_Charles_Bridge_img3.jpg'),
    ('Chichén Itzá', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Chichen_Itza_3.jpg/1920px-Chichen_Itza_3.jpg'),
    ('Christ the Redeemer', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/Christ_the_Redeemer_-_Cristo_Redentor.jpg/1920px-Christ_the_Redeemer_-_Cristo_Redentor.jpg'),
    ('Colosseum', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/1920px-Colosseo_2020.jpg'),
    ('Eiffel Tower', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/1920px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg'),
    ('Forbidden City', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/The_Forbidden_City_-_View_from_Coal_Hill.jpg/1920px-The_Forbidden_City_-_View_from_Coal_Hill.jpg'),
    ('Galápagos Islands', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/Lobo_marino_%28Zalophus_californianus_wollebaeki%29%2C_Punta_Pitt%2C_isla_de_San_Crist%C3%B3bal%2C_islas_Gal%C3%A1pagos%2C_Ecuador%2C_2015-07-24%2C_DD_11.JPG/1920px-Lobo_marino_%28Zalophus_californianus_wollebaeki%29%2C_Punta_Pitt%2C_isla_de_San_Crist%C3%B3bal%2C_islas_Gal%C3%A1pagos%2C_Ecuador%2C_2015-07-24%2C_DD_11.JPG'),
    ('Golden Gate Bridge', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bf/Golden_Gate_Bridge_as_seen_from_Battery_East.jpg/1920px-Golden_Gate_Bridge_as_seen_from_Battery_East.jpg'),
    ('Grand Canyon', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/Canyon_River_Tree_%28165872763%29.jpeg/1920px-Canyon_River_Tree_%28165872763%29.jpeg'),
    ('Great Barrier Reef', 'https://upload.wikimedia.org/wikipedia/commons/4/4f/ISS-45_StoryOfWater%2C_Great_Barrier_Reef%2C_Australia.jpg'),
    ('Great Pyramid of Giza', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/Great_Pyramid_of_Giza_-_Pyramid_of_Khufu.jpg/1920px-Great_Pyramid_of_Giza_-_Pyramid_of_Khufu.jpg'),
    ('Great Wall of China', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/1920px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg'),
    ('Ha Long Bay', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/79/Ha_Long_Bay_in_2019.jpg/1920px-Ha_Long_Bay_in_2019.jpg'),
    ('Hallgrímskirkja', 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Hallgrimskirkja_mai_2026.jpg'),
    ('Iguazú Falls', 'https://upload.wikimedia.org/wikipedia/commons/9/91/Aerial_Foz_de_Igua%C3%A7u_26_Nov_2005.jpg'),
    ('Jeju Island', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c6/Jeju_Island.jpg/1920px-Jeju_Island.jpg'),
    ('Machu Picchu', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bb/Machu_Picchu%2C_2023_%28012%29.jpg/1920px-Machu_Picchu%2C_2023_%28012%29.jpg'),
    ('Marina Bay', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/16/Marina_Bay_Singapore-3499.jpg/1920px-Marina_Bay_Singapore-3499.jpg'),
    ('Matterhorn', 'https://upload.wikimedia.org/wikipedia/commons/6/60/Matterhorn_from_Domh%C3%BCtte_-_2.jpg'),
    ('Medina of Marrakesh', 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Pavillon_Menarag%C3%A4rten.jpg'),
    ('Milford Sound', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b6/Milford_Sound_%28New_Zealand%29.JPG/1920px-Milford_Sound_%28New_Zealand%29.JPG'),
    ('Mount Everest', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/15/Mt._Everest_from_Gokyo_Ri_November_5%2C_2012.jpg/1920px-Mt._Everest_from_Gokyo_Ri_November_5%2C_2012.jpg'),
    ('Mount Fuji', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f8/View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg/1920px-View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg'),
    ('Mount Kilimanjaro', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6c/Kilimanjaro_from_Amboseli.jpg/1920px-Kilimanjaro_from_Amboseli.jpg'),
    ('Neuschwanstein Castle', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f8/Schloss_Neuschwanstein_2013.jpg/1920px-Schloss_Neuschwanstein_2013.jpg'),
    ('Niagara Falls', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/3Falls_Niagara.jpg/1920px-3Falls_Niagara.jpg'),
    ('Okavango Delta', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e8/Okavango_Delta%2C_Botswana1.jpg/1920px-Okavango_Delta%2C_Botswana1.jpg'),
    ('Petra', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e8/Al_Deir_Petra.JPG/1920px-Al_Deir_Petra.JPG'),
    ('Rapa Nui', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/Easter_Island_5.jpg/1920px-Easter_Island_5.jpg'),
    ('Rock-Hewn Churches of Lalibela', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/aa/Lalibela%2C_san_giorgio%2C_esterno_24.jpg/1920px-Lalibela%2C_san_giorgio%2C_esterno_24.jpg'),
    ('Sagrada Família', 'https://upload.wikimedia.org/wikipedia/commons/e/ef/SF_maig_2_cropped.jpg'),
    ('Salar de Uyuni', 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Salar_Uyuni_au01.jpg'),
    ('Santorini Caldera', 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Santorini_Caldera_ASTER.jpg'),
    ('Serengeti National Park', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0b/Serengeti-Landscape-2012.JPG/1920px-Serengeti-Landscape-2012.JPG'),
    ('Statue of Liberty', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Front_view_of_Statue_of_Liberty_%28cropped%29.jpg/1920px-Front_view_of_Statue_of_Liberty_%28cropped%29.jpg'),
    ('Stonehenge', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/Stonehenge2007_07_30.jpg/1920px-Stonehenge2007_07_30.jpg'),
    ('Sydney Opera House', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/Sydney_Australia._%2821339175489%29.jpg/1920px-Sydney_Australia._%2821339175489%29.jpg'),
    ('Table Mountain', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dc/Table_Mountain_DanieVDM.jpg/1920px-Table_Mountain_DanieVDM.jpg'),
    ('Taj Mahal', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/1920px-Taj_Mahal_%28Edited%29.jpeg'),
    ('Uluru', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/ULURU.jpg/1920px-ULURU.jpg'),
    ('Victoria Falls', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/da/Cataratas_Victoria%2C_Zambia-Zimbabue%2C_2018-07-27%2C_DD_04.jpg/1920px-Cataratas_Victoria%2C_Zambia-Zimbabue%2C_2018-07-27%2C_DD_04.jpg'),
    ('Waitomo Glowworm Caves', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b6/%27Cathedral%27_in_Waitomo_Cave.jpg/1920px-%27Cathedral%27_in_Waitomo_Cave.jpg'),
    ('Yellowstone National Park', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/Grand_Canyon_of_the_Yellowstone_Lower_Falls_%2895819p%29.jpg/1920px-Grand_Canyon_of_the_Yellowstone_Lower_Falls_%2895819p%29.jpg')
)
INSERT INTO place_photos (place_id, image_url, alt_text, display_order)
SELECT place.id, media.image_url, place.name || ', ' || place.country, 0
FROM place_media AS media
JOIN places AS place ON place.name = media.name;

