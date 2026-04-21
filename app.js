const STORAGE_KEY = 'idle_founder_ultra_save_v1';
const THEME_KEY = 'idle_founder_theme';
const APP_VERSION = '2.0.0';

const $ = (id) => document.getElementById(id);
const fmtNum = (n) => Math.floor(n).toLocaleString('fr-FR');
const fmtMoney = (n) => `${n.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`;
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const nowTs = () => Date.now();

const HIRE_TYPES = [
  { key:'dev', name:'Développeur', emoji:'👨‍💻', baseCost:120, desc:'Crée plus vite des features et réduit les bugs.', effect:'+ dev power' },
  { key:'marketer', name:'Marketeur', emoji:'📣', baseCost:150, desc:'Attire plus d’utilisateurs et améliore la conversion.', effect:'+ acquisition' },
  { key:'designer', name:'Designer', emoji:'🎨', baseCost:170, desc:'Améliore la satisfaction et la rétention.', effect:'+ satisfaction' },
  { key:'support', name:'Support', emoji:'🎧', baseCost:210, desc:'Réduit le churn et protège la réputation.', effect:'+ support' },
  { key:'sales', name:'Commercial', emoji:'🤝', baseCost:320, desc:'Fait monter les revenus mensuels plus vite.', effect:'+ monétisation' },
  { key:'ops', name:'Ops', emoji:'🛠', baseCost:420, desc:'Réduit la charge infra et le burn.', effect:'+ stabilité' },
];

const FEATURES = [
  { key:'onboarding', name:'Onboarding fluide', cost:100, rep:4, sat:6, users:18, unlock:0 },
  { key:'mobile', name:'Application mobile', cost:450, rep:12, sat:8, users:120, unlock:70 },
  { key:'notifications', name:'Notifications smart', cost:900, rep:15, sat:4, users:220, unlock:150 },
  { key:'ai', name:'Assistant IA', cost:2600, rep:24, sat:12, users:740, unlock:450 },
  { key:'teamspace', name:'Collaboration équipe', cost:5200, rep:34, sat:18, users:1600, unlock:900 },
  { key:'marketplace', name:'Marketplace', cost:12000, rep:56, sat:16, users:4100, unlock:2200 },
  { key:'enterprise', name:'Suite enterprise', cost:42000, rep:95, sat:18, users:12000, unlock:8000 },
  { key:'globalai', name:'IA multi-agent', cost:125000, rep:180, sat:22, users:34000, unlock:22000 },
];

const CAMPAIGNS = [
  { key:'social', name:'Réseaux sociaux', cost:80, users:35, rep:1, unlock:0, desc:'Campagne légère, idéale au début.' },
  { key:'influencer', name:'Influenceurs', cost:450, users:210, rep:4, unlock:70, desc:'Boost de croissance très correct.' },
  { key:'seo', name:'SEO agressif', cost:1500, users:900, rep:8, unlock:200, desc:'Croissance durable sur plusieurs cycles.' },
  { key:'tv', name:'Campagne média', cost:7600, users:5200, rep:18, unlock:1500, desc:'Très cher, mais grosse visibilité.' },
  { key:'global', name:'Lancement global', cost:38000, users:28000, rep:40, unlock:11000, desc:'Scale brutalement la startup.' },
];

const MARKETS = [
  { key:'fr', name:'France', cost:0, multiplier:1, unlock:0, desc:'Ton marché de départ.' },
  { key:'eu', name:'Europe', cost:1600, multiplier:1.3, unlock:200, desc:'Plus de volume, plus d’exigence.' },
  { key:'us', name:'États-Unis', cost:9000, multiplier:1.8, unlock:1500, desc:'Très rentable si ton produit tient la route.' },
  { key:'asia', name:'Asie', cost:30000, multiplier:2.3, unlock:10000, desc:'Massif mais demande de la stabilité.' },
];

const SERVERS = [
  { tier:1, name:'VPS bricolé', cost:0, capacity:120, burn:0 },
  { tier:2, name:'Cloud modeste', cost:500, capacity:850, burn:2 },
  { tier:3, name:'Cluster scalable', cost:2500, capacity:5000, burn:7 },
  { tier:4, name:'Infra mondiale', cost:12000, capacity:24000, burn:20 },
  { tier:5, name:'Infra hyperscale', cost:55000, capacity:110000, burn:60 },
  { tier:6, name:'Data centers premium', cost:250000, capacity:500000, burn:180 },
];

const FUNDING_ROUNDS = [
  { key:'love', name:'Friends & Family', minValuation:0, cash:1200, dilution:8, unlockUsers:20 },
  { key:'angel', name:'Angel', minValuation:8000, cash:9000, dilution:12, unlockUsers:120 },
  { key:'seed', name:'Seed', minValuation:60000, cash:60000, dilution:15, unlockUsers:800 },
  { key:'seriesa', name:'Series A', minValuation:450000, cash:350000, dilution:18, unlockUsers:6000 },
  { key:'seriesb', name:'Series B', minValuation:3200000, cash:2400000, dilution:20, unlockUsers:35000 },
];

