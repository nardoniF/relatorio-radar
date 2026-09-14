var kt=Object.defineProperty;var Lt=(t,e,a)=>e in t?kt(t,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):t[e]=a;var g=(t,e,a)=>Lt(t,typeof e!="symbol"?e+"":e,a);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function a(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=a(s);fetch(s.href,r)}})();const ct="radar_alert_distance_m",dt=[40,50,60,70,80,90,100,110,120];let V=null,ut=!1,T=!1,G=null,H=0,z=0,B=Tt(),M=null,b=null,I=!1;const nt=new Map;function Tt(){const t=localStorage.getItem(ct),e=t?Number(t):300;return Number.isFinite(e)?Math.min(1e3,Math.max(50,e)):300}function mt(){return B}function It(t){B=Math.min(1e3,Math.max(50,Math.round(t))),localStorage.setItem(ct,String(B))}function Ct(){const t="/relatorio-radar/";return t.endsWith("/")?t:`${t}/`}function W(t){return`${Ct()}voice/${t}`}function Pt(t){let e=60,a=1/0;for(const i of dt){const s=Math.abs(i-t);s<a&&(e=i,a=s)}return e}function Dt(t){return`baixa_${Pt(t)}.mp3`}function N(){if(!V){const t=window.AudioContext||window.webkitAudioContext;V=new t}return V}function Bt(){return M||(M=new Audio,M.setAttribute("playsinline","true"),M.setAttribute("webkit-playsinline","true"),M.preload="auto",M.volume=1),M}function Nt(){return b||(b=new Audio(W("silence.mp3")),b.setAttribute("playsinline","true"),b.loop=!0,b.volume=.01,b.preload="auto"),b}function Ot(){const t=N(),e=t.currentTime,a=t.createOscillator(),i=t.createGain();a.type="sine",a.frequency.value=880,i.gain.setValueAtTime(1e-4,e),i.gain.exponentialRampToValueAtTime(.16,e+.02),i.gain.exponentialRampToValueAtTime(1e-4,e+.12),a.connect(i),i.connect(t.destination),a.start(e),a.stop(e+.13)}function Ft(){const t=["monitoramento.mp3","multado.mp3",...dt.map(e=>`baixa_${e}.mp3`)];for(const e of t){if(nt.has(e))continue;const a=new Audio;a.setAttribute("playsinline","true"),a.preload="auto",a.src=W(e);try{a.load()}catch{}nt.set(e,a)}}function qt(t,e=12e3){return new Promise(a=>{let i=!1;const s=()=>{i||(i=!0,t.removeEventListener("ended",s),t.removeEventListener("error",s),a())};t.addEventListener("ended",s),t.addEventListener("error",s),window.setTimeout(s,e)})}async function Y(t){const e=Bt();I=!0;try{try{const a=N();a.state==="suspended"&&await a.resume()}catch{}return e.pause(),e.src=W(t),e.load(),e.currentTime=0,await e.play(),await qt(e),I=!1,!0}catch{return I=!1,!1}}async function Z(){const t=N();try{t.state==="suspended"&&t.resume()}catch{}if(Ot(),Ft(),!await Y("monitoramento.mp3"))try{if("speechSynthesis"in window){const a=new SpeechSynthesisUtterance("Monitoramento iniciado");a.lang="pt-BR",a.volume=1,window.speechSynthesis.speak(a)}}catch{}try{const a=Nt();a.currentTime=0,await a.play()}catch{}ut=!0,T=!0}function X(t=1.5,e=!1){if(!ut&&!e)return;const a=Date.now();if(!e&&a-z<2200)return;z=a;const i=N();i.state==="suspended"&&i.resume();const s=i.currentTime,r=i.createGain();r.gain.setValueAtTime(1e-4,s),r.gain.exponentialRampToValueAtTime(.38,s+.04),r.gain.exponentialRampToValueAtTime(1e-4,s+t),r.connect(i.destination);const o=i.createOscillator(),l=i.createOscillator();o.type="square",l.type="sawtooth",o.frequency.setValueAtTime(740,s),o.frequency.linearRampToValueAtTime(1100,s+.35),o.frequency.linearRampToValueAtTime(740,s+.7),o.frequency.linearRampToValueAtTime(1100,s+1.05),l.frequency.setValueAtTime(520,s);const d=i.createGain(),u=i.createGain();d.gain.value=.55,u.gain.value=.25,o.connect(d),l.connect(u),d.connect(r),u.connect(r),o.start(s),l.start(s),o.stop(s+t),l.stop(s+t)}async function pt(t,e=!1){!T&&!e||I&&!e||(H=Date.now(),await Y(Dt(t)))}async function Vt(t=!1){!T&&!t||(X(1.8,!0),await Y("multado.mp3"))}async function ht(t,e=!1){if(!(!T&&!e)&&"speechSynthesis"in window)try{window.speechSynthesis.cancel();const a=new SpeechSynthesisUtterance(t);a.lang="pt-BR",a.rate=.95,a.volume=1,window.speechSynthesis.speak(a)}catch{}}async function _t(t=60){await Z(),X(1.6,!0),await new Promise(e=>setTimeout(e,500)),await pt(t,!0)}function Gt(t,e){if(!t||!T||t.distanceM>B)return;const a=e>t.radar.limitKmh+.5;a&&X(1.5);const i=Date.now(),s=G!==t.radar.id,r=a&&i-H>7e3;(s||r)&&(G=t.radar.id,pt(t.radar.limitKmh))}function O(){if(G=null,z=0,H=0,"speechSynthesis"in window)try{window.speechSynthesis.cancel()}catch{}}function gt(){try{b==null||b.pause()}catch{}}const _=[{lat:-23.5614,lng:-46.6558},{lat:-23.5602,lng:-46.6525},{lat:-23.5588,lng:-46.6491},{lat:-23.5571,lng:-46.6458},{lat:-23.5554,lng:-46.6426},{lat:-23.5539,lng:-46.6395},{lat:-23.5526,lng:-46.6362},{lat:-23.5514,lng:-46.6328},{lat:-23.5505,lng:-46.6291},{lat:-23.5499,lng:-46.6254},{lat:-23.5496,lng:-46.6216},{lat:-23.5498,lng:-46.6179},{lat:-23.5504,lng:-46.6143},{lat:-23.5515,lng:-46.6109},{lat:-23.553,lng:-46.6078}],U=[{id:"r1",name:"Radar Consolação",lat:-23.5595,lng:-46.6508,limitKmh:50,alertRadiusM:220,passRadiusM:55},{id:"r2",name:"Radar Augusta",lat:-23.5558,lng:-46.6435,limitKmh:50,alertRadiusM:220,passRadiusM:55},{id:"r3",name:"Radar Higienópolis",lat:-23.5518,lng:-46.6345,limitKmh:40,alertRadiusM:200,passRadiusM:50},{id:"r4",name:"Radar Pacaembu",lat:-23.5497,lng:-46.6235,limitKmh:60,alertRadiusM:250,passRadiusM:60},{id:"r5",name:"Radar Sumaré",lat:-23.5508,lng:-46.6125,limitKmh:50,alertRadiusM:220,passRadiusM:55}],zt=6371e3;function w(t){return t*Math.PI/180}function L(t,e){const a=w(e.lat-t.lat),i=w(e.lng-t.lng),s=w(t.lat),r=w(e.lat),o=Math.sin(a/2)**2+Math.cos(s)*Math.cos(r)*Math.sin(i/2)**2;return 2*zt*Math.asin(Math.min(1,Math.sqrt(o)))}function st(t,e){const a=w(t.lat),i=w(e.lat),s=w(e.lng-t.lng),r=Math.sin(s)*Math.cos(i),o=Math.cos(a)*Math.sin(i)-Math.sin(a)*Math.cos(i)*Math.cos(s);return(Math.atan2(r,o)*180/Math.PI+360)%360}function it(t,e){if(t.length===0)return{point:{lat:0,lng:0},heading:0,totalLengthM:0};if(t.length===1)return{point:t[0],heading:0,totalLengthM:0};let a=Math.max(0,e),i=0;const s=[];for(let o=0;o<t.length-1;o++){const l=L(t[o],t[o+1]);s.push({a:t[o],b:t[o+1],len:l}),i+=l}if(a>=i){const o=s[s.length-1];return{point:o.b,heading:st(o.a,o.b),totalLengthM:i}}for(const o of s){if(a<=o.len){const l=o.len===0?0:a/o.len;return{point:{lat:o.a.lat+(o.b.lat-o.a.lat)*l,lng:o.a.lng+(o.b.lng-o.a.lng)*l},heading:st(o.a,o.b),totalLengthM:i}}a-=o.len}return{point:t[t.length-1],heading:0,totalLengthM:i}}function Ut(t){let e=0;for(let a=0;a<t.length-1;a++)e+=L(t[a],t[a+1]);return e}function f(t){return`${Math.round(t)}`}function ft(t){const e=Math.floor(t/1e3),a=Math.floor(e/60),i=Math.floor(a/60),s=a%60,r=e%60;return i>0?`${i}h ${String(s).padStart(2,"0")}m`:`${s}m ${String(r).padStart(2,"0")}s`}function C(t){return new Date(t).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}function jt(t){const e=t.samples.reduce((i,s)=>Math.max(i,s.speedKmh),0),a=t.passages.filter(i=>i.overLimit);return{mode:t.mode,startedAt:t.startedAt,endedAt:t.endedAt,durationMs:Math.max(0,t.endedAt-t.startedAt),maxSpeedKmh:e,samples:t.samples.length,passages:t.passages,overs:a}}function J(t){const e=["Relatório Radar",`Modo: ${t.mode==="sim"?"Simulação":"GPS real"}`,`Início: ${C(t.startedAt)}`,`Fim: ${C(t.endedAt)}`,`Duração: ${ft(t.durationMs)}`,`Vel. máx: ${f(t.maxSpeedKmh)} km/h`,`Radares passados: ${t.passages.length}`,`Acima do limite: ${t.overs.length}`,""];if(t.passages.length===0)e.push("Nenhuma passagem por radar registrada.");else for(const a of t.passages){const i=a.overLimit?"⚠️ ACIMA":"OK";e.push(`${i} · ${a.radar.name} · limite ${a.radar.limitKmh} · passou a ${f(a.speedKmh)} km/h`+(a.overLimit?` (+${f(a.excessKmh)})`:"")+` · ${C(a.passedAt)}`)}return e.join(`
`)}const vt="radar_report_email";function Q(){var t;return((t=localStorage.getItem(vt))==null?void 0:t.trim())??""}function P(t){localStorage.setItem(vt,t.trim())}function bt(t){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t.trim())}function yt(t){const e=t.overs.length,a=new Date(t.endedAt).toLocaleDateString("pt-BR");return e>0?`Relatório Radar ${a} — ${e} acima do limite`:`Relatório Radar ${a}`}function ot(t,e,a){return`mailto:${t}?subject=${encodeURIComponent(e)}&body=${encodeURIComponent(a)}`}function St(t,e){const a=Q().trim();if(!a||!bt(a))return!1;const i=J(t),s=yt(t);let r=ot(a,s,i);if(r.length>1800){const o=i.slice(0,1400)+`

…(relatório truncado; use Copiar relatório para o texto completo)`;r=ot(a,s,o)}return window.location.href=r,!0}async function Ht(t){const e=J(t),a=yt(t);if(navigator.share)try{return await navigator.share({title:a,text:e}),"share"}catch{}return St(t)?"mailto":"none"}function Wt(t){return t.speed!=null&&Number.isFinite(t.speed)&&t.speed>=0?t.speed*3.6:0}class Mt{constructor(e){g(this,"watchId",null);g(this,"last",null);this.cb=e}get lastSample(){return this.last}start(){if(!("geolocation"in navigator)){this.cb.onError("Geolocalização não disponível neste navegador.");return}if(!window.isSecureContext){this.cb.onError("Safari exige HTTPS para GPS. Abra o app via https://");return}this.cb.onStatus("Pedindo permissão de localização…"),this.watchId=navigator.geolocation.watchPosition(e=>{const a={lat:e.coords.latitude,lng:e.coords.longitude,speedKmh:Wt(e.coords),accuracyM:e.coords.accuracy??null,heading:e.coords.heading!=null&&Number.isFinite(e.coords.heading)?e.coords.heading:null,at:e.timestamp||Date.now()};this.last=a,this.cb.onStatus("GPS ativo"),this.cb.onSample(a)},e=>{const a={1:"Permissão de localização negada.",2:"Posição indisponível. Vá a um local aberto ou use Simular.",3:"Tempo esgotado ao obter GPS."};this.cb.onError(a[e.code]??e.message)},{enableHighAccuracy:!0,maximumAge:1e3,timeout:15e3})}stop(){this.watchId!=null&&(navigator.geolocation.clearWatch(this.watchId),this.watchId=null)}}let k=[],D={count:0,generatedAt:"",disclaimer:""},rt=!1;function Yt(){const t="/relatorio-radar/";return t.endsWith("/")?t:`${t}/`}function tt(){return D}async function et(){if(rt&&k.length>0)return D;const t=`${Yt()}data/sp_osm_speed_cameras.json`,e=await fetch(t);if(!e.ok)throw new Error(`Falha ao carregar radares (${e.status})`);const a=await e.json();return k=a.radars.map(i=>({id:i.id,name:i.name,lat:i.lat,lng:i.lng,limitKmh:i.limitKmh,alertRadiusM:i.alertRadiusM??280,passRadiusM:i.passRadiusM??70})),D={count:k.length,generatedAt:a.generatedAt,disclaimer:a.disclaimer},rt=!0,D}function Zt(t,e){return k.filter(a=>L(t,a)<=e)}function Xt(t,e,a=[]){const i=new Set(a),s=Zt(t,e);if(i.size===0)return s;const r=new Map(k.map(l=>[l.id,l])),o=[];for(const l of i)if(!s.some(d=>d.id===l)){const d=r.get(l);d&&o.push(d)}return s.concat(o)}class Jt{constructor(e){g(this,"approaches",new Map);g(this,"passages",[]);g(this,"lastAlert",null);this.radars=e}setRadars(e){this.radars=e}getRadars(){return this.radars}reset(){this.approaches.clear(),this.passages=[],this.lastAlert=null}getPassages(){return[...this.passages]}upcoming(e,a=3){const i=new Set(this.passages.map(s=>s.radar.id));return this.radars.filter(s=>!i.has(s.id)).map(s=>({radar:s,distanceM:L(e,s)})).sort((s,r)=>s.distanceM-r.distanceM).slice(0,a)}getAlert(){return this.lastAlert}update(e){let a=null,i=null;for(const s of this.radars){const r=L(e,s);let o=this.approaches.get(s.id);if(r<=s.alertRadiusM){const l=r<=s.passRadiusM*1.4?"imminent":r<=s.alertRadiusM*.55?"near":"far";(!a||r<a.distanceM)&&(a={radar:s,distanceM:r,level:l})}if(r<=s.passRadiusM)o?(o.entered=!0,r<o.closestM&&(o.closestM=r,o.speedAtClosest=e.speedKmh,o.atClosest=e.at)):(o={radar:s,entered:!0,closestM:r,speedAtClosest:e.speedKmh,atClosest:e.at},this.approaches.set(s.id,o));else if(o!=null&&o.entered){const l=Math.max(0,o.speedAtClosest-s.limitKmh),d={radar:s,passedAt:o.atClosest,speedKmh:o.speedAtClosest,overLimit:l>0,excessKmh:l,closestDistanceM:o.closestM};this.passages.push(d),this.approaches.delete(s.id),i=d}}return this.lastAlert=a,{alert:a,newPassage:i}}}class Qt{constructor(e){g(this,"raf",0);g(this,"startedAt",0);g(this,"distanceM",0);g(this,"speedKmh",90);g(this,"timeScale",4);g(this,"running",!1);g(this,"totalM",Ut(_));this.cb=e}setSpeedKmh(e){this.speedKmh=Math.max(10,Math.min(140,e))}getSpeedKmh(){return this.speedKmh}setTimeScale(e){this.timeScale=Math.max(1,Math.min(12,e))}getTimeScale(){return this.timeScale}start(){this.stop(),this.running=!0,this.startedAt=performance.now(),this.distanceM=0,this.cb.onStatus(`Simulação · ${Math.round(this.speedKmh)} km/h · ${this.timeScale}×`);let e=performance.now();const a=i=>{if(!this.running)return;const s=Math.min(.25,(i-e)/1e3*this.timeScale);e=i;const r=this.speedKmh/3.6;if(this.distanceM+=r*s,this.distanceM>=this.totalM){const{point:u,heading:y}=it(_,this.totalM);this.cb.onSample({lat:u.lat,lng:u.lng,speedKmh:this.speedKmh,accuracyM:5,heading:y,at:Date.now()}),this.running=!1,this.cb.onStatus("Simulação concluída"),this.cb.onFinished();return}const{point:o,heading:l}=it(_,this.distanceM),d=Math.sin((i-this.startedAt)/700)*.8;this.cb.onSample({lat:o.lat,lng:o.lng,speedKmh:Math.max(0,this.speedKmh+d),accuracyM:5,heading:l,at:Date.now()}),this.raf=requestAnimationFrame(a)};this.raf=requestAnimationFrame(a)}stop(){this.running=!1,this.raf&&cancelAnimationFrame(this.raf),this.raf=0}}const j=30,te=2500,wt="radar_auto_start",ee=document.querySelector("#app"),n={mode:"idle",startedAt:null,samples:[],passages:[],lastSample:null,alert:null,report:null,status:"Carregando radares reais de SP…",error:null,alertDistanceM:mt(),packCount:0,autoStart:localStorage.getItem(wt)==="1",watchingAuto:!1},p=new Jt(U);let R=null,c=null,$=null,K=null,E=!1;function $t(t,e){return e?t>e.radar.limitKmh+.5?"over":"ok":"idle"}function S(){var d,u;const t=((d=n.lastSample)==null?void 0:d.speedKmh)??0,e=((u=n.alert)==null?void 0:u.radar.limitKmh)??null,a=n.alert?Math.round(n.alert.distanceM):null,i=$t(t,n.alert),s=n.mode!=="idle"&&!n.report,r=!!n.report,o=n.alert!=null&&n.alert.distanceM<=n.alertDistanceM,l=n.lastSample!=null?p.upcoming(n.lastSample,3):p.getRadars().slice(0,3).map(y=>({radar:y,distanceM:NaN}));ee.innerHTML=`
    <div class="shell ${r?"report-open":""}">
      <header class="brand live-only">
        <h1>Relatório <span>Radar</span></h1>
        <p>
          GPS real usa <strong>${n.packCount||"…"} radares OSM</strong> de SP
          (não é o trecho fictício do sofá).
        </p>
      </header>

      <section class="speed-stage live-only" aria-live="polite">
        <div class="my-speed" id="my-speed">
          <span class="my-speed-label">Sua velocidade</span>
          <strong id="my-speed-value">${f(t)}</strong>
          <span class="my-speed-unit">km/h</span>
        </div>

        <div class="stage-row">
          <div class="speed-ring ring-${i}" id="speed-ring">
            <div class="speed-inner">
              <div class="limit-label">${e!=null?"Baixe para":"Limite"}</div>
              <div class="speed-value" id="limit-value">${e!=null?f(e):"—"}</div>
              <div class="speed-unit">km/h</div>
              <div class="dist-line" id="dist-line">
                ${a!=null?o?`Radar a ${a} m`:`Radar a ${a} m · alerta em ${n.alertDistanceM} m`:"Sem radar próximo"}
              </div>
            </div>
          </div>

          <aside class="upcoming" id="upcoming-list">
            <div class="upcoming-title">Próximos</div>
            ${At(l)}
          </aside>
        </div>
      </section>

      <div class="alert-banner live-only ${i==="over"?"active-imminent":i==="ok"&&n.alert?"active-far":""}">
        <div class="alert-dot" aria-hidden="true"></div>
        <div class="alert-copy">
          ${n.alert?`<strong>${i==="over"?"Acima do limite — reduza":"No limite ou abaixo"}</strong>
                 <span>${n.alert.radar.name} · alvo ${n.alert.radar.limitKmh} km/h</span>`:`<strong>Sem radar no alcance de alerta</strong>
                 <span>${s?"Monitorando…":"Inicie uma viagem."}</span>`}
        </div>
      </div>

      <div class="controls live-only">
        <div class="btn-row">
          <button type="button" class="btn-primary" id="btn-gps" ${s?"disabled":""}>GPS real</button>
          <button type="button" class="btn-secondary" id="btn-sim" ${s&&n.mode!=="sim"?"disabled":""}>Simular no sofá</button>
        </div>

        <div class="settings-panel open">
          <label>
            Sirene/voz a partir de
            <strong id="alert-dist-label">${n.alertDistanceM} m</strong>
          </label>
          <input type="range" id="alert-dist" min="100" max="800" step="50" value="${n.alertDistanceM}" />
          <label class="email-label" for="report-email">
            E-mail do relatório
          </label>
          <input
            type="email"
            id="report-email"
            class="email-input"
            placeholder="seu@email.com"
            value="${ne(Q())}"
            autocomplete="email"
            inputmode="email"
          />
          <label class="auto-label">
            <input type="checkbox" id="auto-start" ${n.autoStart?"checked":""} />
            Iniciar sozinho acima de ${j} km/h
          </label>
          <p class="hint">
            GPS real = radares OSM de SP. Sofá = demo. Auto-início só com o app aberto
            (segundo plano de verdade exige o app nativo no Xcode).
          </p>
        </div>

        <div class="btn-row">
          <button type="button" class="btn-secondary" id="btn-test-sound">Testar voz + sirene</button>
        </div>

        <div class="sim-panel ${n.mode==="sim"&&!n.report?"open":""}" id="sim-panel">
          <label>
            Vel. simulação
            <strong id="sim-speed-label">${(c==null?void 0:c.getSpeedKmh())??90} km/h</strong>
          </label>
          <input type="range" id="sim-speed" min="30" max="120" step="5" value="${(c==null?void 0:c.getSpeedKmh())??90}" ${s?"":"disabled"} />
          <label>
            Tempo
            <strong id="sim-scale-label">${(c==null?void 0:c.getTimeScale())??4}×</strong>
          </label>
          <input type="range" id="sim-scale" min="1" max="10" step="1" value="${(c==null?void 0:c.getTimeScale())??4}" ${s?"":"disabled"} />
        </div>

        <div class="btn-row">
          <button type="button" class="btn-danger" id="btn-finish" ${s?"":"disabled"}>Finalizar</button>
        </div>
      </div>

      <p class="status-line live-only ${n.error?"error":""}">${n.error??n.status}</p>

      <section class="report ${r?"open":""}" aria-live="polite">
        ${r&&n.report?ae(n.report):""}
      </section>
    </div>
    <div class="toast" id="toast" role="status"></div>
  `,se()}function At(t){return t.length===0?'<div class="upcoming-empty">Nenhum à frente</div>':t.map((e,a)=>{const i=Number.isFinite(e.distanceM)?`${Math.round(e.distanceM)} m`:"—";return`
        <div class="upcoming-item" data-radar="${e.radar.id}">
          <div class="upcoming-rank">${a+1}</div>
          <div class="upcoming-body">
            <strong>${e.radar.limitKmh}</strong>
            <span>${e.radar.name.replace(/^Radar\s+/i,"")}</span>
          </div>
          <div class="upcoming-dist" data-dist="${e.radar.id}">${i}</div>
        </div>`}).join("")}function ae(t){const e=t.overs.length;return`
    <h2>Viagem finalizada</h2>
    <div class="report-summary">
      <div class="stat"><em>Duração</em><strong>${ft(t.durationMs)}</strong></div>
      <div class="stat"><em>Vel. máx</em><strong>${f(t.maxSpeedKmh)} km/h</strong></div>
      <div class="stat"><em>Radares</em><strong>${t.passages.length}</strong></div>
      <div class="stat"><em>Acima do limite</em><strong class="${e?"bad":"good"}">${e}</strong></div>
    </div>
    <ul class="passage-list">
      ${t.passages.length===0?'<li><span class="detail">Nenhuma passagem por radar.</span></li>':t.passages.map(a=>`
            <li>
              <span class="tag ${a.overLimit?"bad":"ok"}">${a.overLimit?"Acima do limite":"Dentro do limite"}</span>
              <span class="title">${a.radar.name}</span>
              <span class="detail">
                Limite ${a.radar.limitKmh} · passou a ${f(a.speedKmh)} km/h
                ${a.overLimit?` (+${f(a.excessKmh)})`:""}
                · ${C(a.passedAt)}
              </span>
            </li>`).join("")}
    </ul>
    <div class="btn-row">
      <button type="button" class="btn-primary" id="btn-email">Enviar por e-mail</button>
      <button type="button" class="btn-secondary" id="btn-copy">Copiar relatório</button>
    </div>
    <div class="btn-row">
      <button type="button" class="btn-secondary" id="btn-share">Compartilhar</button>
      <button type="button" class="btn-primary" id="btn-new">Nova viagem</button>
    </div>
  `}function ne(t){return t.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function se(){var r,o,l,d,u,y,x,A;(r=document.getElementById("btn-gps"))==null||r.addEventListener("click",Et),(o=document.getElementById("btn-sim"))==null||o.addEventListener("click",re),(l=document.getElementById("btn-finish"))==null||l.addEventListener("click",le),(d=document.getElementById("btn-new"))==null||d.addEventListener("click",de),(u=document.getElementById("btn-copy"))==null||u.addEventListener("click",ue),(y=document.getElementById("btn-email"))==null||y.addEventListener("click",()=>Kt()),(x=document.getElementById("btn-share"))==null||x.addEventListener("click",()=>{ce()}),(A=document.getElementById("btn-test-sound"))==null||A.addEventListener("click",()=>{_t(60).then(()=>m("Falou: Baixa a velocidade para 60"))});const t=document.getElementById("auto-start");t==null||t.addEventListener("change",()=>{n.autoStart=!!t.checked,localStorage.setItem(wt,n.autoStart?"1":"0"),n.autoStart?xt():q()});const e=document.getElementById("report-email");e==null||e.addEventListener("input",()=>{P(e.value)}),e==null||e.addEventListener("change",()=>{P(e.value)}),e==null||e.addEventListener("blur",()=>{P(e.value)});const a=document.getElementById("alert-dist");a==null||a.addEventListener("input",()=>{const v=Number(a.value);It(v),n.alertDistanceM=mt();const h=document.getElementById("alert-dist-label");h&&(h.textContent=`${n.alertDistanceM} m`)});const i=document.getElementById("sim-speed");i==null||i.addEventListener("input",()=>{const v=Number(i.value);c==null||c.setSpeedKmh(v);const h=document.getElementById("sim-speed-label");h&&(h.textContent=`${v} km/h`),lt()});const s=document.getElementById("sim-scale");s==null||s.addEventListener("input",()=>{const v=Number(s.value);c==null||c.setTimeScale(v);const h=document.getElementById("sim-scale-label");h&&(h.textContent=`${v}×`),lt()})}function lt(){if(n.mode!=="sim"||!c)return;n.status=`Simulação · ${c.getSpeedKmh()} km/h · ${c.getTimeScale()}×`;const t=document.querySelector(".status-line");t&&!n.error&&(t.textContent=n.status)}function F(){R==null||R.stop(),c==null||c.stop(),R=null,c=null}function ie(t){F(),p.reset(),n.mode=t,n.startedAt=Date.now(),n.samples=[],n.passages=[],n.lastSample=null,n.alert=null,n.report=null,n.error=null,n.status="GPS…",S()}function Rt(t){if(n.lastSample=t,n.samples.push(t),n.samples.length>5e3&&n.samples.shift(),n.mode==="gps"&&E){const i=[...p.getPassages().map(s=>s.radar.id),...n.alert?[n.alert.radar.id]:[]];p.setRadars(Xt(t,te,i))}const{alert:e,newPassage:a}=p.update(t);n.alert=e,n.passages=p.getPassages(),oe(t,e),Gt(e,t.speedKmh),a&&(a.overLimit?(Vt(),m(`${a.radar.name}: ${f(a.speedKmh)} km/h — Você foi multado`,!0)):m(`${a.radar.name}: OK`,!1))}function oe(t,e){const a=t.speedKmh,i=(e==null?void 0:e.radar.limitKmh)??null,s=e?Math.round(e.distanceM):null,r=$t(a,e),o=e!=null&&e.distanceM<=n.alertDistanceM,l=document.getElementById("my-speed-value");l&&(l.textContent=f(a));const d=document.getElementById("limit-value");d&&(d.textContent=i!=null?f(i):"—");const u=document.getElementById("speed-ring");u&&(u.className=`speed-ring ring-${r}`);const y=document.getElementById("dist-line");y&&(y.textContent=s!=null?o?`Radar a ${s} m`:`Radar a ${s} m · alerta em ${n.alertDistanceM} m`:"Sem radar próximo");const x=document.querySelector(".limit-label");x&&(x.textContent=i!=null?"Baixe para":"Limite");const A=document.querySelector(".alert-banner");if(A){A.className=`alert-banner live-only ${r==="over"?"active-imminent":r==="ok"&&e?"active-far":""}`;const h=A.querySelector(".alert-copy");h&&(h.innerHTML=e?`<strong>${r==="over"?"Acima do limite — reduza":"No limite ou abaixo"}</strong>
           <span>${e.radar.name} · alvo ${e.radar.limitKmh} km/h</span>`:`<strong>Sem radar no alcance de alerta</strong>
           <span>Monitorando…</span>`)}const v=document.getElementById("upcoming-list");if(v){const h=p.upcoming(t,3);v.innerHTML=`<div class="upcoming-title">Próximos</div>${At(h)}`}}function at(){const t=document.getElementById("report-email");t&&P(t.value)}async function Et(){if(at(),q(),O(),await Z(),!E)try{await et(),n.packCount=tt().count,E=!0}catch(e){n.error=e instanceof Error?e.message:"Falha ao carregar radares",S();return}ie("gps"),p.setRadars([]);const t=n.packCount;n.status=`Navegação iniciada · ${t} radares OSM em SP`,ht(`Navegação iniciada. Mapeados ${t} radares na região de São Paulo.`),m(`Navegação · ${t} radares OSM`),R=new Mt({onSample:Rt,onError:e=>{n.error=e,n.status=e;const a=document.querySelector(".status-line");a&&(a.classList.add("error"),a.textContent=e)},onStatus:e=>{n.status=`${e} · ${n.packCount} radares OSM`,n.error=null;const a=document.querySelector(".status-line");a&&(a.classList.remove("error"),a.textContent=n.status)}}),R.start()}async function re(){at(),q(),O(),await Z(),F(),p.reset(),p.setRadars(U),n.mode="sim",n.startedAt=Date.now(),n.samples=[],n.passages=[],n.lastSample=null,n.alert=null,n.report=null,n.error=null,n.status=`Simulação (demo) · ${U.length} radares fictícios`,ht("Simulação no sofá. Radares de demonstração."),c=new Qt({onSample:Rt,onStatus:t=>{n.status=t;const e=document.querySelector(".status-line");e&&!n.error&&(e.textContent=t)},onFinished:()=>{n.status="Fim do trecho — Finalizar";const t=document.querySelector(".status-line");t&&(t.textContent=n.status)}}),c.setSpeedKmh(90),c.setTimeScale(4),S(),c.start()}function q(){$==null||$.stop(),$=null,n.watchingAuto=!1,K=null}async function xt(){if(!(n.mode!=="idle"||n.report)&&!$){if(!E)try{await et(),n.packCount=tt().count,E=!0}catch{m("Não deu para carregar radares para o auto-início",!0);return}n.watchingAuto=!0,n.status=`Auto: esperando >${j} km/h…`,S(),$=new Mt({onSample:t=>{n.lastSample=t;const e=document.getElementById("my-speed-value");e&&(e.textContent=f(t.speedKmh)),t.speedKmh>=j?(K==null&&(K=Date.now()),Date.now()-K>=3e3&&n.mode==="idle"&&(q(),Et())):K=null},onError:t=>{n.error=t,m(t,!0)},onStatus:t=>{n.status=`Auto · ${t}`;const e=document.querySelector(".status-line");e&&!n.error&&(e.textContent=n.status)}}),$.start()}}function le(){if(n.mode==="idle"||!n.startedAt)return;at(),F(),O(),gt(),n.lastSample&&p.update({...n.lastSample,lat:n.lastSample.lat+1,lng:n.lastSample.lng+1,at:Date.now()});const t=Date.now();n.report=jt({mode:n.mode==="sim"?"sim":"gps",startedAt:n.startedAt,endedAt:t,samples:n.samples,passages:p.getPassages()}),n.mode="idle",n.status="Relatório pronto.",n.alert=null,S(),Kt({auto:!0})}function Kt(t={}){if(!n.report)return;const e=Q();if(!e){m(t.auto?"Informe o e-mail nas configurações para enviar o relatório":"Informe o e-mail antes de enviar",!0);return}if(!bt(e)){m("E-mail inválido",!0);return}St(n.report)?m(t.auto?"Abrindo Mail com o relatório…":"Abrindo Mail…"):m("Não foi possível abrir o Mail",!0)}async function ce(){if(!n.report)return;const t=await Ht(n.report);t==="share"?m("Compartilhado"):t==="mailto"?m("Abrindo Mail…"):m("Não foi possível compartilhar",!0)}function de(){F(),O(),gt(),p.reset(),n.mode="idle",n.startedAt=null,n.samples=[],n.passages=[],n.lastSample=null,n.alert=null,n.report=null,n.error=null,n.status="Escolha GPS real ou Simular no sofá.",S()}async function ue(){if(n.report)try{await navigator.clipboard.writeText(J(n.report)),m("Relatório copiado")}catch{m("Não foi possível copiar",!0)}}function m(t,e=!1){const a=document.getElementById("toast");a&&(a.textContent=t,a.className=`toast show${e?" bad":""}`,window.setTimeout(()=>a.classList.remove("show"),2600))}async function me(){S();try{await et(),n.packCount=tt().count,E=!0,n.status=`${n.packCount} radares OSM em SP · GPS real ou Simular`}catch(t){n.error=t instanceof Error?t.message:"Não carregou o pack de radares. Sofá ainda funciona.",n.status="Pack OSM indisponível — use Simular no sofá"}S(),n.autoStart&&xt()}me();
