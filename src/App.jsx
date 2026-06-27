import React from 'react';
import { api } from './api';

function css(str){const o={};String(str).split(';').forEach(d=>{const i=d.indexOf(':');if(i<0)return;let k=d.slice(0,i).trim();const val=d.slice(i+1).trim();if(!k)return;if(k.slice(0,4)==='-ms-')k='ms-'+k.slice(4);k=k.replace(/-([a-z])/g,(m,c)=>c.toUpperCase());o[k]=val;});return o;}

class Component extends React.Component {

  state = {
    route:this._routeFromHash(), scrolled:false, soundOn:false, menuOpen:false, vw: (typeof window!=='undefined'?window.innerWidth:1280),
    target:'', typed:'', keystrokes:0, startTime:0, elapsed:0, finalElapsed:0,
    finished:false, mistakes:0, combo:0, maxCombo:0, missionIdx:0, glitch:false, pulse:false,
    authUser:'', authPass:'', authConfirm:'', registered:false, authBusy:false,
    dSignal:0, dWords:0, dCities:0, toasts:[],
    timeLimit:60, failed:false, quick:false, quickIdx:0, progress:0,
    liveLeaders:null, liveStat:null, liveRecent:null, liveSeries:null, liveAccDist:null,
    liveAch:null, liveJoined:null, liveTpd:null,
  };

  bgRef = React.createRef();
  globeRef = React.createRef();
  scrollRef = React.createRef();
  inputRef = React.createRef();
  _tseq = 0;

  messages = [
    "humanity is not gone. we are scattered across the dark, waiting for a single voice to cut through the static and remind us that someone is still listening on the other side of the silence.",
    "the towers fell silent at dawn and every screen went black. but the operators remained, fingers resting on the keys, transmitting hope across a broken grid one fragile word at a time.",
    "this is an emergency broadcast. relay the coordinates to the northern shelter before the signal degrades. lives depend on the speed and the accuracy of the transmission you send tonight.",
    "we built machines to connect us and then forgot how to speak. now in the ruins we learn the old craft again, letter by letter, until every message is a hand reaching out in the dark.",
    "signal strength is rising fast. forty thousand souls have heard the call and answered back. keep the channel open and do not stop typing, for the last light of the world runs through you.",
    "reconnect the cities and restore the lines. when the final word lands the grid will wake and the map will bloom with light from coast to coast and from one quiet continent to the next.",
  ];

  missions = [
    {id:'LS-00', name:"Cold Boot", phase:'prologue', loc:"Last Signal Bunker · Switzerland", diff:'Recruit', wpm:30, signal:3, reward:'+80 SIG', color:'#19f0a0'},
    {id:'LS-01', name:"Diagnostics", phase:'prologue', loc:"Server Core · Bunker", diff:'Recruit', wpm:33, signal:4, reward:'+90 SIG', color:'#19f0a0'},
    {id:'LS-02', name:"First Handshake", phase:'prologue', loc:"Channel Zero · Bunker", diff:'Recruit', wpm:36, signal:5, reward:'+110 SIG', color:'#19f0a0'},
    {id:'LS-03', name:"Power Core", phase:'prologue', loc:"Geothermal Core · Bunker", diff:'Operator', wpm:39, signal:6, reward:'+150 SIG', color:'#00E5FF'},
    {id:'LS-04', name:"The Archive", phase:'prologue', loc:"Network Archive · Bunker", diff:'Operator', wpm:42, signal:8, reward:'+210 SIG', color:'#00E5FF'},
    {id:'LS-05', name:"Wake the Mesh", phase:'prologue', loc:"Global Mesh · Standby", diff:'Operator', wpm:45, signal:10, reward:'+270 SIG', color:'#00E5FF'},
    {id:'LS-06', name:"Home Frequency", phase:'p1', loc:"Algiers · Algeria", diff:'Operator', wpm:48, signal:12, reward:'+350 SIG', color:'#00E5FF'},
    {id:'LS-07', name:"Across the Strait", phase:'p1', loc:"Tunis · Tunisia", diff:'Operator', wpm:51, signal:14, reward:'+440 SIG', color:'#00E5FF'},
    {id:'LS-08', name:"Desert Echo", phase:'p1', loc:"Tripoli · Libya", diff:'Specialist', wpm:54, signal:17, reward:'+550 SIG', color:'#8B5CF6'},
    {id:'LS-09', name:"River of Light", phase:'p1', loc:"Cairo · Egypt", diff:'Specialist', wpm:57, signal:20, reward:'+670 SIG', color:'#8B5CF6'},
    {id:'LS-10', name:"Atlantic Gate", phase:'p1', loc:"Casablanca · Morocco", diff:'Specialist', wpm:60, signal:24, reward:'+790 SIG', color:'#8B5CF6'},
    {id:'LS-11', name:"Two Rivers", phase:'p1', loc:"Khartoum · Sudan", diff:'Specialist', wpm:63, signal:28, reward:'+940 SIG', color:'#8B5CF6'},
    {id:'LS-12', name:"Old Continent", phase:'p2', loc:"Paris · France", diff:'Operator', wpm:46, signal:31, reward:'+1090 SIG', color:'#00E5FF'},
    {id:'LS-13', name:"Brandenburg Relay", phase:'p2', loc:"Berlin · Germany", diff:'Operator', wpm:49, signal:33, reward:'+1210 SIG', color:'#00E5FF'},
    {id:'LS-14', name:"Iberian Line", phase:'p2', loc:"Madrid · Spain", diff:'Operator', wpm:52, signal:35, reward:'+1330 SIG', color:'#00E5FF'},
    {id:'LS-15', name:"Seven Hills", phase:'p2', loc:"Rome · Italy", diff:'Operator', wpm:55, signal:37, reward:'+1450 SIG', color:'#00E5FF'},
    {id:'LS-16', name:"Thames Current", phase:'p2', loc:"London · United Kingdom", diff:'Specialist', wpm:58, signal:39, reward:'+1570 SIG', color:'#8B5CF6'},
    {id:'LS-17', name:"Lowland Node", phase:'p2', loc:"Amsterdam · Netherlands", diff:'Specialist', wpm:61, signal:41, reward:'+1690 SIG', color:'#8B5CF6'},
    {id:'LS-18', name:"Bosphorus Bridge", phase:'p2', loc:"Istanbul · Turkey", diff:'Specialist', wpm:64, signal:43, reward:'+1810 SIG', color:'#8B5CF6'},
    {id:'LS-19', name:"Dnieper Signal", phase:'p2', loc:"Kyiv · Ukraine", diff:'Specialist', wpm:67, signal:45, reward:'+1930 SIG', color:'#8B5CF6'},
    {id:'LS-20', name:"Iron Relay", phase:'p2', loc:"Moscow · Russia", diff:'Veteran', wpm:70, signal:47, reward:'+2050 SIG', color:'#FF7A00'},
    {id:'LS-21', name:"Monsoon Uplink", phase:'p2', loc:"Mumbai · India", diff:'Veteran', wpm:73, signal:49, reward:'+2170 SIG', color:'#FF7A00'},
    {id:'LS-22', name:"Han River Grid", phase:'p2', loc:"Seoul · South Korea", diff:'Veteran', wpm:76, signal:51, reward:'+2290 SIG', color:'#FF7A00'},
    {id:'LS-23', name:"Eastern Dawn", phase:'p2', loc:"Beijing · China", diff:'Veteran', wpm:79, signal:53, reward:'+2410 SIG', color:'#FF7A00'},
    {id:'LS-24', name:"Pearl Tower", phase:'p2', loc:"Shanghai · China", diff:'Legend', wpm:82, signal:55, reward:'+2530 SIG', color:'#FF4d6d'},
    {id:'LS-25', name:"Rising Sun", phase:'p2', loc:"Tokyo · Japan", diff:'Legend', wpm:85, signal:57, reward:'+2650 SIG', color:'#FF4d6d'},
    {id:'LS-26', name:"Northern Lights", phase:'p2', loc:"Toronto · Canada", diff:'Legend', wpm:88, signal:59, reward:'+2770 SIG', color:'#FF4d6d'},
    {id:'LS-27', name:"New Dawn", phase:'p2', loc:"New York · United States", diff:'Legend', wpm:92, signal:61, reward:'+2890 SIG', color:'#FF4d6d'},
    {id:'LS-28', name:"Storm Warning", phase:'p3', loc:"Orbital Watch · Geneva", diff:'Operator', wpm:50, signal:63, reward:'+2260 SIG', color:'#00E5FF'},
    {id:'LS-29', name:"Cold Uplink", phase:'p3', loc:"Ground Station · Reykjavik", diff:'Operator', wpm:53, signal:64, reward:'+2410 SIG', color:'#00E5FF'},
    {id:'LS-30', name:"Equator Relay", phase:'p3', loc:"Relay Tower · Nairobi", diff:'Operator', wpm:56, signal:65, reward:'+2560 SIG', color:'#00E5FF'},
    {id:'LS-31', name:"Desert Array", phase:'p3', loc:"Deep Array · Atacama", diff:'Operator', wpm:59, signal:66, reward:'+2710 SIG', color:'#00E5FF'},
    {id:'LS-32', name:"The Relay Chain", phase:'p3', loc:"Global Mesh · Worldwide", diff:'Specialist', wpm:62, signal:67, reward:'+2860 SIG', color:'#8B5CF6'},
    {id:'LS-33', name:"Polar Window", phase:'p3', loc:"Polar Uplink · Svalbard", diff:'Specialist', wpm:65, signal:68, reward:'+3010 SIG', color:'#8B5CF6'},
    {id:'LS-34', name:"Zero Latitude", phase:'p3', loc:"Equatorial Belt · Quito", diff:'Specialist', wpm:68, signal:69, reward:'+3160 SIG', color:'#8B5CF6'},
    {id:'LS-35', name:"Orbital Prep", phase:'p3', loc:"Geostationary Belt", diff:'Specialist', wpm:71, signal:70, reward:'+3310 SIG', color:'#8B5CF6'},
    {id:'LS-36', name:"Mountain Vault", phase:'p3', loc:"Hardened Nodes · Cheyenne", diff:'Veteran', wpm:74, signal:71, reward:'+3460 SIG', color:'#FF7A00'},
    {id:'LS-37', name:"Sun Sentinel", phase:'p3', loc:"Solar Watch · L1 Point", diff:'Veteran', wpm:77, signal:72, reward:'+3610 SIG', color:'#FF7A00'},
    {id:'LS-38', name:"Far Side Echo", phase:'p3', loc:"Lunar Relay · Far Side", diff:'Veteran', wpm:80, signal:73, reward:'+3760 SIG', color:'#FF7A00'},
    {id:'LS-39', name:"High Belt", phase:'p3', loc:"Orbital Array · High Belt", diff:'Veteran', wpm:83, signal:74, reward:'+3910 SIG', color:'#FF7A00'},
    {id:'LS-40', name:"Solar Shield", phase:'p3', loc:"Solar Shield · Hardened Grid", diff:'Legend', wpm:86, signal:75, reward:'+4060 SIG', color:'#FF4d6d'},
    {id:'LS-41', name:"The Uplink", phase:'p3', loc:"Geneva Vault", diff:'Legend', wpm:90, signal:76, reward:'+4210 SIG', color:'#FF4d6d'},
    {id:'LS-42', name:"Frequency Lock", phase:'p3', loc:"All Stations", diff:'Legend', wpm:94, signal:77, reward:'+4360 SIG', color:'#FF4d6d'},
    {id:'LS-43', name:"Last Light", phase:'p3', loc:"Worldwide · Orbital", diff:'Legend', wpm:98, signal:78, reward:'+4510 SIG', color:'#FF4d6d'},
    {id:'LS-44', name:"Ignition", phase:'final', loc:"Orbital Array", diff:'Legend', wpm:102, signal:92, reward:'+3850 SIG', color:'#FF4d6d'},
    {id:'LS-45', name:"Reentry", phase:'final', loc:"Low Earth Orbit", diff:'Legend', wpm:105, signal:94, reward:'+4160 SIG', color:'#FF4d6d'},
    {id:'LS-46', name:"Sunrise Protocol", phase:'final', loc:"Orbital Grid", diff:'Legend', wpm:108, signal:96, reward:'+4470 SIG', color:'#FFcf5a'},
    {id:'LS-47', name:"The Answer", phase:'final', loc:"Global Network", diff:'Legend', wpm:111, signal:98, reward:'+4800 SIG', color:'#FFcf5a'},
    {id:'LS-48', name:"Worlds Reconnected", phase:'final', loc:"Planet Earth", diff:'Legend', wpm:114, signal:99, reward:'+5140 SIG', color:'#FFcf5a'},
    {id:'LS-49', name:"The Last Signal", phase:'final', loc:"Everywhere · Low Earth Orbit", diff:'Legend', wpm:117, signal:100, reward:'+5490 SIG', color:'#FFcf5a'},
  ];

  phases = [
    {key:'prologue', label:'PROLOGUE', sub:'Day Zero', signal:'03%', blurb:'The storm has passed and the world has gone dark. Beneath the mountains of Switzerland the last server flickers awake at three percent. Boot the channel and prove a human is still listening.'},
    {key:'p1', label:'PHASE 1', sub:'Restore Local Communications', signal:'12%', blurb:'Bring the first cities back from the silence. Start where you stand, in North Africa, and light the map one node at a time.'},
    {key:'p2', label:'PHASE 2', sub:'Rebuild the Continents', signal:'47%', blurb:'Reawaken the great relays. Europe, Asia and the Americas are waiting for a single voice to cut through the static.'},
    {key:'p3', label:'PHASE 3', sub:'The Great Transmission', signal:'78%', blurb:'A second solar storm is closing in. Prime the orbital uplink and chain every operator together before the sky goes white again.'},
    {key:'final', label:'FINAL TRANSMISSION', sub:'The Last Signal', signal:'100%', blurb:'One message remains. Millions of characters, every operator alive, typing as one. Send it, and the world hears us again.'},
  ];

  // Leaderboard is loaded live from the backend (see loadLeaderboard). No demo data.
  leaders = [];

  stat = {bestWpm:142, avgWpm:96, totalTests:347, totalWords:'62,940', totalTime:'38h 24m'};
  recent = [
    {date:'2087.06.26', wpm:142, acc:97.4, dur:'1:02', miss:4},
    {date:'2087.06.25', wpm:128, acc:96.1, dur:'0:58', miss:7},
    {date:'2087.06.25', wpm:135, acc:98.0, dur:'1:11', miss:3},
    {date:'2087.06.24', wpm:119, acc:95.2, dur:'0:54', miss:9},
    {date:'2087.06.23', wpm:131, acc:97.7, dur:'1:05', miss:5},
    {date:'2087.06.22', wpm:124, acc:96.6, dur:'0:49', miss:6},
  ];
  wpmSeries = [82,91,87,98,94,108,103,112,119,116,128,142];
  testsPerDay = [{d:'M',v:12},{d:'T',v:18},{d:'W',v:9},{d:'T',v:22},{d:'F',v:16},{d:'S',v:27},{d:'S',v:14}];
  accDist = [{label:'98–100%',pct:54,color:'#00E5FF'},{label:'95–97%',pct:28,color:'#8B5CF6'},{label:'90–94%',pct:13,color:'#FF7A00'},{label:'below 90%',pct:5,color:'#5d6f92'}];

