var F=Object.defineProperty;var N=(t,e,s)=>e in t?F(t,e,{enumerable:!0,configurable:!0,writable:!0,value:s}):t[e]=s;var u=(t,e,s)=>N(t,typeof e!="symbol"?e+"":e,s);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const l of i)if(l.type==="childList")for(const o of l.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function s(i){const l={};return i.integrity&&(l.integrity=i.integrity),i.referrerPolicy&&(l.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?l.credentials="include":i.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function n(i){if(i.ep)return;i.ep=!0;const l=s(i);fetch(i.href,l)}})();let K=null,E=!1,M=null,R=0,L=0,S=!1;function q(){if(!K){const t=window.AudioContext||window.webkitAudioContext;K=new t}return K}async function D(){const t=q();if(t.state==="suspended")try{await t.resume()}catch{}const e=t.createOscillator(),s=t.createGain();s.gain.value=.001,e.connect(s),s.connect(t.destination),e.start(),e.stop(t.currentTime+.05),E=!0,"speechSynthesis"in window&&window.speechSynthesis.getVoices()}function O(t=1.4){if(!E)return;const e=Date.now();if(e-R<2500)return;R=e;const s=q();s.state==="suspended"&&s.resume();const n=s.currentTime,i=s.createGain();i.gain.setValueAtTime(1e-4,n),i.gain.exponentialRampToValueAtTime(.22,n+.05),i.gain.exponentialRampToValueAtTime(1e-4,n+t),i.connect(s.destination);const l=s.createOscillator(),o=s.createOscillator();l.type="sawtooth",o.type="sawtooth",l.frequency.setValueAtTime(680,n),o.frequency.setValueAtTime(920,n);const c=s.createGain(),d=s.createGain();c.gain.value=.5,d.gain.value=.5;const p=s.createOscillator(),f=s.createGain();p.frequency.value=3.2,f.gain.value=.45,p.connect(f),f.connect(c.gain);const A=s.createGain();A.gain.value=-1,f.connect(A),A.connect(d.gain),l.connect(c),o.connect(d),c.connect(i),d.connect(i),l.start(n),o.start(n),p.start(n),l.stop(n+t),o.stop(n+t),p.stop(n+t)}function z(){var e,s;const t=((s=(e=window.speechSynthesis)==null?void 0:e.getVoices)==null?void 0:s.call(e))??[];return t.find(n=>/pt-BR/i.test(n.lang))||t.find(n=>/^pt/i.test(n.lang))||null}function H(t){if(!E||!("speechSynthesis"in window))return;const e=Date.now();if(e-L<4e3||S)return;L=e,window.speechSynthesis.cancel();const s=new SpeechSynthesisUtterance(`Atenção. Radar à frente. Diminua para ${Math.round(t)} quilômetros por hora.`);s.lang="pt-BR",s.rate=1.05,s.pitch=1,s.volume=1;const n=z();n&&(s.voice=n),S=!0,s.onend=()=>{S=!1},s.onerror=()=>{S=!1},window.speechSynthesis.speak(s)}function j(t){if(!t){M=null;return}(t.level==="near"||t.level==="imminent")&&O(t.level==="imminent"?1.8:1.2),(t.level==="near"||t.level==="imminent")&&M!==t.radar.id&&(M=t.radar.id,window.setTimeout(()=>H(t.radar.limitKmh),450))}function $(){M=null,R=0,L=0,S=!1,"speechSynthesis"in window&&window.speechSynthesis.cancel()}const x=[{lat:-23.5614,lng:-46.6558},{lat:-23.5602,lng:-46.6525},{lat:-23.5588,lng:-46.6491},{lat:-23.5571,lng:-46.6458},{lat:-23.5554,lng:-46.6426},{lat:-23.5539,lng:-46.6395},{lat:-23.5526,lng:-46.6362},{lat:-23.5514,lng:-46.6328},{lat:-23.5505,lng:-46.6291},{lat:-23.5499,lng:-46.6254},{lat:-23.5496,lng:-46.6216},{lat:-23.5498,lng:-46.6179},{lat:-23.5504,lng:-46.6143},{lat:-23.5515,lng:-46.6109},{lat:-23.553,lng:-46.6078}],U=[{id:"r1",name:"Radar Consolação",lat:-23.5595,lng:-46.6508,limitKmh:50,alertRadiusM:220,passRadiusM:55},{id:"r2",name:"Radar Augusta",lat:-23.5558,lng:-46.6435,limitKmh:50,alertRadiusM:220,passRadiusM:55},{id:"r3",name:"Radar Higienópolis",lat:-23.5518,lng:-46.6345,limitKmh:40,alertRadiusM:200,passRadiusM:50},{id:"r4",name:"Radar Pacaembu",lat:-23.5497,lng:-46.6235,limitKmh:60,alertRadiusM:250,passRadiusM:60},{id:"r5",name:"Radar Sumaré",lat:-23.5508,lng:-46.6125,limitKmh:50,alertRadiusM:220,passRadiusM:55}],W=6371e3;function h(t){return t*Math.PI/180}function C(t,e){const s=h(e.lat-t.lat),n=h(e.lng-t.lng),i=h(t.lat),l=h(e.lat),o=Math.sin(s/2)**2+Math.cos(i)*Math.cos(l)*Math.sin(n/2)**2;return 2*W*Math.asin(Math.min(1,Math.sqrt(o)))}function P(t,e){const s=h(t.lat),n=h(e.lat),i=h(e.lng-t.lng),l=Math.sin(i)*Math.cos(n),o=Math.cos(s)*Math.sin(n)-Math.sin(s)*Math.cos(n)*Math.cos(i);return(Math.atan2(l,o)*180/Math.PI+360)%360}function k(t,e){if(t.length===0)return{point:{lat:0,lng:0},heading:0,totalLengthM:0};if(t.length===1)return{point:t[0],heading:0,totalLengthM:0};let s=Math.max(0,e),n=0;const i=[];for(let o=0;o<t.length-1;o++){const c=C(t[o],t[o+1]);i.push({a:t[o],b:t[o+1],len:c}),n+=c}if(s>=n){const o=i[i.length-1];return{point:o.b,heading:P(o.a,o.b),totalLengthM:n}}for(const o of i){if(s<=o.len){const c=o.len===0?0:s/o.len;return{point:{lat:o.a.lat+(o.b.lat-o.a.lat)*c,lng:o.a.lng+(o.b.lng-o.a.lng)*c},heading:P(o.a,o.b),totalLengthM:n}}s-=o.len}return{point:t[t.length-1],heading:0,totalLengthM:n}}function X(t){let e=0;for(let s=0;s<t.length-1;s++)e+=C(t[s],t[s+1]);return e}function m(t){return`${Math.round(t)}`}function G(t){const e=Math.floor(t/1e3),s=Math.floor(e/60),n=Math.floor(s/60),i=s%60,l=e%60;return n>0?`${n}h ${String(i).padStart(2,"0")}m`:`${i}m ${String(l).padStart(2,"0")}s`}function y(t){return new Date(t).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}function _(t){return t.speed!=null&&Number.isFinite(t.speed)&&t.speed>=0?t.speed*3.6:0}class J{constructor(e){u(this,"watchId",null);u(this,"last",null);this.cb=e}get lastSample(){return this.last}start(){if(!("geolocation"in navigator)){this.cb.onError("Geolocalização não disponível neste navegador.");return}if(!window.isSecureContext){this.cb.onError("Safari exige HTTPS para GPS. Abra o app via https://");return}this.cb.onStatus("Pedindo permissão de localização…"),this.watchId=navigator.geolocation.watchPosition(e=>{const s={lat:e.coords.latitude,lng:e.coords.longitude,speedKmh:_(e.coords),accuracyM:e.coords.accuracy??null,heading:e.coords.heading!=null&&Number.isFinite(e.coords.heading)?e.coords.heading:null,at:e.timestamp||Date.now()};this.last=s,this.cb.onStatus("GPS ativo"),this.cb.onSample(s)},e=>{const s={1:"Permissão de localização negada.",2:"Posição indisponível. Vá a um local aberto ou use Simular.",3:"Tempo esgotado ao obter GPS."};this.cb.onError(s[e.code]??e.message)},{enableHighAccuracy:!0,maximumAge:1e3,timeout:15e3})}stop(){this.watchId!=null&&(navigator.geolocation.clearWatch(this.watchId),this.watchId=null)}}class Q{constructor(e){u(this,"approaches",new Map);u(this,"passages",[]);u(this,"lastAlert",null);this.radars=e}reset(){this.approaches.clear(),this.passages=[],this.lastAlert=null}getPassages(){return[...this.passages]}getAlert(){return this.lastAlert}update(e){let s=null,n=null;for(const i of this.radars){const l=C(e,i);let o=this.approaches.get(i.id);if(l<=i.alertRadiusM){const c=l<=i.passRadiusM*1.4?"imminent":l<=i.alertRadiusM*.55?"near":"far";(!s||l<s.distanceM)&&(s={radar:i,distanceM:l,level:c})}if(l<=i.passRadiusM)o?(o.entered=!0,l<o.closestM&&(o.closestM=l,o.speedAtClosest=e.speedKmh,o.atClosest=e.at)):(o={radar:i,entered:!0,closestM:l,speedAtClosest:e.speedKmh,atClosest:e.at},this.approaches.set(i.id,o));else if(o!=null&&o.entered){const c=Math.max(0,o.speedAtClosest-i.limitKmh),d={radar:i,passedAt:o.atClosest,speedKmh:o.speedAtClosest,overLimit:c>0,excessKmh:c,closestDistanceM:o.closestM};this.passages.push(d),this.approaches.delete(i.id),n=d}}return this.lastAlert=s,{alert:s,newPassage:n}}}function Y(t){const e=t.samples.reduce((n,i)=>Math.max(n,i.speedKmh),0),s=t.passages.filter(n=>n.overLimit);return{mode:t.mode,startedAt:t.startedAt,endedAt:t.endedAt,durationMs:Math.max(0,t.endedAt-t.startedAt),maxSpeedKmh:e,samples:t.samples.length,passages:t.passages,overs:s}}function Z(t){const e=["Relatório Radar",`Modo: ${t.mode==="sim"?"Simulação":"GPS real"}`,`Início: ${y(t.startedAt)}`,`Fim: ${y(t.endedAt)}`,`Duração: ${G(t.durationMs)}`,`Vel. máx: ${m(t.maxSpeedKmh)} km/h`,`Radares passados: ${t.passages.length}`,`Acima do limite: ${t.overs.length}`,""];if(t.passages.length===0)e.push("Nenhuma passagem por radar registrada.");else for(const s of t.passages){const n=s.overLimit?"⚠️ ACIMA":"OK";e.push(`${n} · ${s.radar.name} · limite ${s.radar.limitKmh} · passou a ${m(s.speedKmh)} km/h`+(s.overLimit?` (+${m(s.excessKmh)})`:"")+` · ${y(s.passedAt)}`)}return e.join(`
`)}class tt{constructor(e){u(this,"raf",0);u(this,"startedAt",0);u(this,"distanceM",0);u(this,"speedKmh",90);u(this,"timeScale",4);u(this,"running",!1);u(this,"totalM",X(x));this.cb=e}setSpeedKmh(e){this.speedKmh=Math.max(10,Math.min(140,e))}getSpeedKmh(){return this.speedKmh}setTimeScale(e){this.timeScale=Math.max(1,Math.min(12,e))}getTimeScale(){return this.timeScale}start(){this.stop(),this.running=!0,this.startedAt=performance.now(),this.distanceM=0,this.cb.onStatus(`Simulação · ${Math.round(this.speedKmh)} km/h · ${this.timeScale}×`);let e=performance.now();const s=n=>{if(!this.running)return;const i=Math.min(.25,(n-e)/1e3*this.timeScale);e=n;const l=this.speedKmh/3.6;if(this.distanceM+=l*i,this.distanceM>=this.totalM){const{point:p,heading:f}=k(x,this.totalM);this.cb.onSample({lat:p.lat,lng:p.lng,speedKmh:this.speedKmh,accuracyM:5,heading:f,at:Date.now()}),this.running=!1,this.cb.onStatus("Simulação concluída"),this.cb.onFinished();return}const{point:o,heading:c}=k(x,this.distanceM),d=Math.sin((n-this.startedAt)/700)*.8;this.cb.onSample({lat:o.lat,lng:o.lng,speedKmh:Math.max(0,this.speedKmh+d),accuracyM:5,heading:c,at:Date.now()}),this.raf=requestAnimationFrame(s)};this.raf=requestAnimationFrame(s)}stop(){this.running=!1,this.raf&&cancelAnimationFrame(this.raf),this.raf=0}}const et=document.querySelector("#app"),a={mode:"idle",startedAt:null,samples:[],passages:[],lastSample:null,alert:null,report:null,status:"Escolha GPS real ou Simular no sofá.",error:null},g=new Q(U);let v=null,r=null;function b(){var l;const t=((l=a.lastSample)==null?void 0:l.speedKmh)??0,e=a.alert?`active-${a.alert.level}`:"",s=a.alert?a.alert.level==="imminent"?"alert-imminent":a.alert.level==="near"?"alert-near":"":"",n=a.mode!=="idle"&&!a.report,i=!!a.report;et.innerHTML=`
    <div class="shell ${i?"report-open":""}">
      <header class="brand live-only">
        <h1>Relatório <span>Radar</span></h1>
        <p>GPS, alerta com sirene e voz — “diminua para X km/h” — e relatório ao finalizar.</p>
      </header>

      <section class="speed-stage live-only" aria-live="polite">
        <div class="speed-ring ${s}">
          <div class="speed-inner">
            <div class="speed-value">${m(t)}</div>
            <div class="speed-unit">km/h</div>
            <div class="meta-row">
              <div>
                Limite
                <strong>${a.alert?a.alert.radar.limitKmh:"—"}</strong>
              </div>
              <div>
                Distância
                <strong>${a.alert?`${Math.round(a.alert.distanceM)} m`:"—"}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="alert-banner live-only ${e}">
        <div class="alert-dot" aria-hidden="true"></div>
        <div class="alert-copy">
          ${a.alert?`<strong>${B(a.alert)}</strong>
                 <span>${a.alert.radar.name} · máx ${a.alert.radar.limitKmh} km/h</span>`:`<strong>Sem radar próximo</strong>
                 <span>${n?"Monitorando o percurso…":"Inicie uma viagem para monitorar."}</span>`}
        </div>
      </div>

      <div class="controls live-only">
        <div class="btn-row">
          <button type="button" class="btn-primary" id="btn-gps" ${n?"disabled":""}>
            GPS real
          </button>
          <button type="button" class="btn-secondary" id="btn-sim" ${n&&a.mode!=="sim"?"disabled":""}>
            Simular no sofá
          </button>
        </div>

        <div class="sim-panel ${a.mode==="sim"&&!a.report?"open":""}" id="sim-panel">
          <label>
            Velocidade
            <strong id="sim-speed-label">${(r==null?void 0:r.getSpeedKmh())??90} km/h</strong>
          </label>
          <input
            type="range"
            id="sim-speed"
            min="30"
            max="120"
            step="5"
            value="${(r==null?void 0:r.getSpeedKmh())??90}"
            ${n?"":"disabled"}
          />
          <label>
            Aceleração do tempo
            <strong id="sim-scale-label">${(r==null?void 0:r.getTimeScale())??4}×</strong>
          </label>
          <input
            type="range"
            id="sim-scale"
            min="1"
            max="10"
            step="1"
            value="${(r==null?void 0:r.getTimeScale())??4}"
            ${n?"":"disabled"}
          />
        </div>

        <div class="btn-row">
          <button type="button" class="btn-danger" id="btn-finish" ${n?"":"disabled"}>
            Finalizar
          </button>
        </div>
      </div>

      <p class="status-line live-only ${a.error?"error":""}">
        ${a.error??a.status}
      </p>

      <section class="report ${i?"open":""}" aria-live="polite">
        ${i&&a.report?st(a.report):""}
      </section>
    </div>
    <div class="toast" id="toast" role="status"></div>
  `,at()}function B(t){return t.level==="imminent"?"Radar à frente — reduza":t.level==="near"?"Aproximando do radar":"Radar no trecho"}function st(t){const e=t.overs.length;return`
    <h2>Viagem finalizada</h2>
    <div class="report-summary">
      <div class="stat">
        <em>Duração</em>
        <strong>${G(t.durationMs)}</strong>
      </div>
      <div class="stat">
        <em>Vel. máx</em>
        <strong>${m(t.maxSpeedKmh)} km/h</strong>
      </div>
      <div class="stat">
        <em>Radares passados</em>
        <strong>${t.passages.length}</strong>
      </div>
      <div class="stat">
        <em>Acima do limite</em>
        <strong class="${e?"bad":"good"}">${e}</strong>
      </div>
    </div>

    <ul class="passage-list">
      ${t.passages.length===0?'<li><span class="detail">Nenhuma passagem por radar nesta viagem.</span></li>':t.passages.map(s=>`
            <li>
              <span class="tag ${s.overLimit?"bad":"ok"}">${s.overLimit?"Acima do limite":"Dentro do limite"}</span>
              <span class="title">${s.radar.name}</span>
              <span class="detail">
                Limite ${s.radar.limitKmh} · passou a ${m(s.speedKmh)} km/h
                ${s.overLimit?` (+${m(s.excessKmh)})`:""}
                · ${y(s.passedAt)}
              </span>
            </li>`).join("")}
    </ul>

    <div class="btn-row">
      <button type="button" class="btn-secondary" id="btn-copy">Copiar relatório</button>
      <button type="button" class="btn-primary" id="btn-new">Nova viagem</button>
    </div>
  `}function at(){var s,n,i,l,o;(s=document.getElementById("btn-gps"))==null||s.addEventListener("click",ot),(n=document.getElementById("btn-sim"))==null||n.addEventListener("click",lt),(i=document.getElementById("btn-finish"))==null||i.addEventListener("click",rt),(l=document.getElementById("btn-new"))==null||l.addEventListener("click",ct),(o=document.getElementById("btn-copy"))==null||o.addEventListener("click",dt);const t=document.getElementById("sim-speed");t==null||t.addEventListener("input",()=>{const c=Number(t.value);r==null||r.setSpeedKmh(c);const d=document.getElementById("sim-speed-label");d&&(d.textContent=`${c} km/h`),I()});const e=document.getElementById("sim-scale");e==null||e.addEventListener("input",()=>{const c=Number(e.value);r==null||r.setTimeScale(c);const d=document.getElementById("sim-scale-label");d&&(d.textContent=`${c}×`),I()})}function I(){if(a.mode!=="sim"||!r)return;a.status=`Simulação · ${r.getSpeedKmh()} km/h · ${r.getTimeScale()}×`;const t=document.querySelector(".status-line");t&&!a.error&&(t.textContent=a.status)}function w(){v==null||v.stop(),r==null||r.stop(),v=null,r=null}function nt(t){w(),g.reset(),a.mode=t,a.startedAt=Date.now(),a.samples=[],a.passages=[],a.lastSample=null,a.alert=null,a.report=null,a.error=null,a.status="Iniciando GPS…",b()}function V(t){a.lastSample=t,a.samples.push(t),a.samples.length>5e3&&a.samples.shift();const{alert:e,newPassage:s}=g.update(t);a.alert=e,a.passages=g.getPassages(),it(t,e),j(e),s&&T(s.overLimit?`${s.radar.name}: ${m(s.speedKmh)} km/h — acima do limite`:`${s.radar.name}: passagem OK`,s.overLimit)}function it(t,e){const s=document.querySelector(".speed-value");s&&(s.textContent=m(t.speedKmh));const n=document.querySelector(".speed-ring");n&&(n.classList.remove("alert-near","alert-imminent"),(e==null?void 0:e.level)==="near"&&n.classList.add("alert-near"),(e==null?void 0:e.level)==="imminent"&&n.classList.add("alert-imminent"));const i=document.querySelector(".alert-banner");if(i){i.className=`alert-banner live-only ${e?`active-${e.level}`:""}`;const o=i.querySelector(".alert-copy");o&&(o.innerHTML=e?`<strong>${B(e)}</strong>
           <span>${e.radar.name} · máx ${e.radar.limitKmh} km/h</span>`:`<strong>Sem radar próximo</strong>
           <span>Monitorando o percurso…</span>`)}const l=document.querySelectorAll(".meta-row strong");l.length>=2&&(l[0].textContent=e?String(e.radar.limitKmh):"—",l[1].textContent=e?`${Math.round(e.distanceM)} m`:"—")}function ot(){D(),$(),nt("gps"),v=new J({onSample:V,onError:t=>{a.error=t,a.status=t;const e=document.querySelector(".status-line");e&&(e.classList.add("error"),e.textContent=t)},onStatus:t=>{a.status=t,a.error=null;const e=document.querySelector(".status-line");e&&(e.classList.remove("error"),e.textContent=t)}}),v.start()}function lt(){D(),$(),w(),g.reset(),a.mode="sim",a.startedAt=Date.now(),a.samples=[],a.passages=[],a.lastSample=null,a.alert=null,a.report=null,a.error=null,a.status="Simulação · 90 km/h · 4× · áudio ligado",r=new tt({onSample:V,onStatus:t=>{a.status=t;const e=document.querySelector(".status-line");e&&!a.error&&(e.textContent=t)},onFinished:()=>{a.status="Fim do trecho simulado — toque em Finalizar.";const t=document.querySelector(".status-line");t&&(t.textContent=a.status)}}),r.setSpeedKmh(90),r.setTimeScale(4),b(),r.start()}function rt(){if(a.mode==="idle"||!a.startedAt)return;w(),$(),a.lastSample&&g.update({...a.lastSample,lat:a.lastSample.lat+1,lng:a.lastSample.lng+1,at:Date.now()});const t=Date.now(),e=Y({mode:a.mode==="sim"?"sim":"gps",startedAt:a.startedAt,endedAt:t,samples:a.samples,passages:g.getPassages()});a.report=e,a.mode="idle",a.status="Relatório pronto.",a.alert=null,b()}function ct(){w(),$(),g.reset(),a.mode="idle",a.startedAt=null,a.samples=[],a.passages=[],a.lastSample=null,a.alert=null,a.report=null,a.error=null,a.status="Escolha GPS real ou Simular no sofá.",b()}async function dt(){if(!a.report)return;const t=Z(a.report);try{await navigator.clipboard.writeText(t),T("Relatório copiado")}catch{T("Não foi possível copiar",!0)}}function T(t,e=!1){const s=document.getElementById("toast");s&&(s.textContent=t,s.className=`toast show${e?" bad":""}`,window.setTimeout(()=>{s.classList.remove("show")},2600))}b();
