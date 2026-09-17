// HomeGuard true 360-degree installation system.
// Uses equirectangular panorama photography and keeps equipment anchored
// to pitch / yaw positions while the player rotates around the room.

(() => {
  const PANNELLUM_JS =
    'https://cdn.jsdelivr.net/npm/pannellum@2.5.7/build/pannellum.js';

  const PANNELLUM_CSS =
    'https://cdn.jsdelivr.net/npm/pannellum@2.5.7/build/pannellum.css';

  function commons360(filename){
    return 'https://commons.wikimedia.org/wiki/Special:Redirect/file/' +
      encodeURIComponent(filename) +
      '?width=3840';
  }

  const kitchenPano = commons360(
    '360 view of the Sandburg Home Kitchen (d0da8053-8da5-4c70-8e49-281c084900ec).jpg'
  );

  const livingPano = commons360(
    'Sandburg Home Living Room (b7a0ca83-a5e6-41b5-bc4b-bd2f97ae97a2).jpg'
  );

  const bedroomPano = commons360(
    "360 view of Mrs. Sandburg's Bedroom (2a47eada-2d4c-4c54-8bce-8fe81c56e617).jpg"
  );

  const bathroomPano = commons360(
    'Bathroom – Panorama (Greg Zaal via Poly Haven).jpg'
  );

  const utilityPano = commons360(
    'Boiler room – Panorama (Oliksiy Yakovlyev via Poly Haven).jpg'
  );

  const garagePano = commons360(
    'Garage – Panorama (Greg Zaal via Poly Haven).jpg'
  );

  const exteriorPano = commons360(
    '360 degree view from the Sandburg Home porch. (db7fe087-bc69-42c1-9cd3-02aea4c0f7d6).jpg'
  );

  /*
    Phase-one panorama set.

    Some navigation areas temporarily share a panorama.
    Later these will be replaced with a coordinated 360 scan/render
    of one complete mission property.
  */
  const PANORAMA_SCENES = {
    'Kitchen': kitchenPano,

    'Living Room': livingPano,
    'Hallway': livingPano,
    'Front Entry': livingPano,
    'Back Entry': livingPano,
    'Stairs': livingPano,

    'Bedroom': bedroomPano,

    'Bathroom': bathroomPano,

    'Laundry': garagePano,

    'Basement Utility': utilityPano,

    'Front Yard': exteriorPano,
    'Driveway': exteriorPano,
    'Left Side Yard': exteriorPano,
    'Right Side Yard': exteriorPano,
    'Backyard': exteriorPano,
    'Patio': exteriorPano
  };

  let panoViewer = null;
  let panoZone = null;
  let downPoint = null;
  let loadingFailed = false;

  const roomScene = document.getElementById('roomScene');
  const sceneImage = document.getElementById('sceneImage');
  const mountedLayer = document.getElementById('mountedDevices');
  const sceneLabel = document.getElementById('sceneLabel');

  if(!roomScene) return;

  const surface = document.createElement('div');
  surface.id = 'panoramaSurface';
  roomScene.insertBefore(surface, roomScene.firstChild);

  const status = document.createElement('div');
  status.id = 'panoramaStatus';
  status.textContent = '360° INSTALL MODE';
  roomScene.appendChild(status);

  const toolbar = document.createElement('div');
  toolbar.className = 'panorama-toolbar';
  toolbar.innerHTML = `
    <span>DRAG TO SPIN 360° • SCROLL TO ZOOM • CLICK TO INSTALL</span>
    <button id="installCenterBtn" type="button">INSTALL AT CENTER</button>
  `;
  roomScene.appendChild(toolbar);

  status.style.display = 'none';
  toolbar.style.display = 'none';

  function loadStyle(href, id){
    if(document.getElementById(id)) return;

    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function loadScript(src, id){
    return new Promise((resolve,reject) => {
      const existing = document.getElementById(id);

      if(existing){
        if(window.pannellum) resolve();
        else existing.addEventListener('load',resolve,{once:true});
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

  loadStyle(PANNELLUM_CSS,'pannellumLibraryStyles');
  loadStyle('panorama-upgrade.css','homeGuardPanoramaStyles');

  function hide360(){
    roomScene.classList.remove('panorama-active');
    surface.style.display = 'none';
    status.style.display = 'none';
    toolbar.style.display = 'none';

    if(sceneImage) sceneImage.style.visibility = '';
    if(mountedLayer) mountedLayer.style.display = '';

    if(panoViewer){
      try { panoViewer.destroy(); } catch(e){}
      panoViewer = null;
    }

    surface.innerHTML = '';
    panoZone = null;
  }

  function hotspotTooltip(div,args){
    div.innerHTML = `
      <span class="hg-hotspot-icon">${args.icon}</span>
      <span class="hg-hotspot-name">${args.name}</span>
    `;
    div.title = `Remove ${args.name}`;
  }

  function removePanoPlacement(uid){
    if(!currentZone) return;

    const list = zoneDevices(currentZone.name);
    const index = list.findIndex(item => item.uid === uid);

    if(index < 0) return;

    const removed = list.splice(index,1)[0];
    const device = deviceById(removed.id);

    const refund =
      typeof removed.charged === 'number'
        ? removed.charged
        : device.cost;

    budget += refund;

    if(panoViewer){
      try { panoViewer.removeHotSpot(uid); } catch(e){}
    }

    roomHint.textContent = removed.included
      ? `${device.name} removed. Its included-package credit is available again.`
      : `${device.name} removed and $${refund} returned to the upgrade budget.`;

    update();
  }

  function addPanoHotspot(item){
    if(!panoViewer || !item.panorama) return;

    const device = deviceById(item.id);
    if(!device) return;

    try{
      panoViewer.addHotSpot({
        id:item.uid,
        pitch:item.pitch,
        yaw:item.yaw,
        cssClass:'hg-device-hotspot',
        createTooltipFunc:hotspotTooltip,
        createTooltipArgs:{
          icon:device.icon,
          name:device.name
        },
        clickHandlerFunc:(event,args) => {
          event.stopPropagation();
          removePanoPlacement(args.uid);
        },
        clickHandlerArgs:{
          uid:item.uid
        }
      });
    }catch(e){}
  }

  function rebuildPanoHotspots(){
    if(!panoViewer || !currentZone) return;

    const list = zoneDevices(currentZone.name);

    list.forEach(item => {
      if(!item.panorama) return;

      try {
        panoViewer.removeHotSpot(item.uid);
      } catch(e){}

      addPanoHotspot(item);
    });
  }

  function panoramaMountError(device,pitch){
    if(device.id === 'water' && pitch > -12){
      return 'Look lower toward the floor and place the water sensor beside the leak source.';
    }

    if(device.id === 'shutoff' && pitch > -10){
      return 'Look lower toward the main water line before placing the shutoff.';
    }

    if(device.id === 'smoke' && pitch < 20){
      return 'Look higher toward the ceiling before placing the smoke detector.';
    }

    if(
      ['motion','indoorcam','outdoorcam','fall'].includes(device.id) &&
      pitch < -28
    ){
      return `${device.name} should normally be mounted higher for useful coverage.`;
    }

    return '';
  }

  function installAtPanorama(pitch,yaw){
    if(!currentZone || !selected) {
      roomHint.textContent =
        'Choose a device first, then click the exact location in the 360 room.';
      return;
    }

    const device = deviceById(selected);

    if(!isAllowed(device,currentZone)){
      roomHint.textContent =
        `${device.name} is not appropriate for ${currentZone.name}.`;
      return;
    }

    const charge =
      typeof chargeForDevice === 'function'
        ? chargeForDevice(device)
        : device.cost;

    if(charge > budget){
      roomHint.textContent =
        `You do not have enough upgrade budget for ${device.name}.`;
      return;
    }

    if(
      (device.id === 'pendant' || device.id === 'shutoff') &&
      hasAnywhere(device.id)
    ){
      roomHint.textContent =
        `Only one ${device.name} is needed in this mission.`;
      return;
    }

    const mountError = panoramaMountError(device,pitch);

    if(mountError){
      roomHint.textContent = mountError;
      return;
    }

    const included =
      charge === 0 &&
      typeof deviceUsesIncludedPackage === 'function' &&
      deviceUsesIncludedPackage(device.id);

    const item = {
      uid:`p${placementCounter++}`,
      id:device.id,
      panorama:true,
      pitch:Number(pitch.toFixed(2)),
      yaw:Number(yaw.toFixed(2)),
      charged:charge,
      included
    };

    if(!placements[currentZone.name]){
      placements[currentZone.name] = [];
    }

    placements[currentZone.name].push(item);
    budget -= charge;

    addPanoHotspot(item);

    roomHint.textContent = included
      ? `${device.name} installed in the 360 room from the included base package.`
      : `${device.name} installed in the 360 room for $${charge}.`;

    placementMessage.className = 'placement-message good';

    placementMessage.textContent = included
      ? `${device.name} installed in ${currentZone.name} — INCLUDED BASE PACKAGE.`
      : `${device.name} installed in ${currentZone.name} — $${charge} deducted from upgrade budget.`;

    update();
  }

  function activate360(zoneName){
    const panorama = PANORAMA_SCENES[zoneName];

    if(!panorama || !window.pannellum){
      hide360();
      return;
    }

    hide360();

    panoZone = zoneName;
    loadingFailed = false;

    roomScene.classList.add('panorama-active');
    surface.style.display = 'block';
    status.style.display = 'block';
    toolbar.style.display = 'flex';

    if(sceneImage) sceneImage.style.visibility = 'hidden';
    if(mountedLayer) mountedLayer.style.display = 'none';

    if(sceneLabel){
      sceneLabel.textContent =
        `${zoneName.toUpperCase()} • TRUE 360° VIEW`;
    }

    surface.innerHTML = '';

    panoViewer = pannellum.viewer(surface,{
      type:'equirectangular',
      panorama,
      autoLoad:true,
      crossOrigin:'anonymous',
      showControls:true,
      showZoomCtrl:true,
      showFullscreenCtrl:false,
      keyboardZoom:true,
      mouseZoom:true,
      draggable:true,
      hfov:100,
      minHfov:45,
      maxHfov:125,
      pitch:0,
      yaw:0,
      hotSpots:[]
    });

    panoViewer.on('load',() => {
      loadingFailed = false;

      roomHint.textContent =
        'Drag to look all the way around. Click an exact location to mount the selected device.';

      zoneDevices(zoneName)
        .filter(item => item.panorama)
        .forEach(addPanoHotspot);

      setTimeout(() => {
        try { panoViewer.resize(); } catch(e){}
      },50);
    });

    panoViewer.on('error',() => {
      if(loadingFailed) return;
      loadingFailed = true;

      roomHint.textContent =
        'The 360 panorama could not load, so the photo-real flat view is being used instead.';

      hide360();

      if(typeof applyPhotoRealScene === 'function'){
        applyPhotoRealScene(zoneName);
      }
    });

    panoViewer.on('mousedown',event => {
      downPoint = {
        x:event.clientX,
        y:event.clientY,
        time:Date.now()
      };
    });

    panoViewer.on('mouseup',event => {
      if(!downPoint || !panoViewer) return;

      if(event.target.closest('.hg-device-hotspot')){
        downPoint = null;
        return;
      }

      const dx = event.clientX - downPoint.x;
      const dy = event.clientY - downPoint.y;
      const distance = Math.hypot(dx,dy);
      const duration = Date.now() - downPoint.time;

      downPoint = null;

      if(distance > 7 || duration > 500) return;

      const coords = panoViewer.mouseEventToCoords(event);

      if(Array.isArray(coords) && coords.length === 2){
        installAtPanorama(coords[0],coords[1]);
      }
    });
  }

  /*
    Keep panorama interaction from bubbling into the old flat-image
    installation click handler.
  */
  ['click','mousedown','mouseup','mousemove','pointerdown','pointerup'].forEach(type => {
    surface.addEventListener(type,event => {
      event.stopPropagation();
    });
  });

  document.getElementById('installCenterBtn')?.addEventListener('click',event => {
    event.stopPropagation();

    if(!panoViewer) return;

    installAtPanorama(
      panoViewer.getPitch(),
      panoViewer.getYaw()
    );
  });

  /*
    The existing game opens a room from blueprint clicks.
    Start the 360 scene immediately after that existing logic finishes.
  */
  document.getElementById('blueprint')?.addEventListener('click',event => {
    const zone = event.target.closest('.zone');

    if(!zone) return;

    setTimeout(() => {
      activate360(zone.dataset.zone);
    },25);
  });

  document.getElementById('closeRoomBtn')?.addEventListener('click',() => {
    hide360();
  });

  document.getElementById('resetBtn')?.addEventListener('click',() => {
    hide360();
  });

  /*
    Existing undo logic updates placements. Refresh visible 360 hot spots
    immediately afterward.
  */
  document.getElementById('undoRoomBtn')?.addEventListener('click',() => {
    setTimeout(rebuildPanoHotspots,0);
  });

  const previousUpdate = window.update;

  if(typeof previousUpdate === 'function'){
    window.update = function(){
      previousUpdate();

      if(panoViewer && currentZone && panoZone === currentZone.name){
        setTimeout(rebuildPanoHotspots,0);
      }
    };
  }

  async function boot360(){
    try{
      await loadScript(PANNELLUM_JS,'pannellumLibraryScript');

      const header = document.querySelector('.room-view-header > div');

      if(header && !document.getElementById('true360ModeBadge')){
        const badge = document.createElement('div');

        badge.id = 'true360ModeBadge';
        badge.textContent = 'TRUE 360° INSTALLATION ENABLED';

        badge.style.cssText =
          'display:inline-block;margin:7px 0 0 7px;padding:5px 9px;border-radius:999px;border:1px solid rgba(85,215,255,.48);background:rgba(7,34,52,.68);color:#55d7ff;font-size:9px;font-weight:900;letter-spacing:.11em';

        header.appendChild(badge);
      }
    }catch(error){
      console.warn('360 viewer failed to load',error);
    }
  }

  boot360();
})();