const MISSIONS = [
  { key:'firstUsers', title:'Atteindre 100 utilisateurs', check:s=>s.users>=100, reward:s=>{s.money+=250; s.reputation+=8;} , desc:'Les premiers utilisateurs valident ton idée.'},
  { key:'firstRevenue', title:'Gagner 1 000 €', check:s=>s.totalEarned>=1000, reward:s=>{s.money+=500; s.hype+=5;}, desc:'Tu prouves que le business peut tourner.'},
  { key:'hire5', title:'Recruter 5 employés', check:s=>totalTeam(s)>=5, reward:s=>{s.money+=1200; s.morale+=8;}, desc:'Tu commences à devenir une vraie boîte.'},
  { key:'openUS', title:'Ouvrir les USA', check:s=>s.unlockedMarkets.includes('us'), reward:s=>{s.money+=5000; s.reputation+=12;}, desc:'Ton produit passe à l’échelle mondiale.'},
  { key:'mrr', title:'Atteindre 10 000 € de MRR', check:s=>calcMRR(s)>=10000, reward:s=>{s.money+=10000; s.prestigeShards+=1;}, desc:'Ta startup commence à faire très mal.'},
  { key:'million', title:'Générer 1M € au total', check:s=>s.totalEarned>=1000000, reward:s=>{s.money+=60000; s.prestigeShards+=3;}, desc:'Tu tiens une fusée.'},
];

const ACHIEVEMENTS = [
  { key:'bugs100', label:'Bug factory', check:s=>s.bugs>=100 },
  { key:'rich', label:'Cash king', check:s=>s.money>=100000 },
  { key:'famous', label:'Marque culte', check:s=>s.reputation>=250 },
  { key:'team20', label:'Équipe sérieuse', check:s=>totalTeam(s)>=20 },
  { key:'prestiger', label:'Visionnaire', check:s=>s.prestigePoints>=1 },
  { key:'scale', label:'Hypercroissance', check:s=>s.users>=100000 },
];

const defaultState = () => ({
  version: APP_VERSION,
  startupName: 'NovaForge',
  founderLevel: 1,
  xp: 0,
  prestigePoints: 0,
  prestigeShards: 0,
  money: 300,
  users: 8,
  activeUsers: 5,
  reputation: 5,
  hype: 0,
  morale: 100,
  satisfaction: 100,
  bugs: 0,
  churnBase: 0.02,
  monetization: 1,
  dilution: 0,
  totalEarned: 0,
  totalRaised: 0,
  campaignsRun: 0,
  featuresBuilt: [],
  campaignBoostTicks: 0,
  seoTicks: 0,
  team: { dev:1, marketer:0, designer:0, support:0, sales:0, ops:0 },
  builtFeatures: 0,
  unlockedMarkets: ['fr'],
  serverTier: 1,
  roundsTaken: [],
  missionsDone: [],
  achievements: [],
  eventLog: [],
  lastTick: nowTs(),
  lastSave: nowTs(),
  theme: localStorage.getItem(THEME_KEY) || 'dark',
});

let state = loadGame();
let deferredPrompt = null;
let toastTimer = null;

function loadGame(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return Object.assign(defaultState(), parsed, {
      team: Object.assign(defaultState().team, parsed.team || {}),
      unlockedMarkets: parsed.unlockedMarkets || ['fr'],
      featuresBuilt: parsed.featuresBuilt || [],
      roundsTaken: parsed.roundsTaken || [],
      missionsDone: parsed.missionsDone || [],
      achievements: parsed.achievements || [],
      eventLog: parsed.eventLog || [],
    });
  } catch {
    return defaultState();
  }
}

function saveGame(show=false){
  state.lastSave = nowTs();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if(show) toast('💾 Partie sauvegardée');
}

