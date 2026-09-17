// HomeGuard HD graphics + room-specific video integration.
// Loaded after game.js and equipment-prices.js so it can enhance the existing game without replacing core logic.

const HD_ROOM_SCENES = {
  'Front Entry':'assets/scenes/entry.svg',
  'Back Entry':'assets/scenes/entry.svg',
  'Living Room':'assets/scenes/living-room.svg',
  'Kitchen':'assets/scenes/kitchen.svg',
  'Hallway':'assets/scenes/living-room.svg',
  'Bathroom':'assets/scenes/bathroom.svg',
  'Bedroom':'assets/scenes/bedroom.svg',
  'Stairs':'assets/scenes/stairs.svg',
  'Laundry':'assets/scenes/laundry.svg',
  'Basement Utility':'assets/scenes/basement-utility.svg',
  'Front Yard':'assets/scenes/exterior-front.svg',
  'Driveway':'assets/scenes/exterior-front.svg',
  'Left Side Yard':'assets/scenes/exterior-side.svg',
  'Right Side Yard':'assets/scenes/exterior-side.svg',
  'Backyard':'assets/scenes/exterior-back.svg',
  'Patio':'assets/scenes/exterior-back.svg'
};

const HD_SCENARIO_VIDEOS = {
  'Intrusion|Front Entry':'assets/videos/intrusion-front-entry.mp4',
  'Intrusion|Back Entry':'assets/videos/intrusion-back-entry.mp4',
  'Intrusion|Living Room':'assets/videos/intrusion-living-room.mp4',
  'Fire|Kitchen':'assets/videos/fire-kitchen.mp4',
  'Fire|Laundry':'assets/videos/fire-laundry.mp4',
  'Fire|Basement Utility':'assets/videos/fire-basement-utility.mp4',
  'Water Leak|Kitchen':'assets/videos/water-kitchen.mp4',
  'Water Leak|Bathroom':'assets/videos/water-bathroom.mp4',
  'Water Leak|Laundry':'assets/videos/water-laundry.mp4',
  'Water Leak|Basement Utility':'assets/videos/water-basement-utility.mp4',
  'Fall|Bathroom':'assets/videos/fall-bathroom.mp4',
  'Fall|Bedroom':'assets/videos/fall-bedroom.mp4',
  'Fall|Stairs':'assets/videos/fall-stairs.mp4',
  'Carbon Monoxide|Bedroom':'assets/videos/co-bedroom.mp4',
  'Carbon Monoxide|Basement Utility':'assets/videos/co-basement-utility.mp4'
};

function ensureSceneImage(){
  const scene = document.getElementById('roomScene');
  if(!scene) return null;
  let image = document.getElementById('sceneImage');
  if(!image){
    image = document.createElement('img');
    image.id = 'sceneImage';
    image.className = 'scene-image';
    image.alt = 'High-detail room view';
    scene.insertBefore(image, scene.firstChild);
  }
  return image;
}

function applyRoomArtwork(zoneName){
  const image = ensureSceneImage();
  if(!image) return;
  image.src = HD_ROOM_SCENES[zoneName] || 'assets/scenes/living-room.svg';
  image.alt = `${zoneName} installation view`;
}

// Wrap the existing room-opening function so the original placement rules remain intact.
if(typeof window.openZone === 'function'){
  const originalOpenZone = window.openZone;
  window.openZone = function(button){
    originalOpenZone(button);
    applyRoomArtwork(button.dataset.zone);
  };
}

function renderFullEquipmentCatalog(){
  const host = document.getElementById('catalog');
  if(!host) return;
  const catalog = Array.isArray(window.homeGuardEquipmentCatalog) ? window.homeGuardEquipmentCatalog : [];
  host.innerHTML = '';
  catalog.forEach(item => {
    const row = document.createElement('div');
    row.className = 'catalog-item';
    const price = Number(item.retail || 0);
    row.innerHTML = `<div><strong>${item.name}</strong></div><div class="price">${price ? '$'+price.toLocaleString() : 'TBD'}</div><div class="meta">${item.part ? 'Part: '+item.part : 'Game concept item'}${item.category ? ' • '+item.category : ''}</div>`;
    host.appendChild(row);
  });
}

function setScenarioVideoFromResult(){
  const eventName = document.getElementById('incident')?.textContent?.trim();
  const locationName = document.getElementById('location')?.textContent?.trim();
  if(!eventName || !locationName || eventName === '—' || locationName === '—') return;
  const source = HD_SCENARIO_VIDEOS[`${eventName}|${locationName}`];
  const player = document.getElementById('scenarioVideo');
  const placeholder = document.getElementById('videoPlaceholder');
  if(!player || !placeholder) return;

  if(!source){
    player.removeAttribute('src');
    player.load();
    placeholder.style.display = 'block';
    placeholder.innerHTML = `<b>${eventName} — ${locationName}</b><br>No dedicated video slot is mapped for this event yet.`;
    return;
  }

  player.src = source;
  player.load();
  placeholder.style.display = 'none';
  player.play().catch(() => {});
}

const scenarioButton = document.getElementById('simulateBtn');
if(scenarioButton){
  // The original game's simulation listener was registered first. This runs immediately after it.
  scenarioButton.addEventListener('click', () => setTimeout(setScenarioVideoFromResult, 0));
}

const scenarioPlayer = document.getElementById('scenarioVideo');
if(scenarioPlayer){
  scenarioPlayer.addEventListener('loadeddata', () => {
    const placeholder = document.getElementById('videoPlaceholder');
    if(placeholder) placeholder.style.display = 'none';
  });
  scenarioPlayer.addEventListener('error', () => {
    const placeholder = document.getElementById('videoPlaceholder');
    const eventName = document.getElementById('incident')?.textContent?.trim() || 'Scenario';
    const locationName = document.getElementById('location')?.textContent?.trim() || '';
    if(placeholder){
      placeholder.style.display = 'block';
      placeholder.innerHTML = `<b>${eventName}${locationName && locationName !== '—' ? ' — '+locationName : ''}</b><br>The game is ready for this cinematic clip, but the MP4 has not been added to <code>assets/videos/</code> yet.`;
    }
  });
}

renderFullEquipmentCatalog();
ensureSceneImage();
