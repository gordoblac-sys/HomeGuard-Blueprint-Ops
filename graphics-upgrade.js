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

// -----------------------------------------------------------------------------
// INCLUDED BASE PACKAGE
// Every job receives these items before the customer's upgrade budget is used.
// 1 panel is automatic. The player places the included contacts, motion and camera.
// -----------------------------------------------------------------------------

const INCLUDED_BASE_PACKAGE = Object.freeze({
  panel: 1,
  door: 3,
  motion: 1,
  camera: 1
});

const INCLUDED_CAMERA_IDS = ['indoorcam','outdoorcam','doorbell'];

function countPlacedDevice(id){
  return Object.values(placements).reduce((total,list) => total + list.filter(item => item.id === id).length, 0);
}

function countPlacedCameras(){
  return Object.values(placements).reduce((total,list) => total + list.filter(item => INCLUDED_CAMERA_IDS.includes(item.id)).length, 0);
}

function includedRemainingForDevice(id){
  if(id === 'door') return Math.max(0, INCLUDED_BASE_PACKAGE.door - countPlacedDevice('door'));
  if(id === 'motion') return Math.max(0, INCLUDED_BASE_PACKAGE.motion - countPlacedDevice('motion'));
  if(INCLUDED_CAMERA_IDS.includes(id)) return Math.max(0, INCLUDED_BASE_PACKAGE.camera - countPlacedCameras());
  return 0;
}

function deviceUsesIncludedPackage(id){
  return id === 'door' || id === 'motion' || INCLUDED_CAMERA_IDS.includes(id);
}

function chargeForDevice(device){
  return deviceUsesIncludedPackage(device.id) && includedRemainingForDevice(device.id) > 0 ? 0 : device.cost;
}

function packageLabelForDevice(device){
  const remaining = includedRemainingForDevice(device.id);
  if(remaining <= 0) return `$${device.cost}`;
  if(device.id === 'door') return `INCLUDED • ${remaining} OF 3 LEFT`;
  if(device.id === 'motion') return 'INCLUDED • 1 LEFT';
  if(INCLUDED_CAMERA_IDS.includes(device.id)) return 'INCLUDED CAMERA • 1 LEFT';
  return `$${device.cost}`;
}

function renderIncludedPackage(){
  const loadout = document.querySelector('.loadout-panel');
  if(!loadout) return;
  let card = document.getElementById('includedBasePackage');
  if(!card){
    card = document.createElement('div');
    card.id = 'includedBasePackage';
    card.className = 'included-package-card';
    const shopHeading = loadout.querySelector('.shop-heading');
    if(shopHeading) loadout.insertBefore(card, shopHeading);
    else loadout.prepend(card);
  }

  const doorsUsed = Math.min(INCLUDED_BASE_PACKAGE.door, countPlacedDevice('door'));
  const motionUsed = Math.min(INCLUDED_BASE_PACKAGE.motion, countPlacedDevice('motion'));
  const cameraUsed = Math.min(INCLUDED_BASE_PACKAGE.camera, countPlacedCameras());

  card.innerHTML = `
    <div class="included-package-title">INCLUDED WITH EVERY JOB</div>
    <div class="included-package-sub">These items do not reduce the customer's equipment budget.</div>
    <div class="included-package-grid">
      <div><b>1</b><span>Panel</span><small>Included automatically</small></div>
      <div><b>${INCLUDED_BASE_PACKAGE.door - doorsUsed}</b><span>Door Contacts Left</span><small>${doorsUsed} of 3 placed</small></div>
      <div><b>${INCLUDED_BASE_PACKAGE.motion - motionUsed}</b><span>Motion Left</span><small>${motionUsed} of 1 placed</small></div>
      <div><b>${INCLUDED_BASE_PACKAGE.camera - cameraUsed}</b><span>Camera Left</span><small>${cameraUsed} of 1 placed</small></div>
    </div>`;
}

function installIncludedPackageStyles(){
  if(document.getElementById('includedPackageStyles')) return;
  const style = document.createElement('style');
  style.id = 'includedPackageStyles';
  style.textContent = `
    .included-package-card{margin:14px 0;padding:14px;border-radius:14px;border:1px solid rgba(105,240,174,.38);background:linear-gradient(180deg,rgba(21,67,54,.34),rgba(8,31,29,.5));box-shadow:inset 0 0 22px rgba(105,240,174,.04)}
    .included-package-title{font-size:12px;font-weight:900;letter-spacing:.12em;color:#69f0ae}
    .included-package-sub{margin-top:5px;color:#a6c7bc;font-size:11px;line-height:1.4}
    .included-package-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
    .included-package-grid>div{padding:9px;border-radius:10px;border:1px solid rgba(105,240,174,.16);background:rgba(3,18,17,.38)}
    .included-package-grid b{display:block;font-size:20px;color:#fff}
    .included-package-grid span{display:block;margin-top:1px;font-size:10px;font-weight:800;color:#dfffee}
    .included-package-grid small{display:block;margin-top:3px;color:#84aa9d;font-size:9px;line-height:1.25}
    .device-btn .included-price{color:#69f0ae;font-weight:900}
  `;
  document.head.appendChild(style);
}