function totalTeam(s=state){ return Object.values(s.team).reduce((a,b)=>a+b,0); }
function devPower(s=state){ return s.team.dev*1.2 + s.team.designer*0.2 + s.prestigePoints*0.35 + s.builtFeatures*0.12; }
function marketingPower(s=state){ return s.team.marketer*1.1 + s.team.sales*0.5 + marketMultiplier(s) + s.hype*0.02 + s.prestigePoints*0.2; }
function supportPower(s=state){ return s.team.support*1.2 + s.team.designer*0.25 + s.prestigePoints*0.15; }
function opsPower(s=state){ return s.team.ops*1.4 + s.prestigePoints*0.1; }
function salesPower(s=state){ return s.team.sales*1.35 + s.team.marketer*0.2 + s.prestigePoints*0.18; }
function marketMultiplier(s=state){ return s.unlockedMarkets.reduce((sum, key)=> sum + ((MARKETS.find(m=>m.key===key)?.multiplier || 1)-1), 1); }
function serverCap(s=state){ return SERVERS.find(x=>x.tier===s.serverTier).capacity * (1 + s.prestigePoints*0.03); }
function calcMRR(s=state){
  const conversion = calcConversion(s);
  const arpu = 3 + salesPower(s)*0.25 + s.monetization*1.8 + s.builtFeatures*0.35;
  return Math.max(0, s.users * conversion * arpu / 20);
}
function calcConversion(s=state){
  return clamp(0.03 + s.reputation/1000 + s.team.designer*0.003 + s.team.marketer*0.002 + s.hype/500, 0.03, 0.42);
}
function calcChurn(s=state){
  return clamp(s.churnBase + s.bugs*0.00055 + Math.max(0, 70 - s.satisfaction)*0.0008 - supportPower(s)*0.0012, 0.002, 0.25);
}
function calcBurn(s=state){
  const salaries = s.team.dev*3 + s.team.marketer*3.4 + s.team.designer*3 + s.team.support*2.8 + s.team.sales*4.5 + s.team.ops*4;
  const infra = SERVERS.find(x=>x.tier===s.serverTier).burn;
  const moralePenalty = s.morale < 45 ? 2 : 0;
  return salaries + infra + moralePenalty;
}
function calcGrowth(s=state){
  let base = 0.2 + marketingPower(s)*0.8 + s.reputation*0.05 + s.hype*0.06 + s.builtFeatures*0.12;
  if (s.campaignBoostTicks > 0) base *= 1.6;
  if (s.seoTicks > 0) base *= 1.35;
  const serverPenalty = loadRatio(s) > 1 ? Math.max(0.15, 1.5 - loadRatio(s)) : 1;
  const satisfactionBoost = clamp(s.satisfaction/100, 0.4, 1.25);
  return base * serverPenalty * satisfactionBoost;
}
function loadRatio(s=state){ return s.users / Math.max(1, serverCap(s)); }
function valuation(s=state){
  const mrr = calcMRR(s);
  return Math.round((mrr*18 + s.users*2 + s.reputation*350 + s.hype*500) * (1 + s.prestigePoints*0.03));
}
function runwaySecs(s=state){
  const cf = netPerSec(s);
  if (cf >= 0) return Infinity;
  return s.money / Math.abs(cf);
}
function netPerSec(s=state){ return calcMRR(s)/30 - calcBurn(s); }
function prestigeGainForecast(s=state){ return Math.floor(Math.sqrt(Math.max(0, s.totalEarned))/450 + s.prestigeShards + s.users/25000 + s.reputation/120); }

function applyOfflineProgress(){
  const diff = Math.floor((nowTs() - state.lastTick)/1000);
  if (diff <= 1) return;
  const capped = Math.min(diff, 60*60*8);
  for (let i=0;i<capped;i++) simulateTick(false);
  toast(`⏳ Progression hors ligne: ${formatDuration(capped)}`);
  addEvent(`Retour hors ligne`, `Ta startup a tourné pendant ${formatDuration(capped)}.`);
}

function simulateTick(update=true){
  const growth = calcGrowth();
  const churn = calcChurn();
  const mrrPerSec = calcMRR()/30;
  const burn = calcBurn();

  let userGain = growth;
  userGain -= state.users * churn * 0.025;
  userGain = Math.max(-state.users*0.1, userGain);
  state.users = Math.max(0, state.users + userGain);
  state.activeUsers = Math.max(0, Math.round(state.users * clamp(0.3 + state.satisfaction/140 + state.hype/300, 0.18, 0.92)));

  const deltaMoney = mrrPerSec - burn;
  state.money += deltaMoney;
  state.totalEarned += Math.max(0, mrrPerSec);

  const bugChange = 0.08 + state.team.dev*0.02 + Math.max(0, loadRatio()-1)*0.8 - state.team.ops*0.06 - state.team.support*0.03 - state.team.dev*0.05;
  state.bugs = Math.max(0, state.bugs + bugChange);

  state.satisfaction = clamp(state.satisfaction + state.team.designer*0.08 + state.team.support*0.1 - state.bugs*0.02 - Math.max(0, loadRatio()-1)*1.6, 0, 100);
  state.reputation = clamp(state.reputation + state.satisfaction*0.004 - state.bugs*0.015 + state.hype*0.002 - Math.max(0, loadRatio()-1)*0.4, 0, 999);
  state.morale = clamp(state.morale + 0.02 - totalTeam()*0.01 - (state.bugs>50?0.2:0) + (state.money>0?0.03:-0.06), 0, 100);
  state.hype = clamp(state.hype - 0.035, 0, 300);
  if (state.campaignBoostTicks > 0) state.campaignBoostTicks--;
  if (state.seoTicks > 0) state.seoTicks--;

  state.xp += 0.5 + totalTeam()*0.05 + state.users/6000;
  if (state.xp >= state.founderLevel * 120) {
    state.xp = 0;
    state.founderLevel++;
    state.money += state.founderLevel * 90;
    toast(`⭐ Niveau ${state.founderLevel} atteint`);
  }

  if (Math.random() < 0.005) triggerRandomEvent();
  if (state.money < -5000) {
    state.money = -5000;
    state.morale = clamp(state.morale - 5, 0, 100);
  }

  checkMissions();
  checkAchievements();
  state.lastTick = nowTs();
  if(update) render();
}

