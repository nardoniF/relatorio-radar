var z=Object.defineProperty;var N=(e,t,s)=>t in e?z(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s;var u=(e,t,s)=>N(e,typeof t!="symbol"?t+"":t,s);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function s(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerPolicy&&(r.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?r.credentials="include":a.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(a){if(a.ep)return;a.ep=!0;const r=s(a);fetch(a.href,r)}})();let $=null,b=!1,R=null,x=0,K=0;function k(){if(!$){const e=window.AudioContext||window.webkitAudioContext;$=new e}return $}async function T(){const e=k();try{e.state==="suspended"&&await e.resume()}catch{}const t=e.currentTime,s=e.createOscillator(),i=e.createGain();s.type="sine",s.frequency.value=880,i.gain.setValueAtTime(1e-4,t),i.gain.exponentialRampToValueAtTime(.2,t+.02),i.gain.exponentialRampToValueAtTime(1e-4,t+.18),s.connect(i),i.connect(e.destination),s.start(t),s.stop(t+.2),b=!0,"speechSynthesis"in window&&(window.speechSynthesis.getVoices(),window.speechSynthesis.onvoiceschanged=()=>{window.speechSynthesis.getVoices()})}function q(e=1.6,t=!1){if(!b&&!t)return;const s=Date.now();if(!t&&s-x<1800)return;x=s;const i=k();i.state==="suspended"&&i.resume();const a=i.currentTime,r=i.createGain();r.gain.setValueAtTime(1e-4,a),r.gain.exponentialRampToValueAtTime(.35,a+.04),r.gain.exponentialRampToValueAtTime(1e-4,a+e),r.connect(i.destination);const o=i.createOscillator(),c=i.createOscillator();o.type="square",c.type="sawtooth",o.frequency.setValueAtTime(740,a),o.frequency.linearRampToValueAtTime(1100,a+.35),o.frequency.linearRampToValueAtTime(740,a+.7),o.frequency.linearRampToValueAtTime(1100,a+1.05),o.frequency.linearRampToValueAtTime(740,a+1.4),c.frequency.setValueAtTime(520,a);const d=i.createGain(),m=i.createGain();d.gain.value=.55,m.gain.value=.25,o.connect(d),c.connect(m),d.connect(r),m.connect(r),o.start(a),c.start(a),o.stop(a+e),c.stop(a+e)}function F(){var t,s;const e=((s=(t=window.speechSynthesis)==null?void 0:t.getVoices)==null?void 0:s.call(t))??[];return e.find(i=>/pt-BR/i.test(i.lang))||e.find(i=>/portuguese/i.test(i.name))||e.find(i=>/^pt/i.test(i.lang))||null}function I(e,t=!1){if(!("speechSynthesis"in window)||!b&&!t)return;const s=Date.now();if(!t&&s-K<3500)return;K=s;try{window.speechSynthesis.cancel()}catch{}const i=`Atenção. Radar à frente. Diminua para ${Math.round(e)} quilômetros por hora.`,a=new SpeechSynthesisUtterance(i);a.lang="pt-BR",a.rate=1,a.pitch=1,a.volume=1;const r=F();r&&(a.voice=r);try{window.speechSynthesis.resume()}catch{}window.speechSynthesis.speak(a),window.setTimeout(()=>{try{window.speechSynthesis.pause(),window.speechSynthesis.resume()}catch{}},40)}async function O(e=60){await T(),q(1.8,!0),I(e,!0)}function H(e){e&&b&&(`${e.radar.id}${e.level}`,(e.level==="far"||e.level==="near"||e.level==="imminent")&&q(e.level==="imminent"?1.8:1.3),(e.level==="near"||e.level==="imminent")&&R!==e.radar.id&&(R=e.radar.id,I(e.radar.limitKmh)))}function M(){if(R=null,x=0,K=0,"speechSynthesis"in window)try{window.speechSynthesis.cancel()}catch{}}const A=[{lat:-23.5614,lng:-46.6558},{lat:-23.5602,lng:-46.6525},{lat:-23.5588,lng:-46.6491},{lat:-23.5571,lng:-46.6458},{lat:-23.5554,lng:-46.6426},{lat:-23.5539,lng:-46.6395},{lat:-23.5526,lng:-46.6362},{lat:-23.5514,lng:-46.6328},{lat:-23.5505,lng:-46.6291},{lat:-23.5499,lng:-46.6254},{lat:-23.5496,lng:-46.6216},{lat:-23.5498,lng:-46.6179},{lat:-23.5504,lng:-46.6143},{lat:-23.5515,lng:-46.6109},{lat:-23.553,lng:-46.6078}],j=[{id:"r1",name:"Radar Consolação",lat:-23.5595,lng:-46.6508,limitKmh:50,alertRadiusM:220,passRadiusM:55},{id:"r2",name:"Radar Augusta",lat:-23.5558,lng:-46.6435,limitKmh:50,alertRadiusM:220,passRadiusM:55},{id:"r3",name:"Radar Higienópolis",lat:-23.5518,lng:-46.6345,limitKmh:40,alertRadiusM:200,passRadiusM:50},{id:"r4",name:"Radar Pacaembu",lat:-23.5497,lng:-46.6235,limitKmh:60,alertRadiusM:250,passRadiusM:60},{id:"r5",name:"Radar Sumaré",lat:-23.5508,lng:-46.6125,limitKmh:50,alertRadiusM:220,passRadiusM:55}],U=6371e3;function h(e){return e*Math.PI/180}function L(e,t){const s=h(t.lat-e.lat),i=h(t.lng-e.lng),a=h(e.lat),r=h(t.lat),o=Math.sin(s/2)**2+Math.cos(a)*Math.cos(r)*Math.sin(i/2)**2;return 2*U*Math.asin(Math.min(1,Math.sqrt(o)))}function E(e,t){const s=h(e.lat),i=h(t.lat),a=h(t.lng-e.lng),r=Math.sin(a)*Math.cos(i),o=Math.cos(s)*Math.sin(i)-Math.sin(s)*Math.cos(i)*Math.cos(a);return(Math.atan2(r,o)*180/Math.PI+360)%360}function C(e,t){if(e.length===0)return{point:{lat:0,lng:0},heading:0,totalLengthM:0};if(e.length===1)return{point:e[0],heading:0,totalLengthM:0};let s=Math.max(0,t),i=0;const a=[];for(let o=0;o<e.length-1;o++){const c=L(e[o],e[o+1]);a.push({a:e[o],b:e[o+1],len:c}),i+=c}if(s>=i){const o=a[a.length-1];return{point:o.b,heading:E(o.a,o.b),totalLengthM:i}}for(const o of a){if(s<=o.len){const c=o.len===0?0:s/o.len;return{point:{lat:o.a.lat+(o.b.lat-o.a.lat)*c,lng:o.a.lng+(o.b.lng-o.a.lng)*c},heading:E(o.a,o.b),totalLengthM:i}}s-=o.len}return{point:e[e.length-1],heading:0,totalLengthM:i}}function W(e){let t=0;for(let s=0;s<e.length-1;s++)t+=L(e[s],e[s+1]);return t}function p(e){return`${Math.round(e)}`}function V(e){const t=Math.floor(e/1e3),s=Math.floor(t/60),i=Math.floor(s/60),a=s%60,r=t%60;return i>0?`${i}h ${String(a).padStart(2,"0")}m`:`${a}m ${String(r).padStart(2,"0")}s`}function S(e){return new Date(e).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}function X(e){return e.speed!=null&&Number.isFinite(e.speed)&&e.speed>=0?e.speed*3.6:0}class _{constructor(t){u(this,"watchId",null);u(this,"last",null);this.cb=t}get lastSample(){return this.last}start(){if(!("geolocation"in navigator)){this.cb.onError("Geolocalização não disponível neste navegador.");return}if(!window.isSecureContext){this.cb.onError("Safari exige HTTPS para GPS. Abra o app via https://");return}this.cb.onStatus("Pedindo permissão de localização…"),this.watchId=navigator.geolocation.watchPosition(t=>{const s={lat:t.coords.latitude,lng:t.coords.longitude,speedKmh:X(t.coords),accuracyM:t.coords.accuracy??null,heading:t.coords.heading!=null&&Number.isFinite(t.coords.heading)?t.coords.heading:null,at:t.timestamp||Date.now()};this.last=s,this.cb.onStatus("GPS ativo"),this.cb.onSample(s)},t=>{const s={1:"Permissão de localização negada.",2:"Posição indisponível. Vá a um local aberto ou use Simular.",3:"Tempo esgotado ao obter GPS."};this.cb.onError(s[t.code]??t.message)},{enableHighAccuracy:!0,maximumAge:1e3,timeout:15e3})}stop(){this.watchId!=null&&(navigator.geolocation.clearWatch(this.watchId),this.watchId=null)}}class J{constructor(t){u(this,"approaches",new Map);u(this,"passages",[]);u(this,"lastAlert",null);this.radars=t}reset(){this.approaches.clear(),this.passages=[],this.lastAlert=null}getPassages(){return[...this.passages]}getAlert(){return this.lastAlert}update(t){let s=null,i=null;for(const a of this.radars){const r=L(t,a);let o=this.approaches.get(a.id);if(r<=a.alertRadiusM){const c=r<=a.passRadiusM*1.4?"imminent":r<=a.alertRadiusM*.55?"near":"far";(!s||r<s.distanceM)&&(s={radar:a,distanceM:r,level:c})}if(r<=a.passRadiusM)o?(o.entered=!0,r<o.closestM&&(o.closestM=r,o.speedAtClosest=t.speedKmh,o.atClosest=t.at)):(o={radar:a,entered:!0,closestM:r,speedAtClosest:t.speedKmh,atClosest:t.at},this.approaches.set(a.id,o));else if(o!=null&&o.entered){const c=Math.max(0,o.speedAtClosest-a.limitKmh),d={radar:a,passedAt:o.atClosest,speedKmh:o.speedAtClosest,overLimit:c>0,excessKmh:c,closestDistanceM:o.closestM};this.passages.push(d),this.approaches.delete(a.id),i=d}}return this.lastAlert=s,{alert:s,newPassage:i}}}function Q(e){const t=e.samples.reduce((i,a)=>Math.max(i,a.speedKmh),0),s=e.passages.filter(i=>i.overLimit);return{mode:e.mode,startedAt:e.startedAt,endedAt:e.endedAt,durationMs:Math.max(0,e.endedAt-e.startedAt),maxSpeedKmh:t,samples:e.samples.length,passages:e.passages,overs:s}}function Y(e){const t=["Relatório Radar",`Modo: ${e.mode==="sim"?"Simulação":"GPS real"}`,`Início: ${S(e.startedAt)}`,`Fim: ${S(e.endedAt)}`,`Duração: ${V(e.durationMs)}`,`Vel. máx: ${p(e.maxSpeedKmh)} km/h`,`Radares passados: ${e.passages.length}`,`Acima do limite: ${e.overs.length}`,""];if(e.passages.length===0)t.push("Nenhuma passagem por radar registrada.");else for(const s of e.passages){const i=s.overLimit?"⚠️ ACIMA":"OK";t.push(`${i} · ${s.radar.name} · limite ${s.radar.limitKmh} · passou a ${p(s.speedKmh)} km/h`+(s.overLimit?` (+${p(s.excessKmh)})`:"")+` · ${S(s.passedAt)}`)}return t.join(`
`)}class Z{constructor(t){u(this,"raf",0);u(this,"startedAt",0);u(this,"distanceM",0);u(this,"speedKmh",90);u(this,"timeScale",4);u(this,"running",!1);u(this,"totalM",W(A));this.cb=t}setSpeedKmh(t){this.speedKmh=Math.max(10,Math.min(140,t))}getSpeedKmh(){return this.speedKmh}setTimeScale(t){this.timeScale=Math.max(1,Math.min(12,t))}getTimeScale(){return this.timeScale}start(){this.stop(),this.running=!0,this.startedAt=performance.now(),this.distanceM=0,this.cb.onStatus(`Simulação · ${Math.round(this.speedKmh)} km/h · ${this.timeScale}×`);let t=performance.now();const s=i=>{if(!this.running)return;const a=Math.min(.25,(i-t)/1e3*this.timeScale);t=i;const r=this.speedKmh/3.6;if(this.distanceM+=r*a,this.distanceM>=this.totalM){const{point:m,heading:G}=C(A,this.totalM);this.cb.onSample({lat:m.lat,lng:m.lng,speedKmh:this.speedKmh,accuracyM:5,heading:G,at:Date.now()}),this.running=!1,this.cb.onStatus("Simulação concluída"),this.cb.onFinished();return}const{point:o,heading:c}=C(A,this.distanceM),d=Math.sin((i-this.startedAt)/700)*.8;this.cb.onSample({lat:o.lat,lng:o.lng,speedKmh:Math.max(0,this.speedKmh+d),accuracyM:5,heading:c,at:Date.now()}),this.raf=requestAnimationFrame(s)};this.raf=requestAnimationFrame(s)}stop(){this.running=!1,this.raf&&cancelAnimationFrame(this.raf),this.raf=0}}const ee=document.querySelector("#app"),n={mode:"idle",startedAt:null,samples:[],passages:[],lastSample:null,alert:null,report:null,status:"Escolha GPS real ou Simular no sofá.",error:null},g=new J(j);let f=null,l=null;function v(){var r;const e=((r=n.lastSample)==null?void 0:r.speedKmh)??0,t=n.alert?`active-${n.alert.level}`:"",s=n.alert?n.alert.level==="imminent"?"alert-imminent":n.alert.level==="near"?"alert-near":"":"",i=n.mode!=="idle"&&!n.report,a=!!n.report;ee.innerHTML=`
    <div class="shell ${a?"report-open":""}">
      <header class="brand live-only">
        <h1>Relatório <span>Radar</span></h1>
        <p>GPS, alerta com sirene e voz — “diminua para X km/h” — e relatório ao finalizar.</p>
      </header>

      <section class="speed-stage live-only" aria-live="polite">
        <div class="speed-ring ${s}">
          <div class="speed-inner">
            <div class="speed-value">${p(e)}</div>
            <div class="speed-unit">km/h</div>
            <div class="meta-row">
              <div>
                Limite
                <strong>${n.alert?n.alert.radar.limitKmh:"—"}</strong>
              </div>
              <div>
                Distância
                <strong>${n.alert?`${Math.round(n.alert.distanceM)} m`:"—"}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="alert-banner live-only ${t}">
        <div class="alert-dot" aria-hidden="true"></div>
        <div class="alert-copy">
          ${n.alert?`<strong>${D(n.alert)}</strong>
                 <span>${n.alert.radar.name} · máx ${n.alert.radar.limitKmh} km/h</span>`:`<strong>Sem radar próximo</strong>
                 <span>${i?"Monitorando o percurso…":"Inicie uma viagem para monitorar."}</span>`}
        </div>
      </div>

      <div class="controls live-only">
        <div class="btn-row">
          <button type="button" class="btn-primary" id="btn-gps" ${i?"disabled":""}>
            GPS real
          </button>
          <button type="button" class="btn-secondary" id="btn-sim" ${i&&n.mode!=="sim"?"disabled":""}>
            Simular no sofá
          </button>
        </div>

        <div class="btn-row">
          <button type="button" class="btn-secondary" id="btn-test-sound">
            Testar sirene + voz
          </button>
        </div>

        <div class="sim-panel ${n.mode==="sim"&&!n.report?"open":""}" id="sim-panel">
          <label>
            Velocidade
            <strong id="sim-speed-label">${(l==null?void 0:l.getSpeedKmh())??90} km/h</strong>
          </label>
          <input
            type="range"
            id="sim-speed"
            min="30"
            max="120"
            step="5"
            value="${(l==null?void 0:l.getSpeedKmh())??90}"
            ${i?"":"disabled"}
          />
          <label>
            Aceleração do tempo
            <strong id="sim-scale-label">${(l==null?void 0:l.getTimeScale())??4}×</strong>
          </label>
          <input
            type="range"
            id="sim-scale"
            min="1"
            max="10"
            step="1"
            value="${(l==null?void 0:l.getTimeScale())??4}"
            ${i?"":"disabled"}
          />
        </div>

        <div class="btn-row">
          <button type="button" class="btn-danger" id="btn-finish" ${i?"":"disabled"}>
            Finalizar
          </button>
        </div>
      </div>

      <p class="status-line live-only ${n.error?"error":""}">
        ${n.error??n.status}
      </p>
      <p class="status-line live-only" style="opacity:0.55;font-size:0.75rem">áudio v3 · se não ouvir, toque em Testar sirene + voz</p>

      <section class="report ${a?"open":""}" aria-live="polite">
        ${a&&n.report?te(n.report):""}
      </section>
    </div>
    <div class="toast" id="toast" role="status"></div>
  `,se()}function D(e){return e.level==="imminent"?"Radar à frente — reduza":e.level==="near"?"Aproximando do radar":"Radar no trecho"}function te(e){const t=e.overs.length;return`
    <h2>Viagem finalizada</h2>
    <div class="report-summary">
      <div class="stat">
        <em>Duração</em>
        <strong>${V(e.durationMs)}</strong>
      </div>
      <div class="stat">
        <em>Vel. máx</em>
        <strong>${p(e.maxSpeedKmh)} km/h</strong>
      </div>
      <div class="stat">
        <em>Radares passados</em>
        <strong>${e.passages.length}</strong>
      </div>
      <div class="stat">
        <em>Acima do limite</em>
        <strong class="${t?"bad":"good"}">${t}</strong>
      </div>
    </div>

    <ul class="passage-list">
      ${e.passages.length===0?'<li><span class="detail">Nenhuma passagem por radar nesta viagem.</span></li>':e.passages.map(s=>`
            <li>
              <span class="tag ${s.overLimit?"bad":"ok"}">${s.overLimit?"Acima do limite":"Dentro do limite"}</span>
              <span class="title">${s.radar.name}</span>
              <span class="detail">
                Limite ${s.radar.limitKmh} · passou a ${p(s.speedKmh)} km/h
                ${s.overLimit?` (+${p(s.excessKmh)})`:""}
                · ${S(s.passedAt)}
              </span>
            </li>`).join("")}
    </ul>

    <div class="btn-row">
      <button type="button" class="btn-secondary" id="btn-copy">Copiar relatório</button>
      <button type="button" class="btn-primary" id="btn-new">Nova viagem</button>
    </div>
  `}function se(){var s,i,a,r,o,c;(s=document.getElementById("btn-gps"))==null||s.addEventListener("click",ie),(i=document.getElementById("btn-sim"))==null||i.addEventListener("click",oe),(a=document.getElementById("btn-finish"))==null||a.addEventListener("click",re),(r=document.getElementById("btn-new"))==null||r.addEventListener("click",le),(o=document.getElementById("btn-copy"))==null||o.addEventListener("click",ce),(c=document.getElementById("btn-test-sound"))==null||c.addEventListener("click",()=>{O(60).then(()=>{y("Sirene + voz disparados"),n.status="Áudio OK — agora use Simular no sofá";const d=document.querySelector(".status-line");d&&!n.error&&(d.textContent=n.status)})});const e=document.getElementById("sim-speed");e==null||e.addEventListener("input",()=>{const d=Number(e.value);l==null||l.setSpeedKmh(d);const m=document.getElementById("sim-speed-label");m&&(m.textContent=`${d} km/h`),P()});const t=document.getElementById("sim-scale");t==null||t.addEventListener("input",()=>{const d=Number(t.value);l==null||l.setTimeScale(d);const m=document.getElementById("sim-scale-label");m&&(m.textContent=`${d}×`),P()})}function P(){if(n.mode!=="sim"||!l)return;n.status=`Simulação · ${l.getSpeedKmh()} km/h · ${l.getTimeScale()}×`;const e=document.querySelector(".status-line");e&&!n.error&&(e.textContent=n.status)}function w(){f==null||f.stop(),l==null||l.stop(),f=null,l=null}function ne(e){w(),g.reset(),n.mode=e,n.startedAt=Date.now(),n.samples=[],n.passages=[],n.lastSample=null,n.alert=null,n.report=null,n.error=null,n.status="Iniciando GPS…",v()}function B(e){n.lastSample=e,n.samples.push(e),n.samples.length>5e3&&n.samples.shift();const{alert:t,newPassage:s}=g.update(e);n.alert=t,n.passages=g.getPassages(),ae(e,t),H(t),s&&y(s.overLimit?`${s.radar.name}: ${p(s.speedKmh)} km/h — acima do limite`:`${s.radar.name}: passagem OK`,s.overLimit)}function ae(e,t){const s=document.querySelector(".speed-value");s&&(s.textContent=p(e.speedKmh));const i=document.querySelector(".speed-ring");i&&(i.classList.remove("alert-near","alert-imminent"),(t==null?void 0:t.level)==="near"&&i.classList.add("alert-near"),(t==null?void 0:t.level)==="imminent"&&i.classList.add("alert-imminent"));const a=document.querySelector(".alert-banner");if(a){a.className=`alert-banner live-only ${t?`active-${t.level}`:""}`;const o=a.querySelector(".alert-copy");o&&(o.innerHTML=t?`<strong>${D(t)}</strong>
           <span>${t.radar.name} · máx ${t.radar.limitKmh} km/h</span>`:`<strong>Sem radar próximo</strong>
           <span>Monitorando o percurso…</span>`)}const r=document.querySelectorAll(".meta-row strong");r.length>=2&&(r[0].textContent=t?String(t.radar.limitKmh):"—",r[1].textContent=t?`${Math.round(t.distanceM)} m`:"—")}function ie(){T(),M(),ne("gps"),f=new _({onSample:B,onError:e=>{n.error=e,n.status=e;const t=document.querySelector(".status-line");t&&(t.classList.add("error"),t.textContent=e)},onStatus:e=>{n.status=e,n.error=null;const t=document.querySelector(".status-line");t&&(t.classList.remove("error"),t.textContent=e)}}),f.start()}function oe(){T(),M(),w(),g.reset(),n.mode="sim",n.startedAt=Date.now(),n.samples=[],n.passages=[],n.lastSample=null,n.alert=null,n.report=null,n.error=null,n.status="Simulação · 90 km/h · 4× · áudio ligado",l=new Z({onSample:B,onStatus:e=>{n.status=e;const t=document.querySelector(".status-line");t&&!n.error&&(t.textContent=e)},onFinished:()=>{n.status="Fim do trecho simulado — toque em Finalizar.";const e=document.querySelector(".status-line");e&&(e.textContent=n.status)}}),l.setSpeedKmh(90),l.setTimeScale(4),v(),l.start()}function re(){if(n.mode==="idle"||!n.startedAt)return;w(),M(),n.lastSample&&g.update({...n.lastSample,lat:n.lastSample.lat+1,lng:n.lastSample.lng+1,at:Date.now()});const e=Date.now(),t=Q({mode:n.mode==="sim"?"sim":"gps",startedAt:n.startedAt,endedAt:e,samples:n.samples,passages:g.getPassages()});n.report=t,n.mode="idle",n.status="Relatório pronto.",n.alert=null,v()}function le(){w(),M(),g.reset(),n.mode="idle",n.startedAt=null,n.samples=[],n.passages=[],n.lastSample=null,n.alert=null,n.report=null,n.error=null,n.status="Escolha GPS real ou Simular no sofá.",v()}async function ce(){if(!n.report)return;const e=Y(n.report);try{await navigator.clipboard.writeText(e),y("Relatório copiado")}catch{y("Não foi possível copiar",!0)}}function y(e,t=!1){const s=document.getElementById("toast");s&&(s.textContent=e,s.className=`toast show${t?" bad":""}`,window.setTimeout(()=>{s.classList.remove("show")},2600))}v();
