// HomeGuard real-property mode.
// Uses the official measured plan and verified same-property 360 panoramas.

(() => {
  const property = window.HOMEGUARD_PROPERTIES?.connemara;
  if (!property) return;

  const blueprint = document.getElementById('blueprint');
  const roomScene = document.getElementById('roomScene');
  const roomTitle = document.getElementById('roomTitle');
  const roomHint = document.getElementById('roomHint');
  const mountedLayer = document.getElementById('mountedDevices');
  const sceneImage = document.getElementById('sceneImage');
  const sceneCrosshair = document.getElementById('sceneCrosshair');
  const sceneLabel = document.getElementById('sceneLabel');
  const placementMessage = document.getElementById('placementMessage');

  if (!blueprint || !roomScene) return;

  const PANNELLUM_JS = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.7/build/pannellum.js';
  const PANNELLUM_CSS = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.7/build/pannellum.css';

  let viewer360 = null;
  let activePanoramaKey = null;
  let pointerStart = null;

  function commonsImage(file){
    return 'https://commons.wikimedia.org/wiki/Special:Redirect/file/' + encodeURIComponent(file) + '?width=4096';
  }

  function ensureStylesheet(href,id){
    if(document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function ensureScript(src,id){
    return new Promise((resolve,reject) => {
      if(window.pannellum) return resolve();
      const old = document.getElementById(id);
      if(old){
        old.addEventListener('load',resolve,{once:true});
        old.addEventListener('error',reject,{once:true});
        return;
      }
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  ensureStylesheet(PANNELLUM_CSS,'realPropertyPannellumCss');

  function updateMissionCopy(){
    const panel = document.querySelector('.loadout-panel');
    if(!panel) return;

    const eyebrow = panel.querySelector('.eyebrow');
    const title = panel.querySelector('h2');
    const brief = panel.querySelector('.brief');
    const tip = panel.querySelector('.mission-tip');

    if(eyebrow) eyebrow.textContent = 'MISSION 01 • REAL PROPERTY';
    if(title) title.textContent = property.name;
    if(brief){
      brief.innerHTML = `
        <p><b>Location:</b> ${property.location}</p>
        <p><b>Property:</b> ${property.propertyType}</p>
        <p><b>Source:</b> National Park Service measured plan + NPS 360 photography</p>
      `;
    }
    if(tip){
      tip.innerHTML = '<b>Your job:</b> use the real measured property plan, enter a verified 360 room, look anywhere from floor to ceiling, and mount protection in the exact location you choose.';
    }
  }

  const verifiedRooms = [
    {
      display:'Front Porch / Entry',
      logicZone:'Front Entry',
      type:'entry',
      panorama:'Front Porch',
      note:'Same-house NPS 360 capture'
    },
    {
      display:'Living Room',
      logicZone:'Living Room',
      type:'window',
      panorama:'Living Room',
      note:'Same-house NPS 360 capture'
    },
    {
      display:'Kitchen',
      logicZone:'Kitchen',
      type:'wet',
      panorama:'Kitchen',
      note:'Same-house NPS 360 capture'
    },
    {
      display:"Mrs. Sandburg's Bedroom",
      logicZone:'Bedroom',
      type:'medical-window',
      panorama:"Mrs. Sandburg's Bedroom",
      note:'Same-house NPS 360 capture'
    }
  ];

  function renderRealBlueprint(){
    blueprint.classList.add('real-property-mode');

    const planUrl = `${property.floorPlans.sourceUrl}#page=${property.floorPlans.firstFloorReportPage}&view=FitH&toolbar=0&navpanes=0`;

    blueprint.innerHTML = `
      <div class="real-plan-head">
        <div>
          <strong>OFFICIAL NPS MEASURED PROPERTY PLAN</strong>
          <span>${property.name} • First-floor plan reference: report page ${property.floorPlans.firstFloorReportPage}. This is the same property used by the verified 360 rooms below.</span>
        </div>
        <a href="${property.floorPlans.sourceUrl}#page=${property.floorPlans.firstFloorReportPage}" target="_blank" rel="noopener">OPEN OFFICIAL PLAN</a>
      </div>

      <div class="real-plan-frame">
        <iframe src="${planUrl}" title="Official Connemara measured floor plan"></iframe>
      </div>

      <div class="real-room-heading">VERIFIED 360 CAPTURE POINTS FROM THIS SAME HOUSE</div>
      <div class="real-zone-grid">
        ${verifiedRooms.map(room => `
          <button class="zone real-zone" type="button"
            data-zone="${room.logicZone}"
            data-type="${room.type}"
            data-panorama-key="${room.panorama}">
            <span>${room.display}<small>${room.note}</small></span>
            <b class="zone-count"></b>
          </button>
        `).join('')}
      </div>

      <div class="real-property-note">
        We only enable a 360 room when the panorama is verified to be from this exact property. Missing rooms stay unavailable instead of being filled with a different house.
      </div>
    `;
  }

  function cleanupReal360(){
    const surface = document.getElementById('realProperty360Surface');
    const toolbar = document.getElementById('realProperty360Toolbar');

    if(viewer360){
      try{ viewer360.destroy(); }catch(e){}
      viewer360 = null;
    }

    surface?.remove();
    toolbar?.remove();
    activePanoramaKey = null;

    if(sceneImage) sceneImage.style.display = '';
    if(mountedLayer) mountedLayer.style.display = '';
    if(sceneCrosshair) sceneCrosshair.style.display = '';
  }

  function hotspotMarkup(div,args){
    div.innerHTML = `<b>${args.icon}</b><small>${args.name}</small>`;
    div.title = `Remove ${args.name}`;
  }

  function removeRealPlacement(uid){
    if(!currentZone) return;
    const list = zoneDevices(currentZone.name);
    const index = list.findIndex(item => item.uid === uid);
    if(index < 0) return;

    const removed = list.splice(index,1)[0];
    const device = deviceById(removed.id);
    const refund = typeof removed.charged === 'number' ? removed.charged : device.cost;
    budget += refund;

    try{ viewer360?.removeHotSpot(uid); }catch(e){}

    roomHint.textContent = removed.included
      ? `${device.name} removed. Its included-package credit is available again.`
      : `${device.name} removed and $${refund} returned to the upgrade budget.`;

    update();
  }

  function addRealHotspot(item){
    if(!viewer360 || !item.realProperty360 || item.panoramaKey !== activePanoramaKey) return;
    const device = deviceById(item.id);
    if(!device) return;

    try{
      viewer360.addHotSpot({
        id:item.uid,
        pitch:item.pitch,
        yaw:item.yaw,
        cssClass:'real-property-hotspot',
        createTooltipFunc:hotspotMarkup,
        createTooltipArgs:{icon:device.icon,name:device.name},
        clickHandlerFunc:(event,args) => {
          event.stopPropagation();
          removeRealPlacement(args.uid);
        },
        clickHandlerArgs:{uid:item.uid}
      });
    }catch(e){}
  }

  function rebuildRealHotspots(){
    if(!viewer360 || !currentZone) return;
    zoneDevices(currentZone.name).forEach(item => {
      if(!item.realProperty360 || item.panoramaKey !== activePanoramaKey) return;
      try{ viewer360.removeHotSpot(item.uid); }catch(e){}
      addRealHotspot(item);
    });
  }

  function mountRuleError(device,pitch){
    if(device.id === 'water' && pitch > -12) return 'Look down toward the floor and place the water sensor beside the leak source.';
    if(device.id === 'shutoff' && pitch > -10) return 'Look down toward the main water line before placing the shutoff.';
    if(device.id === 'smoke' && pitch < 25) return 'Look up toward the ceiling before placing the smoke detector.';
    return '';
  }

  function installReal360(pitch,yaw){
    if(!currentZone || !selected){
      roomHint.textContent = 'Choose a device, then click the exact mounting location in the 360 room.';
      return;
    }

    const device = deviceById(selected);
    if(!isAllowed(device,currentZone)){
      roomHint.textContent = `${device.name} is not appropriate for this area.`;
      return;
    }

    const charge = typeof chargeForDevice === 'function' ? chargeForDevice(device) : device.cost;
    if(charge > budget){
      roomHint.textContent = `You do not have enough upgrade budget for ${device.name}.`;
      return;
    }

    if((device.id === 'pendant' || device.id === 'shutoff') && hasAnywhere(device.id)){
      roomHint.textContent = `Only one ${device.name} is needed in this mission.`;
      return;
    }

    const mountError = mountRuleError(device,pitch);
    if(mountError){
      roomHint.textContent = mountError;
      return;
    }

    const included = charge === 0 && typeof deviceUsesIncludedPackage === 'function' && deviceUsesIncludedPackage(device.id);
    const item = {
      uid:`p${placementCounter++}`,
      id:device.id,
      realProperty360:true,
      propertyId:property.id,
      panoramaKey:activePanoramaKey,
      pitch:Number(pitch.toFixed(2)),
      yaw:Number(yaw.toFixed(2)),
      charged:charge,
      included
    };

    if(!placements[currentZone.name]) placements[currentZone.name] = [];
    placements[currentZone.name].push(item);
    budget -= charge;
    addRealHotspot(item);

    roomHint.textContent = included
      ? `${device.name} installed from the included base package. The device is anchored to this exact 360 position.`
      : `${device.name} installed for $${charge}. The device is anchored to this exact 360 position.`;

    placementMessage.className = 'placement-message good';
    placementMessage.textContent = `${device.name} installed in ${activePanoramaKey}.`;
    update();
  }

  async function startReal360(panoramaKey){
    const pano = property.panoramas[panoramaKey];
    if(!pano){
      roomHint.textContent = 'No verified same-property 360 capture is available for this room.';
      return;
    }

    await ensureScript(PANNELLUM_JS,'realPropertyPannellumJs');
    cleanupReal360();
    activePanoramaKey = panoramaKey;

    document.getElementById('panoramaSurface')?.style.setProperty('display','none','important');
    roomScene.classList.remove('panorama-active');

    if(sceneImage) sceneImage.style.display = 'none';
    if(mountedLayer) mountedLayer.style.display = 'none';
    if(sceneCrosshair) sceneCrosshair.style.display = 'none';

    const surface = document.createElement('div');
    surface.id = 'realProperty360Surface';
    roomScene.appendChild(surface);

    const toolbar = document.createElement('div');
    toolbar.id = 'realProperty360Toolbar';
    toolbar.innerHTML = `
      <span>DRAG ANY DIRECTION • FLOOR TO CEILING • SCROLL TO ZOOM</span>
      <button id="realLookUp" type="button">LOOK UP</button>
      <button id="realLookLevel" type="button">LEVEL</button>
      <button id="realLookDown" type="button">LOOK DOWN</button>
      <button id="realInstallCenter" type="button">INSTALL AT CENTER</button>
    `;
    roomScene.appendChild(toolbar);

    if(sceneLabel) sceneLabel.textContent = `${panoramaKey.toUpperCase()} • REAL PROPERTY 360`;
    roomTitle.textContent = panoramaKey;

    viewer360 = pannellum.viewer(surface,{
      type:'equirectangular',
      panorama:commonsImage(pano.file),
      autoLoad:true,
      crossOrigin:'anonymous',
      draggable:true,
      mouseZoom:true,
      keyboardZoom:true,
      showControls:true,
      showZoomCtrl:true,
      showFullscreenCtrl:false,
      hfov:95,
      minHfov:35,
      maxHfov:120,
      pitch:0,
      yaw:0,
      minPitch:-90,
      maxPitch:90,
      haov:360,
      vaov:180,
      hotSpots:[]
    });

    viewer360.on('load',() => {
      roomHint.textContent = 'This is the real room from the same property as the measured plan. Drag anywhere to look around, including straight up at the ceiling and straight down at the floor.';
      rebuildRealHotspots();
      try{ viewer360.resize(); }catch(e){}
    });

    viewer360.on('error',() => {
      roomHint.textContent = 'The verified 360 image did not load. Use the source link on the blueprint while we keep this room marked as unavailable rather than substituting another house.';
    });

    surface.addEventListener('pointerdown',event => {
      pointerStart = {x:event.clientX,y:event.clientY,time:performance.now()};
    });

    surface.addEventListener('pointerup',event => {
      if(!pointerStart || !viewer360) return;
      if(event.target.closest('.real-property-hotspot')){
        pointerStart = null;
        return;
      }
      const moved = Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y);
      const elapsed = performance.now()-pointerStart.time;
      pointerStart = null;
      if(moved > 8 || elapsed > 450) return;
      const coords = viewer360.mouseEventToCoords(event);
      if(Array.isArray(coords) && coords.length === 2) installReal360(coords[0],coords[1]);
    });

    surface.addEventListener('click',event => event.stopPropagation());

    document.getElementById('realLookUp')?.addEventListener('click',() => viewer360?.setPitch(82,450));
    document.getElementById('realLookLevel')?.addEventListener('click',() => viewer360?.setPitch(0,450));
    document.getElementById('realLookDown')?.addEventListener('click',() => viewer360?.setPitch(-82,450));
    document.getElementById('realInstallCenter')?.addEventListener('click',() => {
      if(viewer360) installReal360(viewer360.getPitch(),viewer360.getYaw());
    });
  }

  function openVerifiedRoom(button){
    const proxy = document.createElement('button');
    proxy.dataset.zone = button.dataset.zone;
    proxy.dataset.type = button.dataset.type;
    openZone(proxy);
    setTimeout(() => startReal360(button.dataset.panoramaKey),25);
  }

  // Capture clicks before the older fictional blueprint / panorama handlers see them.
  blueprint.addEventListener('click',event => {
    const button = event.target.closest('.real-zone');
    if(!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openVerifiedRoom(button);
  },true);

  // Keep scenario testing limited to the rooms that are actually represented by this real-property prototype.
  const simulateBtn = document.getElementById('simulateBtn');
  simulateBtn?.addEventListener('click',event => {
    if(!blueprint.classList.contains('real-property-mode')) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const events = [
      {type:'Intrusion',location:'Front Entry',baseDamage:6500},
      {type:'Intrusion',location:'Living Room',baseDamage:6500},
      {type:'Fire',location:'Kitchen',baseDamage:18000},
      {type:'Water Leak',location:'Kitchen',baseDamage:9000},
      {type:'Fall',location:'Bedroom',baseDamage:12000},
      {type:'Carbon Monoxide',location:'Bedroom',baseDamage:15000}
    ];

    const chosen = events[Math.floor(Math.random()*events.length)];
    const incident = {type:chosen.type,baseDamage:chosen.baseDamage};
    const ok = incidentDetected(incident,chosen.location);
    const dmg = calculateDamage(incident,ok);

    document.getElementById('incident').textContent = chosen.type;
    document.getElementById('location').textContent = chosen.location;
    document.getElementById('detected').textContent = ok ? 'YES' : 'NO';
    document.getElementById('detected').className = ok ? 'good' : 'bad';
    document.getElementById('damage').textContent = `$${dmg.toLocaleString()}`;
    document.getElementById('resultTitle').textContent = ok ? 'THREAT DETECTED' : 'THREAT MISSED';
    document.getElementById('resultTitle').className = ok ? 'good' : 'bad';
    document.getElementById('resultText').textContent = ok
      ? `Your design detected the ${chosen.type.toLowerCase()} event in the real-property training zone.`
      : `The ${chosen.type.toLowerCase()} event was not covered by your current design.`;

    const placeholder = document.getElementById('videoPlaceholder');
    if(placeholder){
      placeholder.style.display = 'block';
      placeholder.textContent = 'Real-property scenario footage will be added only when it matches this same property.';
    }
  },true);

  document.getElementById('closeRoomBtn')?.addEventListener('click',cleanupReal360);
  document.getElementById('resetBtn')?.addEventListener('click',cleanupReal360);
  document.getElementById('undoRoomBtn')?.addEventListener('click',() => setTimeout(rebuildRealHotspots,0));

  updateMissionCopy();
  renderRealBlueprint();
})();