  features = [
    {glyph:'>_', title:'Typing Missions', desc:'Story-driven transmissions with escalating difficulty. Every keystroke pushes the signal further across the grid.'},
    {glyph:'#1', title:'Global Leaderboards', desc:'Climb the operator ranks worldwide. Compare WPM, accuracy and total transmissions in real time.'},
    {glyph:'~/', title:'Detailed Statistics', desc:'Track WPM progression, accuracy distribution and daily streaks with a full mission-control dashboard.'},
    {glyph:'◈', title:'Cyberpunk Experience', desc:'Neon glass, holographic globes and reactive effects. A typing test that feels like a command center.'},
  ];
  story = [
    {n:'1', title:'The Solar Storm', desc:'A geomagnetic surge tore through the upper atmosphere and erased the world\u2019s networks in a single night.'},
    {n:'2', title:'Communication Collapse', desc:'Cities fell silent. Satellites blinked out one by one. The global grid went dark and stayed that way.'},
    {n:'3', title:'The Last Operators', desc:'A handful of operators kept the old channels alive, typing by candlelight to hold the lines open.'},
    {n:'4', title:'Your Mission', desc:'Take a seat at the console. Reconnect the world, one transmitted word at a time, and bring back the light.'},
  ];
  aboutSecs = [
    {tag:'01', title:'The Collapse', body:'When the solar storm hit, it did not destroy the machines — it severed the connections between them. Power returned within weeks, but the network never did. Humanity woke to find itself an archipelago of dark islands, each unable to reach the next.'},
    {tag:'02', title:'The Operators', body:'From the ruins rose a new profession. Operators learned to coax fragile signals through damaged hardware, encoding entire rescue efforts into bursts of typed text. Speed kept people alive. Accuracy kept them found.'},
    {tag:'03', title:'The Mission', body:'The Last Signal is the training ground and the front line. Every mission you complete strengthens a real node on the mesh. Every word transmitted lights another window in a city that had gone dark.'},
    {tag:'04', title:'The Technology', body:'A reactive command interface built for focus and flow: a live transmission engine, a holographic world map, and a metrics core that turns your raw typing into the language of mission control.'},
  ];
  // `key` maps to the backend's computed achievement flags (see loadStats); `got` is derived live.
  achievements = [
    {key:'firstLight', name:'First Light', desc:'Complete your first mission', glyph:'✦'},
    {key:'speedDemon', name:'Speed Demon', desc:'Break 140 WPM', glyph:'⚡'},
    {key:'perfectSignal', name:'Perfect Signal', desc:'100% accuracy run', glyph:'◎'},
    {key:'centurion', name:'Centurion', desc:'Complete 10 transmissions', glyph:'∞'},
    {key:'marathon', name:'Marathon', desc:'Type for 30 minutes total', glyph:'◷'},
    {key:'globetrotter', name:'Globetrotter', desc:'Restore 50 cities', glyph:'◍'},
  ];
  // Recent Activity is built live from the operator's runs (see renderVals).

  componentDidMount(){
    this._mouse = {x:.5, y:.5};
    this._initBg(); this._initGlobe();
    this._raf = requestAnimationFrame(this._loop);
    this._onResize = () => { this.setState({vw:window.innerWidth}); this._sizeBg(); };
    this._onMove = (e) => { this._mouse.x = e.clientX/window.innerWidth; this._mouse.y = e.clientY/window.innerHeight; };
    // Browser back/forward (and manual hash edits) drive navigation.
    this._onHash = () => { const r=this._routeFromHash(); if(r!==this.state.route) this.go(r, true); };
    window.addEventListener('resize', this._onResize);
    window.addEventListener('mousemove', this._onMove, {passive:true});
    window.addEventListener('hashchange', this._onHash);
    this._sizeBg();
    this.setState({progress:this._loadProgress()});
    if(api.isAuthed()) this._loadAccountProgress();
    this.newMission(0);
    this.loadGlobal();
    // Load data for whatever page the URL restored us to on refresh.
    this._routeLoad(this.state.route);
  }
  componentWillUnmount(){
    cancelAnimationFrame(this._raf); cancelAnimationFrame(this._cRaf);
    clearInterval(this._timer); clearTimeout(this._gT); clearTimeout(this._pT);
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('mousemove', this._onMove);
    window.removeEventListener('hashchange', this._onHash);
  }

  _loop = (t) => {
    this._raf = requestAnimationFrame(this._loop);
    this._drawBg(t);
    if(this.state.route==='home' && this.globeRef.current) this._drawGlobe(t);
  };