// Replace shop rendering so included quantities visibly show $0 / INCLUDED.
window.renderShop = function(){
  shop.innerHTML = '';
  devices.forEach(d => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'device-btn' + (selected === d.id ? ' active' : '');
    const charge = chargeForDevice(d);
    b.disabled = charge > budget;
    const label = packageLabelForDevice(d);
    const included = charge === 0 && deviceUsesIncludedPackage(d.id);
    b.innerHTML = `<strong>${d.icon} ${d.name}</strong><small class="${included ? 'included-price' : ''}">${label}</small><small>${d.desc}</small>`;
    b.addEventListener('click', () => selectDevice(d.id));
    shop.appendChild(b);
  });
};

window.renderRoomShop = function(){
  roomShop.innerHTML = '';
  devices.forEach(d => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'device-btn compact' + (selected === d.id ? ' active' : '');
    const allowed = currentZone ? isAllowed(d,currentZone) : true;
    const charge = chargeForDevice(d);
    b.disabled = charge > budget || !allowed;
    const label = allowed ? packageLabelForDevice(d) : 'Not used here';
    const included = charge === 0 && deviceUsesIncludedPackage(d.id) && allowed;
    b.innerHTML = `<strong>${d.icon} ${d.name}</strong><small class="${included ? 'included-price' : ''}">${label}</small>`;
    b.addEventListener('click', () => selectDevice(d.id));
    roomShop.appendChild(b);
  });
};

// Replace installation charging logic. Included quantities are recorded with a $0 charge.
window.installAt = function(x,y){
  if(!currentZone) return;
  if(!selected){
    roomHint.textContent = 'Choose a device from the loadout first.';
    return;
  }
  const d = deviceById(selected);
  if(!isAllowed(d,currentZone)){
    roomHint.textContent = `${d.name} is not appropriate for ${currentZone.name}. Choose another device.`;
    return;
  }

  const charge = chargeForDevice(d);
  if(charge > budget){
    roomHint.textContent = `You do not have enough upgrade budget for ${d.name}.`;
    return;
  }
  if((d.id === 'pendant' || d.id === 'shutoff') && hasAnywhere(d.id)){
    roomHint.textContent = `Only one ${d.name} is needed in this mission.`;
    return;
  }
  const mountError = validateMount(d,y);
  if(mountError){
    roomHint.textContent = mountError;
    return;
  }

  const included = charge === 0 && deviceUsesIncludedPackage(d.id);
  const item = {
    uid:`p${placementCounter++}`,
    id:d.id,
    x:Number(x.toFixed(2)),
    y:Number(y.toFixed(2)),
    charged:charge,
    included
  };
  if(!placements[currentZone.name]) placements[currentZone.name] = [];
  placements[currentZone.name].push(item);
  budget -= charge;

  roomHint.textContent = included
    ? `${d.name} installed from the included base package. Customer upgrade budget was not used.`
    : `${d.name} installed for $${charge}.`;
  placementMessage.className = 'placement-message good';
  placementMessage.textContent = included
    ? `${d.name} installed in ${currentZone.name} — INCLUDED BASE PACKAGE.`
    : `${d.name} installed in ${currentZone.name} — $${charge} deducted from upgrade budget.`;
  update();
};

window.removePlacement = function(uid){
  if(!currentZone) return;
  const list = zoneDevices(currentZone.name);
  const index = list.findIndex(p => p.uid === uid);
  if(index < 0) return;
  const [removed] = list.splice(index,1);
  const d = deviceById(removed.id);
  const refund = typeof removed.charged === 'number' ? removed.charged : d.cost;
  budget += refund;
  roomHint.textContent = removed.included
    ? `${d.name} removed. Its included-package credit is available again.`
    : `${d.name} removed and $${refund} returned to the upgrade budget.`;
  update();
};

// Remove the original undo listener, which assumed every device was paid, and replace it with package-aware undo.
const oldUndoButton = document.getElementById('undoRoomBtn');
if(oldUndoButton){
  const newUndoButton = oldUndoButton.cloneNode(true);
  oldUndoButton.replaceWith(newUndoButton);
  newUndoButton.addEventListener('click',() => {
    if(!currentZone) return;
    const list = zoneDevices(currentZone.name);
    if(!list.length){
      roomHint.textContent = 'There is nothing to undo in this area.';
      return;
    }
    const removed = list.pop();
    const d = deviceById(removed.id);
    const refund = typeof removed.charged === 'number' ? removed.charged : d.cost;
    budget += refund;
    roomHint.textContent = removed.included
      ? `${d.name} removed. Its included-package credit is available again.`
      : `${d.name} removed and $${refund} returned to the upgrade budget.`;
    update();
  });
}

// Make the budget wording clear: it is for upgrades beyond the included package.
const budgetLabel = document.querySelector('.budget-box span');
const budgetHelp = document.querySelector('.budget-box small');
if(budgetLabel) budgetLabel.textContent = 'CUSTOMER UPGRADE BUDGET';
if(budgetHelp) budgetHelp.textContent = 'Used only for equipment beyond the included base package.';

const originalUpdate = window.update;
window.update = function(){
  originalUpdate();
  renderIncludedPackage();
};

installIncludedPackageStyles();
renderFullEquipmentCatalog();
ensureSceneImage();
renderIncludedPackage();
update();