function triggerRandomEvent(){
  const events = [
    { title:'Tweet viral', effect:()=>{ state.hype += 12; state.users += 150; state.reputation += 3; }, msg:'Un créateur parle de ton produit, ça convertit fort.'},
    { title:'Gros bug prod', effect:()=>{ state.bugs += 18; state.satisfaction -= 8; }, msg:'Déploiement un peu trop ambitieux.'},
    { title:'Avis 5 étoiles', effect:()=>{ state.reputation += 7; state.satisfaction += 4; }, msg:'Les utilisateurs adorent la dernière version.'},
    { title:'Candidat exceptionnel', effect:()=>{ state.money += 300; state.morale += 6; }, msg:'Une opportunité de recrutement te fait gagner du temps et de l’argent.'},
    { title:'Pic serveur', effect:()=>{ state.bugs += 6; state.users += 80; }, msg:'Ça pousse vite, mais l’infra souffre.'},
  ];
  const e = events[Math.floor(Math.random()*events.length)];
  e.effect();
  addEvent(e.title, e.msg);
}

function addEvent(title, body){
  state.eventLog.unshift({ title, body, ts: nowTs() });
  state.eventLog = state.eventLog.slice(0, 30);
}

function checkMissions(){
  MISSIONS.forEach(m=>{
    if (!state.missionsDone.includes(m.key) && m.check(state)) {
      state.missionsDone.push(m.key);
      m.reward(state);
      addEvent(`Mission validée: ${m.title}`, m.desc);
      toast(`✅ ${m.title}`);
    }
  });
}

function checkAchievements(){
  ACHIEVEMENTS.forEach(a=>{
    if (!state.achievements.includes(a.key) && a.check(state)) {
      state.achievements.push(a.key);
      addEvent(`Succès débloqué: ${a.label}`, 'Tu renforces le mythe de ta startup.');
      toast(`🏆 ${a.label}`);
    }
  });
}

function hire(type){
  const spec = HIRE_TYPES.find(h=>h.key===type);
  const owned = state.team[type];
  const cost = Math.round(spec.baseCost * Math.pow(1.18, owned));
  if (state.money < cost) return toast('Pas assez de cash');
  state.money -= cost;
  state.team[type]++;
  state.morale = clamp(state.morale - 1, 0, 100);
  addEvent(`Recrutement: ${spec.name}`, `${spec.emoji} +1 ${spec.name.toLowerCase()}.`);
  render();
}

function buildFeature(key){
  const f = FEATURES.find(x=>x.key===key);
  if (state.featuresBuilt.includes(key)) return;
  if (state.users < f.unlock) return toast('Pas encore assez d’utilisateurs');
  const cost = Math.round(f.cost * (1 - Math.min(0.35, state.team.dev*0.01)));
  if (state.money < cost) return toast('Pas assez de cash');
  state.money -= cost;
  state.featuresBuilt.push(key);
  state.builtFeatures++;
  state.reputation += f.rep;
  state.satisfaction = clamp(state.satisfaction + f.sat, 0, 100);
  state.users += f.users;
  state.hype += 6;
  state.bugs += Math.max(1, Math.round(f.cost/600));
  addEvent(`Feature livrée: ${f.name}`, 'La roadmap avance et le marché réagit bien.');
  render();
}

function runCampaign(key){
  const c = CAMPAIGNS.find(x=>x.key===key);
  if (state.users < c.unlock) return toast('Trop tôt pour cette campagne');
  if (state.money < c.cost) return toast('Pas assez de cash');
  state.money -= c.cost;
  state.users += c.users * (1 + state.team.marketer*0.06);
  state.hype += c.rep * 1.5;
  state.reputation += c.rep;
  state.campaignsRun++;
  if (key === 'seo') state.seoTicks += 220;
  else state.campaignBoostTicks += 90;
  addEvent(`Campagne: ${c.name}`, c.desc);
  render();
}

function unlockMarket(key){
  const m = MARKETS.find(x=>x.key===key);
  if (state.unlockedMarkets.includes(key)) return;
  if (state.users < m.unlock) return toast('Pas assez d’utilisateurs');
  if (state.money < m.cost) return toast('Pas assez de cash');
  state.money -= m.cost;
  state.unlockedMarkets.push(key);
  state.reputation += 8;
  state.hype += 10;
  addEvent(`Nouveau marché: ${m.name}`, 'La startup passe à une nouvelle échelle.');
  render();
}

function upgradeServer(tier){
  if (tier !== state.serverTier + 1) return;
  const s = SERVERS.find(x=>x.tier===tier);
  if (!s) return;
  if (state.money < s.cost) return toast('Pas assez de cash');
  state.money -= s.cost;
  state.serverTier = tier;
  state.reputation += 5;
  addEvent(`Infra améliorée`, `Tu passes à ${s.name}.`);
  render();
}

