const STARTING_BUDGET = 1600;

const devices = [
  { id:'door', name:'Door Sensor', icon:'▣', cost:40, desc:'Detects a protected door opening.', guide:'Mount on the door and frame.' },
  { id:'window', name:'Window Sensor', icon:'▤', cost:35, desc:'Detects a protected window opening.', guide:'Mount directly on a window and frame.' },
  { id:'motion', name:'Motion Detector', icon:'◉', cost:90, desc:'Detects movement through an interior area.', guide:'Mount high on a wall or corner with a clear view.' },
  { id:'indoorcam', name:'Indoor Camera', icon:'●', cost:150, desc:'Provides visual coverage inside the home.', guide:'Mount high with a wide view of the room.' },
  { id:'outdoorcam', name:'Outdoor Camera', icon:'◆', cost:180, desc:'Watches exterior approaches and blind spots.', guide:'Mount high outside with a clear approach view.' },
  { id:'doorbell', name:'Video Doorbell', icon:'▥', cost:160, desc:'Covers a main exterior doorway.', guide:'Mount beside the exterior door at eye level.' },
  { id:'smoke', name:'Smoke Detector', icon:'▲', cost:80, desc:'Detects smoke and fire.', guide:'Mount on the ceiling or very high on the wall.' },
  { id:'co', name:'CO Detector', icon:'C', cost:75, desc:'Detects dangerous carbon monoxide.', guide:'Mount in a sleeping, hallway or utility detection area.' },
  { id:'water', name:'Water Sensor', icon:'≈', cost:60, desc:'Detects water at plumbing and appliance risks.', guide:'Place low on the floor beside the likely leak source.' },
  { id:'shutoff', name:'Water Shutoff', icon:'V', cost:180, desc:'Automatically limits water damage after a detected leak.', guide:'Install low near the main water supply in the utility area.' },
  { id:'fall', name:'Fall Detector', icon:'+', cost:180, desc:'Detects a fall in a high-risk area.', guide:'Mount where the sensor can cover the high-risk area.' },
  { id:'pendant', name:'Medical Pendant', icon:'M', cost:125, desc:'Gives the senior resident whole-home emergency help.', guide:'Assign the pendant to the resident.' }
];

const incidents = [
  { type:'Intrusion', locations:['Front Entry','Back Entry','Living Room'], baseDamage:6500, video:'assets/videos/intrusion.mp4' },
  { type:'Fire', locations:['Kitchen','Basement Utility','Laundry'], baseDamage:18000, video:'assets/videos/fire.mp4' },
  { type:'Water Leak', locations:['Basement Utility','Laundry','Bathroom','Kitchen'], baseDamage:9000, video:'assets/videos/water.mp4' },
  { type:'Fall', locations:['Bathroom','Bedroom','Stairs'], baseDamage:12000, video:'assets/videos/fall.mp4' },
  { type:'Carbon Monoxide', locations:['Basement Utility','Bedroom'], baseDamage:15000, video:'assets/videos/co.mp4' }
];

let budget = STARTING_BUDGET;
let selected = null;
let placements = {};
let currentZone = null;
let placementCounter = 1;

const shop = document.getElementById('deviceShop');
const roomShop = document.getElementById('roomDeviceShop');
const budgetEl = document.getElementById('budget');
const selectedEl = document.getElementById('selected');
const countEl = document.getElementById('deviceCount');
const coverageEl = document.getElementById('coverage');
const placementMessage = document.getElementById('placementMessage');
const video = document.getElementById('scenarioVideo');
const placeholder = document.getElementById('videoPlaceholder');
const viewer = document.getElementById('roomViewer');
const roomScene = document.getElementById('roomScene');
const roomTitle = document.getElementById('roomTitle');
const roomHint = document.getElementById('roomHint');
const roomSelected = document.getElementById('roomSelected');
const roomDeviceCount = document.getElementById('roomDeviceCount');
const mountGuide = document.getElementById('mountGuide');
const mountedDevices = document.getElementById('mountedDevices');
const sceneCrosshair = document.getElementById('sceneCrosshair');
const sceneLabel = document.getElementById('sceneLabel');

