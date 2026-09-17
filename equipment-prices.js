// SafeStreets Equipment Price Sheet Rev. 6.9.26
// Game pricing uses the Retail column because the mission budget represents
// the customer's available equipment spend.

const equipmentRetailOverrides = {
  door: {
    name: 'ADT Command Door/Window Contact',
    cost: 175,
    part: 'SIXCTA',
    desc: 'Standard wireless door/window contact. Retail $175.'
  },
  window: {
    name: 'ADT Command Door/Window Contact',
    cost: 175,
    part: 'SIXCTA',
    desc: 'Standard wireless door/window contact. Retail $175.'
  },
  motion: {
    name: 'ADT Command Motion Detector',
    cost: 305,
    part: 'SIXPIRA',
    desc: 'Wireless motion detector. Retail $305.'
  },
  indoorcam: {
    name: 'ADT Control Indoor Camera',
    cost: 305,
    part: 'ADC-V515 / N8-RC845',
    desc: 'Indoor video camera. Retail $305.'
  },
  outdoorcam: {
    name: 'ADT Control Outdoor Camera',
    cost: 405,
    part: 'ADC-V724X / N8-OC845',
    desc: 'Outdoor video camera. Retail $405.'
  },
  doorbell: {
    name: 'HD Doorbell Camera',
    cost: 355,
    part: 'ADT / ADC-VDB750',
    desc: 'HD video doorbell camera. Retail $355.'
  },
  smoke: {
    name: 'ADT Command Smoke Detector',
    cost: 325,
    part: 'SIXSMOKEVA',
    desc: 'Wireless smoke detector. Retail $325.'
  },
  co: {
    name: 'ADT Command Carbon Monoxide Detector',
    cost: 305,
    part: 'SIXCOVA',
    desc: 'Wireless carbon monoxide detector. Retail $305.'
  },
  water: {
    name: 'ADT Command Flood Detector w/15ft Probe',
    cost: 235,
    part: 'SIXFLOODA',
    desc: 'Flood detector with 15-foot probe. Retail $235.'
  }
};

for (const device of devices) {
  const override = equipmentRetailOverrides[device.id];
  if (override) Object.assign(device, override);
}

// Additional real equipment from the same price sheet. These are cataloged
// here for future gameplay expansion once their room-placement rules are added.
window.homeGuardEquipmentCatalog = [
  { id:'glassbreak', name:'ADT Command Glassbreak Detector', part:'SIXGBA', retail:305 },
  { id:'indoorSiren', name:'ADT Command Indoor Siren / Strobe', part:'SIXSIREA', retail:235 },
  { id:'outdoorSiren', name:'ADT Command Outdoor Siren / Strobe', part:'SIXSIREN-ODA', retail:305 },
  { id:'shock', name:'ADT Command Shock Sensor 2', part:'SIXSHOCK2A', retail:215 },
  { id:'touchscreen', name:'ADT Command 7in Wireless Color Touchscreen', part:'WTS800', retail:369 },
  { id:'touchpad', name:'ADT Command Wireless Touchpad', part:'WLTP100', retail:255 },
  { id:'keyfob', name:'ADT Command 4-Button Keyfob 2', part:'SIXFOB2A', retail:155 },
  { id:'miniContact', name:'ADT Command Mini Door/Window Contact', part:'SIXMINI', retail:205 },
  { id:'smokeCoCombo', name:'ADT Command Combo Smoke/CO Detector', part:'SIXCOMBOA', retail:405 },
  { id:'googleIndoor', name:'Google Indoor Camera', part:'--', retail:355 },
  { id:'googleOutdoor', name:'Google Outdoor Camera', part:'--', retail:425 },
  { id:'googleDoorbell', name:'Google Doorbell Camera', part:'--', retail:375 },
  { id:'thermostat', name:'ADT Command Z-Wave Thermostat', part:'NJ-ADCT2000A', retail:355 },
  { id:'garage', name:'ADT Control Garage Door Opener', part:'LN-GD00Z8', retail:355 },
  { id:'doorLock', name:'Kwikset 888/620 Door Lock', part:'KT-98880006', retail:359 },
  { id:'nestThermostat', name:'Google Nest Thermostat', part:'GA01334-US', retail:355 }
];

// Refresh the interface with the real prices after game.js initializes.
if (typeof update === 'function') update();