  _initBg(){
    const W = window.innerWidth, H = window.innerHeight;
    const sn = W<700?90:170;
    this._stars = [];
    for(let i=0;i<sn;i++) this._stars.push({x:Math.random(),y:Math.random(),z:Math.random()*.8+.2,r:Math.random()*1.3+.2,tw:Math.random()*6.28});
    const cols = ['0,229,255','139,92,246','255,122,0'];
    const pn = W<700?22:46;
    this._parts = [];
    for(let i=0;i<pn;i++) this._parts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.3,vy:-(.2+Math.random()*.5),size:.6+Math.random()*1.8,col:cols[i%3]});
    this._pings = []; this._lastPing = 0;
  }
  _sizeBg(){
    const cv = this.bgRef.current; if(!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio||1);
    cv.width = window.innerWidth*dpr; cv.height = window.innerHeight*dpr;
    cv.getContext('2d').setTransform(dpr,0,0,dpr,0,0);
  }
  _drawBg(t){
    const cv = this.bgRef.current; if(!cv) return;
    const ctx = cv.getContext('2d'); const W = window.innerWidth, H = window.innerHeight;
    ctx.clearRect(0,0,W,H);
    const mx = this._mouse.x-.5, my = this._mouse.y-.5;
    for(const s of this._stars){ const px = s.x*W + mx*46*s.z, py = s.y*H + my*46*s.z; const tw = .5+.5*Math.sin(t*.002+s.tw); ctx.globalAlpha = (.2+.6*tw)*s.z; ctx.fillStyle = '#bfe9ff'; ctx.beginPath(); ctx.arc(px,py,s.r*s.z+.2,0,6.28); ctx.fill(); }
    ctx.globalAlpha = 1;
    for(let i=this._parts.length-1;i>=0;i--){ const p = this._parts[i]; p.x += p.vx; p.y += p.vy;
      if(p.burst){ p.vy += .03; p.vx *= .98; p.vy *= .98; p.life -= .018; if(p.life<=0){ this._parts.splice(i,1); continue; } }
      else { if(p.y<-12){ p.y = H+12; p.x = Math.random()*W; } if(p.x<-12) p.x = W+12; if(p.x>W+12) p.x = -12; }
      const a = p.burst ? p.life : .55; ctx.globalAlpha = a*.8; ctx.fillStyle = 'rgba('+p.col+',1)'; ctx.shadowColor = 'rgba('+p.col+',1)'; ctx.shadowBlur = p.burst?12:6; ctx.beginPath(); ctx.arc(p.x,p.y,p.size*(p.burst?1.7:1),0,6.28); ctx.fill(); }
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    const gap = this.state.route==='home'?2200:3800;
    if(t-this._lastPing>gap){ this._lastPing = t; this._pings.push({x:Math.random()*W,y:Math.random()*H*.85,r:0,life:1}); if(this._pings.length>5) this._pings.shift(); }
    for(let i=this._pings.length-1;i>=0;i--){ const pg = this._pings[i]; pg.r += 1.7; pg.life -= .006; if(pg.life<=0){ this._pings.splice(i,1); continue; } ctx.globalAlpha = pg.life*.45; ctx.strokeStyle = '#00E5FF'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(pg.x,pg.y,pg.r,0,6.28); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }

  _initGlobe(){
    const conts = [
      {lat:48,lon:-100,dlat:22,dlon:30,n:64},{lat:-15,lon:-60,dlat:24,dlon:14,n:50},
      {lat:50,lon:12,dlat:11,dlon:22,n:40},{lat:3,lon:21,dlat:33,dlon:24,n:88},
      {lat:56,lon:96,dlat:21,dlon:52,n:120},{lat:23,lon:80,dlat:15,dlon:22,n:50},
      {lat:-25,lon:134,dlat:10,dlon:16,n:32},{lat:66,lon:-42,dlat:7,dlon:16,n:14},
    ];
    const dots = [];
    for(const c of conts){ let placed=0, guard=0; while(placed<c.n && guard<c.n*25){ guard++; const la=c.lat+(Math.random()*2-1)*c.dlat, lo=c.lon+(Math.random()*2-1)*c.dlon; const nx=(la-c.lat)/c.dlat, ny=(lo-c.lon)/c.dlon; if(nx*nx+ny*ny<=1){ dots.push({lat:la*Math.PI/180,lon:lo*Math.PI/180,b:.55+Math.random()*.45}); placed++; } } }
    this._globeDots = dots;
    this._cities = [{lat:40.7,lon:-74},{lat:51.5,lon:-.1},{lat:35.7,lon:139.7},{lat:-33.9,lon:151.2},{lat:55.7,lon:37.6},{lat:-23.5,lon:-46.6},{lat:28.6,lon:77.2},{lat:30,lon:31.2},{lat:1.35,lon:103.8},{lat:64.1,lon:-21.9}].map(c=>({lat:c.lat*Math.PI/180,lon:c.lon*Math.PI/180}));
    this._arcs = [[0,2],[1,4],[5,8],[9,3]];
  }
  _drawGlobe(t){
    const cv = this.globeRef.current; if(!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio||1);
    const cssW = cv.clientWidth||520, cssH = cv.clientHeight||520;
    if(cv.width !== Math.round(cssW*dpr)){ cv.width = Math.round(cssW*dpr); cv.height = Math.round(cssH*dpr); }
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,cssW,cssH);
    const R = Math.min(cssW,cssH)*.36, cx = cssW/2, cy = cssH/2, rot = t*.00016, tilt = .41, ct = Math.cos(tilt), stn = Math.sin(tilt);
    const proj = (lat,lon) => { const cl = Math.cos(lat), X = cl*Math.sin(lon+rot), Y = Math.sin(lat), Z = cl*Math.cos(lon+rot); const y2 = Y*ct-Z*stn, z2 = Y*stn+Z*ct; return {x:cx+X*R, y:cy-y2*R, z:z2}; };
    let g = ctx.createRadialGradient(cx,cy,R*.72,cx,cy,R*1.32); g.addColorStop(0,'rgba(0,229,255,0)'); g.addColorStop(.74,'rgba(0,229,255,0)'); g.addColorStop(.9,'rgba(0,229,255,.16)'); g.addColorStop(1,'rgba(139,92,246,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx,cy,R*1.32,0,6.29); ctx.fill();
    g = ctx.createRadialGradient(cx-R*.35,cy-R*.35,R*.1,cx,cy,R); g.addColorStop(0,'rgba(12,26,46,.92)'); g.addColorStop(.7,'rgba(6,12,28,.94)'); g.addColorStop(1,'rgba(2,5,14,.96)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx,cy,R,0,6.29); ctx.fill();
    ctx.strokeStyle = 'rgba(0,229,255,.10)'; ctx.lineWidth = 1;
    for(let la=-60;la<=60;la+=30){ ctx.beginPath(); let st2=false; for(let lo=0;lo<=360;lo+=6){ const p=proj(la*Math.PI/180,lo*Math.PI/180); if(p.z>=0){ if(!st2){ctx.moveTo(p.x,p.y);st2=true;}else ctx.lineTo(p.x,p.y);} else st2=false; } ctx.stroke(); }
    for(let lo=0;lo<360;lo+=30){ ctx.beginPath(); let st2=false; for(let la=-90;la<=90;la+=6){ const p=proj(la*Math.PI/180,lo*Math.PI/180); if(p.z>=0){ if(!st2){ctx.moveTo(p.x,p.y);st2=true;}else ctx.lineTo(p.x,p.y);} else st2=false; } ctx.stroke(); }
    for(const d of this._globeDots){ const p = proj(d.lat,d.lon); if(p.z>0){ const a=(.2+.8*p.z)*d.b; ctx.fillStyle='rgba(86,214,255,'+a.toFixed(3)+')'; const s=1.3+p.z*.9; ctx.fillRect(p.x-s/2,p.y-s/2,s,s); } }
    for(let i=0;i<this._cities.length;i++){ const c=this._cities[i], p=proj(c.lat,c.lon); if(p.z>.1){ const pl=.5+.5*Math.sin(t*.004+i); ctx.globalAlpha=(.3+.7*pl)*p.z; ctx.fillStyle='#9ff0ff'; ctx.shadowColor='#00E5FF'; ctx.shadowBlur=10; ctx.beginPath(); ctx.arc(p.x,p.y,1.5+pl*1.5,0,6.29); ctx.fill(); } }
    ctx.shadowBlur=0; ctx.globalAlpha=1;
    for(const pr of this._arcs){ const A=proj(this._cities[pr[0]].lat,this._cities[pr[0]].lon), B=proj(this._cities[pr[1]].lat,this._cities[pr[1]].lon); if(A.z>0&&B.z>0){ const mxp=(A.x+B.x)/2,myp=(A.y+B.y)/2,dx=mxp-cx,dy=myp-cy,dist=Math.hypot(dx,dy)||1,lift=36+(1-dist/R)*30,cxp=mxp+dx/dist*lift,cyp=myp+dy/dist*lift; ctx.strokeStyle='rgba(0,229,255,.3)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(A.x,A.y); ctx.quadraticCurveTo(cxp,cyp,B.x,B.y); ctx.stroke(); const q=(t*.0004+pr[0]*.21)%1, qx=(1-q)*(1-q)*A.x+2*(1-q)*q*cxp+q*q*B.x, qy=(1-q)*(1-q)*A.y+2*(1-q)*q*cyp+q*q*B.y; ctx.fillStyle='#fff'; ctx.shadowColor='#00E5FF'; ctx.shadowBlur=9; ctx.beginPath(); ctx.arc(qx,qy,2,0,6.29); ctx.fill(); ctx.shadowBlur=0; } }
    ctx.strokeStyle='rgba(0,229,255,.5)'; ctx.lineWidth=1.6; ctx.beginPath(); ctx.arc(cx,cy,R,0,6.29); ctx.stroke();
    ctx.globalAlpha=.4; ctx.strokeStyle='rgba(139,92,246,.5)'; ctx.lineWidth=5; ctx.beginPath(); ctx.arc(cx,cy,R+3,0,6.29); ctx.stroke(); ctx.globalAlpha=1;
  }

  _animateCounts(signal, words, cities){
    cancelAnimationFrame(this._cRaf);
    const dur=1700, t0=performance.now();
    const tick=()=>{ const k=Math.min(1,(performance.now()-t0)/dur), e=1-Math.pow(1-k,3);
      this.setState({dSignal:Math.round(signal*e), dWords:Math.round(words*e), dCities:Math.round(cities*e)});
      if(k<1) this._cRaf=requestAnimationFrame(tick); };
    tick();
  }
  loadGlobal(){
    api.globalStats().then(g=>{
      const cities=g.cities||0, words=g.words||0;
      const signal=Math.min(100, Math.round((cities/Math.max(1,this.missions.length))*100));
      this._animateCounts(signal, words, cities);
    }).catch(()=>{ this._animateCounts(0,0,0); });
  }

  _routeFromHash(){
    if(typeof window==='undefined') return 'home';
    const h=(window.location.hash||'').replace(/^#\/?/, '').split('?')[0];
    const valid=['home','story','leaderboard','stats','about','login','register','profile','404'];
    return valid.indexOf(h)>=0 ? h : 'home';
  }
  _routeLoad(route){
    if(route==='leaderboard') this.loadLeaderboard();
    if(route==='stats'||route==='profile') this.loadStats();
  }
  go(route, fromHash){ if(route!=='typing') clearInterval(this._timer); this.setState({route, menuOpen:false});
    // Keep the URL in sync so a refresh restores the same page (browser back/forward works too).
    if(!fromHash && typeof window!=='undefined'){ const target='#/'+route; if(window.location.hash!==target) window.location.hash=target; }
    if(this.scrollRef.current) this.scrollRef.current.scrollTop=0; this.beep(520,.05,'sine',.04);
    if(route==='typing'){ this.newMission(this.state.missionIdx); setTimeout(()=>this.focusInput(),80); }
    this._routeLoad(route); }

  async loadLeaderboard(){
    try{
      const data = await api.leaderboard(50);
      let rows = (data && data.leaderboard) || [];
      if(data && data.you) rows = [...rows, data.you];
      if(rows.length) this.setState({liveLeaders:rows});
    }catch(e){ /* keep static demo leaderboard as fallback */ }
  }
  async loadStats(){
    if(!api.isAuthed()){ this.setState({liveStat:null, liveRecent:null, liveSeries:null, liveAccDist:null, liveAch:null, liveJoined:null, liveTpd:null}); return; }
    try{
      const d = await api.myStats();
      this.setState({liveStat:d.stat, liveRecent:d.recent, liveSeries:d.wpmSeries, liveAccDist:d.accDist, liveAch:d.achievements, liveJoined:d.joined, liveTpd:d.testsPerDay});
    }catch(e){ /* keep static fallback */ }
  }
  logout(){
    api.logout();
    this.setState({liveStat:null, liveRecent:null, liveSeries:null, liveAccDist:null, liveAch:null, liveJoined:null, liveTpd:null, liveLeaders:null, progress:this._loadProgress()});
    this.beep(440,.1,'sine',.05); this.toast('SIGNED OUT','ok');
    this.go('home');
  }
  newMission(idx){ clearInterval(this._timer); const n=this.missions.length; const i=((idx%n)+n)%n; const m=this.missions[i]; const text=this._scriptAt(i); const tl=this._timeLimitFor(m.diff,text.length); this.setState({quick:false, missionIdx:i, target:text, timeLimit:tl, typed:'', keystrokes:0, startTime:0, elapsed:0, finalElapsed:0, finished:false, failed:false, mistakes:0, combo:0, maxCombo:0}); }
  retry(){ clearInterval(this._timer); this.setState({typed:'', keystrokes:0, startTime:0, elapsed:0, finalElapsed:0, finished:false, failed:false, mistakes:0, combo:0, maxCombo:0, route:'typing'}); setTimeout(()=>this.focusInput(),80); }
  nextMission(){ if(this.state.quick){ this.quickPlay(); return; } const next=this.state.missionIdx+1; if(next<this.missions.length && next<=this.state.progress){ this.newMission(next); this.setState({route:'typing'}); setTimeout(()=>this.focusInput(),80); } else { this.go('story'); } }
  startMissionAt(idx){ if(idx>this.state.progress){ this.toast('SECTOR LOCKED · CLEAR PRIOR MISSIONS','rec'); return; } this.newMission(idx); this.setState({route:'typing'}); setTimeout(()=>this.focusInput(),80); }
  quickPlay(){ clearInterval(this._timer); const arr=this._scripts(); const i=Math.floor(Math.random()*arr.length); const text=arr[i]; const tl=this._timeLimitFor('Specialist',text.length); this.setState({quick:true, quickIdx:i, target:text, timeLimit:tl, route:'typing', typed:'', keystrokes:0, startTime:0, elapsed:0, finalElapsed:0, finished:false, failed:false, mistakes:0, combo:0, maxCombo:0}); setTimeout(()=>this.focusInput(),80); this.toast('RANDOM TRANSMISSION','ok'); }
  _scripts(){ return (typeof window!=='undefined' && window.LS_SCRIPTS && window.LS_SCRIPTS.length) ? window.LS_SCRIPTS : ['the signal is weak but the channel is open. transmit the message and bring the network back online one word at a time.']; }
  _scriptAt(i){ const a=this._scripts(); return a[((i%a.length)+a.length)%a.length]; }
  _timeLimitFor(diff,len){ const f={Recruit:.60,Operator:.52,Specialist:.46,Veteran:.40,Legend:.34}[diff]||.5; return Math.max(8,Math.ceil(len*f)); }
  _loadProgress(){ try{ const v=localStorage.getItem('tls_progress_v1'); const n=v?parseInt(v,10):0; return isNaN(n)?0:Math.max(0,Math.min(this.missions.length,n)); }catch(e){ return 0; } }
  _saveProgress(p){ try{ localStorage.setItem('tls_progress_v1',String(p)); }catch(e){} }
  // Merge the account's saved progress with whatever is local (take the furthest), apply it,
  // cache it, and push it back up to the server if the local value was ahead.
  _applyServerProgress(serverP){
    const merged = Math.min(this.missions.length, Math.max(this._loadProgress(), this.state.progress||0, serverP||0));
    this.setState({progress:merged}); this._saveProgress(merged);
    if(api.isAuthed() && merged>(serverP||0)) api.saveProgress(merged).catch(()=>{});
  }
  async _loadAccountProgress(){
    try{ const d=await api.me(); if(d && typeof d.progress==='number') this._applyServerProgress(d.progress); }catch(e){ /* invalid/expired token — stay on local progress */ }
  }
  _fail(){ clearInterval(this._timer); this.setState({failed:true, finalElapsed:this.state.timeLimit}); this._glitch(); this.beep(150,.3,'sawtooth',.06); setTimeout(()=>this.beep(90,.4,'sawtooth',.05),160); this.toast('SIGNAL LOST · TIME EXPIRED','rec'); }
  focusInput(){ if(this.inputRef.current) this.inputRef.current.focus(); }

  handleType(val){
    if(this.state.finished||this.state.failed) return;
    const target = this.state.target; val = val.slice(0,target.length);
    let {typed,startTime,keystrokes,mistakes,combo,maxCombo} = this.state;
    if(!startTime){ startTime = performance.now(); this._startTimer(); }
    if(val.length>typed.length){
      for(let i=typed.length;i<val.length;i++){ keystrokes++;
        if(val[i]===target[i]){ combo++; maxCombo=Math.max(maxCombo,combo); if(combo>0&&combo%12===0) this._burst(); this.beep(720+Math.min(combo,24)*7,.03,'square',.022); }
        else { mistakes++; combo=0; this._glitch(); this.beep(120,.09,'sawtooth',.05); }
      }
    } else { this.beep(280,.02,'sine',.018); }
    this.setState({typed:val,startTime,keystrokes,mistakes,combo,maxCombo});
    if(val.length===target.length) this._finish(startTime,mistakes,keystrokes);
  }
  _startTimer(){ clearInterval(this._timer); this._timer=setInterval(()=>{ const st=this.state; if(st.route==='typing'&&st.startTime&&!st.finished&&!st.failed){ const el=(performance.now()-st.startTime)/1000; if(el>=st.timeLimit){ this.setState({elapsed:st.timeLimit}); this._fail(); } else { this.setState({elapsed:el}); } } else if(this.state.route!=='typing') clearInterval(this._timer); },80); }
  _finish(startTime,mistakes,keystrokes){ clearInterval(this._timer); const el=(performance.now()-startTime)/1000; this.setState({finished:true,finalElapsed:el});
    this.beep(620,.12,'sine',.05); setTimeout(()=>this.beep(940,.18,'sine',.05),130);
    const mins=el/60, correct=keystrokes-mistakes, wpm=mins>0?Math.round((correct/5)/mins):0;
    const acc=keystrokes>0?(keystrokes-mistakes)/keystrokes*100:100;
    const m=this.missions[this.state.missionIdx%this.missions.length]||{};
    // Record the run for logged-in operators so it counts toward the leaderboard and global totals.
    if(api.isAuthed()){
      api.submitRun({ missionId: this.state.quick?null:m.id, wpm, accuracy:acc, mistakes, keystrokes, durationSec:el })
        .then(()=>this.loadGlobal())
        .catch(()=>{});
    }
    if(!this.state.quick){ const next=this.state.missionIdx+1; if(next>this.state.progress){ this._saveProgress(next); this.setState({progress:next}); if(api.isAuthed()) api.saveProgress(next).catch(()=>{}); setTimeout(()=>this.toast('SECTOR UNLOCKED','ok'),1100); } }
    setTimeout(()=>{ this.toast('SIGNAL CONNECTED','ok'); if(wpm>=this.stat.bestWpm) setTimeout(()=>this.toast('NEW RECORD · '+wpm+' WPM','rec'),500); },200);
  }
  _glitch(){ this.setState({glitch:true}); clearTimeout(this._gT); this._gT=setTimeout(()=>this.setState({glitch:false}),250); }
  _burst(){ const cx=window.innerWidth/2, cy=window.innerHeight*.46, cols=['0,229,255','139,92,246','255,122,0']; for(let i=0;i<26;i++){ const a=Math.random()*6.28, s=1+Math.random()*4.2; this._parts.push({x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,size:1+Math.random()*2,col:cols[i%3],burst:true}); } this.setState({pulse:true}); clearTimeout(this._pT); this._pT=setTimeout(()=>this.setState({pulse:false}),550); this.beep(700,.08,'triangle',.04); }

  beep(freq,dur,type,vol){ if(!this.state.soundOn) return; try{ if(!this._ac) this._ac=new (window.AudioContext||window.webkitAudioContext)(); const ac=this._ac; if(ac.state==='suspended') ac.resume(); const o=ac.createOscillator(), g=ac.createGain(); o.type=type||'sine'; o.frequency.value=freq; o.connect(g); g.connect(ac.destination); const t=ac.currentTime; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol||.05,t+.006); g.gain.exponentialRampToValueAtTime(.0001,t+(dur||.08)); o.start(t); o.stop(t+(dur||.08)+.02); }catch(e){} }
  toggleSound(){ const on=!this.state.soundOn; this.setState({soundOn:on}); if(on){ try{ if(!this._ac) this._ac=new (window.AudioContext||window.webkitAudioContext)(); this._ac.resume&&this._ac.resume(); }catch(e){} this.beep(660,.09,'sine',.05); this.toast('AUDIO ONLINE','ok'); } }
  toast(msg,kind){ const id=++this._tseq; this.setState(s=>({toasts:[...s.toasts,{id,msg,kind:kind||'ok'}]})); setTimeout(()=>this.setState(s=>({toasts:s.toasts.filter(t=>t.id!==id)})),3200); }
  async login(e){ if(e&&e.preventDefault) e.preventDefault(); if(this.state.authBusy) return;
    const u=(this.state.authUser||'').trim(), p=this.state.authPass||'';
    if(!u||!p){ this.toast('ENTER CALLSIGN AND ACCESS CODE','rec'); this._glitch(); return; }
    this.setState({authBusy:true});
    try{
      const data = await api.login(u,p);
      this._applyServerProgress(data && data.progress);
      this.beep(700,.1,'sine',.05); this.toast('SIGNAL CONNECTED','ok');
      this.setState({authBusy:false, authPass:''});
      setTimeout(()=>this.go('home'),750);
    }catch(err){
      this.setState({authBusy:false});
      this._glitch(); this.beep(150,.3,'sawtooth',.06);
      this.toast(String(err&&err.message||'LOGIN FAILED').toUpperCase(),'rec');
    }
  }
  async register(e){ if(e&&e.preventDefault) e.preventDefault(); if(this.state.authBusy) return;
    const u=(this.state.authUser||'').trim(), p=this.state.authPass||'', c=this.state.authConfirm||'';
    if(!u||!p){ this.toast('ENTER CALLSIGN AND ACCESS CODE','rec'); this._glitch(); return; }
    if(p!==c){ this.toast('ACCESS CODES DO NOT MATCH','rec'); this._glitch(); return; }
    this.setState({authBusy:true});
    try{
      const data = await api.register(u,p);
      // New account: push any guest progress up so it isn't lost on signup.
      this._applyServerProgress(data && data.progress);
      this.setState({registered:true, authBusy:false, authPass:'', authConfirm:''});
      this.beep(700,.1,'sine',.05); setTimeout(()=>this.beep(990,.16,'sine',.05),150);
      this.toast('OPERATOR CREATED','ok');
    }catch(err){
      this.setState({authBusy:false});
      this._glitch(); this.beep(150,.3,'sawtooth',.06);
      this.toast(String(err&&err.message||'REGISTRATION FAILED').toUpperCase(),'rec');
    }
  }

  _fmt(sec){ const s=Math.floor(sec), m=Math.floor(s/60); return m+':'+String(s%60).padStart(2,'0'); }
  _comma(n){ return (n||0).toLocaleString('en-US'); }
  _charts(series, accDist, tpd){
    // When logged in, `series` is the operator's real run history (possibly short/empty);
    // use it as-is. When logged out it's null, so fall back to the demo curve.
    const live = Array.isArray(series);
    let wpm = live ? series.slice() : this.wpmSeries;
    if(live && wpm.length<2) wpm = wpm.length===1 ? [wpm[0], wpm[0]] : [0,0];
    const n=wpm.length, W=620, H=200, pad=16;
    const max=Math.max(...wpm)*1.08, min=Math.min(...wpm)*.82, range=(max-min)||1;
    const xs=i=>pad+(n>1?(i/(n-1)):0)*(W-2*pad), ys=v=>H-pad-((v-min)/range)*(H-2*pad);
    const pts=wpm.map((v,i)=>xs(i).toFixed(1)+','+ys(v).toFixed(1)).join(' ');
    const area='M '+pad+' '+(H-pad)+' L '+wpm.map((v,i)=>xs(i).toFixed(1)+' '+ys(v).toFixed(1)).join(' L ')+' L '+(W-pad)+' '+(H-pad)+' Z';
    const dots=wpm.map((v,i)=>({x:xs(i).toFixed(1),y:ys(v).toFixed(1)}));
    const tpdSrc=(tpd&&tpd.length)?tpd:this.testsPerDay, bmax=(Math.max(...tpdSrc.map(d=>d.v))||1)*1.18, step=(W-2*pad)/tpdSrc.length, bw=step*.5;
    const bars=tpdSrc.map((d,i)=>{ const x=pad+i*step+(step-bw)/2, h=(d.v/bmax)*(H-2*pad-10); return {x:x.toFixed(1),y:(H-pad-h).toFixed(1),w:bw.toFixed(1),h:h.toFixed(1),label:d.d,v:d.v,lx:(x+bw/2).toFixed(1),vy:(H-pad-h-7).toFixed(1)}; });
    const accSrc=(accDist&&accDist.length)?accDist:this.accDist;
    const C=2*Math.PI*54; let off=0; const donut=accSrc.map(d=>{ const len=d.pct/100*C, seg={label:d.label,pct:d.pct,color:d.color,dash:len.toFixed(2),gap:(C-len).toFixed(2),offset:(-off).toFixed(2)}; off+=len; return seg; });
    return {wpmPts:pts, wpmArea:area, wpmDots:dots, bars, donut, donutC:C.toFixed(2)};
  }

  renderVals(){
    const s = this.state;
    const target = s.target||'';
    const chars = []; let correct=0;
    for(let i=0;i<target.length;i++){ let st='untyped';
      if(i<s.typed.length){ st = s.typed[i]===target[i]?'correct':'incorrect'; if(st==='correct') correct++; }
      else if(i===s.typed.length){ st='current'; }
      let style;
      if(st==='correct') style={color:'#e8f6ff'};
      else if(st==='incorrect') style={color:'#ff6a85',background:'rgba(255,84,112,.16)',borderRadius:'3px'};
      else if(st==='current') style={color:'#7fe9ff'};
      else style={color:'#5a6b8c'};
      chars.push({ch:target[i], style, current:st==='current', key:i});
    }
    const el = s.finished ? s.finalElapsed : s.elapsed;
    const mins = el/60;
    const wpm = mins>0 ? Math.round((correct/5)/mins) : 0;
    const acc = s.keystrokes>0 ? Math.max(0,Math.round((s.keystrokes-s.mistakes)/s.keystrokes*100)) : 100;
    const progress = target.length ? Math.round(s.typed.length/target.length*100) : 0;
    const signal = s.keystrokes>0 ? Math.min(100, Math.round(acc*.7 + Math.min(s.maxCombo,30)/30*30)) : 0;
    const timeLeft = Math.max(0, (s.timeLimit||0) - el);
    const timePct = s.timeLimit ? Math.max(0, Math.min(100, timeLeft/s.timeLimit*100)) : 100;
    const timeLow = s.startTime>0 && timeLeft<=10 && !s.finished && !s.failed;
    const m = this.missions[s.missionIdx%this.missions.length] || {};
    const vw = s.vw, desktop = vw>=900;
    const sbar = (on,h)=>on?h:'5px';
    const mkNav = (key,label) => ({key,label,active:s.route===key,dim:s.route!==key,go:()=>this.go(key)});
    const prog = s.progress;
    const missionsV = this.missions.map((mm,i)=>({...mm, done:i<prog, unlocked:i<=prog, locked:i>prog, start:()=>this.startMissionAt(i)}));
    const phasesV = this.phases.map(p=>({...p, missions: missionsV.filter(mm=>mm.phase===p.key)}));
    // Leaderboard comes live from the backend; empty until real operators log runs.
    const lb = s.liveLeaders || this.leaders;
    const podiumPh = {user:'—', wpm:'—'};
    const profileStat = s.liveStat || this.stat;
    const authed = api.isAuthed();
    const authedUser = api.currentUser();
    const profileName = (authedUser && authedUser.username) || (authed ? 'OPERATOR' : 'GUEST');
    const profileJoined = s.liveJoined || '—';
    const profileLevel = 1 + Math.floor((profileStat.totalTests||0)/5);
    const avgAcc = (s.liveStat && s.liveStat.avgAcc!=null) ? Math.round(s.liveStat.avgAcc) : 97;
    const ach = s.liveAch || {};
    const recentRuns = s.liveRecent || [];
    const activityV = recentRuns.map(r=>{ const m=this.missions.find(mm=>mm.id===r.missionId); const isRec=r.wpm===profileStat.bestWpm; const color=isRec?'#FF7A00':'#19f0a0'; return { what:'Completed '+(m?m.name:(r.missionId||'Transmission')), when:r.date, val:isRec?'RECORD':(r.wpm+' WPM'), kind:isRec?'rec':'ok', color, bdr:isRec?'rgba(255,122,0,.3)':'rgba(25,240,160,.3)' }; });

    return {
      isHome:s.route==='home', isTyping:s.route==='typing', isLeaderboard:s.route==='leaderboard', isStats:s.route==='stats', isStory:s.route==='story', isLogin:s.route==='login', isRegister:s.route==='register', isProfile:s.route==='profile', isAbout:s.route==='about', isNotFound:s.route==='404',
      showFooter: ['home','leaderboard','stats','story','profile','about'].indexOf(s.route)>=0,
      typingActive: s.route==='typing' && !s.finished && !s.failed,
      bgRef:this.bgRef, globeRef:this.globeRef, scrollRef:this.scrollRef, inputRef:this.inputRef,
      navItems:[mkNav('home','Home'),mkNav('story','Missions'),mkNav('leaderboard','Leaderboard'),mkNav('stats','Statistics'),mkNav('about','About')],
      desktopNav:desktop, mobileNav:!desktop,
      navFill: s.scrolled?1:0,
      onScroll:(e)=>{ const sc=e.target.scrollTop>24; if(sc!==this.state.scrolled) this.setState({scrolled:sc}); },
      toggleMenu:()=>this.setState(st=>({menuOpen:!st.menuOpen})), menuOpen:s.menuOpen,
      goHome:()=>this.go('home'), goLogin:()=>this.go('login'), goRegister:()=>this.go('register'), goLeaderboard:()=>this.go('leaderboard'), goAbout:()=>this.go('about'), goStats:()=>this.go('stats'), goStory:()=>this.go('story'), goProfile:()=>this.go('profile'), go404:()=>this.go('404'),
      toggleSound:()=>this.toggleSound(), soundOn:s.soundOn,
      soundColor: s.soundOn?'#00E5FF':'#5d6f92', soundBorder: s.soundOn?'rgba(0,229,255,.5)':'rgba(255,255,255,.12)', soundGlow: s.soundOn?'rgba(0,229,255,.3)':'rgba(0,0,0,.4)',
      sb1: sbar(s.soundOn,'9px'), sb2: sbar(s.soundOn,'18px'), sb3: sbar(s.soundOn,'12px'), sb4: sbar(s.soundOn,'20px'),
      dSignal:s.dSignal, dWords:this._comma(s.dWords), dCities:s.dCities,
      features:this.features, story:this.story,
      chars, wpm, acc, progress, signal, mistakes:s.mistakes, combo:s.combo, maxCombo:s.maxCombo, charsTyped:s.typed.length, targetLen:target.length, timeStr:this._fmt(el), durStr:this._fmt(s.finalElapsed),
      countStr:this._fmt(timeLeft), timeLeft, timePct, timeLow, failed:s.failed, quick:s.quick, timeLimitStr:this._fmt(s.timeLimit), progressCount:s.progress, totalMissions:this.missions.length,
      onType:(e)=>this.handleType(e.target.value), typedVal:s.typed, focusInput:()=>this.focusInput(), finished:s.finished, glitch:s.glitch,
      missionTag: s.quick ? 'QUICK PLAY' : (m.id+' · '+m.name), missionDiff: s.quick ? 'Random' : m.diff, missionLoc: s.quick ? 'Open Channel' : m.loc,
      startMission:()=>this.quickPlay(), quickPlay:()=>this.quickPlay(), retry:()=>this.retry(), nextMission:()=>this.nextMission(),
      missions:this.missions, startMissionAt:(i)=>this.startMissionAt(i),
      missionsV, phasesV,
      leaders:lb, p1:lb[0]||podiumPh, p2:lb[1]||podiumPh, p3:lb[2]||podiumPh, noOperators:lb.length===0,
      leadersRows:lb.map(L=>({...L, accStr:Number(L.acc).toFixed(1), rankColor: L.rank===1?'#ffcf5a':(L.rank===2?'#cbd5e1':(L.rank===3?'#e0934a':'#5d8ba3')), rowStyle: L.me?{background:'rgba(0,229,255,.08)',border:'1px solid rgba(0,229,255,.4)',boxShadow:'inset 0 0 30px rgba(0,229,255,.06)'}:{background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)'}})),
      stat:profileStat, recent:s.liveRecent||this.recent, aboutSecs:this.aboutSecs,
      profileName, profileBestWpm:profileStat.bestWpm, profileMissions:profileStat.totalTests,
      profileLevel, profileJoined, avgAcc, authed, onLogout:()=>this.logout(),
      achievementsV:this.achievements.map(a=>({...a, got:!!ach[a.key], locked:!ach[a.key]})),
      activityV, noActivity:activityV.length===0,
      ...this._charts(s.liveSeries, s.liveAccDist, s.liveTpd),
      registered:s.registered, onLogin:(e)=>this.login(e), onRegister:(e)=>this.register(e),
      authUser:s.authUser, authPass:s.authPass, authConfirm:s.authConfirm,
      setAuthUser:(e)=>this.setState({authUser:e.target.value}), setAuthPass:(e)=>this.setState({authPass:e.target.value}), setAuthConfirm:(e)=>this.setState({authConfirm:e.target.value}),
      toasts: s.toasts.map(t=>({...t, border: t.kind==='rec'?'rgba(255,122,0,.5)':(t.kind==='lvl'?'rgba(139,92,246,.5)':'rgba(0,229,255,.45)'), glow: t.kind==='rec'?'rgba(255,122,0,.25)':(t.kind==='lvl'?'rgba(139,92,246,.25)':'rgba(0,229,255,.22)'), dot: t.kind==='rec'?'#FF7A00':(t.kind==='lvl'?'#8B5CF6':'#19f0a0') })),
    };
  }


  render(){
    const { bgRef, scrollRef, onScroll, navFill, goHome, desktopNav, navItems, goProfile, goLogin, mobileNav, toggleMenu, isHome, globeRef, startMission, goLeaderboard, dSignal, dWords, dCities, features, story, isTyping, missionTag, missionDiff, missionLoc, pulse, wpm, acc, mistakes, countStr, combo, signal, typingActive, focusInput, chars, inputRef, typedVal, onType, charsTyped, targetLen, progress, failed, retry, goStory, finished, durStr, nextMission, goStats, isLeaderboard, p2, p1, p3, leadersRows, noOperators, isStats, stat, wpmArea, wpmPts, wpmDots, bars, donut, recent, isStory, phasesV, isLogin, onLogin, authUser, setAuthUser, authPass, setAuthPass, goRegister, isRegister, onRegister, authConfirm, setAuthConfirm, registered, isProfile, achievementsV, activityV, isAbout, aboutSecs, isNotFound, showFooter, goAbout, go404, menuOpen, glitch, toasts, toggleSound, soundBorder, soundGlow, soundColor, sb1, sb2, sb3, sb4, profileName, profileBestWpm, profileMissions, profileLevel, profileJoined, avgAcc, authed, onLogout, noActivity } = this.renderVals();
    return (
      <div style={css(`position:relative;height:100vh;width:100%;overflow:hidden;background:#050816;font-family:'Inter',system-ui,sans-serif;color:#dbe6ff;`)}>
      
      <canvas ref={bgRef} style={css(`position:absolute;inset:0;width:100%;height:100%;z-index:0;display:block;`)}></canvas>
      <div style={css(`position:absolute;inset:0;z-index:1;pointer-events:none;background-image:linear-gradient(rgba(0,229,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,.045) 1px,transparent 1px);background-size:64px 64px;mask-image:radial-gradient(ellipse at 50% 35%,#000 25%,transparent 80%);-webkit-mask-image:radial-gradient(ellipse at 50% 35%,#000 25%,transparent 80%);`)}></div>
      <div style={css(`position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(ellipse at 50% -5%,rgba(0,229,255,.10),transparent 50%),radial-gradient(ellipse at 85% 110%,rgba(139,92,246,.12),transparent 55%),radial-gradient(ellipse at 8% 90%,rgba(255,122,0,.06),transparent 50%);`)}></div>
      <div style={css(`position:absolute;left:0;right:0;height:120px;z-index:2;pointer-events:none;background:linear-gradient(180deg,rgba(0,229,255,.05),transparent);animation:lsscan 7s linear infinite;mix-blend-mode:screen;`)}></div>
      
      <div ref={scrollRef} onScroll={onScroll} style={css(`position:absolute;inset:0;z-index:5;overflow-y:auto;overflow-x:hidden;scroll-behavior:smooth;`)}>
      
      <nav style={css(`position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:13px clamp(16px,4vw,42px);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);`)}>
        <div style={css(`position:absolute;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(180deg,rgba(6,9,22,.92),rgba(6,9,22,.55));border-bottom:1px solid rgba(0,229,255,.18);box-shadow:0 8px 40px rgba(0,0,0,.4);opacity:${navFill};transition:opacity .4s ease;`)}></div>
        <div onClick={goHome} style={css(`display:flex;align-items:center;gap:12px;cursor:pointer;`)}>
          <img src="assets/logo-emblem.png" alt="The Last Signal" style={css(`height:40px;width:auto;filter:drop-shadow(0 0 12px rgba(0,229,255,.45));`)}/>
          <div style={css(`display:flex;flex-direction:column;line-height:1;`)}>
            <span style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:15px;letter-spacing:.16em;color:#eaf6ff;white-space:nowrap;`)}>THE LAST SIGNAL</span>
            <span style={css(`font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.32em;color:#00E5FF;margin-top:3px;`)}>TYPE · CONNECT · SAVE HUMANITY</span>
          </div>
        </div>
        {desktopNav && (<>
        <div style={css(`display:flex;align-items:center;gap:6px;`)}>
          {navItems.map((item, $index) => (<React.Fragment key={$index}>
            <div onClick={item.go} style={css(`position:relative;padding:9px 15px;cursor:pointer;font-size:13.5px;font-weight:500;letter-spacing:.02em;transition:opacity .2s;`)} className="g0">
              {item.active && (<><span style={css(`color:#eaf6ff;`)}>{item.label}</span></>)}
              {item.dim && (<><span style={css(`color:#9fb1cf;`)}>{item.label}</span></>)}
              {item.active && (<><div style={css(`position:absolute;left:15px;right:15px;bottom:2px;height:2px;background:linear-gradient(90deg,#00E5FF,#8B5CF6);border-radius:2px;box-shadow:0 0 10px #00E5FF;`)}></div></>)}
            </div>
          </React.Fragment>))}
        </div>
        <div style={css(`display:flex;align-items:center;gap:14px;`)}>
          <div onClick={goProfile} title="Open operator profile" style={css(`display:flex;align-items:center;gap:9px;padding:7px 13px;border-radius:10px;background:rgba(0,229,255,.05);border:1px solid rgba(0,229,255,.15);cursor:pointer;transition:border-color .2s,background .2s;`)} className="g1">
            <div style={css(`width:8px;height:8px;border-radius:50%;background:#19f0a0;box-shadow:0 0 8px #19f0a0;animation:lspulse 2s infinite;`)}></div>
            <span style={css(`font-family:'JetBrains Mono',monospace;font-size:12px;color:#cfe9ff;letter-spacing:.05em;`)}>{profileName}</span>
          </div>
          <button onClick={authed?onLogout:goLogin} style={css(`padding:9px 20px;border-radius:10px;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:13px;letter-spacing:.04em;color:#04121a;background:linear-gradient(135deg,#00E5FF,#8B5CF6);border:none;box-shadow:0 0 20px rgba(0,229,255,.35);transition:transform .2s,box-shadow .2s;`)} className="g2">{authed?'LOGOUT':'LOGIN'}</button>
        </div>
        </>)}
        {mobileNav && (<>
          <button onClick={toggleMenu} style={css(`display:flex;flex-direction:column;gap:5px;padding:11px;border-radius:10px;cursor:pointer;background:rgba(0,229,255,.07);border:1px solid rgba(0,229,255,.25);`)}>
            <span style={css(`display:block;width:22px;height:2px;background:#00E5FF;border-radius:2px;`)}></span>
            <span style={css(`display:block;width:22px;height:2px;background:#00E5FF;border-radius:2px;`)}></span>
            <span style={css(`display:block;width:14px;height:2px;background:#8B5CF6;border-radius:2px;`)}></span>
          </button>
        </>)}
      </nav>
      
      {isHome && (<>
      <div>
        <section style={css(`position:relative;min-height:calc(100vh - 68px);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px clamp(16px,5vw,40px) 60px;overflow:hidden;`)}>
          <canvas ref={globeRef} style={css(`position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);width:min(86vw,640px);height:min(86vw,640px);z-index:0;opacity:.9;pointer-events:none;`)}></canvas>
          <div style={css(`position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;text-align:center;max-width:920px;`)}>
            <div style={css(`display:inline-flex;align-items:center;gap:10px;padding:8px 16px;border-radius:100px;background:rgba(255,122,0,.08);border:1px solid rgba(255,122,0,.3);margin-bottom:26px;`)}>
              <span style={css(`width:7px;height:7px;border-radius:50%;background:#FF7A00;box-shadow:0 0 10px #FF7A00;animation:lspulse 1.6s infinite;`)}></span>
              <span style={css(`font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.28em;color:#ffb784;`)}>EMERGENCY BROADCAST · CHANNEL OPEN</span>
            </div>
            <div style={css(`filter:drop-shadow(0 0 36px rgba(0,229,255,.42));`)}>
              <h1 style={css(`margin:0;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:clamp(44px,9.5vw,118px);line-height:.95;letter-spacing:-.02em;background:linear-gradient(118deg,#dff7ff,#00E5FF 42%,#8B5CF6 92%);-webkit-background-clip:text;background-clip:text;color:transparent;`)}>THE LAST<br/>SIGNAL</h1>
            </div>
            <p style={css(`margin:26px 0 0;font-size:clamp(15px,2.4vw,20px);color:#9fb3d4;max-width:560px;line-height:1.6;`)}>Reconnect humanity one word at a time. Step into the command center, hold the channel open, and transmit the messages that bring the world back online.</p>
            <div style={css(`display:flex;flex-wrap:wrap;gap:16px;justify-content:center;margin-top:38px;`)}>
              <button onClick={startMission} style={css(`display:inline-flex;align-items:center;gap:11px;padding:16px 32px;border:none;border-radius:13px;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:15px;letter-spacing:.05em;text-transform:uppercase;color:#04121a;background:linear-gradient(135deg,#00E5FF,#46c8ff 45%,#8B5CF6);box-shadow:0 0 28px rgba(0,229,255,.45),inset 0 0 0 1px rgba(255,255,255,.25);transition:transform .2s,box-shadow .2s;`)} className="g3">▶ PLAY</button>
              <button onClick={goLeaderboard} style={css(`display:inline-flex;align-items:center;gap:11px;padding:16px 30px;border-radius:13px;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:15px;letter-spacing:.05em;text-transform:uppercase;color:#bfefff;background:rgba(0,229,255,.06);border:1px solid rgba(0,229,255,.4);transition:transform .2s,box-shadow .2s,background .2s;`)} className="g4">VIEW LEADERBOARD</button>
            </div>
          </div>
          <div style={css(`position:relative;z-index:2;display:flex;flex-wrap:wrap;gap:16px;justify-content:center;margin-top:54px;width:100%;max-width:760px;`)}>
            <div style={css(`flex:1;min-width:200px;padding:22px 24px;border-radius:16px;background:rgba(15,23,42,.5);border:1px solid rgba(0,229,255,.18);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 8px 40px rgba(0,0,0,.4);`)}>
              <div style={css(`font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.2em;color:#00E5FF;`)}>GLOBAL SIGNAL STRENGTH</div>
              <div style={css(`display:flex;align-items:baseline;gap:4px;margin:10px 0 12px;`)}><span style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:38px;color:#eaf6ff;`)}>{dSignal}</span><span style={css(`font-size:20px;color:#00E5FF;`)}>%</span></div>
              <div style={css(`height:6px;border-radius:6px;background:rgba(255,255,255,.07);overflow:hidden;`)}><div style={css(`height:100%;width:${dSignal}%;border-radius:6px;background:linear-gradient(90deg,#00E5FF,#8B5CF6);box-shadow:0 0 14px #00E5FF;transition:width .3s;`)}></div></div>
            </div>
            <div style={css(`flex:1;min-width:200px;padding:22px 24px;border-radius:16px;background:rgba(15,23,42,.5);border:1px solid rgba(139,92,246,.2);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 8px 40px rgba(0,0,0,.4);`)}>
              <div style={css(`font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.2em;color:#a78bfa;`)}>WORDS TRANSMITTED</div>
              <div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:38px;color:#eaf6ff;margin-top:10px;`)}>{dWords}</div>
              <div style={css(`font-size:12px;color:#7c8db0;margin-top:8px;`)}>across the global mesh network</div>
            </div>
            <div style={css(`flex:1;min-width:200px;padding:22px 24px;border-radius:16px;background:rgba(15,23,42,.5);border:1px solid rgba(255,122,0,.22);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 8px 40px rgba(0,0,0,.4);`)}>
              <div style={css(`font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.2em;color:#ff9a4d;`)}>CITIES RESTORED</div>
              <div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:38px;color:#eaf6ff;margin-top:10px;`)}>{dCities}</div>
              <div style={css(`font-size:12px;color:#7c8db0;margin-top:8px;`)}>lights back on, and counting</div>
            </div>
          </div>
        </section>
      
        <section style={css(`position:relative;z-index:2;padding:80px clamp(16px,5vw,40px);max-width:1200px;margin:0 auto;`)}>
          <div style={css(`text-align:center;margin-bottom:48px;`)}>
            <div style={css(`font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.3em;color:#00E5FF;margin-bottom:14px;`)}>// SYSTEM CAPABILITIES</div>
            <h2 style={css(`margin:0;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:clamp(28px,4.5vw,46px);color:#eaf6ff;letter-spacing:-.01em;`)}>Built for operators</h2>
          </div>
          <div style={css(`display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px;`)}>
            {features.map((f, $index) => (<React.Fragment key={$index}>
              <div style={css(`position:relative;padding:28px 24px;border-radius:18px;background:rgba(15,23,42,.5);border:1px solid rgba(0,229,255,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 8px 40px rgba(0,0,0,.4);overflow:hidden;transition:transform .3s,border-color .3s,box-shadow .3s;`)} className="g5">
                <div style={css(`width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(0,229,255,.16),rgba(139,92,246,.16));border:1px solid rgba(0,229,255,.3);margin-bottom:18px;box-shadow:0 0 20px rgba(0,229,255,.2);`)}>
                  <span style={css(`font-family:'JetBrains Mono',monospace;font-weight:700;font-size:18px;color:#00E5FF;`)}>{f.glyph}</span>
                </div>
                <h3 style={css(`margin:0 0 8px;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:18px;color:#eaf6ff;`)}>{f.title}</h3>
                <p style={css(`margin:0;font-size:13.5px;line-height:1.6;color:#8fa1c2;`)}>{f.desc}</p>
              </div>
            </React.Fragment>))}
          </div>
        </section>
      
        <section style={css(`position:relative;z-index:2;padding:40px clamp(16px,5vw,40px) 90px;max-width:1000px;margin:0 auto;`)}>
          <div style={css(`text-align:center;margin-bottom:54px;`)}>
            <div style={css(`font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.3em;color:#a78bfa;margin-bottom:14px;`)}>// MISSION LOG</div>
            <h2 style={css(`margin:0;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:clamp(28px,4.5vw,46px);color:#eaf6ff;letter-spacing:-.01em;`)}>How the world went dark</h2>
          </div>
          <div style={css(`position:relative;`)}>
            <div style={css(`position:absolute;left:27px;top:8px;bottom:8px;width:2px;background:linear-gradient(180deg,#00E5FF,#8B5CF6,rgba(139,92,246,0));`)}></div>
            {story.map((s, $index) => (<React.Fragment key={$index}>
              <div style={css(`position:relative;display:flex;gap:26px;padding-bottom:34px;`)}>
                <div style={css(`position:relative;z-index:2;flex:0 0 56px;width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:rgba(8,12,28,.9);border:1px solid rgba(0,229,255,.35);box-shadow:0 0 22px rgba(0,229,255,.25);font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:20px;color:#00E5FF;`)}>{s.n}</div>
                <div style={css(`flex:1;padding:18px 24px;border-radius:16px;background:rgba(15,23,42,.45);border:1px solid rgba(255,255,255,.06);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);`)}>
                  <h3 style={css(`margin:0 0 6px;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:18px;color:#eaf6ff;`)}>{s.title}</h3>
                  <p style={css(`margin:0;font-size:14px;line-height:1.65;color:#8fa1c2;`)}>{s.desc}</p>
                </div>
              </div>
            </React.Fragment>))}
          </div>
        </section>
      </div>
      </>)}
      
      {isTyping && (<>
      <section style={css(`position:relative;z-index:2;max-width:1000px;margin:0 auto;padding:34px clamp(16px,4vw,32px) 70px;`)}>
        <div style={css(`display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:26px;`)}>
          <div>
            <div style={css(`display:inline-flex;align-items:center;gap:9px;padding:6px 13px;border-radius:8px;background:rgba(255,122,0,.08);border:1px solid rgba(255,122,0,.3);margin-bottom:14px;`)}>
              <span style={css(`width:7px;height:7px;border-radius:50%;background:#FF7A00;box-shadow:0 0 10px #FF7A00;animation:lspulse 1.4s infinite;`)}></span>
              <span style={css(`font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.18em;color:#ffb784;white-space:nowrap;`)}>{missionTag}</span>
            </div>
            <h1 style={css(`margin:0;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:clamp(30px,5vw,46px);color:#eaf6ff;letter-spacing:-.01em;`)}>Emergency Broadcast</h1>
            <p style={css(`margin:8px 0 0;font-size:15px;color:#90a3c4;`)}>Transmit the message before the signal is lost.</p>
          </div>
          <div style={css(`display:flex;gap:10px;`)}>
            <div style={css(`padding:9px 14px;border-radius:10px;background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.3);font-family:'JetBrains Mono',monospace;font-size:11px;color:#c4b5fd;letter-spacing:.05em;`)}><span style={css(`color:#7c6fae;`)}>DIFFICULTY</span> {missionDiff}</div>
            <div style={css(`padding:9px 14px;border-radius:10px;background:rgba(0,229,255,.07);border:1px solid rgba(0,229,255,.25);font-family:'JetBrains Mono',monospace;font-size:11px;color:#9adcff;letter-spacing:.05em;`)}><span style={css(`color:#5d8ba3;`)}>NODE</span> {missionLoc}</div>
          </div>
        </div>
      
        <div style={css(`display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;margin-bottom:26px;`)}>
          <div style={css(`position:relative;padding:16px 18px;border-radius:15px;background:rgba(15,23,42,.55);border:1px solid rgba(0,229,255,.28);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:0 0 24px rgba(0,229,255,.1);overflow:hidden;`)}>
            {pulse && (<><div style={css(`position:absolute;inset:-1px;border-radius:15px;border:1.5px solid #00E5FF;box-shadow:0 0 30px rgba(0,229,255,.6);animation:lspulse .55s ease;pointer-events:none;`)}></div></>)}
            <div style={css(`font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.18em;color:#5d8ba3;`)}>WPM</div>
            <div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:34px;color:#00E5FF;line-height:1.1;text-shadow:0 0 18px rgba(0,229,255,.5);`)}>{wpm}</div>
          </div>
          <div style={css(`padding:16px 18px;border-radius:15px;background:rgba(15,23,42,.55);border:1px solid rgba(25,240,160,.25);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);`)}>
            <div style={css(`font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.18em;color:#5d8ba3;`)}>ACCURACY</div>
            <div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:34px;color:#19f0a0;line-height:1.1;text-shadow:0 0 16px rgba(25,240,160,.4);`)}>{acc}<span style={css(`font-size:18px;`)}>%</span></div>
          </div>
          <div style={css(`padding:16px 18px;border-radius:15px;background:rgba(15,23,42,.55);border:1px solid rgba(255,84,112,.25);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);`)}>
            <div style={css(`font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.18em;color:#5d8ba3;`)}>MISTAKES</div>
            <div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:34px;color:#ff6a85;line-height:1.1;`)}>{mistakes}</div>
          </div>
          <div style={css(`padding:16px 18px;border-radius:15px;background:rgba(15,23,42,.55);border:1px solid rgba(139,92,246,.25);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);`)}>
            <div style={css(`font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.18em;color:#5d8ba3;`)}>TIME</div>
            <div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:34px;color:#c4b5fd;line-height:1.1;`)}>{countStr}</div>
          </div>
          <div style={css(`padding:16px 18px;border-radius:15px;background:rgba(15,23,42,.55);border:1px solid rgba(255,122,0,.25);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);`)}>
            <div style={css(`font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.18em;color:#5d8ba3;`)}>COMBO</div>
            <div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:34px;color:#ff9a4d;line-height:1.1;`)}>×{combo}</div>
          </div>
          <div style={css(`padding:16px 18px;border-radius:15px;background:rgba(15,23,42,.55);border:1px solid rgba(0,229,255,.25);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);`)}>
            <div style={css(`font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.18em;color:#5d8ba3;`)}>SIGNAL</div>
            <div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:34px;color:#7fe9ff;line-height:1.1;`)}>{signal}<span style={css(`font-size:18px;`)}>%</span></div>
          </div>
        </div>
      
        {typingActive && (<>
        <div>
          <div onClick={focusInput} style={css(`position:relative;padding:clamp(26px,4vw,44px);border-radius:20px;background:rgba(9,14,30,.6);border:1px solid rgba(0,229,255,.2);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 16px 60px rgba(0,0,0,.5),inset 0 0 60px rgba(0,229,255,.03);cursor:text;overflow:hidden;`)}>
            <div style={css(`position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,#00E5FF,transparent);opacity:.6;`)}></div>
            <div style={css(`font-family:'JetBrains Mono',monospace;font-size:clamp(18px,2.7vw,27px);line-height:2;letter-spacing:.01em;white-space:pre-wrap;overflow-wrap:break-word;`)}>{chars.map((c, $index) => (<React.Fragment key={$index}><span style={css(`position:relative;`)}>{c.current && (<><span style={css(`position:absolute;left:-2px;top:8%;bottom:8%;width:2.5px;border-radius:2px;background:#00E5FF;box-shadow:0 0 12px #00E5FF,0 0 22px #00E5FF;animation:lsblink 1.05s steps(1) infinite;`)}></span></>)}<span style={c.style}>{c.ch}</span></span></React.Fragment>))}</div>
            <input ref={inputRef} value={typedVal} onChange={onType} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} style={css(`position:absolute;inset:0;width:100%;height:100%;opacity:0;border:none;background:transparent;color:transparent;caret-color:transparent;font-size:16px;cursor:text;`)}/>
          </div>
          <div style={css(`margin-top:26px;`)}>
            <div style={css(`display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;`)}>
              <span style={css(`font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.22em;color:#7fe9ff;`)}>◢ SIGNAL TRANSMISSION PROGRESS</span>
              <span style={css(`font-family:'JetBrains Mono',monospace;font-size:12px;color:#9fb3d4;`)}>{charsTyped} / {targetLen} · {progress}%</span>
            </div>
            <div style={css(`position:relative;height:14px;border-radius:10px;background:rgba(255,255,255,.05);border:1px solid rgba(0,229,255,.15);overflow:hidden;`)}>
              <div style={css(`position:absolute;inset:0;background-image:repeating-linear-gradient(90deg,rgba(0,229,255,.18) 0 2px,transparent 2px 8px);`)}></div>
              <div style={css(`position:relative;height:100%;width:${progress}%;border-radius:10px;background:linear-gradient(90deg,#0090ff,#00E5FF 60%,#8B5CF6);box-shadow:0 0 18px #00E5FF;transition:width .12s ease;`)}></div>
            </div>
          </div>
        </div>
        </>)}
      
        {failed && (<>
        <div style={css(`position:relative;padding:clamp(32px,5vw,56px);border-radius:24px;background:rgba(22,8,15,.72);border:1px solid rgba(255,84,112,.35);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 24px 80px rgba(0,0,0,.6),0 0 60px rgba(255,40,90,.12);text-align:center;overflow:hidden;`)}>
          <div style={css(`position:absolute;top:-40%;left:50%;transform:translateX(-50%);width:140%;height:80%;background:radial-gradient(ellipse at center,rgba(255,40,90,.16),transparent 70%);pointer-events:none;`)}></div>
          <div style={css(`position:relative;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.34em;color:#ff6a85;margin-bottom:14px;`)}>◉ TRANSMISSION LOST</div>
          <h2 style={css(`position:relative;margin:0;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:clamp(34px,6vw,58px);color:#ff6a85;text-shadow:0 0 30px rgba(255,40,90,.4),3px 0 0 rgba(0,229,255,.35),-3px 0 0 rgba(255,40,90,.5);animation:lsglitch 2s infinite;`)}>Signal Lost</h2>
          <p style={css(`position:relative;margin:14px 0 30px;font-size:15px;color:#c79aab;`)}>The timer ran out before the message reached its destination. The node went dark — transmit it again.</p>
          <div style={css(`position:relative;display:flex;flex-wrap:wrap;gap:14px;justify-content:center;`)}>
            <button onClick={retry} style={css(`padding:14px 28px;border:none;border-radius:12px;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:14px;letter-spacing:.04em;text-transform:uppercase;color:#fff;background:linear-gradient(135deg,#ff4d6d,#8B5CF6);box-shadow:0 0 26px rgba(255,77,109,.45);transition:transform .2s,box-shadow .2s;`)} className="g6">↻ Retry Transmission</button>
            <button onClick={goStory} style={css(`padding:14px 28px;border-radius:12px;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:14px;letter-spacing:.04em;text-transform:uppercase;color:#bfefff;background:rgba(0,229,255,.06);border:1px solid rgba(0,229,255,.4);transition:transform .2s,background .2s;`)} className="g7">⊕ Mission Deck</button>
          </div>
        </div>
        </>)}
      
        {finished && (<>
        <div style={css(`position:relative;padding:clamp(32px,5vw,56px);border-radius:24px;background:rgba(9,14,30,.72);border:1px solid rgba(0,229,255,.3);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 24px 80px rgba(0,0,0,.6),0 0 60px rgba(0,229,255,.12);text-align:center;overflow:hidden;`)}>
          <div style={css(`position:absolute;top:-40%;left:50%;transform:translateX(-50%);width:140%;height:80%;background:radial-gradient(ellipse at center,rgba(0,229,255,.16),transparent 70%);pointer-events:none;`)}></div>
          <div style={css(`position:relative;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.34em;color:#19f0a0;margin-bottom:14px;`)}>◉ TRANSMISSION COMPLETE</div>
          <h2 style={css(`position:relative;margin:0;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:clamp(34px,6vw,58px);background:linear-gradient(120deg,#dff7ff,#00E5FF 50%,#8B5CF6);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 24px rgba(0,229,255,.4));`)}>Mission Complete</h2>
          <p style={css(`position:relative;margin:12px 0 30px;font-size:15px;color:#90a3c4;`)}>Signal connected. The message reached its destination.</p>
          <div style={css(`position:relative;display:inline-flex;flex-direction:column;align-items:center;padding:22px 56px;border-radius:20px;background:rgba(0,229,255,.06);border:1px solid rgba(0,229,255,.3);margin-bottom:30px;box-shadow:inset 0 0 40px rgba(0,229,255,.06);`)}>
            <span style={css(`font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.24em;color:#5d8ba3;`)}>WORDS PER MINUTE</span>
            <span style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:clamp(56px,11vw,92px);line-height:1;color:#00E5FF;text-shadow:0 0 34px rgba(0,229,255,.6);`)}>{wpm}</span>
          </div>
          <div style={css(`position:relative;display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:14px;max-width:620px;margin:0 auto 32px;`)}>
            <div style={css(`padding:16px;border-radius:14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);`)}><div style={css(`font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;color:#5d8ba3;`)}>ACCURACY</div><div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:26px;color:#19f0a0;margin-top:4px;`)}>{acc}%</div></div>
            <div style={css(`padding:16px;border-radius:14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);`)}><div style={css(`font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;color:#5d8ba3;`)}>MISTAKES</div><div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:26px;color:#ff6a85;margin-top:4px;`)}>{mistakes}</div></div>
            <div style={css(`padding:16px;border-radius:14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);`)}><div style={css(`font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;color:#5d8ba3;`)}>CHARACTERS</div><div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:26px;color:#c4b5fd;margin-top:4px;`)}>{charsTyped}</div></div>
            <div style={css(`padding:16px;border-radius:14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);`)}><div style={css(`font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;color:#5d8ba3;`)}>DURATION</div><div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:26px;color:#7fe9ff;margin-top:4px;`)}>{durStr}</div></div>
          </div>
          <div style={css(`position:relative;display:flex;flex-wrap:wrap;gap:14px;justify-content:center;`)}>
            <button onClick={retry} style={css(`padding:14px 28px;border:none;border-radius:12px;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:14px;letter-spacing:.04em;text-transform:uppercase;color:#04121a;background:linear-gradient(135deg,#00E5FF,#8B5CF6);box-shadow:0 0 26px rgba(0,229,255,.45);transition:transform .2s,box-shadow .2s;`)} className="g8">↻ Retry Mission</button>
            <button onClick={nextMission} style={css(`padding:14px 28px;border-radius:12px;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:14px;letter-spacing:.04em;text-transform:uppercase;color:#bfefff;background:rgba(0,229,255,.06);border:1px solid rgba(0,229,255,.4);transition:transform .2s,background .2s;`)} className="g9">⊕ New Mission</button>
            <button onClick={goStats} style={css(`padding:14px 28px;border-radius:12px;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:14px;letter-spacing:.04em;text-transform:uppercase;color:#c4b5fd;background:rgba(139,92,246,.08);border:1px solid rgba(139,92,246,.4);transition:transform .2s,background .2s;`)} className="g10">◴ View Statistics</button>
          </div>
        </div>
        </>)}
      </section>
      </>)}
      
      {isLeaderboard && (<>
      <section style={css(`position:relative;z-index:2;max-width:1080px;margin:0 auto;padding:46px clamp(16px,5vw,40px) 70px;`)}>
        <div style={css(`text-align:center;margin-bottom:44px;`)}>
          <div style={css(`font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.3em;color:#00E5FF;margin-bottom:12px;`)}>// GLOBAL MESH RANKING</div>
          <h1 style={css(`margin:0;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:clamp(30px,5vw,50px);color:#eaf6ff;letter-spacing:-.01em;`)}>Global Operators Ranking</h1>
          <p style={css(`margin:10px 0 0;font-size:15px;color:#90a3c4;`)}>The fastest signals on the network. Updated every transmission.</p>
        </div>
      
        <div style={css(`display:flex;align-items:flex-end;justify-content:center;gap:clamp(8px,2.5vw,26px);margin-bottom:50px;flex-wrap:nowrap;`)}>
          <div style={css(`flex:1;max-width:240px;display:flex;flex-direction:column;align-items:center;`)}>
            <div style={css(`width:66px;height:66px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(203,210,224,.25),rgba(203,210,224,.05));border:2px solid #cbd5e1;box-shadow:0 0 26px rgba(203,210,224,.4);font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:26px;color:#e6edf6;margin-bottom:12px;animation:lsfloat 4s ease-in-out infinite;`)}>2</div>
            <div style={css(`font-family:'JetBrains Mono',monospace;font-size:13px;color:#dbe6ff;letter-spacing:.04em;margin-bottom:3px;white-space:nowrap;`)}>{p2.user}</div>
            <div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:22px;color:#cbd5e1;`)}>{p2.wpm}<span style={css(`font-size:11px;color:#7c8db0;`)}> WPM</span></div>
            <div style={css(`width:100%;height:108px;margin-top:14px;border-radius:14px 14px 0 0;background:linear-gradient(180deg,rgba(203,210,224,.16),rgba(203,210,224,.02));border:1px solid rgba(203,210,224,.3);border-bottom:none;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:46px;color:rgba(203,210,224,.45);`)}>02</div>
          </div>
          <div style={css(`flex:1;max-width:260px;display:flex;flex-direction:column;align-items:center;`)}>
            <div style={css(`font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.2em;color:#ffcf5a;margin-bottom:8px;`)}>◆ TOP OPERATOR</div>
            <div style={css(`width:84px;height:84px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(255,207,90,.3),rgba(255,207,90,.06));border:2px solid #ffcf5a;box-shadow:0 0 40px rgba(255,207,90,.5);font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:34px;color:#ffe6a8;margin-bottom:12px;animation:lsfloat 3.4s ease-in-out infinite;`)}>1</div>
            <div style={css(`font-family:'JetBrains Mono',monospace;font-size:14px;color:#fff;letter-spacing:.04em;margin-bottom:3px;white-space:nowrap;`)}>{p1.user}</div>
            <div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:28px;color:#ffcf5a;text-shadow:0 0 20px rgba(255,207,90,.5);`)}>{p1.wpm}<span style={css(`font-size:12px;color:#caa860;`)}> WPM</span></div>
            <div style={css(`width:100%;height:152px;margin-top:14px;border-radius:14px 14px 0 0;background:linear-gradient(180deg,rgba(255,207,90,.2),rgba(255,207,90,.03));border:1px solid rgba(255,207,90,.4);border-bottom:none;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:60px;color:rgba(255,207,90,.5);box-shadow:inset 0 0 40px rgba(255,207,90,.1);`)}>01</div>
          </div>
          <div style={css(`flex:1;max-width:240px;display:flex;flex-direction:column;align-items:center;`)}>
            <div style={css(`width:62px;height:62px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(224,147,74,.25),rgba(224,147,74,.05));border:2px solid #e0934a;box-shadow:0 0 24px rgba(224,147,74,.4);font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:24px;color:#f3c190;margin-bottom:12px;animation:lsfloat 4.4s ease-in-out infinite;`)}>3</div>
            <div style={css(`font-family:'JetBrains Mono',monospace;font-size:13px;color:#dbe6ff;letter-spacing:.04em;margin-bottom:3px;white-space:nowrap;`)}>{p3.user}</div>
            <div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:22px;color:#e0934a;`)}>{p3.wpm}<span style={css(`font-size:11px;color:#7c8db0;`)}> WPM</span></div>
            <div style={css(`width:100%;height:84px;margin-top:14px;border-radius:14px 14px 0 0;background:linear-gradient(180deg,rgba(224,147,74,.16),rgba(224,147,74,.02));border:1px solid rgba(224,147,74,.3);border-bottom:none;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:40px;color:rgba(224,147,74,.45);`)}>03</div>
          </div>
        </div>
      
        <div style={css(`border-radius:18px;background:rgba(9,14,30,.5);border:1px solid rgba(0,229,255,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);overflow:hidden;`)}>
          <div style={css(`display:grid;grid-template-columns:64px 1fr 100px 120px 90px;gap:10px;padding:15px 22px;border-bottom:1px solid rgba(0,229,255,.12);font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.14em;color:#5d8ba3;`)}>
            <span>RANK</span><span>OPERATOR</span><span style={css(`text-align:right;`)}>BEST WPM</span><span style={css(`text-align:right;`)}>AVG ACC</span><span style={css(`text-align:right;`)}>TESTS</span>
          </div>
          {leadersRows.map((L, $index) => (<React.Fragment key={$index}>
            <div style={L.rowStyle}>
              <div style={css(`display:grid;grid-template-columns:64px 1fr 100px 120px 90px;gap:10px;padding:15px 22px;align-items:center;`)}>
                <span style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:17px;color:${L.rankColor};`)}>{L.rank}</span>
                <span style={css(`font-family:'JetBrains Mono',monospace;font-size:14px;color:#dbe6ff;letter-spacing:.03em;`)}>{L.user}</span>
                <span style={css(`text-align:right;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:16px;color:#00E5FF;`)}>{L.wpm}</span>
                <span style={css(`text-align:right;font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:15px;color:#19f0a0;`)}>{L.accStr}%</span>
                <span style={css(`text-align:right;font-size:14px;color:#90a3c4;`)}>{L.tests}</span>
              </div>
            </div>
          </React.Fragment>))}
          {noOperators && (<><div style={css(`padding:42px 22px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:.06em;color:#5d8ba3;`)}>NO TRANSMISSIONS LOGGED YET — COMPLETE A MISSION TO CLAIM THE FIRST RANK.</div></>)}
        </div>
      </section>
      </>)}
      
      {isStats && (<>
      <section style={css(`position:relative;z-index:2;max-width:1100px;margin:0 auto;padding:46px clamp(16px,5vw,40px) 70px;`)}>
        <div style={css(`margin-bottom:36px;`)}>
          <div style={css(`font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.3em;color:#00E5FF;margin-bottom:12px;`)}>// OPERATOR DIAGNOSTICS</div>
          <h1 style={css(`margin:0;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:clamp(30px,5vw,50px);color:#eaf6ff;letter-spacing:-.01em;`)}>Statistics</h1>
        </div>
      
        <div style={css(`display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:24px;`)}>
          <div style={css(`padding:22px;border-radius:16px;background:rgba(15,23,42,.5);border:1px solid rgba(0,229,255,.22);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);`)}><div style={css(`font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;color:#5d8ba3;`)}>BEST WPM</div><div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:38px;color:#00E5FF;margin-top:6px;text-shadow:0 0 18px rgba(0,229,255,.4);`)}>{stat.bestWpm}</div></div>
          <div style={css(`padding:22px;border-radius:16px;background:rgba(15,23,42,.5);border:1px solid rgba(139,92,246,.22);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);`)}><div style={css(`font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;color:#5d8ba3;`)}>AVERAGE WPM</div><div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:38px;color:#a78bfa;margin-top:6px;`)}>{stat.avgWpm}</div></div>
          <div style={css(`padding:22px;border-radius:16px;background:rgba(15,23,42,.5);border:1px solid rgba(25,240,160,.22);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);`)}><div style={css(`font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;color:#5d8ba3;`)}>TOTAL TESTS</div><div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:38px;color:#19f0a0;margin-top:6px;`)}>{stat.totalTests}</div></div>
          <div style={css(`padding:22px;border-radius:16px;background:rgba(15,23,42,.5);border:1px solid rgba(255,122,0,.22);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);`)}><div style={css(`font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;color:#5d8ba3;`)}>TOTAL WORDS</div><div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:38px;color:#ff9a4d;margin-top:6px;`)}>{stat.totalWords}</div></div>
          <div style={css(`padding:22px;border-radius:16px;background:rgba(15,23,42,.5);border:1px solid rgba(0,229,255,.18);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);`)}><div style={css(`font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;color:#5d8ba3;`)}>TOTAL TIME</div><div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:38px;color:#7fe9ff;margin-top:6px;`)}>{stat.totalTime}</div></div>
        </div>
      
        <div style={css(`display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-bottom:16px;`)}>
          <div style={css(`grid-column:1/-1;padding:24px;border-radius:18px;background:rgba(9,14,30,.5);border:1px solid rgba(255,255,255,.07);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);`)}>
            <div style={css(`display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;`)}><span style={css(`font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:16px;color:#eaf6ff;`)}>WPM Progression</span><span style={css(`font-family:'JetBrains Mono',monospace;font-size:11px;color:#5d8ba3;`)}>LAST 12 SESSIONS</span></div>
            <svg viewBox="0 0 620 200" style={css(`width:100%;height:auto;display:block;`)}>
              <defs>
                <linearGradient id="wpmFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#00E5FF" stopOpacity="0.32"/><stop offset="1" stopColor="#00E5FF" stopOpacity="0"/></linearGradient>
                <linearGradient id="wpmLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#00E5FF"/><stop offset="1" stopColor="#8B5CF6"/></linearGradient>
              </defs>
              <path d={wpmArea} fill="url(#wpmFill)"></path>
              <polyline points={wpmPts} fill="none" stroke="url(#wpmLine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></polyline>
              {wpmDots.map((d, $index) => (<React.Fragment key={$index}><circle cx={d.x} cy={d.y} r="3.2" fill="#0b1020" stroke="#00E5FF" strokeWidth="2"></circle></React.Fragment>))}
            </svg>
          </div>
          <div style={css(`padding:24px;border-radius:18px;background:rgba(9,14,30,.5);border:1px solid rgba(255,255,255,.07);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);`)}>
            <div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:16px;color:#eaf6ff;margin-bottom:14px;`)}>Tests Per Day</div>
            <svg viewBox="0 0 620 200" style={css(`width:100%;height:auto;display:block;`)}>
              <defs><linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8B5CF6"/><stop offset="1" stopColor="#00E5FF"/></linearGradient></defs>
              {bars.map((b, $index) => (<React.Fragment key={$index}><rect x={b.x} y={b.y} width={b.w} height={b.h} rx="5" fill="url(#barGrad)"></rect><text x={b.lx} y="195" textAnchor="middle" fill="#5d8ba3" fontSize="12" fontFamily="JetBrains Mono, monospace">{b.label}</text><text x={b.lx} y={b.vy} textAnchor="middle" fill="#9fb3d4" fontSize="12" fontFamily="JetBrains Mono, monospace">{b.v}</text></React.Fragment>))}
            </svg>
          </div>
          <div style={css(`padding:24px;border-radius:18px;background:rgba(9,14,30,.5);border:1px solid rgba(255,255,255,.07);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);`)}>
            <div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:16px;color:#eaf6ff;margin-bottom:14px;`)}>Accuracy Distribution</div>
            <div style={css(`display:flex;align-items:center;gap:20px;flex-wrap:wrap;`)}>
              <svg viewBox="0 0 140 140" style={css(`width:150px;height:150px;flex:0 0 auto;`)}>
                <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="15"></circle>
                {donut.map((s, $index) => (<React.Fragment key={$index}><circle cx="70" cy="70" r="54" fill="none" stroke={s.color} strokeWidth="15" strokeDasharray={`${s.dash} ${s.gap}`} strokeDashoffset={s.offset} transform="rotate(-90 70 70)"></circle></React.Fragment>))}
                <text x="70" y="66" textAnchor="middle" fill="#eaf6ff" fontSize="24" fontWeight="700" fontFamily="Space Grotesk, sans-serif">{avgAcc}%</text>
                <text x="70" y="85" textAnchor="middle" fill="#5d8ba3" fontSize="9" letterSpacing="1.5" fontFamily="JetBrains Mono, monospace">AVG ACC</text>
              </svg>
              <div style={css(`flex:1;min-width:140px;display:flex;flex-direction:column;gap:9px;`)}>
                {donut.map((s, $index) => (<React.Fragment key={$index}>
                  <div style={css(`display:flex;align-items:center;gap:10px;`)}><span style={css(`width:11px;height:11px;border-radius:3px;background:${s.color};box-shadow:0 0 8px ${s.color};`)}></span><span style={css(`flex:1;font-size:13px;color:#bcccea;`)}>{s.label}</span><span style={css(`font-family:'JetBrains Mono',monospace;font-size:13px;color:#eaf6ff;`)}>{s.pct}%</span></div>
                </React.Fragment>))}
              </div>
            </div>
          </div>
        </div>
      
        <div style={css(`border-radius:18px;background:rgba(9,14,30,.5);border:1px solid rgba(255,255,255,.07);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);overflow:hidden;margin-top:8px;`)}>
          <div style={css(`padding:18px 22px 6px;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:16px;color:#eaf6ff;`)}>Recent Transmissions</div>
          <div style={css(`display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr 1fr;gap:10px;padding:12px 22px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.12em;color:#5d8ba3;`)}>
            <span>DATE</span><span style={css(`text-align:right;`)}>WPM</span><span style={css(`text-align:right;`)}>ACCURACY</span><span style={css(`text-align:right;`)}>DURATION</span><span style={css(`text-align:right;`)}>MISTAKES</span>
          </div>
          {recent.map((r, $index) => (<React.Fragment key={$index}>
            <div style={css(`display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr 1fr;gap:10px;padding:13px 22px;border-top:1px solid rgba(255,255,255,.04);align-items:center;`)}>
              <span style={css(`font-family:'JetBrains Mono',monospace;font-size:13px;color:#90a3c4;`)}>{r.date}</span>
              <span style={css(`text-align:right;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:15px;color:#00E5FF;`)}>{r.wpm}</span>
              <span style={css(`text-align:right;font-size:14px;color:#19f0a0;`)}>{r.acc}%</span>
              <span style={css(`text-align:right;font-size:14px;color:#c4b5fd;`)}>{r.dur}</span>
              <span style={css(`text-align:right;font-size:14px;color:#ff6a85;`)}>{r.miss}</span>
            </div>
          </React.Fragment>))}
        </div>
      </section>
      </>)}
      
      {isStory && (<>
      <section style={css(`position:relative;z-index:2;max-width:1120px;margin:0 auto;padding:46px clamp(16px,5vw,40px) 70px;`)}>
        <div style={css(`margin-bottom:34px;`)}>
          <div style={css(`font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.3em;color:#a78bfa;margin-bottom:12px;`)}>// OPERATION LAST SIGNAL · CAMPAIGN</div>
          <h1 style={css(`margin:0;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:clamp(30px,5vw,50px);color:#eaf6ff;letter-spacing:-.01em;`)}>Story Missions</h1>
          <p style={css(`margin:12px 0 0;font-size:15px;line-height:1.75;color:#90a3c4;max-width:680px;`)}>Year 2047. A solar storm called <span style={css(`color:#cfe0f5;`)}>Event LS-0</span> silenced the Global Signal Network in a single day. From the last bunker beneath the Alps you are <span style={css(`color:#00E5FF;`)}>Operator-7</span>, and only 3% of the world is still online. Every word you transmit restores the signal and lights another city on the map.</p>
        </div>
        {phasesV.map((p, $index) => (<React.Fragment key={$index}>
          <div style={css(`margin-bottom:42px;`)}>
            <div style={css(`display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:10px;`)}>
              <span style={css(`font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.24em;color:#00E5FF;white-space:nowrap;`)}>{p.label}</span>
              <span style={css(`height:1px;flex:1;min-width:24px;background:linear-gradient(90deg,rgba(0,229,255,.45),rgba(0,229,255,0));`)}></span>
              <span style={css(`font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.12em;color:#7fe9ff;padding:4px 11px;border-radius:7px;border:1px solid rgba(0,229,255,.3);background:rgba(0,229,255,.05);white-space:nowrap;`)}>NETWORK → {p.signal}</span>
            </div>
            <h2 style={css(`margin:0 0 7px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:clamp(22px,3.4vw,30px);color:#eaf6ff;`)}>{p.sub}</h2>
            <p style={css(`margin:0;font-size:14px;line-height:1.65;color:#8fa1c2;max-width:680px;`)}>{p.blurb}</p>
            <div style={css(`display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px;margin-top:20px;`)}>
              {p.missions.map((m, $index) => (<React.Fragment key={$index}>
                <div style={css(`position:relative;display:flex;flex-direction:column;padding:24px;border-radius:18px;background:rgba(15,23,42,.5);border:1px solid rgba(0,229,255,.14);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 10px 40px rgba(0,0,0,.4);overflow:hidden;transition:transform .3s,border-color .3s,box-shadow .3s;`)} className="g11">
              {m.done && (<><div style={css(`position:absolute;top:16px;right:16px;display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:8px;background:rgba(25,240,160,.12);border:1px solid rgba(25,240,160,.4);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.1em;color:#19f0a0;`)}>✓ CITY RESTORED</div></>)}
              <div style={css(`display:flex;align-items:center;gap:10px;margin-bottom:14px;`)}>
                <span style={css(`font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.1em;color:#5d8ba3;`)}>{m.id}</span>
                <span style={css(`padding:3px 10px;border-radius:7px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.08em;color:${m.color};border:1px solid ${m.color};background:rgba(255,255,255,.03);`)}>{m.diff}</span>
              </div>
              <h3 style={css(`margin:0 0 8px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:22px;color:#eaf6ff;`)}>{m.name}</h3>
              <div style={css(`display:flex;align-items:center;gap:7px;margin-bottom:14px;font-size:12.5px;color:#7f9bc4;`)}><span style={css(`color:#00E5FF;`)}>◉</span>{m.loc} · target {m.wpm} WPM</div>
              <p style={css(`margin:0 0 20px;font-size:13.5px;line-height:1.6;color:#8fa1c2;flex:1;`)}>{m.desc}</p>
              <div style={css(`display:flex;align-items:center;justify-content:space-between;gap:12px;`)}>
                <span style={css(`font-family:'JetBrains Mono',monospace;font-size:13px;color:#ff9a4d;`)}>◇ {m.reward}</span>
                {m.unlocked && (<><button onClick={m.start} style={css(`padding:11px 20px;border:none;border-radius:11px;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:13px;letter-spacing:.03em;color:#04121a;background:linear-gradient(135deg,#00E5FF,#8B5CF6);box-shadow:0 0 20px rgba(0,229,255,.35);transition:transform .2s,box-shadow .2s;`)} className="g12">Start Mission ▶</button></>)}
                {m.locked && (<><button onClick={m.start} style={css(`padding:11px 20px;border-radius:11px;cursor:not-allowed;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:13px;letter-spacing:.03em;color:#6b7ba0;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);`)}>◌ Locked</button></>)}
              </div>
            </div>
          </React.Fragment>))}
            </div>
          </div>
        </React.Fragment>))}
      </section>
      </>)}
      
      {isLogin && (<>
      <section style={css(`position:relative;z-index:2;min-height:calc(100vh - 68px);display:flex;align-items:center;justify-content:center;padding:40px 20px;`)}>
        <div style={css(`width:100%;max-width:430px;padding:42px clamp(24px,5vw,38px);border-radius:24px;background:rgba(9,14,30,.66);border:1px solid rgba(0,229,255,.25);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);box-shadow:0 24px 80px rgba(0,0,0,.6),0 0 50px rgba(0,229,255,.1);`)}>
          <div style={css(`text-align:center;margin-bottom:28px;`)}>
            <img src="assets/logo-emblem.png" alt="" style={css(`height:62px;filter:drop-shadow(0 0 16px rgba(0,229,255,.5));margin-bottom:12px;`)}/>
            <div style={css(`font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.26em;color:#00E5FF;margin-bottom:8px;`)}>// SECURE CHANNEL</div>
            <h1 style={css(`margin:0;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:26px;color:#eaf6ff;`)}>Operator Login</h1>
          </div>
          <form onSubmit={onLogin} style={css(`display:flex;flex-direction:column;gap:16px;`)}>
            <div><div style={css(`font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;color:#5d8ba3;margin-bottom:7px;`)}>USERNAME</div><input value={authUser} onChange={setAuthUser} placeholder="OPERATOR-7" style={css(`width:100%;padding:14px 16px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(0,229,255,.2);color:#eaf6ff;font-size:15px;`)} className="g13"/></div>
            <div><div style={css(`font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;color:#5d8ba3;margin-bottom:7px;`)}>PASSWORD</div><input type="password" value={authPass} onChange={setAuthPass} placeholder="••••••••" style={css(`width:100%;padding:14px 16px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(0,229,255,.2);color:#eaf6ff;font-size:15px;`)} className="g14"/></div>
            <button type="submit" style={css(`margin-top:6px;padding:15px;border:none;border-radius:12px;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:15px;letter-spacing:.04em;text-transform:uppercase;color:#04121a;background:linear-gradient(135deg,#00E5FF,#8B5CF6);box-shadow:0 0 28px rgba(0,229,255,.45);transition:transform .2s,box-shadow .2s;`)} className="g15">Connect To Network</button>
          </form>
          <div style={css(`text-align:center;margin-top:22px;font-size:13px;color:#7c8db0;`)}>New operator? <span onClick={goRegister} style={css(`color:#00E5FF;cursor:pointer;font-weight:600;`)}>Create an account</span></div>
        </div>
      </section>
      </>)}
      
      {isRegister && (<>
      <section style={css(`position:relative;z-index:2;min-height:calc(100vh - 68px);display:flex;align-items:center;justify-content:center;padding:40px 20px;`)}>
        <div style={css(`position:relative;width:100%;max-width:430px;padding:42px clamp(24px,5vw,38px);border-radius:24px;background:rgba(9,14,30,.66);border:1px solid rgba(139,92,246,.3);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);box-shadow:0 24px 80px rgba(0,0,0,.6),0 0 50px rgba(139,92,246,.12);overflow:hidden;`)}>
          <div style={css(`text-align:center;margin-bottom:26px;`)}>
            <img src="assets/logo-emblem.png" alt="" style={css(`height:62px;filter:drop-shadow(0 0 16px rgba(139,92,246,.5));margin-bottom:12px;`)}/>
            <div style={css(`font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.26em;color:#a78bfa;margin-bottom:8px;`)}>// NEW OPERATOR</div>
            <h1 style={css(`margin:0;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:26px;color:#eaf6ff;`)}>Join the Network</h1>
          </div>
          <form onSubmit={onRegister} style={css(`display:flex;flex-direction:column;gap:15px;`)}>
            <div><div style={css(`font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;color:#5d8ba3;margin-bottom:7px;`)}>USERNAME</div><input value={authUser} onChange={setAuthUser} placeholder="choose a callsign" style={css(`width:100%;padding:14px 16px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(139,92,246,.25);color:#eaf6ff;font-size:15px;`)} className="g16"/></div>
            <div><div style={css(`font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;color:#5d8ba3;margin-bottom:7px;`)}>PASSWORD</div><input type="password" value={authPass} onChange={setAuthPass} placeholder="••••••••" style={css(`width:100%;padding:14px 16px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(139,92,246,.25);color:#eaf6ff;font-size:15px;`)} className="g17"/></div>
            <div><div style={css(`font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;color:#5d8ba3;margin-bottom:7px;`)}>CONFIRM PASSWORD</div><input type="password" value={authConfirm} onChange={setAuthConfirm} placeholder="••••••••" style={css(`width:100%;padding:14px 16px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(139,92,246,.25);color:#eaf6ff;font-size:15px;`)} className="g18"/></div>
            <button type="submit" style={css(`margin-top:6px;padding:15px;border:none;border-radius:12px;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:15px;letter-spacing:.04em;text-transform:uppercase;color:#fff;background:linear-gradient(135deg,#8B5CF6,#00E5FF);box-shadow:0 0 28px rgba(139,92,246,.45);transition:transform .2s,box-shadow .2s;`)} className="g19">Create Operator</button>
          </form>
          <div style={css(`text-align:center;margin-top:22px;font-size:13px;color:#7c8db0;`)}>Already enlisted? <span onClick={goLogin} style={css(`color:#a78bfa;cursor:pointer;font-weight:600;`)}>Log in</span></div>
          {registered && (<>
            <div style={css(`position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:rgba(7,11,24,.94);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);`)}>
              <div style={css(`width:84px;height:84px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle,rgba(25,240,160,.25),rgba(25,240,160,.02));border:2px solid #19f0a0;box-shadow:0 0 40px rgba(25,240,160,.5);font-size:40px;color:#19f0a0;animation:lspulse 1.6s infinite;`)}>✓</div>
              <div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:24px;color:#eaf6ff;`)}>Signal Connected.</div>
              <div style={css(`font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.1em;color:#19f0a0;`)}>OPERATOR REGISTERED · WELCOME TO THE MESH</div>
              <button onClick={startMission} style={css(`margin-top:8px;padding:13px 26px;border:none;border-radius:11px;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:14px;color:#04121a;background:linear-gradient(135deg,#19f0a0,#00E5FF);box-shadow:0 0 26px rgba(25,240,160,.4);`)}>Begin First Mission ▶</button>
            </div>
          </>)}
        </div>
      </section>
      </>)}
      
      {isProfile && (<>
      <section style={css(`position:relative;z-index:2;max-width:1040px;margin:0 auto;padding:46px clamp(16px,5vw,40px) 70px;`)}>
        <div style={css(`display:flex;flex-wrap:wrap;align-items:center;gap:28px;padding:32px;border-radius:22px;background:rgba(9,14,30,.55);border:1px solid rgba(0,229,255,.18);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 16px 60px rgba(0,0,0,.45);margin-bottom:22px;`)}>
          <div style={css(`position:relative;flex:0 0 auto;width:118px;height:118px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle,rgba(0,229,255,.16),rgba(139,92,246,.08));border:2px solid rgba(0,229,255,.5);box-shadow:0 0 36px rgba(0,229,255,.35);`)}>
            <img src="assets/logo-emblem.png" alt="" style={css(`width:82px;height:82px;object-fit:contain;filter:drop-shadow(0 0 10px rgba(0,229,255,.5));`)}/>
            <div style={css(`position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);padding:3px 12px;border-radius:8px;background:#0a0e1d;border:1px solid rgba(0,229,255,.4);font-family:'JetBrains Mono',monospace;font-size:10px;color:#00E5FF;white-space:nowrap;`)}>LVL {profileLevel}</div>
          </div>
          <div style={css(`flex:1;min-width:220px;`)}>
            <div style={css(`font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.2em;color:#19f0a0;margin-bottom:6px;`)}>◉ ONLINE · OPERATOR</div>
            <h1 style={css(`margin:0 0 4px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:clamp(28px,4.5vw,40px);color:#eaf6ff;`)}>{profileName}</h1>
            <div style={css(`font-size:13px;color:#7c8db0;`)}>Joined {profileJoined} · Relay Division</div>
          </div>
          <div style={css(`display:flex;gap:14px;flex-wrap:wrap;`)}>
            <div style={css(`padding:16px 22px;border-radius:14px;background:rgba(0,229,255,.06);border:1px solid rgba(0,229,255,.22);text-align:center;`)}><div style={css(`font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;color:#5d8ba3;`)}>BEST WPM</div><div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:30px;color:#00E5FF;`)}>{profileBestWpm}</div></div>
            <div style={css(`padding:16px 22px;border-radius:14px;background:rgba(139,92,246,.06);border:1px solid rgba(139,92,246,.22);text-align:center;`)}><div style={css(`font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;color:#5d8ba3;`)}>MISSIONS</div><div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:30px;color:#a78bfa;`)}>{profileMissions}</div></div>
          </div>
        </div>
      
        <div style={css(`display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:22px;`)}>
          <div>
            <div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:18px;color:#eaf6ff;margin-bottom:16px;`)}>Achievements</div>
            <div style={css(`display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;`)}>
              {achievementsV.map((a, $index) => (<React.Fragment key={$index}>
                <div style={css(`padding:18px;border-radius:15px;background:rgba(15,23,42,.5);border:1px solid rgba(255,255,255,.06);text-align:center;`)}>
                  {a.got && (<><div style={css(`width:46px;height:46px;margin:0 auto 10px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:22px;color:#00E5FF;background:linear-gradient(135deg,rgba(0,229,255,.18),rgba(139,92,246,.18));border:1px solid rgba(0,229,255,.4);box-shadow:0 0 18px rgba(0,229,255,.25);`)}>{a.glyph}</div></>)}
                  {a.locked && (<><div style={css(`width:46px;height:46px;margin:0 auto 10px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:20px;color:#46577a;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);`)}>◌</div></>)}
                  <div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:13.5px;color:#dbe6ff;margin-bottom:3px;`)}>{a.name}</div>
                  <div style={css(`font-size:11px;color:#7c8db0;line-height:1.4;`)}>{a.desc}</div>
                </div>
              </React.Fragment>))}
            </div>
          </div>
          <div>
            <div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:18px;color:#eaf6ff;margin-bottom:16px;`)}>Recent Activity</div>
            <div style={css(`display:flex;flex-direction:column;gap:10px;`)}>
              {activityV.map((a, $index) => (<React.Fragment key={$index}>
                <div style={css(`display:flex;align-items:center;gap:14px;padding:14px 18px;border-radius:13px;background:rgba(15,23,42,.5);border:1px solid rgba(255,255,255,.06);`)}>
                  <span style={css(`width:9px;height:9px;border-radius:50%;background:${a.color};box-shadow:0 0 9px ${a.color};flex:0 0 auto;`)}></span>
                  <div style={css(`flex:1;min-width:0;`)}><div style={css(`font-size:13.5px;color:#dbe6ff;`)}>{a.what}</div><div style={css(`font-family:'JetBrains Mono',monospace;font-size:10px;color:#5d8ba3;margin-top:2px;`)}>{a.when}</div></div>
                  <span style={css(`font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.06em;color:${a.color};border:1px solid ${a.bdr};padding:4px 9px;border-radius:7px;white-space:nowrap;`)}>{a.val}</span>
                </div>
              </React.Fragment>))}
              {noActivity && (<><div style={css(`padding:24px 18px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.05em;color:#5d8ba3;border:1px dashed rgba(255,255,255,.08);border-radius:13px;`)}>NO ACTIVITY YET — COMPLETE A MISSION TO START YOUR LOG.</div></>)}
            </div>
          </div>
        </div>
      </section>
      </>)}
      
      {isAbout && (<>
      <section style={css(`position:relative;z-index:2;max-width:880px;margin:0 auto;padding:56px clamp(16px,5vw,40px) 70px;`)}>
        <div style={css(`text-align:center;margin-bottom:54px;`)}>
          <div style={css(`font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.3em;color:#00E5FF;margin-bottom:16px;`)}>// TRANSMISSION ARCHIVE</div>
          <h1 style={css(`margin:0;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:clamp(32px,6vw,56px);line-height:1;background:linear-gradient(120deg,#dff7ff,#00E5FF 50%,#8B5CF6);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 24px rgba(0,229,255,.35));`)}>The Last Signal</h1>
          <p style={css(`margin:18px auto 0;font-size:16px;color:#9fb3d4;max-width:540px;line-height:1.7;`)}>A typing test reimagined as humanity's final communication network. Every word you transmit is part of the story below.</p>
        </div>
        <div style={css(`display:flex;flex-direction:column;gap:18px;`)}>
          {aboutSecs.map((s, $index) => (<React.Fragment key={$index}>
            <div style={css(`display:flex;gap:24px;padding:28px;border-radius:18px;background:rgba(15,23,42,.45);border:1px solid rgba(0,229,255,.12);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);`)}>
              <div style={css(`flex:0 0 auto;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:38px;line-height:1;background:linear-gradient(135deg,#00E5FF,#8B5CF6);-webkit-background-clip:text;background-clip:text;color:transparent;opacity:.85;`)}>{s.tag}</div>
              <div><h3 style={css(`margin:0 0 10px;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:20px;color:#eaf6ff;`)}>{s.title}</h3><p style={css(`margin:0;font-size:14.5px;line-height:1.75;color:#90a3c4;`)}>{s.body}</p></div>
            </div>
          </React.Fragment>))}
        </div>
        <div style={css(`text-align:center;margin-top:44px;`)}>
          <button onClick={startMission} style={css(`padding:16px 34px;border:none;border-radius:13px;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:15px;letter-spacing:.05em;text-transform:uppercase;color:#04121a;background:linear-gradient(135deg,#00E5FF,#8B5CF6);box-shadow:0 0 28px rgba(0,229,255,.45);transition:transform .2s,box-shadow .2s;`)} className="g20">▶ Take a Seat at the Console</button>
        </div>
      </section>
      </>)}
      
      {isNotFound && (<>
      <section style={css(`position:relative;z-index:2;min-height:calc(100vh - 68px);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 20px;`)}>
        <div style={css(`font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:.4em;color:#ff6a85;margin-bottom:20px;`)}>ERROR · 404 · CONNECTION DROPPED</div>
        <h1 style={css(`margin:0;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:clamp(48px,13vw,140px);line-height:.9;letter-spacing:-.02em;color:#eaf6ff;text-shadow:0 0 40px rgba(0,229,255,.4),4px 0 0 rgba(255,40,90,.5),-4px 0 0 rgba(0,229,255,.5);animation:lsglitch 2.4s infinite;`)}>SIGNAL LOST</h1>
        <p style={css(`margin:26px 0 0;font-size:16px;color:#90a3c4;max-width:440px;line-height:1.7;`)}>The transmission you were looking for has faded into the static. The node is dark — for now.</p>
        <button onClick={goHome} style={css(`margin-top:34px;padding:16px 34px;border:none;border-radius:13px;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:15px;letter-spacing:.05em;text-transform:uppercase;color:#04121a;background:linear-gradient(135deg,#00E5FF,#8B5CF6);box-shadow:0 0 28px rgba(0,229,255,.45);transition:transform .2s,box-shadow .2s;`)} className="g21">↩ Return To Base</button>
      </section>
      </>)}
      
      
      
      {showFooter && (<>
      <footer style={css(`position:relative;z-index:2;border-top:1px solid rgba(0,229,255,.12);padding:42px clamp(16px,5vw,40px);margin-top:20px;background:rgba(5,8,22,.5);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);`)}>
        <div style={css(`max-width:1200px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:20px;`)}>
          <div style={css(`display:flex;align-items:center;gap:12px;`)}>
            <img src="assets/logo-emblem.png" alt="" style={css(`height:34px;filter:drop-shadow(0 0 10px rgba(0,229,255,.4));`)}/>
            <div>
              <div style={css(`font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:14px;letter-spacing:.16em;color:#eaf6ff;`)}>THE LAST SIGNAL</div>
              <div style={css(`font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.2em;color:#5d6f92;margin-top:3px;`)}>© 2087 GLOBAL MESH OPERATIONS</div>
            </div>
          </div>
          <div style={css(`display:flex;gap:26px;`)}>
            <span style={css(`font-size:13px;color:#8fa1c2;cursor:pointer;transition:color .2s;`)} className="g22">GitHub</span>
            <span onClick={goAbout} style={css(`font-size:13px;color:#8fa1c2;cursor:pointer;transition:color .2s;`)} className="g23">About</span>
            <span onClick={go404} style={css(`font-size:13px;color:#8fa1c2;cursor:pointer;transition:color .2s;`)} className="g24">Privacy</span>
          </div>
        </div>
      </footer>
      </>)}
      
      </div>
      
      {menuOpen && (<>
      <div style={css(`position:absolute;inset:0;z-index:90;background:rgba(5,8,22,.94);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);display:flex;flex-direction:column;padding:24px;`)}>
        <div style={css(`display:flex;justify-content:flex-end;`)}><button onClick={toggleMenu} style={css(`width:44px;height:44px;border-radius:12px;background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.3);color:#00E5FF;font-size:22px;cursor:pointer;`)}>✕</button></div>
        <div style={css(`display:flex;flex-direction:column;gap:6px;margin-top:30px;`)}>
          {navItems.map((item, $index) => (<React.Fragment key={$index}>
            <div onClick={item.go} style={css(`padding:18px 16px;border-radius:14px;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:24px;color:#cfe0f5;border-bottom:1px solid rgba(255,255,255,.05);cursor:pointer;`)}>{item.label}</div>
          </React.Fragment>))}
          <button onClick={authed?onLogout:goLogin} style={css(`margin-top:24px;padding:18px;border-radius:14px;border:none;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:16px;letter-spacing:.05em;color:#04121a;background:linear-gradient(135deg,#00E5FF,#8B5CF6);box-shadow:0 0 28px rgba(0,229,255,.45);`)}>{authed?'LOG OUT':'LOGIN TO NETWORK'}</button>
        </div>
      </div>
      </>)}
      
      {glitch && (<>
      <div style={css(`position:absolute;inset:0;z-index:88;pointer-events:none;mix-blend-mode:screen;background:repeating-linear-gradient(0deg,rgba(255,40,90,.07) 0 2px,transparent 2px 4px),repeating-linear-gradient(0deg,rgba(0,229,255,.05) 0 3px,transparent 3px 6px);animation:lsglitch .26s steps(2) infinite;`)}></div>
      </>)}
      
      <div style={css(`position:absolute;bottom:20px;right:20px;z-index:85;display:flex;flex-direction:column;gap:10px;align-items:flex-end;`)}>
        {toasts.map((t, $index) => (<React.Fragment key={$index}>
          <div style={css(`display:flex;align-items:center;gap:12px;padding:13px 18px;border-radius:13px;background:rgba(8,14,30,.92);border:1px solid ${t.border};backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 10px 40px rgba(0,0,0,.5),0 0 24px ${t.glow};min-width:200px;`)}>
            <span style={css(`width:10px;height:10px;border-radius:50%;background:${t.dot};box-shadow:0 0 10px ${t.dot};`)}></span>
            <span style={css(`font-family:'JetBrains Mono',monospace;font-size:12.5px;letter-spacing:.08em;color:#eaf6ff;`)}>{t.msg}</span>
          </div>
        </React.Fragment>))}
      </div>
      
      <button onClick={toggleSound} title="Toggle sound" style={css(`position:absolute;bottom:20px;left:20px;z-index:85;width:50px;height:50px;border-radius:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;background:rgba(8,14,30,.85);border:1px solid ${soundBorder};backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:0 0 22px ${soundGlow};transition:all .3s;`)}>
        <div style={css(`display:flex;align-items:flex-end;gap:3px;height:20px;`)}>
          <span style={css(`width:3px;border-radius:3px;background:${soundColor};height:${sb1};box-shadow:0 0 6px ${soundColor};`)}></span>
          <span style={css(`width:3px;border-radius:3px;background:${soundColor};height:${sb2};box-shadow:0 0 6px ${soundColor};`)}></span>
          <span style={css(`width:3px;border-radius:3px;background:${soundColor};height:${sb3};box-shadow:0 0 6px ${soundColor};`)}></span>
          <span style={css(`width:3px;border-radius:3px;background:${soundColor};height:${sb4};box-shadow:0 0 6px ${soundColor};`)}></span>
        </div>
      </button>
      
      </div>
    );
  }
}

export default Component;