function takeFunding(key){
  const r = FUNDING_ROUNDS.find(x=>x.key===key);
  if (!r || state.roundsTaken.includes(key)) return;
  if (valuation() < r.minValuation || state.users < r.unlockUsers) return toast('Startup pas assez mature');
  state.money += r.cash;
  state.totalRaised += r.cash;
  state.dilution += r.dilution;
  state.roundsTaken.push(key);
  state.hype += 18;
  state.reputation += 10;
  addEvent(`Levée: ${r.name}`, `+${fmtMoney(r.cash)} contre ${r.dilution}% de dilution.`);
  render();
}

function shipFeatureAction(){
  const candidates = FEATURES.filter(f=>!state.featuresBuilt.includes(f.key) && state.users >= f.unlock);
  if (!candidates.length) return toast('Aucune feature dispo pour maintenant');
  buildFeature(candidates[0].key);
}
function launchCampaignAction(){
  const cands = [...CAMPAIGNS].filter(c=>state.users >= c.unlock).sort((a,b)=>b.cost-a.cost);
  if (!cands.length) return toast('Pas encore de campagne disponible');
  runCampaign(cands[0].key);
}
function pitchInvestorAction(){
  const cands = FUNDING_ROUNDS.filter(r=>!state.roundsTaken.includes(r.key) && valuation() >= r.minValuation && state.users >= r.unlockUsers);
  if (!cands.length) return toast('Aucun investisseur prêt pour le moment');
  takeFunding(cands[0].key);
}
function fixBugsAction(){
  const cost = Math.max(40, Math.round(state.bugs * 4));
  if (state.money < cost) return toast('Pas assez de cash');
  state.money -= cost;
  state.bugs = Math.max(0, state.bugs - (20 + state.team.dev*2 + state.team.ops*4));
  state.satisfaction = clamp(state.satisfaction + 6, 0, 100);
  addEvent('Hotfix', 'La prod retrouve un peu de calme.');
  render();
}
function teamBuilding(){
  if (state.money < 300) return toast('Pas assez de cash');
  state.money -= 300;
  state.morale = clamp(state.morale + 18, 0, 100);
  state.satisfaction = clamp(state.satisfaction + 2, 0, 100);
  addEvent('Team building', 'Pizza, memes et regain de motivation.');
  render();
}
function crunchMode(){
  state.bugs += 10;
  state.morale = clamp(state.morale - 20, 0, 100);
  state.satisfaction = clamp(state.satisfaction - 4, 0, 100);
  state.hype += 6;
  state.users += 120;
  addEvent('Mode crunch', 'Tu livres plus vite, mais l’équipe le sent passer.');
  render();
}
function monetize(){
  const cost = 1500 + state.monetization*1200;
  if (state.money < cost) return toast('Pas assez de cash');
  state.money -= cost;
  state.monetization += 1;
  state.satisfaction = clamp(state.satisfaction - 3, 0, 100);
  addEvent('Monétisation optimisée', 'Le revenu par utilisateur monte.');
  render();
}
function emergencyBridge(){
  if (state.roundsTaken.includes('bridge-' + state.founderLevel)) return toast('Déjà utilisé pour ce niveau');
  state.money += 25000;
  state.dilution += 9;
  state.roundsTaken.push('bridge-' + state.founderLevel);
  state.reputation = clamp(state.reputation - 8, 0, 999);
  addEvent('Pont d’urgence', 'Tu gagnes du temps, mais le marché le sent.');
  render();
}

function doPrestige(){
  const gain = prestigeGainForecast();
  if (gain < 1) return toast('Pas encore assez avancé pour prestige');
  if (!confirm(`Relancer une startup contre ${gain} point(s) de prestige ?`)) return;
  const theme = state.theme;
  state = defaultState();
  state.prestigePoints += gain;
  state.theme = theme;
  state.money += gain * 120;
  state.reputation += gain * 2;
  state.team.dev = 1;
  addEvent('Nouvelle aventure', 'Tu repars avec une expérience fondatrice permanente.');
  saveGame();
  applyTheme();
  render();
}

