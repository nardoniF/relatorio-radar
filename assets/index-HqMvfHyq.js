var ct=Object.defineProperty;var dt=(t,e,a)=>e in t?ct(t,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):t[e]=a;var m=(t,e,a)=>dt(t,typeof e!="symbol"?e+"":e,a);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function a(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(s){if(s.ep)return;s.ep=!0;const r=a(s);fetch(s.href,r)}})();const U="radar_alert_distance_m";let K=null,_=!1,I=!1,B=null,k=0,E=ut(),b=null;function ut(){const t=localStorage.getItem(U),e=t?Number(t):300;return Number.isFinite(e)?Math.min(1e3,Math.max(50,e)):300}function H(){return E}function mt(t){E=Math.min(1e3,Math.max(50,Math.round(t))),localStorage.setItem(U,String(E))}function j(){if(!K){const t=window.AudioContext||window.webkitAudioContext;K=new t}return K}function Q(){return b||(b=new Audio,b.setAttribute("playsinline","true"),b.preload="auto"),b}function Z(t){return"https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=pt-BR&q="+encodeURIComponent(t)}async function P(){const t=j();try{t.state==="suspended"&&await t.resume()}catch{}const e=t.currentTime,a=t.createOscillator(),o=t.createGain();if(a.type="sine",a.frequency.value=880,o.gain.setValueAtTime(1e-4,e),o.gain.exponentialRampToValueAtTime(.16,e+.02),o.gain.exponentialRampToValueAtTime(1e-4,e+.12),a.connect(o),o.connect(t.destination),a.start(e),a.stop(e+.13),"speechSynthesis"in window)try{window.speechSynthesis.cancel();const r=new SpeechSynthesisUtterance("Monitoramento iniciado");r.lang="pt-BR",r.rate=1,r.volume=1;const i=window.speechSynthesis.getVoices(),l=i.find(d=>/pt-BR/i.test(d.lang))||i.find(d=>/^pt/i.test(d.lang));l&&(r.voice=l),window.speechSynthesis.speak(r)}catch{}const s=Q();try{s.src=Z("Monitoramento iniciado"),s.currentTime=0,await s.play()}catch{try{s.src="data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//////////////////////////////////////////////////////////////////8AAAA8TEFNRTMuMTAwBLgAAAAAAAAAABUgJAUHQQAB9gAAAnGRqtmyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",await s.play()}catch{}}_=!0,I=!0}function N(t=1.5,e=!1){if(!_&&!e)return;const a=Date.now();if(!e&&a-k<2200)return;k=a;const o=j();o.state==="suspended"&&o.resume();const s=o.currentTime,r=o.createGain();r.gain.setValueAtTime(1e-4,s),r.gain.exponentialRampToValueAtTime(.38,s+.04),r.gain.exponentialRampToValueAtTime(1e-4,s+t),r.connect(o.destination);const i=o.createOscillator(),l=o.createOscillator();i.type="square",l.type="sawtooth",i.frequency.setValueAtTime(740,s),i.frequency.linearRampToValueAtTime(1100,s+.35),i.frequency.linearRampToValueAtTime(740,s+.7),i.frequency.linearRampToValueAtTime(1100,s+1.05),l.frequency.setValueAtTime(520,s);const d=o.createGain(),u=o.createGain();d.gain.value=.55,u.gain.value=.25,i.connect(d),l.connect(u),d.connect(r),u.connect(r),i.start(s),l.start(s),i.stop(s+t),l.stop(s+t)}function W(t){return`Baixa a velocidade para ${Math.round(t)} quilômetros por hora`}async function Y(t){const e=Q();try{return e.pause(),e.src=Z(t),e.currentTime=0,await e.play(),!0}catch{if(!("speechSynthesis"in window))return!1;try{window.speechSynthesis.cancel();const a=new SpeechSynthesisUtterance(t);return a.lang="pt-BR",a.rate=.95,a.volume=1,window.speechSynthesis.speak(a),!0}catch{return!1}}}async function At(t){return Y(W(t))}function pt(t){if(!("speechSynthesis"in window))return!1;try{window.speechSynthesis.cancel();const e=new SpeechSynthesisUtterance(W(t));e.lang="pt-BR",e.rate=.95,e.volume=1;const a=window.speechSynthesis.getVoices(),o=a.find(s=>/pt-BR/i.test(s.lang))||a.find(s=>/^pt/i.test(s.lang));return o&&(e.voice=o),window.speechSynthesis.speak(e),!0}catch{return!1}}async function J(t,e=!1){if(!I&&!e)return;await At(t)||pt(t)}async function gt(t=!1){!I&&!t||(N(1.8,!0),await Y("Você foi multado"))}async function ht(t=60){await P(),N(1.6,!0),await new Promise(e=>setTimeout(e,700)),await J(t,!0)}function ft(t,e){!t||!I||t.distanceM>E||(e>t.radar.limitKmh+.5&&N(1.5),B!==t.radar.id&&(B=t.radar.id,J(t.radar.limitKmh)))}function C(){if(B=null,k=0,"speechSynthesis"in window)try{window.speechSynthesis.cancel()}catch{}try{b==null||b.pause()}catch{}}const L=[{lat:-23.5614,lng:-46.6558},{lat:-23.5602,lng:-46.6525},{lat:-23.5588,lng:-46.6491},{lat:-23.5571,lng:-46.6458},{lat:-23.5554,lng:-46.6426},{lat:-23.5539,lng:-46.6395},{lat:-23.5526,lng:-46.6362},{lat:-23.5514,lng:-46.6328},{lat:-23.5505,lng:-46.6291},{lat:-23.5499,lng:-46.6254},{lat:-23.5496,lng:-46.6216},{lat:-23.5498,lng:-46.6179},{lat:-23.5504,lng:-46.6143},{lat:-23.5515,lng:-46.6109},{lat:-23.553,lng:-46.6078}],X=[{id:"r1",name:"Radar Consolação",lat:-23.5595,lng:-46.6508,limitKmh:50,alertRadiusM:220,passRadiusM:55},{id:"r2",name:"Radar Augusta",lat:-23.5558,lng:-46.6435,limitKmh:50,alertRadiusM:220,passRadiusM:55},{id:"r3",name:"Radar Higienópolis",lat:-23.5518,lng:-46.6345,limitKmh:40,alertRadiusM:200,passRadiusM:50},{id:"r4",name:"Radar Pacaembu",lat:-23.5497,lng:-46.6235,limitKmh:60,alertRadiusM:250,passRadiusM:60},{id:"r5",name:"Radar Sumaré",lat:-23.5508,lng:-46.6125,limitKmh:50,alertRadiusM:220,passRadiusM:55}],vt=6371e3;function y(t){return t*Math.PI/180}function x(t,e){const a=y(e.lat-t.lat),o=y(e.lng-t.lng),s=y(t.lat),r=y(e.lat),i=Math.sin(a/2)**2+Math.cos(s)*Math.cos(r)*Math.sin(o/2)**2;return 2*vt*Math.asin(Math.min(1,Math.sqrt(i)))}function F(t,e){const a=y(t.lat),o=y(e.lat),s=y(e.lng-t.lng),r=Math.sin(s)*Math.cos(o),i=Math.cos(a)*Math.sin(o)-Math.sin(a)*Math.cos(o)*Math.cos(s);return(Math.atan2(r,i)*180/Math.PI+360)%360}function G(t,e){if(t.length===0)return{point:{lat:0,lng:0},heading:0,totalLengthM:0};if(t.length===1)return{point:t[0],heading:0,totalLengthM:0};let a=Math.max(0,e),o=0;const s=[];for(let i=0;i<t.length-1;i++){const l=x(t[i],t[i+1]);s.push({a:t[i],b:t[i+1],len:l}),o+=l}if(a>=o){const i=s[s.length-1];return{point:i.b,heading:F(i.a,i.b),totalLengthM:o}}for(const i of s){if(a<=i.len){const l=i.len===0?0:a/i.len;return{point:{lat:i.a.lat+(i.b.lat-i.a.lat)*l,lng:i.a.lng+(i.b.lng-i.a.lng)*l},heading:F(i.a,i.b),totalLengthM:o}}a-=i.len}return{point:t[t.length-1],heading:0,totalLengthM:o}}function bt(t){let e=0;for(let a=0;a<t.length-1;a++)e+=x(t[a],t[a+1]);return e}function h(t){return`${Math.round(t)}`}function tt(t){const e=Math.floor(t/1e3),a=Math.floor(e/60),o=Math.floor(a/60),s=a%60,r=e%60;return o>0?`${o}h ${String(s).padStart(2,"0")}m`:`${s}m ${String(r).padStart(2,"0")}s`}function R(t){return new Date(t).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}function yt(t){const e=t.samples.reduce((o,s)=>Math.max(o,s.speedKmh),0),a=t.passages.filter(o=>o.overLimit);return{mode:t.mode,startedAt:t.startedAt,endedAt:t.endedAt,durationMs:Math.max(0,t.endedAt-t.startedAt),maxSpeedKmh:e,samples:t.samples.length,passages:t.passages,overs:a}}function q(t){const e=["Relatório Radar",`Modo: ${t.mode==="sim"?"Simulação":"GPS real"}`,`Início: ${R(t.startedAt)}`,`Fim: ${R(t.endedAt)}`,`Duração: ${tt(t.durationMs)}`,`Vel. máx: ${h(t.maxSpeedKmh)} km/h`,`Radares passados: ${t.passages.length}`,`Acima do limite: ${t.overs.length}`,""];if(t.passages.length===0)e.push("Nenhuma passagem por radar registrada.");else for(const a of t.passages){const o=a.overLimit?"⚠️ ACIMA":"OK";e.push(`${o} · ${a.radar.name} · limite ${a.radar.limitKmh} · passou a ${h(a.speedKmh)} km/h`+(a.overLimit?` (+${h(a.excessKmh)})`:"")+` · ${R(a.passedAt)}`)}return e.join(`
`)}const et="radar_report_email";function V(){var t;return((t=localStorage.getItem(et))==null?void 0:t.trim())??""}function D(t){localStorage.setItem(et,t.trim())}function at(t){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t.trim())}function nt(t){const e=t.overs.length,a=new Date(t.endedAt).toLocaleDateString("pt-BR");return e>0?`Relatório Radar ${a} — ${e} acima do limite`:`Relatório Radar ${a}`}function O(t,e,a){return`mailto:${t}?subject=${encodeURIComponent(e)}&body=${encodeURIComponent(a)}`}function st(t,e){const a=V().trim();if(!a||!at(a))return!1;const o=q(t),s=nt(t);let r=O(a,s,o);if(r.length>1800){const i=o.slice(0,1400)+`

…(relatório truncado; use Copiar relatório para o texto completo)`;r=O(a,s,i)}return window.location.href=r,!0}async function Mt(t){const e=q(t),a=nt(t);if(navigator.share)try{return await navigator.share({title:a,text:e}),"share"}catch{}return st(t)?"mailto":"none"}function St(t){return t.speed!=null&&Number.isFinite(t.speed)&&t.speed>=0?t.speed*3.6:0}class wt{constructor(e){m(this,"watchId",null);m(this,"last",null);this.cb=e}get lastSample(){return this.last}start(){if(!("geolocation"in navigator)){this.cb.onError("Geolocalização não disponível neste navegador.");return}if(!window.isSecureContext){this.cb.onError("Safari exige HTTPS para GPS. Abra o app via https://");return}this.cb.onStatus("Pedindo permissão de localização…"),this.watchId=navigator.geolocation.watchPosition(e=>{const a={lat:e.coords.latitude,lng:e.coords.longitude,speedKmh:St(e.coords),accuracyM:e.coords.accuracy??null,heading:e.coords.heading!=null&&Number.isFinite(e.coords.heading)?e.coords.heading:null,at:e.timestamp||Date.now()};this.last=a,this.cb.onStatus("GPS ativo"),this.cb.onSample(a)},e=>{const a={1:"Permissão de localização negada.",2:"Posição indisponível. Vá a um local aberto ou use Simular.",3:"Tempo esgotado ao obter GPS."};this.cb.onError(a[e.code]??e.message)},{enableHighAccuracy:!0,maximumAge:1e3,timeout:15e3})}stop(){this.watchId!=null&&(navigator.geolocation.clearWatch(this.watchId),this.watchId=null)}}class $t{constructor(e){m(this,"approaches",new Map);m(this,"passages",[]);m(this,"lastAlert",null);this.radars=e}reset(){this.approaches.clear(),this.passages=[],this.lastAlert=null}getPassages(){return[...this.passages]}upcoming(e,a=3){const o=new Set(this.passages.map(s=>s.radar.id));return this.radars.filter(s=>!o.has(s.id)).map(s=>({radar:s,distanceM:x(e,s)})).sort((s,r)=>s.distanceM-r.distanceM).slice(0,a)}getAlert(){return this.lastAlert}update(e){let a=null,o=null;for(const s of this.radars){const r=x(e,s);let i=this.approaches.get(s.id);if(r<=s.alertRadiusM){const l=r<=s.passRadiusM*1.4?"imminent":r<=s.alertRadiusM*.55?"near":"far";(!a||r<a.distanceM)&&(a={radar:s,distanceM:r,level:l})}if(r<=s.passRadiusM)i?(i.entered=!0,r<i.closestM&&(i.closestM=r,i.speedAtClosest=e.speedKmh,i.atClosest=e.at)):(i={radar:s,entered:!0,closestM:r,speedAtClosest:e.speedKmh,atClosest:e.at},this.approaches.set(s.id,i));else if(i!=null&&i.entered){const l=Math.max(0,i.speedAtClosest-s.limitKmh),d={radar:s,passedAt:i.atClosest,speedKmh:i.speedAtClosest,overLimit:l>0,excessKmh:l,closestDistanceM:i.closestM};this.passages.push(d),this.approaches.delete(s.id),o=d}}return this.lastAlert=a,{alert:a,newPassage:o}}}class Rt{constructor(e){m(this,"raf",0);m(this,"startedAt",0);m(this,"distanceM",0);m(this,"speedKmh",90);m(this,"timeScale",4);m(this,"running",!1);m(this,"totalM",bt(L));this.cb=e}setSpeedKmh(e){this.speedKmh=Math.max(10,Math.min(140,e))}getSpeedKmh(){return this.speedKmh}setTimeScale(e){this.timeScale=Math.max(1,Math.min(12,e))}getTimeScale(){return this.timeScale}start(){this.stop(),this.running=!0,this.startedAt=performance.now(),this.distanceM=0,this.cb.onStatus(`Simulação · ${Math.round(this.speedKmh)} km/h · ${this.timeScale}×`);let e=performance.now();const a=o=>{if(!this.running)return;const s=Math.min(.25,(o-e)/1e3*this.timeScale);e=o;const r=this.speedKmh/3.6;if(this.distanceM+=r*s,this.distanceM>=this.totalM){const{point:u,heading:f}=G(L,this.totalM);this.cb.onSample({lat:u.lat,lng:u.lng,speedKmh:this.speedKmh,accuracyM:5,heading:f,at:Date.now()}),this.running=!1,this.cb.onStatus("Simulação concluída"),this.cb.onFinished();return}const{point:i,heading:l}=G(L,this.distanceM),d=Math.sin((o-this.startedAt)/700)*.8;this.cb.onSample({lat:i.lat,lng:i.lng,speedKmh:Math.max(0,this.speedKmh+d),accuracyM:5,heading:l,at:Date.now()}),this.raf=requestAnimationFrame(a)};this.raf=requestAnimationFrame(a)}stop(){this.running=!1,this.raf&&cancelAnimationFrame(this.raf),this.raf=0}}const Et=document.querySelector("#app"),n={mode:"idle",startedAt:null,samples:[],passages:[],lastSample:null,alert:null,report:null,status:"Escolha GPS real ou Simular no sofá.",error:null,alertDistanceM:H()},v=new $t(X);let M=null,c=null;function it(t,e){return e?t>e.radar.limitKmh+.5?"over":"ok":"idle"}function w(){var d,u;const t=((d=n.lastSample)==null?void 0:d.speedKmh)??0,e=((u=n.alert)==null?void 0:u.radar.limitKmh)??null,a=n.alert?Math.round(n.alert.distanceM):null,o=it(t,n.alert),s=n.mode!=="idle"&&!n.report,r=!!n.report,i=n.alert!=null&&n.alert.distanceM<=n.alertDistanceM,l=n.lastSample!=null?v.upcoming(n.lastSample,3):X.slice(0,3).map(f=>({radar:f,distanceM:NaN}));Et.innerHTML=`
    <div class="shell ${r?"report-open":""}">
      <header class="brand live-only">
        <h1>Relatório <span>Radar</span></h1>
        <p>Círculo = limite. Em cima = sua velocidade. Ao lado = próximos 3 radares.</p>
      </header>

      <section class="speed-stage live-only" aria-live="polite">
        <div class="my-speed" id="my-speed">
          <span class="my-speed-label">Sua velocidade</span>
          <strong id="my-speed-value">${h(t)}</strong>
          <span class="my-speed-unit">km/h</span>
        </div>

        <div class="stage-row">
          <div class="speed-ring ring-${o}" id="speed-ring">
            <div class="speed-inner">
              <div class="limit-label">${e!=null?"Baixe para":"Limite"}</div>
              <div class="speed-value" id="limit-value">${e!=null?h(e):"—"}</div>
              <div class="speed-unit">km/h</div>
              <div class="dist-line" id="dist-line">
                ${a!=null?i?`Radar a ${a} m`:`Radar a ${a} m · alerta em ${n.alertDistanceM} m`:"Sem radar próximo"}
              </div>
            </div>
          </div>

          <aside class="upcoming" id="upcoming-list">
            <div class="upcoming-title">Próximos</div>
            ${ot(l)}
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
          <label class="email-label" for="report-email">
            E-mail do relatório
          </label>
          <input
            type="email"
            id="report-email"
            class="email-input"
            placeholder="seu@email.com"
            value="${It(V())}"
            autocomplete="email"
            inputmode="email"
          />
          <p class="hint">Ao finalizar, o Mail abre com o relatório. Confira e toque em Enviar.</p>
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
        ${r&&n.report?xt(n.report):""}
      </section>
    </div>
    <div class="toast" id="toast" role="status"></div>
  `,Ct()}function ot(t){return t.length===0?'<div class="upcoming-empty">Nenhum à frente</div>':t.map((e,a)=>{const o=Number.isFinite(e.distanceM)?`${Math.round(e.distanceM)} m`:"—";return`
        <div class="upcoming-item" data-radar="${e.radar.id}">
          <div class="upcoming-rank">${a+1}</div>
          <div class="upcoming-body">
            <strong>${e.radar.limitKmh}</strong>
            <span>${e.radar.name.replace(/^Radar\s+/i,"")}</span>
          </div>
          <div class="upcoming-dist" data-dist="${e.radar.id}">${o}</div>
        </div>`}).join("")}function xt(t){const e=t.overs.length;return`
    <h2>Viagem finalizada</h2>
    <div class="report-summary">
      <div class="stat"><em>Duração</em><strong>${tt(t.durationMs)}</strong></div>
      <div class="stat"><em>Vel. máx</em><strong>${h(t.maxSpeedKmh)} km/h</strong></div>
      <div class="stat"><em>Radares</em><strong>${t.passages.length}</strong></div>
      <div class="stat"><em>Acima do limite</em><strong class="${e?"bad":"good"}">${e}</strong></div>
    </div>
    <ul class="passage-list">
      ${t.passages.length===0?'<li><span class="detail">Nenhuma passagem por radar.</span></li>':t.passages.map(a=>`
            <li>
              <span class="tag ${a.overLimit?"bad":"ok"}">${a.overLimit?"Acima do limite":"Dentro do limite"}</span>
              <span class="title">${a.radar.name}</span>
              <span class="detail">
                Limite ${a.radar.limitKmh} · passou a ${h(a.speedKmh)} km/h
                ${a.overLimit?` (+${h(a.excessKmh)})`:""}
                · ${R(a.passedAt)}
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
  `}function It(t){return t.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Ct(){var s,r,i,l,d,u,f,S;(s=document.getElementById("btn-gps"))==null||s.addEventListener("click",Lt),(r=document.getElementById("btn-sim"))==null||r.addEventListener("click",Bt),(i=document.getElementById("btn-finish"))==null||i.addEventListener("click",kt),(l=document.getElementById("btn-new"))==null||l.addEventListener("click",Pt),(d=document.getElementById("btn-copy"))==null||d.addEventListener("click",Nt),(u=document.getElementById("btn-email"))==null||u.addEventListener("click",()=>lt()),(f=document.getElementById("btn-share"))==null||f.addEventListener("click",()=>{Dt()}),(S=document.getElementById("btn-test-sound"))==null||S.addEventListener("click",()=>{ht(60).then(()=>A("Falou: Baixa a velocidade para 60"))});const t=document.getElementById("report-email");t==null||t.addEventListener("change",()=>{D(t.value)}),t==null||t.addEventListener("blur",()=>{D(t.value)});const e=document.getElementById("alert-dist");e==null||e.addEventListener("input",()=>{const p=Number(e.value);mt(p),n.alertDistanceM=H();const g=document.getElementById("alert-dist-label");g&&(g.textContent=`${n.alertDistanceM} m`)});const a=document.getElementById("sim-speed");a==null||a.addEventListener("input",()=>{const p=Number(a.value);c==null||c.setSpeedKmh(p);const g=document.getElementById("sim-speed-label");g&&(g.textContent=`${p} km/h`),z()});const o=document.getElementById("sim-scale");o==null||o.addEventListener("input",()=>{const p=Number(o.value);c==null||c.setTimeScale(p);const g=document.getElementById("sim-scale-label");g&&(g.textContent=`${p}×`),z()})}function z(){if(n.mode!=="sim"||!c)return;n.status=`Simulação · ${c.getSpeedKmh()} km/h · ${c.getTimeScale()}×`;const t=document.querySelector(".status-line");t&&!n.error&&(t.textContent=n.status)}function T(){M==null||M.stop(),c==null||c.stop(),M=null,c=null}function Tt(t){T(),v.reset(),n.mode=t,n.startedAt=Date.now(),n.samples=[],n.passages=[],n.lastSample=null,n.alert=null,n.report=null,n.error=null,n.status="GPS…",w()}function rt(t){n.lastSample=t,n.samples.push(t),n.samples.length>5e3&&n.samples.shift();const{alert:e,newPassage:a}=v.update(t);n.alert=e,n.passages=v.getPassages(),Kt(t,e),ft(e,t.speedKmh),a&&(a.overLimit?(gt(),A(`${a.radar.name}: ${h(a.speedKmh)} km/h — Você foi multado`,!0)):A(`${a.radar.name}: OK`,!1))}function Kt(t,e){const a=t.speedKmh,o=(e==null?void 0:e.radar.limitKmh)??null,s=e?Math.round(e.distanceM):null,r=it(a,e),i=e!=null&&e.distanceM<=n.alertDistanceM,l=document.getElementById("my-speed-value");l&&(l.textContent=h(a));const d=document.getElementById("limit-value");d&&(d.textContent=o!=null?h(o):"—");const u=document.getElementById("speed-ring");u&&(u.className=`speed-ring ring-${r}`);const f=document.getElementById("dist-line");f&&(f.textContent=s!=null?i?`Radar a ${s} m`:`Radar a ${s} m · alerta em ${n.alertDistanceM} m`:"Sem radar próximo");const S=document.querySelector(".limit-label");S&&(S.textContent=o!=null?"Baixe para":"Limite");const p=document.querySelector(".alert-banner");if(p){p.className=`alert-banner live-only ${r==="over"?"active-imminent":r==="ok"&&e?"active-far":""}`;const $=p.querySelector(".alert-copy");$&&($.innerHTML=e?`<strong>${r==="over"?"Acima do limite — reduza":"No limite ou abaixo"}</strong>
           <span>${e.radar.name} · alvo ${e.radar.limitKmh} km/h</span>`:`<strong>Sem radar no alcance de alerta</strong>
           <span>Monitorando…</span>`)}const g=document.getElementById("upcoming-list");if(g){const $=v.upcoming(t,3);g.innerHTML=`<div class="upcoming-title">Próximos</div>${ot($)}`}}async function Lt(){await P(),C(),Tt("gps"),M=new wt({onSample:rt,onError:t=>{n.error=t,n.status=t;const e=document.querySelector(".status-line");e&&(e.classList.add("error"),e.textContent=t)},onStatus:t=>{n.status=t,n.error=null;const e=document.querySelector(".status-line");e&&(e.classList.remove("error"),e.textContent=t)}}),M.start()}async function Bt(){await P(),C(),T(),v.reset(),n.mode="sim",n.startedAt=Date.now(),n.samples=[],n.passages=[],n.lastSample=null,n.alert=null,n.report=null,n.error=null,n.status="Simulação · voz liberada",c=new Rt({onSample:rt,onStatus:t=>{n.status=t;const e=document.querySelector(".status-line");e&&!n.error&&(e.textContent=t)},onFinished:()=>{n.status="Fim do trecho — Finalizar";const t=document.querySelector(".status-line");t&&(t.textContent=n.status)}}),c.setSpeedKmh(90),c.setTimeScale(4),w(),c.start()}function kt(){if(n.mode==="idle"||!n.startedAt)return;const t=document.getElementById("report-email");t&&D(t.value),T(),C(),n.lastSample&&v.update({...n.lastSample,lat:n.lastSample.lat+1,lng:n.lastSample.lng+1,at:Date.now()});const e=Date.now();n.report=yt({mode:n.mode==="sim"?"sim":"gps",startedAt:n.startedAt,endedAt:e,samples:n.samples,passages:v.getPassages()}),n.mode="idle",n.status="Relatório pronto.",n.alert=null,w(),lt({auto:!0})}function lt(t={}){if(!n.report)return;const e=V();if(!e){A(t.auto?"Informe o e-mail nas configurações para enviar o relatório":"Informe o e-mail antes de enviar",!0);return}if(!at(e)){A("E-mail inválido",!0);return}st(n.report)?A(t.auto?"Abrindo Mail com o relatório…":"Abrindo Mail…"):A("Não foi possível abrir o Mail",!0)}async function Dt(){if(!n.report)return;const t=await Mt(n.report);t==="share"?A("Compartilhado"):t==="mailto"?A("Abrindo Mail…"):A("Não foi possível compartilhar",!0)}function Pt(){T(),C(),v.reset(),n.mode="idle",n.startedAt=null,n.samples=[],n.passages=[],n.lastSample=null,n.alert=null,n.report=null,n.error=null,n.status="Escolha GPS real ou Simular no sofá.",w()}async function Nt(){if(n.report)try{await navigator.clipboard.writeText(q(n.report)),A("Relatório copiado")}catch{A("Não foi possível copiar",!0)}}function A(t,e=!1){const a=document.getElementById("toast");a&&(a.textContent=t,a.className=`toast show${e?" bad":""}`,window.setTimeout(()=>a.classList.remove("show"),2600))}w();
