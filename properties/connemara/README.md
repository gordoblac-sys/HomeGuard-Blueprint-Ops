# Connemara Real-Property Mission

This mission package uses one real property: the Main House at Carl Sandburg Home National Historic Site (Connemara), Flat Rock, North Carolina.

## Why this property

- National Park Service provides a virtual tour of the real home.
- NPS-created 360-degree photographs of multiple rooms are available as true equirectangular panoramas.
- The panoramas were produced by National Park Service employees as part of their official duties and are public domain in the United States.
- The official Connemara Main House Historic Structure Report contains measured 2004 floor plans for the same home.

## Official floor-plan reference

Connemara Main House Historic Structure Report:
https://npshistory.com/publications/carl/hsr-connemara-main-house.pdf

Report pages:
- Ground floor plan: 171
- First floor plan: 173
- Second floor plan: 175

The game should use these measured plans as the geometry reference. Do not invent a different floor plan for this mission.

## NPS virtual tour

https://www.nps.gov/carl/planyourvisit/virtual-tour.htm

## Verified same-property 360 panoramas

The property configuration in `property.js` contains the exact Wikimedia Commons / NPS source names for:

- Front Porch
- Living Room
- Kitchen
- Mrs. Sandburg's Bedroom
- Guest Room
- Mrs. Sandburg's Farm Office
- Carl Sandburg's Correspondence Office

## Build rule

For a room to be presented as a TRUE 360 room in this mission, it must have a verified panorama from this same property. Do not substitute a panorama from another home just to fill a missing room.

Rooms without a verified same-property panorama should be visibly marked as unavailable / pending rather than represented with a mismatched house.

## Future property packages

Every future mission should follow the same structure:

1. One real property.
2. One measured / verified floor plan for that property.
3. 360 captures from that same property.
4. Blueprint navigation points tied to those exact panorama locations.
5. Device placements saved by property + room + panorama pitch/yaw.
