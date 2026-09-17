// HomeGuard true 360-degree installation system.
// Uses verified equirectangular panorama images and keeps equipment anchored
// to pitch / yaw positions while the player looks around the entire room.

(() => {
  const PANNELLUM_JS = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.7/build/pannellum.js';
  const PANNELLUM_CSS = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.7/build/pannellum.css';

  const PANOS = {
    kitchen: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/360_view_of_the_Sandburg_Home_Kitchen_%28d0da8053-8da5-4c70-8e49-281c084900ec%29.jpg/3840px-360_view_of_the_Sandburg_Home_Kitchen_%28d0da8053-8da5-4c70-8e49-281c084900ec%29.jpg',
    living: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Sandburg_Home_Living_Room_%28b7a0ca83-a5e6-41b5-bc4b-bd2f97ae97a2%29.jpg/3840px-Sandburg_Home_Living_Room_%28b7a0ca83-a5e6-41b5-bc4b-bd2f97ae97a2%29.jpg',
    bedroom: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/360_view_of_Mrs._Sandburg%27s_Bedroom_%282a47eada-2d4c-4c54-8bce-8fe81c56e617%29.jpg/3840px-360_view_of_Mrs._Sandburg%27s_Bedroom_%282a47eada-2d4c-4c54-8bce-8fe81c56e617%29.jpg',
    guest: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/Sandburg_Home_Guest_Room_%287c0014e7-ccbc-40dc-be23-25236f546c2f%29.jpg/3840px-Sandburg_Home_Guest_Room_%287c0014e7-ccbc-40dc-be23-25236f546c2f%29.jpg',
    demo: 'https://pannellum.org/images/alma.jpg'
  };

  const PANORAMA_SCENES = {
    'Kitchen': PANOS.kitchen,
    'Living Room': PANOS.living,
    'Hallway': PANOS.living,
    'Front Entry': PANOS.living,
    'Back Entry': PANOS.living,
    'Stairs': PANOS.living,
    'Bedroom': PANOS.bedroom,
    'Bathroom': PANOS.guest,
    'Laundry': PANOS.kitchen,
    'Basement Utility': PANOS.guest,
    'Front Yard': PANOS.demo,
    'Driveway': PANOS.demo,
    'Left Side Yard': PANOS.demo,
    'Right Side Yard': PANOS.demo,
    'Backyard': PANOS.demo,
    'Patio': PANOS.demo
  };

  let panoViewer = null;
  let panoZone = null;
  let pointerStart = null;

  const roomScene = document.getElementById('roomScene');
  const sceneImage = document.getElementById('sceneImage');
  const mountedLayer = document.getElementById('mountedDevices');
  const sceneLabel = document.getElementById('sceneLabel');

  if (!roomScene) return;

  const surface = document.createElement('div');
  surface.id = 'panoramaSurface';
  roomScene.insertBefore(surface, roomScene.firstChild);

  const status = document.createElement('div');
  status.id = 'panoramaStatus';
  status.textContent = 'TRUE 360° INSTALL MODE';
  roomScene.appendChild(status);

  const toolbar = document.createElement('div');
  toolbar.className = 'panorama-toolbar';
  toolbar.innerHTML = `
    <span>DRAG ANY DIRECTION • LOOK UP / DOWN • SCROLL TO ZOOM</span>
    <button id="lookUpBtn" type="button">LOOK UP</button>
    <button id="lookLevelBtn" type="button">LEVEL</button>
    <button id="lookDownBtn" type="button">LOOK DOWN</button>
    <button id="installCenterBtn" type="button">INSTALL AT CENTER</button>
  `;
  roomScene.appendChild(toolbar);

  status.style.display = 'none';
  toolbar.style.display = 'none';

  function loadStyle(href, id) {
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function loadScript(src, id) {
    return new Promise((resolve, reject) => {
      if (window.pannellum) return resolve();
      const existing = document.getElementById(id);
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
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

  loadStyle(PANNELLUM_CSS, 'pannellumLibraryStyles');
  loadStyle('panorama-upgrade.css', 'homeGuardPanoramaStyles');

  function hide360() {
    roomScene.classList.remove('panorama-active');
    surface.style.display = 'none';
    status.style.display = 'none';
    toolbar.style.display = 'none';
    if (sceneImage) sceneImage.style.visibility = '';
    if (mountedLayer) mountedLayer.style.display = '';
    if (panoViewer) {
      try { panoViewer.destroy(); } catch (e) {}
      panoViewer = null;
    }
    surface.innerHTML = '';
    panoZone = null;
  }

  function hotspotTooltip(div, args) {
    div.innerHTML = `<span class="hg-hotspot-icon">${args.icon}</span><span class="hg-hotspot-name">${args.name}</span>`;
    div.title = `Remove ${args.name}`;
  }

  function removePanoPlacement(uid) {
    if (!currentZone) return;
    const list = zoneDevices(currentZone.name);
    const index = list.findIndex(item => item.uid === uid);
    if (index < 0) return;

    const removed = list.splice(index, 1)[0];
    const device = deviceById(removed.id);
    const refund = typeof removed.charged === 'number' ? removed.charged : device.cost;
    budget += refund;

    if (panoViewer) {
      try { panoViewer.removeHotSpot(uid); } catch (e) {}
    }

    roomHint.textContent = removed.included
      ? `${device.name} removed. Its included-package credit is available again.`
      : `${device.name} removed and $${refund} returned to the upgrade budget.`;
    update();
  }

  function addPanoHotspot(item) {
    if (!panoViewer || !item.panorama) return;
    const device = deviceById(item.id);
    if (!device) return;

    try {
      panoViewer.addHotSpot({
        id: item.uid,
        pitch: item.pitch,
        yaw: item.yaw,
        cssClass: 'hg-device-hotspot',
        createTooltipFunc: hotspotTooltip,
        createTooltipArgs: { icon: device.icon, name: device.name },
        clickHandlerFunc: (event, args) => {
          event.stopPropagation();
          removePanoPlacement(args.uid);
        },
        clickHandlerArgs: { uid: item.uid }
      });
    } catch (e) {}
  }

  function rebuildPanoHotspots() {
    if (!panoViewer || !currentZone) return;
    zoneDevices(currentZone.name).forEach(item => {
      if (!item.panorama) return;
      try { panoViewer.removeHotSpot(item.uid); } catch (e) {}
      addPanoHotspot(item);
    });
  }

  function panoramaMountError(device, pitch) {
    if (device.id === 'water' && pitch > -12) {
      return 'Look down toward the floor and place the water sensor beside the leak source.';
    }
    if (device.id === 'shutoff' && pitch > -10) {
      return 'Look down toward the main water line before placing the shutoff.';
    }
    if (device.id === 'smoke' && pitch < 25) {
      return 'Look up toward the ceiling before placing the smoke detector.';
    }
    return '';
  }

  function installAtPanorama(pitch, yaw) {
    if (!currentZone || !selected) {
      roomHint.textContent = 'Choose a device first, then aim at the exact spot in the 360 room.';
      return;
    }

    const device = deviceById(selected);
    if (!isAllowed(device, currentZone)) {
      roomHint.textContent = `${device.name} is not appropriate for ${currentZone.name}.`;
      return;
    }

    const charge = typeof chargeForDevice === 'function' ? chargeForDevice(device) : device.cost;
    if (charge > budget) {
      roomHint.textContent = `You do not have enough upgrade budget for ${device.name}.`;
      return;
    }

    if ((device.id === 'pendant' || device.id === 'shutoff') && hasAnywhere(device.id)) {
      roomHint.textContent = `Only one ${device.name} is needed in this mission.`;
      return;
    }

    const mountError = panoramaMountError(device, pitch);
    if (mountError) {
      roomHint.textContent = mountError;
      return;
    }

    const included = charge === 0 && typeof deviceUsesIncludedPackage === 'function' && deviceUsesIncludedPackage(device.id);
    const item = {
      uid: `p${placementCounter++}`,
      id: device.id,
      panorama: true,
      pitch: Number(pitch.toFixed(2)),
      yaw: Number(yaw.toFixed(2)),
      charged: charge,
      included
    };

    if (!placements[currentZone.name]) placements[currentZone.name] = [];
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

  function activate360(zoneName) {
    if (!window.pannellum) return;
    const panorama = PANORAMA_SCENES[zoneName] || PANOS.demo;

    hide360();
    panoZone = zoneName;
    roomScene.classList.add('panorama-active');
    surface.style.display = 'block';
    status.style.display = 'block';
    toolbar.style.display = 'flex';
    if (sceneImage) sceneImage.style.visibility = 'hidden';
    if (mountedLayer) mountedLayer.style.display = 'none';
    if (sceneLabel) sceneLabel.textContent = `${zoneName.toUpperCase()} • TRUE 360° VIEW`;

    panoViewer = pannellum.viewer(surface, {
      type: 'equirectangular',
      panorama,
      autoLoad: true,
      crossOrigin: 'anonymous',
      draggable: true,
      mouseZoom: true,
      keyboardZoom: true,
      showControls: true,
      showZoomCtrl: true,
      showFullscreenCtrl: false,
      hfov: 95,
      minHfov: 35,
      maxHfov: 120,
      pitch: 0,
      yaw: 0,
      minPitch: -90,
      maxPitch: 90,
      haov: 360,
      vaov: 180,
      hotSpots: []
    });

    panoViewer.on('load', () => {
      roomHint.textContent = 'Drag left, right, up, or down. You can look from the floor all the way to the ceiling. Click a spot to install equipment.';
      zoneDevices(zoneName).filter(item => item.panorama).forEach(addPanoHotspot);
      try { panoViewer.resize(); } catch (e) {}
    });

    panoViewer.on('error', () => {
      roomHint.textContent = 'The 360 room failed to load. Refresh once; if it still fails, the flat photo will remain available.';
    });
  }

  // Track a short press separately from a drag. Dragging remains completely native to Pannellum.
  surface.addEventListener('pointerdown', event => {
    pointerStart = { x: event.clientX, y: event.clientY, time: performance.now() };
  });

  surface.addEventListener('pointerup', event => {
    if (!pointerStart || !panoViewer) return;
    if (event.target.closest('.hg-device-hotspot')) {
      pointerStart = null;
      return;
    }

    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    const moved = Math.hypot(dx, dy);
    const elapsed = performance.now() - pointerStart.time;
    pointerStart = null;

    if (moved > 8 || elapsed > 450) return;
    const coords = panoViewer.mouseEventToCoords(event);
    if (Array.isArray(coords) && coords.length === 2) installAtPanorama(coords[0], coords[1]);
  });

  // Prevent the old flat-image click installer from also firing after a panorama click.
  surface.addEventListener('click', event => event.stopPropagation());

  document.getElementById('installCenterBtn')?.addEventListener('click', event => {
    event.stopPropagation();
    if (!panoViewer) return;
    installAtPanorama(panoViewer.getPitch(), panoViewer.getYaw());
  });

  document.getElementById('lookUpBtn')?.addEventListener('click', event => {
    event.stopPropagation();
    if (panoViewer) panoViewer.setPitch(75, 450);
  });

  document.getElementById('lookLevelBtn')?.addEventListener('click', event => {
    event.stopPropagation();
    if (panoViewer) panoViewer.setPitch(0, 450);
  });

  document.getElementById('lookDownBtn')?.addEventListener('click', event => {
    event.stopPropagation();
    if (panoViewer) panoViewer.setPitch(-75, 450);
  });

  document.getElementById('blueprint')?.addEventListener('click', event => {
    const zone = event.target.closest('.zone');
    if (!zone) return;
    setTimeout(() => activate360(zone.dataset.zone), 80);
  });

  document.getElementById('closeRoomBtn')?.addEventListener('click', hide360);
  document.getElementById('resetBtn')?.addEventListener('click', hide360);
  document.getElementById('undoRoomBtn')?.addEventListener('click', () => setTimeout(rebuildPanoHotspots, 0));

  async function boot360() {
    try {
      await loadScript(PANNELLUM_JS, 'pannellumLibraryScript');
      const header = document.querySelector('.room-view-header > div');
      if (header && !document.getElementById('true360ModeBadge')) {
        const badge = document.createElement('div');
        badge.id = 'true360ModeBadge';
        badge.textContent = 'TRUE 360° • FLOOR TO CEILING';
        badge.style.cssText = 'display:inline-block;margin:7px 0 0 7px;padding:5px 9px;border-radius:999px;border:1px solid rgba(85,215,255,.48);background:rgba(7,34,52,.68);color:#55d7ff;font-size:9px;font-weight:900;letter-spacing:.11em';
        header.appendChild(badge);
      }
    } catch (error) {
      console.warn('360 viewer failed to load', error);
    }
  }

  boot360();
})();
