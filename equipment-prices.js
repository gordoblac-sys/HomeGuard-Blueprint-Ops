// SafeStreets Equipment Price Sheet Rev. 6.9.26
// Game pricing uses the Retail column because the mission budget represents
// the customer's available equipment spend.

const equipmentRetailOverrides = {
  door: { name:'ADT Command Door/Window Contact', cost:175, part:'SIXCTA', desc:'Standard wireless door/window contact. Retail $175.' },
  window: { name:'ADT Command Door/Window Contact', cost:175, part:'SIXCTA', desc:'Standard wireless door/window contact. Retail $175.' },
  motion: { name:'ADT Command Motion Detector', cost:305, part:'SIXPIRA', desc:'Wireless motion detector. Retail $305.' },
  indoorcam: { name:'ADT Control Indoor Camera', cost:305, part:'ADC-V515 / N8-RC845', desc:'Indoor video camera. Retail $305.' },
  outdoorcam: { name:'ADT Control Outdoor Camera', cost:405, part:'ADC-V724X / N8-OC845', desc:'Outdoor video camera. Retail $405.' },
  doorbell: { name:'HD Doorbell Camera', cost:355, part:'ADT / ADC-VDB750', desc:'HD video doorbell camera. Retail $355.' },
  smoke: { name:'ADT Command Smoke Detector', cost:325, part:'SIXSMOKEVA', desc:'Wireless smoke detector. Retail $325.' },
  co: { name:'ADT Command Carbon Monoxide Detector', cost:305, part:'SIXCOVA', desc:'Wireless carbon monoxide detector. Retail $305.' },
  water: { name:'ADT Command Flood Detector w/15ft Probe', cost:235, part:'SIXFLOODA', desc:'Flood detector with 15-foot probe. Retail $235.' }
};

for (const device of devices) {
  const override = equipmentRetailOverrides[device.id];
  if (override) Object.assign(device, override);
}

window.homeGuardEquipmentCatalog = [
  // Command Wireless Security Options
  { category:'Security', id:'glassbreak', name:'ADT Command-Glassbreak Detector Wireless', part:'SIXGBA', par:240, retail:305, labor:5, commission:65 },
  { category:'Security', id:'motion', name:'ADT Command-Motion Detector Wireless', part:'SIXPIRA', par:240, retail:305, labor:5, commission:65 },
  { category:'Security', id:'indoorSiren', name:'ADT Command-Indoor Siren/ Strobe', part:'SIXSIREA', par:185, retail:235, labor:5, commission:50 },
  { category:'Security', id:'outdoorSiren', name:'ADT Command-Outdoor Siren/ Strobe', part:'SIXSIREN-ODA', par:245, retail:305, labor:5, commission:60 },
  { category:'Security', id:'shock', name:'ADT Command-Shock Sensor 2', part:'SIXSHOCK2A', par:165, retail:215, labor:5, commission:50 },
  { category:'Security', id:'touchscreen', name:'ADT Command-7in Wireless Color Touchscreen', part:'WTS800', par:319, retail:369, labor:5, commission:50 },
  { category:'Security', id:'touchpad', name:'ADT Command-Wireless Touchpad', part:'WLTP100', par:205, retail:255, labor:5, commission:50 },
  { category:'Security', id:'keyfob', name:'ADT Command-4-Button Keyfob 2 Wireless', part:'SIXFOB2A', par:120, retail:155, labor:5, commission:35 },
  { category:'Security', id:'doorWindow', name:'ADT Command-Door/Window Contact Wireless', part:'SIXCTA', par:135, retail:175, labor:5, commission:40 },
  { category:'Security', id:'miniContact', name:'ADT Command-Mini Door/Window Contact Wireless', part:'SIXMINI', par:155, retail:205, labor:5, commission:50 },
  { category:'Security Upgrade', id:'panelUpgrade', name:'ADT Command- Base/UPGRADE to 7in AIO Control Panel (from 5in)', part:'', par:104, retail:139, labor:null, commission:35, upgradeOnly:true },
  { category:'Security Upgrade', id:'shockUpgrade', name:'Shock UPGRADE (From D/W given by sales)', part:'', par:70, retail:100, labor:5, commission:30, upgradeOnly:true },
  { category:'Security Upgrade', id:'miniUpgrade', name:'Mini Door/Window Contact UPGRADE (From Standard D/W given by sales)', part:'', par:70, retail:100, labor:5, commission:30, upgradeOnly:true },

  // Command Wireless Life Safety Options
  { category:'Life Safety', id:'smoke', name:'ADT Command-Smoke 2 Detector Wireless', part:'SIXSMOKEVA', par:255, retail:325, labor:5, commission:70 },
  { category:'Life Safety', id:'co', name:'ADT Command-Carbon Monoxide Detector', part:'SIXCOVA', par:240, retail:305, labor:5, commission:65 },
  { category:'Life Safety', id:'flood', name:'ADT Command-Flood Detector w/15ft Probe', part:'SIXFLOODA', par:175, retail:235, labor:5, commission:60 },
  { category:'Life Safety', id:'smokeCoCombo', name:'ADT Command-Combo Smoke/CO Detector', part:'SIXCOMBOA', par:335, retail:405, labor:5, commission:70 },

  // Command Video Options
  { category:'Video', id:'adtDoorbell', name:'HD Doorbell Camera (ADT, ADC-VDB750)', part:'Various', par:305, retail:355, labor:15, commission:50 },
  { category:'Video', id:'adtOutdoor', name:'ADT Control-ADC-V724X Outdoor Camera (or OC845)', part:'ADC-V724X / N8-OC845', par:360, retail:405, labor:35, commission:45 },
  { category:'Video', id:'adtIndoor', name:'ADT Control-ADC-V515 Indoor Camera (or RC845)', part:'ADC-V515 / N8-RC845', par:255, retail:305, labor:5, commission:50 },
  { category:'Video Upgrade', id:'googleCameraUpgrade', name:'Google Doorbell OR Google Camera UPGRADE (from ADC-VDB750, RC845, or OC845)', part:'', par:169, retail:199, labor:'Matches Cam', commission:30, upgradeOnly:true },
  { category:'Video', id:'googleIndoor', name:'Google Indoor Camera', part:'--', par:290, retail:355, labor:5, commission:65 },
  { category:'Video', id:'googleOutdoor', name:'Google Outdoor Camera', part:'--', par:365, retail:425, labor:35, commission:60 },
  { category:'Video', id:'googleDoorbell', name:'Google Doorbell Camera', part:'--', par:315, retail:375, labor:15, commission:60 },

  // Control/Home Automation Options
  { category:'Automation', id:'adtThermostat', name:'ADT Command-ZWave Thermostat', part:'NJ-ADCT2000A', par:305, retail:355, labor:20, commission:50 },
  { category:'Automation', id:'garage', name:'ADT Control-Linear-GD00Z8 Garage Door Opener', part:'LN-GD00Z8', par:305, retail:355, labor:20, commission:50 },
  { category:'Automation', id:'doorLock', name:'Kwikset 888/620 Door lock Brass / Bronze / Satin Nickel', part:'KT-98880006', par:309, retail:359, labor:20, commission:50 },
  { category:'Automation', id:'smartBulb', name:'ADT Control-Jasco ENBRIGHTEN Z-Wave A19 60W Bulb', part:'JS-76609', par:99, retail:129, labor:5, commission:30 },
  { category:'Automation', id:'lampModule', name:'ADT Control-All LampModules(Dimm/In-Wall/Deco)', part:'JS-28170', par:105, retail:135, labor:5, commission:30 },
  { category:'Automation Upgrade', id:'premiumAutomationUpgrade', name:'Premium Automation Device UPGRADE (From Lamp Module - Limit 1 @ $64.99)', part:'--', par:null, retail:249, labor:20, commission:30, upgradeOnly:true },
  { category:'Automation', id:'nestThermostat', name:'Google Nest Thermostat', part:'GA01334-US', par:305, retail:355, labor:20, commission:50 },

  // Additional Products
  { category:'Additional', id:'hubMax', name:'Google Hub Max (10in with Cam)', part:'GA00426-US', par:345, retail:405, labor:5, commission:60 },
  { category:'Additional', id:'hub', name:'Google Hub (7in without Cam)', part:'GA01331-US', par:225, retail:255, labor:5, commission:30 },
  { category:'Additional', id:'googleWifi', name:'Google WiFi Router or Point (mesh extender with smart speaker – requires router)', part:'GA00595-US / GA00667-US', par:265, retail:305, labor:20, commission:40 },
  { category:'Additional', id:'googleMini', name:'Google Mini', part:'GA00638-US', par:85, retail:115, labor:5, commission:30 },
  { category:'Additional', id:'eero6plus', name:'ADT Control – Eero 6+ Dual Band WIFI Mesh', part:'R011111', par:259, retail:299, labor:20, commission:40 }
];

