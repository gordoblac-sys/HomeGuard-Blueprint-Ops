const STARTING_BUDGET=1200;
const devices=[
{id:'door',name:'Door Sensor',cost:40,desc:'Detects protected door openings.'},
{id:'window',name:'Window Sensor',cost:35,desc:'Detects protected window openings.'},
{id:'motion',name:'Motion Detector',cost:90,desc:'Detects movement inside a room.'},
{id:'camera',name:'Camera',cost:150,desc:'Visual intrusion coverage.'},
{id:'smoke',name:'Smoke Detector',cost:80,desc:'Detects smoke and fire.'},
{id:'co',name:'CO Detector',cost:75,desc:'Detects carbon monoxide.'},
{id:'water',name:'Water Sensor',cost:60,desc:'Detects leaks in the room.'},
{id:'fall',name:'Fall Detector',cost:180,desc:'Detects a fall in the room.'},
{id:'pendant',name:'Medical Pendant',cost:125,desc:'Whole-home medical emergency coverage.'}
];
const incidents=[
{type:'Intrusion',locations:['Front Entry','Back Entry','Living Room'],baseDamage:6500,detect:['door','window','motion','camera'],video:'assets/videos/intrusion.mp4'},
{type:'Fire',locations:['Kitchen','Basement','Laundry'],baseDamage:18000,detect:['smoke'],video:'assets/videos/fire.mp4'},
{type:'Water Leak',locations:['Basement','Laundry','Bathroom'],baseDamage:9000,detect:['water'],video:'assets/videos/water.mp4'},
{type:'Fall',locations:['Bathroom','Bedroom','Stairs'],baseDamage:12000,detect:['fall','pendant'],video:'assets/videos/fall.mp4'},
{type:'Carbon Monoxide',locations:['Basement','Bedroom'],baseDamage:15000,detect:['co'],video:'assets/videos/co.mp4'}
];
let budget=STARTING_BUDGET,selected=null,placements={};
const shop=document.getElementById('deviceShop'),budgetEl=document.getElementById('budget'),selectedEl=document.getElementById('selected'),countEl=document.getElementById('deviceCount'),coverageEl=document.getElementById('coverage'),video=document.getElementById('scenarioVideo'),placeholder=document.getElementById('videoPlaceholder');
function renderShop(){shop.innerHTML='';devices.forEach(d=>{const b=document.createElement('button');b.className='device-btn'+(selected===d.id?' active':'');b.disabled=d.cost>budget;b.innerHTML=`<strong>${d.name} · $${d.cost}</strong><small>${d.desc}</small>`;b.onclick=()=>{selected=d.id;selectedEl.textContent=d.name;renderShop()};shop.appendChild(b)})}
function roomList(room){return placements[room]||[]}
function installedCount(){return Object.values(placements).reduce((n,a)=>n+a.length,0)}
function coverage(){const checks=[['Front Entry',['door','motion','camera']],['Back Entry',['door','window','motion','camera']],['Living Room',['window','motion','camera']],['Kitchen',['smoke']],['Basement',['smoke','co','water']],['Laundry',['smoke','water']],['Bathroom',['water','fall','pendant']],['Bedroom',['co','fall','pendant']],['Stairs',['fall','pendant']]];let hit=0,total=0;const pendant=Object.values(placements).some(a=>a.includes('pendant'));checks.forEach(([room,req])=>{const have=roomList(room);req.forEach(id=>{total++;if(have.includes(id)||(id==='pendant'&&pendant))hit++})});return Math.round(hit/total*100)}
function update(){budgetEl.textContent=`$${budget.toLocaleString()}`;countEl.textContent=installedCount();coverageEl.textContent=`${coverage()}%`;document.querySelectorAll('.room').forEach(r=>{const box=r.querySelector('.chips');box.innerHTML='';roomList(r.dataset.room).forEach(id=>{const d=devices.find(x=>x.id===id);const s=document.createElement('span');s.className='chip';s.textContent=d.name;box.appendChild(s)})});renderShop()}
function place(room){if(!selected)return;const d=devices.find(x=>x.id===selected);if(d.cost>budget)return;const current=roomList(room);if(current.includes(selected))return;if(selected==='pendant'&&Object.values(placements).some(a=>a.includes('pendant')))return;placements[room]=[...current,selected];budget-=d.cost;update()}
function detected(incident,location){const have=roomList(location);const pendant=Object.values(placements).some(a=>a.includes('pendant'));if(incident.type==='Fall')return have.includes('fall')||pendant;return incident.detect.some(id=>have.includes(id))}
function simulate(){if(!installedCount())return;const i=incidents[Math.floor(Math.random()*incidents.length)];const loc=i.locations[Math.floor(Math.random()*i.locations.length)];const ok=detected(i,loc);const dmg=ok?Math.round(i.baseDamage*.15):i.baseDamage;document.getElementById('incident').textContent=i.type;document.getElementById('location').textContent=loc;document.getElementById('detected').textContent=ok?'YES':'NO';document.getElementById('detected').className=ok?'good':'bad';document.getElementById('damage').textContent=`$${dmg.toLocaleString()}`;document.getElementById('resultTitle').textContent=ok?'THREAT DETECTED':'THREAT MISSED';document.getElementById('resultTitle').className=ok?'good':'bad';document.getElementById('resultText').textContent=ok?`Your system caught the ${i.type.toLowerCase()} event in the ${loc}.`:`The ${i.type.toLowerCase()} event in the ${loc} went undetected.`;video.src=i.video;video.load();placeholder.textContent=`Loaded ${i.video}. Add that MP4 to the videos folder when you are ready.`}
document.getElementById('blueprint').addEventListener('click',e=>{const r=e.target.closest('.room');if(r)place(r.dataset.room)});document.getElementById('simulateBtn').onclick=simulate;document.getElementById('resetBtn').onclick=()=>{budget=STARTING_BUDGET;selected=null;placements={};selectedEl.textContent='None';video.removeAttribute('src');video.load();placeholder.textContent='Scenario footage will appear here.';document.getElementById('resultTitle').textContent='SYSTEM NOT TESTED';document.getElementById('resultTitle').className='';document.getElementById('resultText').textContent='Build your system and run the scenario.';['incident','location','detected','damage'].forEach(id=>document.getElementById(id).textContent='—');update()};
update();