function render(){
  $('startupNameInput').value = state.startupName;
  $('founderLevel').textContent = `Niveau ${state.founderLevel}`;
  $('prestigePts').textContent = fmtNum(state.prestigePoints);
  $('moneyVal').textContent = fmtMoney(state.money);
  $('usersVal').textContent = fmtNum(state.users);
  $('reputationVal').textContent = fmtNum(state.reputation);
  $('hypeVal').textContent = `Hype ${state.hype.toFixed(0)}`;
  $('cashflowVal').textContent = `${netPerSec() >=0?'+':''}${netPerSec().toFixed(1)} €/s`;
  $('growthVal').textContent = `+${calcGrowth().toFixed(1)}/s`;
  $('burnVal').textContent = `${calcBurn().toFixed(1)} €/s`;
  $('runwayVal').textContent = runwaySecs()===Infinity ? 'Runway ∞' : `Runway ${formatDuration(runwaySecs())}`;
  $('satisfactionLabel').textContent = `${state.satisfaction.toFixed(0)}%`;
  $('serverLoadLabel').textContent = `${(loadRatio()*100).toFixed(0)}%`;
  $('bugsLabel').textContent = `${Math.floor(state.bugs)}`;
  $('satisfactionBar').style.width = `${state.satisfaction}%`;
  $('serverLoadBar').style.width = `${Math.min(100, loadRatio()*100)}%`;
  $('bugsBar').style.width = `${Math.min(100, state.bugs)}%`;
  $('teamSizeLabel').textContent = `${totalTeam()} employés`;
  $('moraleLabel').textContent = `${state.morale.toFixed(0)}%`;
  $('featuresBuiltLabel').textContent = `${state.builtFeatures} features`;
  $('serverTierLabel').textContent = `Niveau ${state.serverTier}`;
  $('campaignsRunLabel').textContent = `${state.campaignsRun} campagnes`;
  $('marketsOpenLabel').textContent = `${state.unlockedMarkets.length} marché${state.unlockedMarkets.length>1?'s':''}`;
  $('fundingTotalLabel').textContent = fmtMoney(state.totalRaised);
  $('missionsDoneLabel').textContent = `${state.missionsDone.length} validée${state.missionsDone.length>1?'s':''}`;
  $('achievementsCount').textContent = fmtNum(state.achievements.length);
  $('mrrVal').textContent = fmtMoney(calcMRR());
  $('churnVal').textContent = `${(calcChurn()*100).toFixed(1)}%`;
  $('conversionVal').textContent = `${(calcConversion()*100).toFixed(1)}%`;
  $('valuationVal').textContent = fmtMoney(valuation());
  $('analyticsSummary').textContent = netPerSec() >= 0 ? 'Croissance rentable' : 'Besoin d’optimisation';
  $('financeHealthLabel').textContent = state.money >= 0 && netPerSec()>=0 ? 'Très solide' : state.money >= 0 ? 'Sous contrôle' : 'Fragile';
  $('prestigeForecast').textContent = `+${prestigeGainForecast()} points`;
  $('onlineBadge').textContent = navigator.onLine ? '🟢 En ligne' : '🟠 Hors ligne';
  $('stageBadge').textContent = state.users < 100 ? 'Garage' : state.users < 1000 ? 'Incubée' : state.users < 10000 ? 'En scale' : state.users < 100000 ? 'Scale-up' : 'Licorne';
  $('eventMoodLabel').textContent = state.hype > 50 ? 'Très chaud' : state.bugs > 50 ? 'Sous tension' : 'Neutre';

  renderMissions(); renderAchievements(); renderEvents(); renderHireCards(); renderTeamStats(); renderFeatures(); renderServers(); renderCampaigns(); renderMarkets(); renderFunding(); renderFinanceStats(); renderPrestigeStats(); renderMetaStats();

  saveGame();
}

