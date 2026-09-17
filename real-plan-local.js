// HomeGuard local measured-plan presentation.
// Replaces the browser-blocked embedded HSR PDF with local architectural traces
// of the same Connemara property, while keeping the official NPS report link.

(() => {
  const FIRST_PLAN = 'properties/connemara/first-floor.svg';
  const SECOND_PLAN = 'properties/connemara/second-floor.svg';

  const floorRooms = {
    first: new Set(['Front Porch', 'Living Room', 'Kitchen']),
    second: new Set(["Mrs. Sandburg's Bedroom"])
  };

  function installStyles(){
    if(document.getElementById('localRealPlanStyles')) return;
    const style = document.createElement('style');
    style.id = 'localRealPlanStyles';
    style.textContent = `
      .local-plan-shell{height:100%;display:flex;flex-direction:column;background:#eef1f2}
      .local-plan-tabs{display:flex;gap:8px;flex-wrap:wrap;padding:12px 12px 10px;background:#07111e;border-bottom:1px solid rgba(85,215,255,.22)}
      .local-plan-tabs button{min-height:40px;padding:0 14px;border-radius:10px;border:1px solid rgba(85,215,255,.34);background:#0b2030;color:#c9eaf6;font-size:10px;font-weight:900;letter-spacing:.06em;cursor:pointer}
      .local-plan-tabs button.active{border-color:rgba(105,240,174,.72);background:#123b30;color:#e9fff4}
      .local-plan-source{margin-left:auto;display:flex;align-items:center;color:#7f9dab;font-size:9px;line-height:1.35}
      .local-plan-image-wrap{position:relative;flex:1;min-height:0;background:#f7f7f2;overflow:auto}
      .local-plan-image{display:block;width:100%;height:100%;min-height:470px;object-fit:contain;background:#f7f7f2}
      .local-plan-foot{padding:8px 12px;background:#07111e;border-top:1px solid rgba(85,215,255,.18);color:#7696a5;font-size:9px;line-height:1.45}
      .real-zone.floor-hidden{display:none!important}
      @media(max-width:800px){.local-plan-source{width:100%;margin-left:0}.local-plan-image{min-height:390px}}
    `;
    document.head.appendChild(style);
  }

  function applyFloor(floor){
    const image = document.getElementById('localMeasuredPlanImage');
    const firstBtn = document.getElementById('localFirstFloorBtn');
    const secondBtn = document.getElementById('localSecondFloorBtn');
    if(!image || !firstBtn || !secondBtn) return;

    const isFirst = floor === 'first';
    image.src = isFirst ? FIRST_PLAN : SECOND_PLAN;
    image.alt = isFirst
      ? 'Connemara Main House first-floor interactive trace based on the NPS measured plan'
      : 'Connemara Main House second-floor interactive trace based on the NPS measured plan';

    firstBtn.classList.toggle('active', isFirst);
    secondBtn.classList.toggle('active', !isFirst);
    firstBtn.setAttribute('aria-pressed', String(isFirst));
    secondBtn.setAttribute('aria-pressed', String(!isFirst));

    document.querySelectorAll('.real-zone').forEach(button => {
      const pano = button.dataset.panoramaKey;
      const visible = floorRooms[floor]?.has(pano);
      button.classList.toggle('floor-hidden', !visible);
    });

    const heading = document.querySelector('.real-room-heading');
    if(heading){
      heading.textContent = isFirst
        ? 'VERIFIED 360 CAPTURE POINTS • FIRST FLOOR / FRONT PORCH'
        : 'VERIFIED 360 CAPTURE POINTS • SECOND FLOOR';
    }
  }

  function upgradePlan(){
    const frame = document.querySelector('.real-plan-frame');
    if(!frame || frame.dataset.localPlanReady === '1') return false;

    installStyles();
    frame.dataset.localPlanReady = '1';
    frame.innerHTML = `
      <div class="local-plan-shell">
        <div class="local-plan-tabs" role="group" aria-label="Choose property floor">
          <button id="localFirstFloorBtn" type="button" aria-pressed="true">FIRST FLOOR</button>
          <button id="localSecondFloorBtn" type="button" aria-pressed="false">SECOND FLOOR</button>
          <span class="local-plan-source">Local interactive trace from the official NPS 2004 measured plans</span>
        </div>
        <div class="local-plan-image-wrap">
          <img id="localMeasuredPlanImage" class="local-plan-image" src="${FIRST_PLAN}" alt="Connemara Main House first-floor interactive trace based on the NPS measured plan" />
        </div>
        <div class="local-plan-foot">The official Historic Structure Report remains the architectural source of truth. The local trace is simplified only for reliable in-game navigation and matching the same-house 360 capture points.</div>
      </div>`;

    const headText = document.querySelector('.real-plan-head span');
    if(headText){
      headText.textContent = 'Connemara Main House • NPS 2004 measured plans: first floor report page 173, second floor report page 175. The local view below stays inside the game so it cannot be blocked by the external PDF viewer.';
    }

    document.getElementById('localFirstFloorBtn')?.addEventListener('click', () => applyFloor('first'));
    document.getElementById('localSecondFloorBtn')?.addEventListener('click', () => applyFloor('second'));
    applyFloor('first');
    return true;
  }

  if(upgradePlan()) return;

  const observer = new MutationObserver(() => {
    if(upgradePlan()) observer.disconnect();
  });
  observer.observe(document.documentElement, {childList:true, subtree:true});

  setTimeout(() => {
    upgradePlan();
    observer.disconnect();
  }, 5000);
})();
