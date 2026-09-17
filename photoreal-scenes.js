// HomeGuard photo-real scene layer.
// This script loads after graphics-upgrade.js and replaces illustrated room scenes
// with real photographic interiors/exteriors while preserving device-placement logic.

const PHOTOREAL_SCENES = {
  'Kitchen': 'https://images.pexels.com/photos/16869702/pexels-photo-16869702.jpeg?auto=compress&cs=tinysrgb&w=1800',
  'Living Room': 'https://images.pexels.com/photos/5353892/pexels-photo-5353892.jpeg?auto=compress&cs=tinysrgb&w=1800',
  'Hallway': 'https://images.pexels.com/photos/7031909/pexels-photo-7031909.jpeg?auto=compress&cs=tinysrgb&w=1800',
  'Bedroom': 'https://images.pexels.com/photos/4940610/pexels-photo-4940610.jpeg?auto=compress&cs=tinysrgb&w=1800',
  'Bathroom': 'https://images.pexels.com/photos/11701114/pexels-photo-11701114.jpeg?auto=compress&cs=tinysrgb&w=1800',
  'Laundry': 'https://images.pexels.com/photos/28479466/pexels-photo-28479466.jpeg?auto=compress&cs=tinysrgb&w=1800',
  'Basement Utility': 'https://images.pexels.com/photos/10847199/pexels-photo-10847199.jpeg?auto=compress&cs=tinysrgb&w=1800',
  'Stairs': 'https://images.pexels.com/photos/5997959/pexels-photo-5997959.jpeg?auto=compress&cs=tinysrgb&w=1800',
  'Front Entry': 'https://images.pexels.com/photos/7031909/pexels-photo-7031909.jpeg?auto=compress&cs=tinysrgb&w=1800',
  'Back Entry': 'https://images.pexels.com/photos/8135493/pexels-photo-8135493.jpeg?auto=compress&cs=tinysrgb&w=1800',
  'Front Yard': 'https://images.pexels.com/photos/7587880/pexels-photo-7587880.jpeg?auto=compress&cs=tinysrgb&w=1800',
  'Driveway': 'https://images.pexels.com/photos/7587880/pexels-photo-7587880.jpeg?auto=compress&cs=tinysrgb&w=1800',
  'Left Side Yard': 'https://images.pexels.com/photos/7031607/pexels-photo-7031607.jpeg?auto=compress&cs=tinysrgb&w=1800',
  'Right Side Yard': 'https://images.pexels.com/photos/7031607/pexels-photo-7031607.jpeg?auto=compress&cs=tinysrgb&w=1800',
  'Backyard': 'https://images.pexels.com/photos/17240696/pexels-photo-17240696.jpeg?auto=compress&cs=tinysrgb&w=1800',
  'Patio': 'https://images.pexels.com/photos/17240696/pexels-photo-17240696.jpeg?auto=compress&cs=tinysrgb&w=1800'
};

const PHOTOREAL_FALLBACKS = {
  'Kitchen':'assets/scenes/kitchen.svg',
  'Living Room':'assets/scenes/living-room.svg',
  'Hallway':'assets/scenes/living-room.svg',
  'Bedroom':'assets/scenes/bedroom.svg',
  'Bathroom':'assets/scenes/bathroom.svg',
  'Laundry':'assets/scenes/laundry.svg',
  'Basement Utility':'assets/scenes/basement-utility.svg',
  'Stairs':'assets/scenes/stairs.svg',
  'Front Entry':'assets/scenes/entry.svg',
  'Back Entry':'assets/scenes/entry.svg',
  'Front Yard':'assets/scenes/exterior-front.svg',
  'Driveway':'assets/scenes/exterior-front.svg',
  'Left Side Yard':'assets/scenes/exterior-side.svg',
  'Right Side Yard':'assets/scenes/exterior-side.svg',
  'Backyard':'assets/scenes/exterior-back.svg',
  'Patio':'assets/scenes/exterior-back.svg'
};

const PHOTOREAL_POSITIONS = {
  'Kitchen':'center center',
  'Living Room':'center center',
  'Hallway':'center center',
  'Bedroom':'center center',
  'Bathroom':'center center',
  'Laundry':'center center',
  'Basement Utility':'center center',
  'Stairs':'center center',
  'Front Entry':'center center',
  'Back Entry':'center center',
  'Front Yard':'center center',
  'Driveway':'center center',
  'Left Side Yard':'center center',
  'Right Side Yard':'center center',
  'Backyard':'center center',
  'Patio':'center center'
};

function applyPhotoRealScene(zoneName){
  const image = document.getElementById('sceneImage');
  if(!image) return;

  const photo = PHOTOREAL_SCENES[zoneName];
  const fallback = PHOTOREAL_FALLBACKS[zoneName] || 'assets/scenes/living-room.svg';
  image.dataset.photoFallback = fallback;
  image.dataset.fallbackActive = '0';
  image.style.objectPosition = PHOTOREAL_POSITIONS[zoneName] || 'center center';
  image.alt = `${zoneName} photo-real installation view`;

  image.onerror = () => {
    if(image.dataset.fallbackActive === '1') return;
    image.dataset.fallbackActive = '1';
    image.src = image.dataset.photoFallback;
  };

  image.src = photo || fallback;

  const label = document.getElementById('sceneLabel');
  if(label) label.textContent = `${zoneName.toUpperCase()} • PHOTO-REAL VIEW`;
}

// Replace the global artwork function used by the HD room-opening wrapper.
window.applyRoomArtwork = applyPhotoRealScene;

// Also apply after blueprint clicks so photo mode wins even if the browser kept
// a reference to the earlier artwork function.
const photoBlueprint = document.getElementById('blueprint');
if(photoBlueprint){
  photoBlueprint.addEventListener('click', event => {
    const zone = event.target.closest('.zone');
    if(!zone) return;
    setTimeout(() => applyPhotoRealScene(zone.dataset.zone), 0);
  });
}

// Add a visible photo-real mode badge inside the room viewer.
const photoViewer = document.querySelector('.room-view-header > div');
if(photoViewer && !document.getElementById('photoRealModeBadge')){
  const badge = document.createElement('div');
  badge.id = 'photoRealModeBadge';
  badge.textContent = 'PHOTO-REAL INSTALLATION MODE';
  badge.style.cssText = 'display:inline-block;margin-top:7px;padding:5px 9px;border-radius:999px;border:1px solid rgba(105,240,174,.42);background:rgba(11,47,38,.55);color:#69f0ae;font-size:9px;font-weight:900;letter-spacing:.12em';
  photoViewer.appendChild(badge);
}