function deviceById(id){ return devices.find(d => d.id === id); }
function zoneDevices(zone){ return placements[zone] || []; }
function installedCount(){ return Object.values(placements).reduce((n,a) => n + a.length, 0); }
function has(zone,id){ return zoneDevices(zone).some(p => p.id === id); }
function hasAny(zone, ids){ return zoneDevices(zone).some(p => ids.includes(p.id)); }
function hasAnywhere(id){ return Object.values(placements).some(list => list.some(p => p.id === id)); }
function hasExteriorCamera(zones){ return zones.some(z => has(z,'outdoorcam')); }

function isAllowed(device, zone){
  if(!zone) return true;
  const name = zone.name;
  const type = zone.type;
  if(device.id === 'outdoorcam') return type === 'exterior';
  if(device.id === 'doorbell') return name === 'Front Entry' || name === 'Back Entry';
  if(device.id === 'door') return name === 'Front Entry' || name === 'Back Entry';
  if(device.id === 'window') return name === 'Living Room' || name === 'Bedroom';
  if(device.id === 'water') return ['Kitchen','Bathroom','Laundry','Basement Utility'].includes(name);
  if(device.id === 'shutoff') return name === 'Basement Utility';
  if(device.id === 'fall') return ['Bathroom','Bedroom','Stairs'].includes(name);
  if(device.id === 'co') return ['Basement Utility','Bedroom','Hallway'].includes(name);
  if(device.id === 'smoke') return ['Kitchen','Laundry','Basement Utility','Hallway','Bedroom'].includes(name);
  if(device.id === 'pendant') return type !== 'exterior';
  if(device.id === 'indoorcam' || device.id === 'motion') return type !== 'exterior';
  return true;
}

function renderShop(){
  shop.innerHTML = '';
  devices.forEach(d => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'device-btn' + (selected === d.id ? ' active' : '');
    b.disabled = d.cost > budget;
    b.innerHTML = `<strong>${d.icon} ${d.name} · $${d.cost}</strong><small>${d.desc}</small>`;
    b.addEventListener('click', () => selectDevice(d.id));
    shop.appendChild(b);
  });
}

function renderRoomShop(){
  roomShop.innerHTML = '';
  devices.forEach(d => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'device-btn compact' + (selected === d.id ? ' active' : '');
    const allowed = currentZone ? isAllowed(d,currentZone) : true;
    b.disabled = d.cost > budget || !allowed;
    b.innerHTML = `<strong>${d.icon} ${d.name}</strong><small>$${d.cost}${allowed ? '' : ' · Not used here'}</small>`;
    b.addEventListener('click', () => selectDevice(d.id));
    roomShop.appendChild(b);
  });
}

function selectDevice(id){
  selected = id;
  const d = deviceById(id);
  selectedEl.textContent = d.name;
  roomSelected.textContent = d.name;
  mountGuide.textContent = d.guide;
  roomHint.textContent = d.guide + ' Click the exact mounting location.';
  renderShop();
  renderRoomShop();
}

function coverage(){
  const checks = [
    has('Front Entry','door') || has('Front Entry','doorbell'),
    has('Back Entry','door') || has('Back Entry','doorbell'),
    has('Living Room','window'),
    has('Bedroom','window'),
    hasExteriorCamera(['Front Yard','Driveway']),
    hasExteriorCamera(['Backyard','Patio']),
    hasExteriorCamera(['Left Side Yard','Right Side Yard']),
    has('Kitchen','smoke'),
    has('Laundry','smoke'),
    has('Basement Utility','smoke'),
    has('Basement Utility','co'),
    has('Bedroom','co') || has('Hallway','co'),
    has('Kitchen','water'),
    has('Laundry','water'),
    has('Bathroom','water'),
    has('Basement Utility','water'),
    hasAnywhere('shutoff'),
    has('Stairs','fall') || hasAnywhere('pendant'),
    has('Bathroom','fall') || hasAnywhere('pendant'),
    has('Bedroom','fall') || hasAnywhere('pendant')
  ];
  return Math.round(checks.filter(Boolean).length / checks.length * 100);
}