function renderMissions(){
  $('missionsList').innerHTML = MISSIONS.map(m=>{
    const done = state.missionsDone.includes(m.key);
    return `<div class="line-item"><div class="line-item-top"><div><h3>${done?'✅':'🎯'} ${m.title}</h3><p>${m.desc}</p></div><span class="pill">${done?'Validée':'En cours'}</span></div></div>`;
  }).join('');
}
function renderAchievements(){
  $('achievementsList').innerHTML = ACHIEVEMENTS.map(a=>`<div class="line-item"><div class="line-item-top"><div><h3>${state.achievements.includes(a.key)?'🏆':'🔒'} ${a.label}</h3></div><span class="pill">${state.achievements.includes(a.key)?'Débloqué':'Verrouillé'}</span></div></div>`).join('');
}
function renderEvents(){
  $('eventLog').innerHTML = state.eventLog.length ? state.eventLog.map(e=>`<div class="timeline-item"><strong>${e.title}</strong><div>${e.body}</div><small>${new Date(e.ts).toLocaleString('fr-FR')}</small></div>`).join('') : `<div class="timeline-item">Ton histoire de startup commence maintenant.</div>`;
}
function renderHireCards(){
  $('hireCards').innerHTML = HIRE_TYPES.map(h=>{
    const owned = state.team[h.key];
    const cost = Math.round(h.baseCost * Math.pow(1.18, owned));
    return `<div class="action-card"><div class="action-card-top"><div><h3>${h.emoji} ${h.name}</h3><p>${h.desc}</p></div><strong class="cost">${fmtMoney(cost)}</strong></div><div class="card-actions"><span class="mini">Possédés: ${owned} · ${h.effect}</span><button class="btn secondary" data-hire="${h.key}">Recruter</button></div></div>`;
  }).join('');
  document.querySelectorAll('[data-hire]').forEach(btn=>btn.onclick=()=>hire(btn.dataset.hire));
}
function renderTeamStats(){
  $('teamStats').innerHTML = [
    ['Productivité dev', devPower().toFixed(1)],
    ['Force marketing', marketingPower().toFixed(1)],
    ['Support client', supportPower().toFixed(1)],
    ['Stabilité ops', opsPower().toFixed(1)],
    ['Moral équipe', `${state.morale.toFixed(0)}%`],
  ].map(([a,b])=>`<div class="stat-row"><span>${a}</span><strong>${b}</strong></div>`).join('');
}
function renderFeatures(){
  $('featureCards').innerHTML = FEATURES.map(f=>{
    const built = state.featuresBuilt.includes(f.key);
    const cost = Math.round(f.cost * (1 - Math.min(0.35, state.team.dev*0.01)));
    const locked = state.users < f.unlock;
    return `<div class="action-card"><div class="action-card-top"><div><h3>${built?'✅':'🧩'} ${f.name}</h3><p>+${f.rep} réputation · +${f.sat}% satisfaction · +${fmtNum(f.users)} users</p></div><strong class="cost">${fmtMoney(cost)}</strong></div><div class="card-actions"><span class="mini">${locked?`Débloque à ${fmtNum(f.unlock)} users`: built?'Déjà construite':'Disponible'}</span><button class="btn secondary" ${built||locked?'disabled':''} data-feature="${f.key}">${built?'Construite':'Construire'}</button></div></div>`;
  }).join('');
  document.querySelectorAll('[data-feature]').forEach(btn=>btn.onclick=()=>buildFeature(btn.dataset.feature));
}
function renderServers(){
  $('serverCards').innerHTML = SERVERS.map(s=>{
    const current = s.tier===state.serverTier;
    const next = s.tier===state.serverTier+1;
    return `<div class="action-card"><div class="action-card-top"><div><h3>${current?'🟢':'🖥'} ${s.name}</h3><p>Capacité ${fmtNum(s.capacity)} users · Burn ${s.burn}/s</p></div><strong class="cost">${s.cost?fmtMoney(s.cost):'Inclus'}</strong></div><div class="card-actions"><span class="mini">${current?'En production': next?'Prochaine amélioration':'Verrouillé'}</span><button class="btn secondary" ${!next?'disabled':''} data-server="${s.tier}">Upgrade</button></div></div>`;
  }).join('');
  document.querySelectorAll('[data-server]').forEach(btn=>btn.onclick=()=>upgradeServer(Number(btn.dataset.server)));
}
function renderCampaigns(){
  $('campaignCards').innerHTML = CAMPAIGNS.map(c=>`<div class="action-card"><div class="action-card-top"><div><h3>📣 ${c.name}</h3><p>${c.desc}</p></div><strong class="cost">${fmtMoney(c.cost)}</strong></div><div class="card-actions"><span class="mini">+${fmtNum(c.users)} users · débloque à ${fmtNum(c.unlock)}</span><button class="btn secondary" ${state.users < c.unlock ? 'disabled':''} data-campaign="${c.key}">Lancer</button></div></div>`).join('');
  document.querySelectorAll('[data-campaign]').forEach(btn=>btn.onclick=()=>runCampaign(btn.dataset.campaign));
}
function renderMarkets(){
  $('marketCards').innerHTML = MARKETS.map(m=>{
    const open = state.unlockedMarkets.includes(m.key);
    return `<div class="action-card"><div class="action-card-top"><div><h3>🌍 ${m.name}</h3><p>${m.desc}</p></div><strong class="cost">${m.cost?fmtMoney(m.cost):'Ouvert'}</strong></div><div class="card-actions"><span class="mini">x${m.multiplier.toFixed(1)} croissance · ${fmtNum(m.unlock)} users</span><button class="btn secondary" ${open||state.users<m.unlock?'disabled':''} data-market="${m.key}">${open?'Ouvert':'Débloquer'}</button></div></div>`;
  }).join('');
  document.querySelectorAll('[data-market]').forEach(btn=>btn.onclick=()=>unlockMarket(btn.dataset.market));
}
function renderFunding(){
  $('fundingCards').innerHTML = FUNDING_ROUNDS.map(r=>{
    const taken = state.roundsTaken.includes(r.key);
    const ready = valuation() >= r.minValuation && state.users >= r.unlockUsers;
    return `<div class="action-card"><div class="action-card-top"><div><h3>💸 ${r.name}</h3><p>Valo mini ${fmtMoney(r.minValuation)} · ${fmtNum(r.unlockUsers)} users</p></div><strong class="cost">${fmtMoney(r.cash)}</strong></div><div class="card-actions"><span class="mini">Dilution ${r.dilution}%</span><button class="btn secondary" ${taken||!ready?'disabled':''} data-funding="${r.key}">${taken?'Pris':'Lever'}</button></div></div>`;
  }).join('');
  document.querySelectorAll('[data-funding]').forEach(btn=>btn.onclick=()=>takeFunding(btn.dataset.funding));
}
function renderFinanceStats(){
  $('financeStats').innerHTML = [
    ['MRR', fmtMoney(calcMRR())],
    ['Burn rate', `${calcBurn().toFixed(1)} €/s`],
    ['Cashflow net', `${netPerSec()>=0?'+':''}${netPerSec().toFixed(1)} €/s`],
    ['Dilution', `${state.dilution.toFixed(0)}%`],
    ['Valorisation', fmtMoney(valuation())],
  ].map(([a,b])=>`<div class="stat-row"><span>${a}</span><strong>${b}</strong></div>`).join('');
}
function renderPrestigeStats(){
  $('prestigeStats').innerHTML = [
    ['Points actuels', fmtNum(state.prestigePoints)],
    ['Gain estimé', `+${prestigeGainForecast()}`],
    ['Bonus croissance', `+${(state.prestigePoints*3).toFixed(0)}%`],
    ['Bonus dev', `+${(state.prestigePoints*0.35).toFixed(1)}`],
  ].map(([a,b])=>`<div class="stat-row"><span>${a}</span><strong>${b}</strong></div>`).join('');
}
function renderMetaStats(){
  $('metaStats').innerHTML = [
    ['Version', APP_VERSION],
    ['Sauvegarde locale', 'Active'],
    ['Dernière sauvegarde', new Date(state.lastSave).toLocaleTimeString('fr-FR')],
    ['Temps de survie', formatDuration((nowTs()-state.lastTick)/1000)],
  ].map(([a,b])=>`<div class="stat-row"><span>${a}</span><strong>${b}</strong></div>`).join('');
}