// Devices that are part of the current game design but are not priced on the
// supplied SafeStreets price sheet remain provisional until a supported price is provided.
window.homeGuardProvisionalEquipment = ['shutoff','fall','pendant'];

// Add a visible full-price-sheet catalog below the active loadout without making
// every catalog item gameplay-active before its placement/scoring rules are ready.
(function renderFullEquipmentCatalog(){
  const shop = document.getElementById('deviceShop');
  if (!shop || document.getElementById('fullEquipmentCatalog')) return;
  const details = document.createElement('details');
  details.id = 'fullEquipmentCatalog';
  details.style.marginTop = '12px';
  details.innerHTML = '<summary style="cursor:pointer;font-weight:800;color:#37d7ff">FULL EQUIPMENT CATALOG</summary>';
  const body = document.createElement('div');
  body.style.marginTop = '8px';
  body.style.display = 'grid';
  body.style.gap = '8px';

  const groups = {};
  window.homeGuardEquipmentCatalog.forEach(item => {
    (groups[item.category] ||= []).push(item);
  });

  Object.entries(groups).forEach(([category, items]) => {
    const section = document.createElement('div');
    section.style.padding = '9px';
    section.style.border = '1px solid #214b67';
    section.style.borderRadius = '10px';
    const rows = items.map(item => {
      const part = item.part ? ` · ${item.part}` : '';
      const upgrade = item.upgradeOnly ? ' · UPGRADE' : '';
      return `<div style="padding:4px 0;color:#cfe8f5;font-size:11px"><b>${item.name}</b><br><span style="color:#8ca8bc">Retail $${item.retail}${part}${upgrade}</span></div>`;
    }).join('');
    section.innerHTML = `<div style="font-size:10px;letter-spacing:.12em;color:#69f0ae;margin-bottom:5px">${category.toUpperCase()}</div>${rows}`;
    body.appendChild(section);
  });

  details.appendChild(body);
  shop.insertAdjacentElement('afterend', details);
})();

if (typeof update === 'function') update();
