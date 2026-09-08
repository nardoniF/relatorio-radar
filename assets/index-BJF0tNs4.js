var tt=Object.defineProperty;var et=(t,e,a)=>e in t?tt(t,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):t[e]=a;var m=(t,e,a)=>et(t,typeof e!="symbol"?e+"":e,a);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const l of s)if(l.type==="childList")for(const i of l.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function a(s){const l={};return s.integrity&&(l.integrity=s.integrity),s.referrerPolicy&&(l.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?l.credentials="include":s.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function o(s){if(s.ep)return;s.ep=!0;const l=a(s);fetch(s.href,l)}})();const F="radar_alert_distance_m";let C=null,G=!1,R=!1,E=null,L=0,w=at(),g=null;function at(){const t=localStorage.getItem(F),e=t?Number(t):300;return Number.isFinite(e)?Math.min(1e3,Math.max(50,e)):300}function z(){return w}function nt(t){w=Math.min(1e3,Math.max(50,Math.round(t))),localStorage.setItem(F,String(w))}function O(){if(!C){const t=window.AudioContext||window.webkitAudioContext;C=new t}return C}function U(){return g||(g=new Audio,g.setAttribute("playsinline","true"),g.preload="auto"),g}function H(t){return"https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=pt-BR&q="+encodeURIComponent(t)}async function k(){const t=O();try{t.state==="suspended"&&await t.resume()}catch{}const e=t.currentTime,a=t.createOscillator(),o=t.createGain();if(a.type="sine",a.frequency.value=880,o.gain.setValueAtTime(1e-4,e),o.gain.exponentialRampToValueAtTime(.16,e+.02),o.gain.exponentialRampToValueAtTime(1e-4,e+.12),a.connect(o),o.connect(t.destination),a.start(e),a.stop(e+.13),"speechSynthesis"in window)try{window.speechSynthesis.cancel();const l=new SpeechSynthesisUtterance("Monitoramento iniciado");l.lang="pt-BR",l.rate=1,l.volume=1;const i=window.speechSynthesis.getVoices(),r=i.find(d=>/pt-BR/i.test(d.lang))||i.find(d=>/^pt/i.test(d.lang));r&&(l.voice=r),window.speechSynthesis.speak(l)}catch{}const s=U();try{s.src=H("Monitoramento iniciado"),s.currentTime=0,await s.play()}catch{try{s.src="data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//////////////////////////////////////////////////////////////////8AAAA8TEFNRTMuMTAwBLgAAAAAAAAAABUgJAUHQQAB9gAAAnGRqtmyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",await s.play()}catch{}}G=!0,R=!0}function B(t=1.5,e=!1){if(!G&&!e)return;const a=Date.now();if(!e&&a-L<2200)return;L=a;const o=O();o.state==="suspended"&&o.resume();const s=o.currentTime,l=o.createGain();l.gain.setValueAtTime(1e-4,s),l.gain.exponentialRampToValueAtTime(.38,s+.04),l.gain.exponentialRampToValueAtTime(1e-4,s+t),l.connect(o.destination);const i=o.createOscillator(),r=o.createOscillator();i.type="square",r.type="sawtooth",i.frequency.setValueAtTime(740,s),i.frequency.linearRampToValueAtTime(1100,s+.35),i.frequency.linearRampToValueAtTime(740,s+.7),i.frequency.linearRampToValueAtTime(1100,s+1.05),r.frequency.setValueAtTime(520,s);const d=o.createGain(),u=o.createGain();d.gain.value=.55,u.gain.value=.25,i.connect(d),r.connect(u),d.connect(l),u.connect(l),i.start(s),r.start(s),i.stop(s+t),r.stop(s+t)}function _(t){return`Baixa a velocidade para ${Math.round(t)} quilômetros por hora`}async function Q(t){const e=U();try{return e.pause(),e.src=H(t),e.currentTime=0,await e.play(),!0}catch{if(!("speechSynthesis"in window))return!1;try{window.speechSynthesis.cancel();const a=new SpeechSynthesisUtterance(t);return a.lang="pt-BR",a.rate=.95,a.volume=1,window.speechSynthesis.speak(a),!0}catch{return!1}}}async function st(t){return Q(_(t))}function it(t){if(!("speechSynthesis"in window))return!1;try{window.speechSynthesis.cancel();const e=new SpeechSynthesisUtterance(_(t));e.lang="pt-BR",e.rate=.95,e.volume=1;const a=window.speechSynthesis.getVoices(),o=a.find(s=>/pt-BR/i.test(s.lang))||a.find(s=>/^pt/i.test(s.lang));return o&&(e.voice=o),window.speechSynthesis.speak(e),!0}catch{return!1}}async function j(t,e=!1){if(!R&&!e)return;await st(t)||it(t)}async function ot(t=!1){!R&&!t||(B(1.8,!0),await Q("Você foi multado"))}async function lt(t=60){await k(),B(1.6,!0),await new Promise(e=>setTimeout(e,700)),await j(t,!0)}function rt(t,e){!t||!R||t.distanceM>w||(e>t.radar.limitKmh+.5&&B(1.5),E!==t.radar.id&&(E=t.radar.id,j(t.radar.limitKmh)))}function x(){if(E=null,L=0,"speechSynthesis"in window)try{window.speechSynthesis.cancel()}catch{}try{g==null||g.pause()}catch{}}const I=[{lat:-23.5614,lng:-46.6558},{lat:-23.5602,lng:-46.6525},{lat:-23.5588,lng:-46.6491},{lat:-23.5571,lng:-46.6458},{lat:-23.5554,lng:-46.6426},{lat:-23.5539,lng:-46.6395},{lat:-23.5526,lng:-46.6362},{lat:-23.5514,lng:-46.6328},{lat:-23.5505,lng:-46.6291},{lat:-23.5499,lng:-46.6254},{lat:-23.5496,lng:-46.6216},{lat:-23.5498,lng:-46.6179},{lat:-23.5504,lng:-46.6143},{lat:-23.5515,lng:-46.6109},{lat:-23.553,lng:-46.6078}],Z=[{id:"r1",name:"Radar Consolação",lat:-23.5595,lng:-46.6508,limitKmh:50,alertRadiusM:220,passRadiusM:55},{id:"r2",name:"Radar Augusta",lat:-23.5558,lng:-46.6435,limitKmh:50,alertRadiusM:220,passRadiusM:55},{id:"r3",name:"Radar Higienópolis",lat:-23.5518,lng:-46.6345,limitKmh:40,alertRadiusM:200,passRadiusM:50},{id:"r4",name:"Radar Pacaembu",lat:-23.5497,lng:-46.6235,limitKmh:60,alertRadiusM:250,passRadiusM:60},{id:"r5",name:"Radar Sumaré",lat:-23.5508,lng:-46.6125,limitKmh:50,alertRadiusM:220,passRadiusM:55}],ct=6371e3;function f(t){return t*Math.PI/180}function $(t,e){const a=f(e.lat-t.lat),o=f(e.lng-t.lng),s=f(t.lat),l=f(e.lat),i=Math.sin(a/2)**2+Math.cos(s)*Math.cos(l)*Math.sin(o/2)**2;return 2*ct*Math.asin(Math.min(1,Math.sqrt(i)))}function N(t,e){const a=f(t.lat),o=f(e.lat),s=f(e.lng-t.lng),l=Math.sin(s)*Math.cos(o),i=Math.cos(a)*Math.sin(o)-Math.sin(a)*Math.cos(o)*Math.cos(s);return(Math.atan2(l,i)*180/Math.PI+360)%360}function q(t,e){if(t.length===0)return{point:{lat:0,lng:0},heading:0,totalLengthM:0};if(t.length===1)return{point:t[0],heading:0,totalLengthM:0};let a=Math.max(0,e),o=0;const s=[];for(let i=0;i<t.length-1;i++){const r=$(t[i],t[i+1]);s.push({a:t[i],b:t[i+1],len:r}),o+=r}if(a>=o){const i=s[s.length-1];return{point:i.b,heading:N(i.a,i.b),totalLengthM:o}}for(const i of s){if(a<=i.len){const r=i.len===0?0:a/i.len;return{point:{lat:i.a.lat+(i.b.lat-i.a.lat)*r,lng:i.a.lng+(i.b.lng-i.a.lng)*r},heading:N(i.a,i.b),totalLengthM:o}}a-=i.len}return{point:t[t.length-1],heading:0,totalLengthM:o}}function dt(t){let e=0;for(let a=0;a<t.length-1;a++)e+=$(t[a],t[a+1]);return e}function p(t){return`${Math.round(t)}`}function W(t){const e=Math.floor(t/1e3),a=Math.floor(e/60),o=Math.floor(a/60),s=a%60,l=e%60;return o>0?`${o}h ${String(s).padStart(2,"0")}m`:`${s}m ${String(l).padStart(2,"0")}s`}function S(t){return new Date(t).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}function ut(t){return t.speed!=null&&Number.isFinite(t.speed)&&t.speed>=0?t.speed*3.6:0}class At{constructor(e){m(this,"watchId",null);m(this,"last",null);this.cb=e}get lastSample(){return this.last}start(){if(!("geolocation"in navigator)){this.cb.onError("Geolocalização não disponível neste navegador.");return}if(!window.isSecureContext){this.cb.onError("Safari exige HTTPS para GPS. Abra o app via https://");return}this.cb.onStatus("Pedindo permissão de localização…"),this.watchId=navigator.geolocation.watchPosition(e=>{const a={lat:e.coords.latitude,lng:e.coords.longitude,speedKmh:ut(e.coords),accuracyM:e.coords.accuracy??null,heading:e.coords.heading!=null&&Number.isFinite(e.coords.heading)?e.coords.heading:null,at:e.timestamp||Date.now()};this.last=a,this.cb.onStatus("GPS ativo"),this.cb.onSample(a)},e=>{const a={1:"Permissão de localização negada.",2:"Posição indisponível. Vá a um local aberto ou use Simular.",3:"Tempo esgotado ao obter GPS."};this.cb.onError(a[e.code]??e.message)},{enableHighAccuracy:!0,maximumAge:1e3,timeout:15e3})}stop(){this.watchId!=null&&(navigator.geolocation.clearWatch(this.watchId),this.watchId=null)}}class mt{constructor(e){m(this,"approaches",new Map);m(this,"passages",[]);m(this,"lastAlert",null);this.radars=e}reset(){this.approaches.clear(),this.passages=[],this.lastAlert=null}getPassages(){return[...this.passages]}upcoming(e,a=3){const o=new Set(this.passages.map(s=>s.radar.id));return this.radars.filter(s=>!o.has(s.id)).map(s=>({radar:s,distanceM:$(e,s)})).sort((s,l)=>s.distanceM-l.distanceM).slice(0,a)}getAlert(){return this.lastAlert}update(e){let a=null,o=null;for(const s of this.radars){const l=$(e,s);let i=this.approaches.get(s.id);if(l<=s.alertRadiusM){const r=l<=s.passRadiusM*1.4?"imminent":l<=s.alertRadiusM*.55?"near":"far";(!a||l<a.distanceM)&&(a={radar:s,distanceM:l,level:r})}if(l<=s.passRadiusM)i?(i.entered=!0,l<i.closestM&&(i.closestM=l,i.speedAtClosest=e.speedKmh,i.atClosest=e.at)):(i={radar:s,entered:!0,closestM:l,speedAtClosest:e.speedKmh,atClosest:e.at},this.approaches.set(s.id,i));else if(i!=null&&i.entered){const r=Math.max(0,i.speedAtClosest-s.limitKmh),d={radar:s,passedAt:i.atClosest,speedKmh:i.speedAtClosest,overLimit:r>0,excessKmh:r,closestDistanceM:i.closestM};this.passages.push(d),this.approaches.delete(s.id),o=d}}return this.lastAlert=a,{alert:a,newPassage:o}}}function pt(t){const e=t.samples.reduce((o,s)=>Math.max(o,s.speedKmh),0),a=t.passages.filter(o=>o.overLimit);return{mode:t.mode,startedAt:t.startedAt,endedAt:t.endedAt,durationMs:Math.max(0,t.endedAt-t.startedAt),maxSpeedKmh:e,samples:t.samples.length,passages:t.passages,overs:a}}function ht(t){const e=["Relatório Radar",`Modo: ${t.mode==="sim"?"Simulação":"GPS real"}`,`Início: ${S(t.startedAt)}`,`Fim: ${S(t.endedAt)}`,`Duração: ${W(t.durationMs)}`,`Vel. máx: ${p(t.maxSpeedKmh)} km/h`,`Radares passados: ${t.passages.length}`,`Acima do limite: ${t.overs.length}`,""];if(t.passages.length===0)e.push("Nenhuma passagem por radar registrada.");else for(const a of t.passages){const o=a.overLimit?"⚠️ ACIMA":"OK";e.push(`${o} · ${a.radar.name} · limite ${a.radar.limitKmh} · passou a ${p(a.speedKmh)} km/h`+(a.overLimit?` (+${p(a.excessKmh)})`:"")+` · ${S(a.passedAt)}`)}return e.join(`
`)}class gt{constructor(e){m(this,"raf",0);m(this,"startedAt",0);m(this,"distanceM",0);m(this,"speedKmh",90);m(this,"timeScale",4);m(this,"running",!1);m(this,"totalM",dt(I));this.cb=e}setSpeedKmh(e){this.speedKmh=Math.max(10,Math.min(140,e))}getSpeedKmh(){return this.speedKmh}setTimeScale(e){this.timeScale=Math.max(1,Math.min(12,e))}getTimeScale(){return this.timeScale}start(){this.stop(),this.running=!0,this.startedAt=performance.now(),this.distanceM=0,this.cb.onStatus(`Simulação · ${Math.round(this.speedKmh)} km/h · ${this.timeScale}×`);let e=performance.now();const a=o=>{if(!this.running)return;const s=Math.min(.25,(o-e)/1e3*this.timeScale);e=o;const l=this.speedKmh/3.6;if(this.distanceM+=l*s,this.distanceM>=this.totalM){const{point:u,heading:A}=q(I,this.totalM);this.cb.onSample({lat:u.lat,lng:u.lng,speedKmh:this.speedKmh,accuracyM:5,heading:A,at:Date.now()}),this.running=!1,this.cb.onStatus("Simulação concluída"),this.cb.onFinished();return}const{point:i,heading:r}=q(I,this.distanceM),d=Math.sin((o-this.startedAt)/700)*.8;this.cb.onSample({lat:i.lat,lng:i.lng,speedKmh:Math.max(0,this.speedKmh+d),accuracyM:5,heading:r,at:Date.now()}),this.raf=requestAnimationFrame(a)};this.raf=requestAnimationFrame(a)}stop(){this.running=!1,this.raf&&cancelAnimationFrame(this.raf),this.raf=0}}const ft=document.querySelector("#app"),n={mode:"idle",startedAt:null,samples:[],passages:[],lastSample:null,alert:null,report:null,status:"Escolha GPS real ou Simular no sofá.",error:null,alertDistanceM:z()},h=new mt(Z);let v=null,c=null;function J(t,e){return e?t>e.radar.limitKmh+.5?"over":"ok":"idle"}function M(){var d,u;const t=((d=n.lastSample)==null?void 0:d.speedKmh)??0,e=((u=n.alert)==null?void 0:u.radar.limitKmh)??null,a=n.alert?Math.round(n.alert.distanceM):null,o=J(t,n.alert),s=n.mode!=="idle"&&!n.report,l=!!n.report,i=n.alert!=null&&n.alert.distanceM<=n.alertDistanceM,r=n.lastSample!=null?h.upcoming(n.lastSample,3):Z.slice(0,3).map(A=>({radar:A,distanceM:NaN}));ft.innerHTML=`
    <div class="shell ${l?"report-open":""}">
      <header class="brand live-only">
        <h1>Relatório <span>Radar</span></h1>
        <p>Círculo = limite. Em cima = sua velocidade. Ao lado = próximos 3 radares.</p>
      </header>

      <section class="speed-stage live-only" aria-live="polite">
        <div class="my-speed" id="my-speed">
          <span class="my-speed-label">Sua velocidade</span>
          <strong id="my-speed-value">${p(t)}</strong>
          <span class="my-speed-unit">km/h</span>
        </div>

        <div class="stage-row">
          <div class="speed-ring ring-${o}" id="speed-ring">
            <div class="speed-inner">
              <div class="limit-label">${e!=null?"Baixe para":"Limite"}</div>
              <div class="speed-value" id="limit-value">${e!=null?p(e):"—"}</div>
              <div class="speed-unit">km/h</div>
              <div class="dist-line" id="dist-line">
                ${a!=null?i?`Radar a ${a} m`:`Radar a ${a} m · alerta em ${n.alertDistanceM} m`:"Sem radar próximo"}
              </div>
            </div>
          </div>

          <aside class="upcoming" id="upcoming-list">
            <div class="upcoming-title">Próximos</div>
            ${Y(r)}
          </aside>
        </div>
      </section>

      <div class="alert-banner live-only ${o==="over"?"active-imminent":o==="ok"&&n.alert?"active-far":""}">
        <div class="alert-dot" aria-hidden="true"></div>
        <div class="alert-copy">
          ${n.alert?`<strong>${o==="over"?"Acima do limite — reduza":"No limite ou abaixo"}</strong>
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
          <p class="hint">Padrão 300 m. Ao iniciar, o app libera a voz (diz “Monitoramento iniciado”).</p>
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

      <section class="report ${l?"open":""}" aria-live="polite">
        ${l&&n.report?vt(n.report):""}
      </section>
    </div>
    <div class="toast" id="toast" role="status"></div>
  `,yt()}function Y(t){return t.length===0?'<div class="upcoming-empty">Nenhum à frente</div>':t.map((e,a)=>{const o=Number.isFinite(e.distanceM)?`${Math.round(e.distanceM)} m`:"—";return`
        <div class="upcoming-item" data-radar="${e.radar.id}">
          <div class="upcoming-rank">${a+1}</div>
          <div class="upcoming-body">
            <strong>${e.radar.limitKmh}</strong>
            <span>${e.radar.name.replace(/^Radar\s+/i,"")}</span>
          </div>
          <div class="upcoming-dist" data-dist="${e.radar.id}">${o}</div>
        </div>`}).join("")}function vt(t){const e=t.overs.length;return`
    <h2>Viagem finalizada</h2>
    <div class="report-summary">
      <div class="stat"><em>Duração</em><strong>${W(t.durationMs)}</strong></div>
      <div class="stat"><em>Vel. máx</em><strong>${p(t.maxSpeedKmh)} km/h</strong></div>
      <div class="stat"><em>Radares</em><strong>${t.passages.length}</strong></div>
      <div class="stat"><em>Acima do limite</em><strong class="${e?"bad":"good"}">${e}</strong></div>
    </div>
    <ul class="passage-list">
      ${t.passages.length===0?'<li><span class="detail">Nenhuma passagem por radar.</span></li>':t.passages.map(a=>`
            <li>
              <span class="tag ${a.overLimit?"bad":"ok"}">${a.overLimit?"Acima do limite":"Dentro do limite"}</span>
              <span class="title">${a.radar.name}</span>
              <span class="detail">
                Limite ${a.radar.limitKmh} · passou a ${p(a.speedKmh)} km/h
                ${a.overLimit?` (+${p(a.excessKmh)})`:""}
                · ${S(a.passedAt)}
              </span>
            </li>`).join("")}
    </ul>
    <div class="btn-row">
      <button type="button" class="btn-secondary" id="btn-copy">Copiar relatório</button>
      <button type="button" class="btn-primary" id="btn-new">Nova viagem</button>
    </div>
  `}function yt(){var o,s,l,i,r,d;(o=document.getElementById("btn-gps"))==null||o.addEventListener("click",St),(s=document.getElementById("btn-sim"))==null||s.addEventListener("click",wt),(l=document.getElementById("btn-finish"))==null||l.addEventListener("click",$t),(i=document.getElementById("btn-new"))==null||i.addEventListener("click",Rt),(r=document.getElementById("btn-copy"))==null||r.addEventListener("click",xt),(d=document.getElementById("btn-test-sound"))==null||d.addEventListener("click",()=>{lt(60).then(()=>y("Falou: Baixa a velocidade para 60"))});const t=document.getElementById("alert-dist");t==null||t.addEventListener("input",()=>{const u=Number(t.value);nt(u),n.alertDistanceM=z();const A=document.getElementById("alert-dist-label");A&&(A.textContent=`${n.alertDistanceM} m`)});const e=document.getElementById("sim-speed");e==null||e.addEventListener("input",()=>{const u=Number(e.value);c==null||c.setSpeedKmh(u);const A=document.getElementById("sim-speed-label");A&&(A.textContent=`${u} km/h`),V()});const a=document.getElementById("sim-scale");a==null||a.addEventListener("input",()=>{const u=Number(a.value);c==null||c.setTimeScale(u);const A=document.getElementById("sim-scale-label");A&&(A.textContent=`${u}×`),V()})}function V(){if(n.mode!=="sim"||!c)return;n.status=`Simulação · ${c.getSpeedKmh()} km/h · ${c.getTimeScale()}×`;const t=document.querySelector(".status-line");t&&!n.error&&(t.textContent=n.status)}function T(){v==null||v.stop(),c==null||c.stop(),v=null,c=null}function Mt(t){T(),h.reset(),n.mode=t,n.startedAt=Date.now(),n.samples=[],n.passages=[],n.lastSample=null,n.alert=null,n.report=null,n.error=null,n.status="GPS…",M()}function X(t){n.lastSample=t,n.samples.push(t),n.samples.length>5e3&&n.samples.shift();const{alert:e,newPassage:a}=h.update(t);n.alert=e,n.passages=h.getPassages(),bt(t,e),rt(e,t.speedKmh),a&&(a.overLimit?(ot(),y(`${a.radar.name}: ${p(a.speedKmh)} km/h — Você foi multado`,!0)):y(`${a.radar.name}: OK`,!1))}function bt(t,e){const a=t.speedKmh,o=(e==null?void 0:e.radar.limitKmh)??null,s=e?Math.round(e.distanceM):null,l=J(a,e),i=e!=null&&e.distanceM<=n.alertDistanceM,r=document.getElementById("my-speed-value");r&&(r.textContent=p(a));const d=document.getElementById("limit-value");d&&(d.textContent=o!=null?p(o):"—");const u=document.getElementById("speed-ring");u&&(u.className=`speed-ring ring-${l}`);const A=document.getElementById("dist-line");A&&(A.textContent=s!=null?i?`Radar a ${s} m`:`Radar a ${s} m · alerta em ${n.alertDistanceM} m`:"Sem radar próximo");const D=document.querySelector(".limit-label");D&&(D.textContent=o!=null?"Baixe para":"Limite");const K=document.querySelector(".alert-banner");if(K){K.className=`alert-banner live-only ${l==="over"?"active-imminent":l==="ok"&&e?"active-far":""}`;const b=K.querySelector(".alert-copy");b&&(b.innerHTML=e?`<strong>${l==="over"?"Acima do limite — reduza":"No limite ou abaixo"}</strong>
           <span>${e.radar.name} · alvo ${e.radar.limitKmh} km/h</span>`:`<strong>Sem radar no alcance de alerta</strong>
           <span>Monitorando…</span>`)}const P=document.getElementById("upcoming-list");if(P){const b=h.upcoming(t,3);P.innerHTML=`<div class="upcoming-title">Próximos</div>${Y(b)}`}}async function St(){await k(),x(),Mt("gps"),v=new At({onSample:X,onError:t=>{n.error=t,n.status=t;const e=document.querySelector(".status-line");e&&(e.classList.add("error"),e.textContent=t)},onStatus:t=>{n.status=t,n.error=null;const e=document.querySelector(".status-line");e&&(e.classList.remove("error"),e.textContent=t)}}),v.start()}async function wt(){await k(),x(),T(),h.reset(),n.mode="sim",n.startedAt=Date.now(),n.samples=[],n.passages=[],n.lastSample=null,n.alert=null,n.report=null,n.error=null,n.status="Simulação · voz liberada",c=new gt({onSample:X,onStatus:t=>{n.status=t;const e=document.querySelector(".status-line");e&&!n.error&&(e.textContent=t)},onFinished:()=>{n.status="Fim do trecho — Finalizar";const t=document.querySelector(".status-line");t&&(t.textContent=n.status)}}),c.setSpeedKmh(90),c.setTimeScale(4),M(),c.start()}function $t(){if(n.mode==="idle"||!n.startedAt)return;T(),x(),n.lastSample&&h.update({...n.lastSample,lat:n.lastSample.lat+1,lng:n.lastSample.lng+1,at:Date.now()});const t=Date.now();n.report=pt({mode:n.mode==="sim"?"sim":"gps",startedAt:n.startedAt,endedAt:t,samples:n.samples,passages:h.getPassages()}),n.mode="idle",n.status="Relatório pronto.",n.alert=null,M()}function Rt(){T(),x(),h.reset(),n.mode="idle",n.startedAt=null,n.samples=[],n.passages=[],n.lastSample=null,n.alert=null,n.report=null,n.error=null,n.status="Escolha GPS real ou Simular no sofá.",M()}async function xt(){if(n.report)try{await navigator.clipboard.writeText(ht(n.report)),y("Relatório copiado")}catch{y("Não foi possível copiar",!0)}}function y(t,e=!1){const a=document.getElementById("toast");a&&(a.textContent=t,a.className=`toast show${e?" bad":""}`,window.setTimeout(()=>a.classList.remove("show"),2600))}M();