function renderZoneCounts(){
  document.querySelectorAll('.zone').forEach(z => {
    const count = zoneDevices(z.dataset.zone).length;
    const badge = z.querySelector('.zone-count');
    badge.textContent = count;
    badge.classList.toggle('show', count > 0);
  });
}

function update(){
  budgetEl.textContent = `$${budget.toLocaleString()}`;
  countEl.textContent = installedCount();
  coverageEl.textContent = `${coverage()}%`;
  selectedEl.textContent = selected ? deviceById(selected).name : 'None';
  roomSelected.textContent = selected ? deviceById(selected).name : 'None';
  if(currentZone) roomDeviceCount.textContent = zoneDevices(currentZone.name).length;
  renderZoneCounts();
  renderShop();
  renderRoomShop();
  if(currentZone) renderMountedDevices();
}

function themeFor(zone){
  if(zone.type === 'exterior') return 'theme-exterior';
  if(zone.name === 'Kitchen') return 'theme-kitchen';
  if(zone.name === 'Living Room' || zone.name === 'Hallway') return 'theme-living';
  if(zone.name === 'Bedroom') return 'theme-bedroom';
  if(zone.name === 'Bathroom') return 'theme-bathroom';
  if(zone.name === 'Laundry') return 'theme-laundry';
  if(zone.name === 'Stairs') return 'theme-stairs';
  if(zone.name === 'Basement Utility') return 'theme-utility';
  if(zone.name === 'Front Entry' || zone.name === 'Back Entry') return 'theme-entry';
  return 'theme-living';
}

function hintFor(zone){
  const hints = {
    'Front Yard':'Look for views of the front walk, porch and street approach.',
    'Driveway':'A camera here can watch vehicles and the side approach.',
    'Backyard':'Think about the back door, patio and rear windows.',
    'Patio':'Cover the rear doorway and anyone approaching the house.',
    'Left Side Yard':'This is a potential blind-side approach to windows.',
    'Right Side Yard':'This is a potential blind-side approach to windows.',
    'Kitchen':'Fire and water are major risks here. Think ceiling for smoke and floor for leaks.',
    'Bathroom':'Water and falls are the major risks in this room.',
    'Laundry':'Washer hoses create water risk; appliances can also create fire risk.',
    'Basement Utility':'Water heater, furnace, CO and the main water line make this a critical room.',
    'Stairs':'This is a high-risk fall area for the senior resident.',
    'Bedroom':'Think life safety, window intrusion and the senior resident.',
    'Living Room':'Multiple windows can create intrusion risk.',
    'Front Entry':'Protect the door and consider video coverage of visitors.',
    'Back Entry':'Protect the door and the rear approach.',
    'Hallway':'A central hallway can be useful for motion, smoke or CO detection.'
  };
  return hints[zone.name] || 'Choose the equipment that makes sense for this area.';
}

function openZone(button){
  currentZone = { name:button.dataset.zone, type:button.dataset.type };
  roomTitle.textContent = currentZone.name;
  sceneLabel.textContent = currentZone.name.toUpperCase();
  roomHint.textContent = hintFor(currentZone);
  roomScene.className = `room-scene ${themeFor(currentZone)}`;
  viewer.classList.add('open');
  viewer.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
  mountGuide.textContent = selected ? deviceById(selected).guide : 'Choose a device from the strip below';
  update();
}

function closeZone(){
  viewer.classList.remove('open');
  viewer.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
  currentZone = null;
  renderRoomShop();
}