function renameStartup(){
  const name = $('startupNameInput').value.trim();
  if (!name) return toast('Nom invalide');
  state.startupName = name;
  toast('Nom mis à jour');
  render();
}
function exportSave(){
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${state.startupName.toLowerCase().replace(/[^a-z0-9]+/gi,'-') || 'idle-founder'}-save.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
function importSave(file){
  const fr = new FileReader();
  fr.onload = () => {
    try {
      const parsed = JSON.parse(fr.result);
      state = Object.assign(defaultState(), parsed);
      saveGame();
      applyTheme();
      render();
      toast('Import réussi');
    } catch {
      toast('Fichier invalide');
    }
  };
  fr.readAsText(file);
}
function resetAll(){
  if (!confirm('Supprimer toute la progression ?')) return;
  state = defaultState();
  saveGame();
  applyTheme();
  render();
}

function formatDuration(sec){
  if (sec === Infinity) return '∞';
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec/3600); const m = Math.floor((sec%3600)/60); const s = sec%60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s}s`;
  return `${s}s`;
}
function toast(msg){
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show-toast');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>el.classList.remove('show-toast'), 2200);
}
function applyTheme(){
  document.documentElement.setAttribute('data-theme', state.theme);
  $('themeColorMeta').content = state.theme === 'dark' ? '#0b1020' : '#eef3fb';
  localStorage.setItem(THEME_KEY, state.theme);
}
function toggleTheme(){ state.theme = state.theme === 'dark' ? 'light' : 'dark'; applyTheme(); render(); }

function bindUI(){
  document.querySelectorAll('.tab').forEach(btn=>btn.onclick=()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    $(btn.dataset.tab).classList.add('active');
  });
  $('renameBtn').onclick = renameStartup;
  $('shipFeatureBtn').onclick = shipFeatureAction;
  $('runCampaignBtn').onclick = launchCampaignAction;
  $('pitchInvestorBtn').onclick = pitchInvestorAction;
  $('fixBugsBtn').onclick = fixBugsAction;
  $('teamEventBtn').onclick = teamBuilding;
  $('crunchBtn').onclick = crunchMode;
  $('monetizeBtn').onclick = monetize;
  $('downRoundBtn').onclick = emergencyBridge;
  $('prestigeBtn').onclick = doPrestige;
  $('saveBtn').onclick = () => saveGame(true);
  $('exportBtn').onclick = exportSave;
  $('importBtn').onclick = () => $('importFile').click();
  $('importFile').onchange = e => e.target.files[0] && importSave(e.target.files[0]);
  $('themeBtn').onclick = toggleTheme;
  $('resetBtn').onclick = resetAll;
}

window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  $('installBtn').classList.remove('hidden');
});
$('installBtn')?.addEventListener('click', async()=>{
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  $('installBtn').classList.add('hidden');
});
window.addEventListener('appinstalled', ()=> toast('PWA installée 🎉'));
window.addEventListener('online', ()=> render());
window.addEventListener('offline', ()=> render());

if ('serviceWorker' in navigator) {
  window.addEventListener('load', ()=> navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}

bindUI();
applyTheme();
applyOfflineProgress();
render();
setInterval(()=>simulateTick(true), 1000);
setInterval(()=>saveGame(false), 15000);