function validateMount(device,y){
  if(device.id === 'water' && y < 58) return 'Water sensors belong low near the floor and leak source.';
  if(device.id === 'shutoff' && y < 52) return 'The shutoff should be mounted low near the main water line.';
  if(['smoke','motion','indoorcam','outdoorcam','fall'].includes(device.id) && y > 62) return `${device.name} should normally be mounted higher for useful coverage.`;
  return '';
}

function installAt(x,y){
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
  if(d.cost > budget){
    roomHint.textContent = `You do not have enough budget for ${d.name}.`;
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
  const item = { uid:`p${placementCounter++}`, id:d.id, x:Number(x.toFixed(2)), y:Number(y.toFixed(2)) };
  if(!placements[currentZone.name]) placements[currentZone.name] = [];
  placements[currentZone.name].push(item);
  budget -= d.cost;
  roomHint.textContent = `${d.name} installed. Click another location to add more equipment or choose a different device.`;
  placementMessage.className = 'placement-message good';
  placementMessage.textContent = `${d.name} installed in ${currentZone.name}.`;
  update();
}

function removePlacement(uid){
  if(!currentZone) return;
  const list = zoneDevices(currentZone.name);
  const index = list.findIndex(p => p.uid === uid);
  if(index < 0) return;
  const [removed] = list.splice(index,1);
  budget += deviceById(removed.id).cost;
  roomHint.textContent = `${deviceById(removed.id).name} removed and refunded.`;
  update();
}

function renderMountedDevices(){
  mountedDevices.innerHTML = '';
  if(!currentZone) return;
  zoneDevices(currentZone.name).forEach(p => {
    const d = deviceById(p.id);
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = 'mounted-device';
    marker.style.left = `${p.x}%`;
    marker.style.top = `${p.y}%`;
    marker.innerHTML = `<span>${d.icon}</span><small>${d.name}</small>`;
    marker.title = `Remove ${d.name}`;
    marker.addEventListener('click',e => { e.stopPropagation(); removePlacement(p.uid); });
    mountedDevices.appendChild(marker);
  });
  roomDeviceCount.textContent = zoneDevices(currentZone.name).length;
}

function intrusionDetected(location){
  if(location === 'Front Entry') return hasAny('Front Entry',['door','doorbell','motion','indoorcam']) || hasExteriorCamera(['Front Yard','Driveway']);
  if(location === 'Back Entry') return hasAny('Back Entry',['door','doorbell','motion','indoorcam']) || hasExteriorCamera(['Backyard','Patio']);
  if(location === 'Living Room') return hasAny('Living Room',['window','motion','indoorcam']) || hasExteriorCamera(['Left Side Yard','Right Side Yard']);
  return false;
}

function incidentDetected(incident,location){
  if(incident.type === 'Intrusion') return intrusionDetected(location);
  if(incident.type === 'Fire') return has(location,'smoke');
  if(incident.type === 'Water Leak') return has(location,'water');
  if(incident.type === 'Fall') return has(location,'fall') || hasAnywhere('pendant');
  if(incident.type === 'Carbon Monoxide') return has(location,'co') || (location === 'Bedroom' && has('Hallway','co'));
  return false;
}

function calculateDamage(incident,detectedOk){
  if(!detectedOk) return incident.baseDamage;
  if(incident.type === 'Water Leak') return Math.round(incident.baseDamage * (hasAnywhere('shutoff') ? .05 : .28));
  if(incident.type === 'Fire') return Math.round(incident.baseDamage * .20);
  if(incident.type === 'Fall') return Math.round(incident.baseDamage * .12);
  if(incident.type === 'Carbon Monoxide') return Math.round(incident.baseDamage * .08);
  return Math.round(incident.baseDamage * .10);
}

function simulate(){
  if(!installedCount()){
    placementMessage.className = 'placement-message bad';
    placementMessage.textContent = 'Install at least one device before running a scenario.';
    return;
  }
  const incident = incidents[Math.floor(Math.random()*incidents.length)];
  const location = incident.locations[Math.floor(Math.random()*incident.locations.length)];
  const ok = incidentDetected(incident,location);
  const dmg = calculateDamage(incident,ok);

  document.getElementById('incident').textContent = incident.type;
  document.getElementById('location').textContent = location;
  document.getElementById('detected').textContent = ok ? 'YES' : 'NO';
  document.getElementById('detected').className = ok ? 'good' : 'bad';
  document.getElementById('damage').textContent = `$${dmg.toLocaleString()}`;
  document.getElementById('resultTitle').textContent = ok ? 'THREAT DETECTED' : 'THREAT MISSED';
  document.getElementById('resultTitle').className = ok ? 'good' : 'bad';
  document.getElementById('resultText').textContent = ok
    ? `Your design detected the ${incident.type.toLowerCase()} event in the ${location}. Estimated loss was reduced.`
    : `The ${incident.type.toLowerCase()} event in the ${location} was not covered by your design.`;
  video.src = incident.video;
  video.load();
  placeholder.textContent = `Scenario slot: ${incident.video}. We will replace this with the finished cinematic footage.`;
}

function resetGame(){
  budget = STARTING_BUDGET;
  selected = null;
  placements = {};
  placementCounter = 1;
  closeZone();
  selectedEl.textContent = 'None';
  roomSelected.textContent = 'None';
  mountGuide.textContent = 'Choose a device';
  video.removeAttribute('src');
  video.load();
  placeholder.textContent = 'Scenario footage will appear here when cinematic clips are added.';
  document.getElementById('resultTitle').textContent = 'SYSTEM NOT TESTED';
  document.getElementById('resultTitle').className = '';
  document.getElementById('resultText').textContent = 'Inspect the property, build your system and run the scenario.';
  ['incident','location','detected','damage'].forEach(id => document.getElementById(id).textContent = '—');
  placementMessage.className = 'placement-message';
  placementMessage.textContent = 'Click any highlighted area to enter it and mount equipment.';
  update();
}

document.getElementById('blueprint').addEventListener('click',e => {
  const zoneButton = e.target.closest('.zone');
  if(zoneButton) openZone(zoneButton);
});

document.getElementById('closeRoomBtn').addEventListener('click',closeZone);
document.getElementById('simulateBtn').addEventListener('click',simulate);
document.getElementById('resetBtn').addEventListener('click',resetGame);

document.getElementById('undoRoomBtn').addEventListener('click',() => {
  if(!currentZone) return;
  const list = zoneDevices(currentZone.name);
  if(!list.length){ roomHint.textContent = 'There is nothing to undo in this area.'; return; }
  const removed = list.pop();
  budget += deviceById(removed.id).cost;
  roomHint.textContent = `${deviceById(removed.id).name} removed and refunded.`;
  update();
});

roomScene.addEventListener('mousemove',e => {
  const rect = roomScene.getBoundingClientRect();
  sceneCrosshair.style.display = 'block';
  sceneCrosshair.style.left = `${e.clientX - rect.left}px`;
  sceneCrosshair.style.top = `${e.clientY - rect.top}px`;
});
roomScene.addEventListener('mouseleave',() => { sceneCrosshair.style.display = 'none'; });
roomScene.addEventListener('click',e => {
  if(e.target.closest('.mounted-device')) return;
  const rect = roomScene.getBoundingClientRect();
  const x = Math.max(0,Math.min(100,(e.clientX - rect.left)/rect.width*100));
  const y = Math.max(0,Math.min(100,(e.clientY - rect.top)/rect.height*100));
  installAt(x,y);
});

document.addEventListener('keydown',e => {
  if(e.key === 'Escape' && viewer.classList.contains('open')) closeZone();
});

update();
