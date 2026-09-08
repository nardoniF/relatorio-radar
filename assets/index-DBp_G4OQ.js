var At=Object.defineProperty;var pt=(t,e,a)=>e in t?At(t,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):t[e]=a;var m=(t,e,a)=>pt(t,typeof e!="symbol"?e+"":e,a);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function a(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(n){if(n.ep)return;n.ep=!0;const r=a(n);fetch(n.href,r)}})();const Z="radar_alert_distance_m",W="data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//////////////////////////////////////////////////////////////////8AAAA8TEFNRTMuMTAwBLgAAAAAAAAAABUgJAUHQQAB9gAAAnGRqtmyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";let B=null,Y=!1,C=!1,D=null,N=0,I=gt(),y=null,f=null,S=!1;function gt(){const t=localStorage.getItem(Z),e=t?Number(t):300;return Number.isFinite(e)?Math.min(1e3,Math.max(50,e)):300}function J(){return I}function ht(t){I=Math.min(1e3,Math.max(50,Math.round(t))),localStorage.setItem(Z,String(I))}function K(){if(!B){const t=window.AudioContext||window.webkitAudioContext;B=new t}return B}function q(){return y||(y=new Audio,y.setAttribute("playsinline","true"),y.setAttribute("webkit-playsinline","true"),y.preload="auto",y.volume=1),y}function X(){return f||(f=new Audio(W),f.setAttribute("playsinline","true"),f.loop=!0,f.volume=.01,f.preload="auto"),f}function ft(t){return"https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=pt-BR&q="+encodeURIComponent(t)}function vt(){const t=K(),e=t.currentTime,a=t.createOscillator(),i=t.createGain();a.type="sine",a.frequency.value=880,i.gain.setValueAtTime(1e-4,e),i.gain.exponentialRampToValueAtTime(.16,e+.02),i.gain.exponentialRampToValueAtTime(1e-4,e+.12),a.connect(i),i.connect(t.destination),a.start(e),a.stop(e+.13)}async function F(){const t=K();try{if(t.state==="suspended"){const a=t.resume()}}catch{}vt();const e=q();try{e.pause(),e.src=W,e.currentTime=0,await e.play()}catch{}try{const a=X();a.currentTime=0,await a.play()}catch{}Y=!0,C=!0,O("Monitoramento iniciado")}function G(t=1.5,e=!1){if(!Y&&!e)return;const a=Date.now();if(!e&&a-N<2200)return;N=a;const i=K();i.state==="suspended"&&i.resume();const n=i.currentTime,r=i.createGain();r.gain.setValueAtTime(1e-4,n),r.gain.exponentialRampToValueAtTime(.38,n+.04),r.gain.exponentialRampToValueAtTime(1e-4,n+t),r.connect(i.destination);const o=i.createOscillator(),c=i.createOscillator();o.type="square",c.type="sawtooth",o.frequency.setValueAtTime(740,n),o.frequency.linearRampToValueAtTime(1100,n+.35),o.frequency.linearRampToValueAtTime(740,n+.7),o.frequency.linearRampToValueAtTime(1100,n+1.05),c.frequency.setValueAtTime(520,n);const d=i.createGain(),u=i.createGain();d.gain.value=.55,u.gain.value=.25,o.connect(d),c.connect(u),d.connect(r),u.connect(r),o.start(n),c.start(n),o.stop(n+t),c.stop(n+t)}function tt(t){return`Baixa a velocidade para ${Math.round(t)} quilômetros por hora`}function bt(t,e=12e3){return new Promise(a=>{let i=!1;const n=()=>{i||(i=!0,t.removeEventListener("ended",n),t.removeEventListener("error",n),a())};t.addEventListener("ended",n),t.addEventListener("error",n),window.setTimeout(n,e)})}async function O(t){if(S)try{q().pause()}catch{}S=!0;const e=q();try{return e.pause(),e.src=ft(t),e.load(),e.currentTime=0,await e.play(),await bt(e),S=!1,!0}catch{}if("speechSynthesis"in window)try{window.speechSynthesis.cancel();const a=new SpeechSynthesisUtterance(t);a.lang="pt-BR",a.rate=.95,a.volume=1;const i=window.speechSynthesis.getVoices(),n=i.find(r=>/pt-BR/i.test(r.lang))||i.find(r=>/^pt/i.test(r.lang));return n&&(a.voice=n),await new Promise(r=>{a.onend=()=>r(),a.onerror=()=>r(),window.speechSynthesis.speak(a),window.setTimeout(r,8e3)}),S=!1,!0}catch{return S=!1,!1}return S=!1,!1}async function yt(t){return O(tt(t))}function Mt(t){if(!("speechSynthesis"in window))return!1;try{window.speechSynthesis.cancel();const e=new SpeechSynthesisUtterance(tt(t));e.lang="pt-BR",e.rate=.95,e.volume=1;const a=window.speechSynthesis.getVoices(),i=a.find(n=>/pt-BR/i.test(n.lang))||a.find(n=>/^pt/i.test(n.lang));return i&&(e.voice=i),window.speechSynthesis.speak(e),!0}catch{return!1}}async function et(t,e=!1){if(!C&&!e)return;try{const i=K();i.state==="suspended"&&await i.resume()}catch{}try{const i=X();i.paused&&i.play()}catch{}await yt(t)||Mt(t)}async function St(t=!1){!C&&!t||(G(1.8,!0),await O("Você foi multado"))}async function wt(t=60){await F(),G(1.6,!0),await new Promise(e=>setTimeout(e,700)),await et(t,!0)}function $t(t,e){!t||!C||t.distanceM>I||(e>t.radar.limitKmh+.5&&G(1.5),D!==t.radar.id&&(D=t.radar.id,et(t.radar.limitKmh)))}function L(){if(D=null,N=0,"speechSynthesis"in window)try{window.speechSynthesis.cancel()}catch{}}function at(){try{f==null||f.pause()}catch{}}const P=[{lat:-23.5614,lng:-46.6558},{lat:-23.5602,lng:-46.6525},{lat:-23.5588,lng:-46.6491},{lat:-23.5571,lng:-46.6458},{lat:-23.5554,lng:-46.6426},{lat:-23.5539,lng:-46.6395},{lat:-23.5526,lng:-46.6362},{lat:-23.5514,lng:-46.6328},{lat:-23.5505,lng:-46.6291},{lat:-23.5499,lng:-46.6254},{lat:-23.5496,lng:-46.6216},{lat:-23.5498,lng:-46.6179},{lat:-23.5504,lng:-46.6143},{lat:-23.5515,lng:-46.6109},{lat:-23.553,lng:-46.6078}],nt=[{id:"r1",name:"Radar Consolação",lat:-23.5595,lng:-46.6508,limitKmh:50,alertRadiusM:220,passRadiusM:55},{id:"r2",name:"Radar Augusta",lat:-23.5558,lng:-46.6435,limitKmh:50,alertRadiusM:220,passRadiusM:55},{id:"r3",name:"Radar Higienópolis",lat:-23.5518,lng:-46.6345,limitKmh:40,alertRadiusM:200,passRadiusM:50},{id:"r4",name:"Radar Pacaembu",lat:-23.5497,lng:-46.6235,limitKmh:60,alertRadiusM:250,passRadiusM:60},{id:"r5",name:"Radar Sumaré",lat:-23.5508,lng:-46.6125,limitKmh:50,alertRadiusM:220,passRadiusM:55}],Rt=6371e3;function M(t){return t*Math.PI/180}function T(t,e){const a=M(e.lat-t.lat),i=M(e.lng-t.lng),n=M(t.lat),r=M(e.lat),o=Math.sin(a/2)**2+Math.cos(n)*Math.cos(r)*Math.sin(i/2)**2;return 2*Rt*Math.asin(Math.min(1,Math.sqrt(o)))}function _(t,e){const a=M(t.lat),i=M(e.lat),n=M(e.lng-t.lng),r=Math.sin(n)*Math.cos(i),o=Math.cos(a)*Math.sin(i)-Math.sin(a)*Math.cos(i)*Math.cos(n);return(Math.atan2(r,o)*180/Math.PI+360)%360}function H(t,e){if(t.length===0)return{point:{lat:0,lng:0},heading:0,totalLengthM:0};if(t.length===1)return{point:t[0],heading:0,totalLengthM:0};let a=Math.max(0,e),i=0;const n=[];for(let o=0;o<t.length-1;o++){const c=T(t[o],t[o+1]);n.push({a:t[o],b:t[o+1],len:c}),i+=c}if(a>=i){const o=n[n.length-1];return{point:o.b,heading:_(o.a,o.b),totalLengthM:i}}for(const o of n){if(a<=o.len){const c=o.len===0?0:a/o.len;return{point:{lat:o.a.lat+(o.b.lat-o.a.lat)*c,lng:o.a.lng+(o.b.lng-o.a.lng)*c},heading:_(o.a,o.b),totalLengthM:i}}a-=o.len}return{point:t[t.length-1],heading:0,totalLengthM:i}}function Et(t){let e=0;for(let a=0;a<t.length-1;a++)e+=T(t[a],t[a+1]);return e}function h(t){return`${Math.round(t)}`}function st(t){const e=Math.floor(t/1e3),a=Math.floor(e/60),i=Math.floor(a/60),n=a%60,r=e%60;return i>0?`${i}h ${String(n).padStart(2,"0")}m`:`${n}m ${String(r).padStart(2,"0")}s`}function x(t){return new Date(t).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}function xt(t){const e=t.samples.reduce((i,n)=>Math.max(i,n.speedKmh),0),a=t.passages.filter(i=>i.overLimit);return{mode:t.mode,startedAt:t.startedAt,endedAt:t.endedAt,durationMs:Math.max(0,t.endedAt-t.startedAt),maxSpeedKmh:e,samples:t.samples.length,passages:t.passages,overs:a}}function z(t){const e=["Relatório Radar",`Modo: ${t.mode==="sim"?"Simulação":"GPS real"}`,`Início: ${x(t.startedAt)}`,`Fim: ${x(t.endedAt)}`,`Duração: ${st(t.durationMs)}`,`Vel. máx: ${h(t.maxSpeedKmh)} km/h`,`Radares passados: ${t.passages.length}`,`Acima do limite: ${t.overs.length}`,""];if(t.passages.length===0)e.push("Nenhuma passagem por radar registrada.");else for(const a of t.passages){const i=a.overLimit?"⚠️ ACIMA":"OK";e.push(`${i} · ${a.radar.name} · limite ${a.radar.limitKmh} · passou a ${h(a.speedKmh)} km/h`+(a.overLimit?` (+${h(a.excessKmh)})`:"")+` · ${x(a.passedAt)}`)}return e.join(`
`)}const it="radar_report_email";function U(){var t;return((t=localStorage.getItem(it))==null?void 0:t.trim())??""}function V(t){localStorage.setItem(it,t.trim())}function ot(t){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t.trim())}function rt(t){const e=t.overs.length,a=new Date(t.endedAt).toLocaleDateString("pt-BR");return e>0?`Relatório Radar ${a} — ${e} acima do limite`:`Relatório Radar ${a}`}function j(t,e,a){return`mailto:${t}?subject=${encodeURIComponent(e)}&body=${encodeURIComponent(a)}`}function lt(t,e){const a=U().trim();if(!a||!ot(a))return!1;const i=z(t),n=rt(t);let r=j(a,n,i);if(r.length>1800){const o=i.slice(0,1400)+`

…(relatório truncado; use Copiar relatório para o texto completo)`;r=j(a,n,o)}return window.location.href=r,!0}async function It(t){const e=z(t),a=rt(t);if(navigator.share)try{return await navigator.share({title:a,text:e}),"share"}catch{}return lt(t)?"mailto":"none"}function Tt(t){return t.speed!=null&&Number.isFinite(t.speed)&&t.speed>=0?t.speed*3.6:0}class Ct{constructor(e){m(this,"watchId",null);m(this,"last",null);this.cb=e}get lastSample(){return this.last}start(){if(!("geolocation"in navigator)){this.cb.onError("Geolocalização não disponível neste navegador.");return}if(!window.isSecureContext){this.cb.onError("Safari exige HTTPS para GPS. Abra o app via https://");return}this.cb.onStatus("Pedindo permissão de localização…"),this.watchId=navigator.geolocation.watchPosition(e=>{const a={lat:e.coords.latitude,lng:e.coords.longitude,speedKmh:Tt(e.coords),accuracyM:e.coords.accuracy??null,heading:e.coords.heading!=null&&Number.isFinite(e.coords.heading)?e.coords.heading:null,at:e.timestamp||Date.now()};this.last=a,this.cb.onStatus("GPS ativo"),this.cb.onSample(a)},e=>{const a={1:"Permissão de localização negada.",2:"Posição indisponível. Vá a um local aberto ou use Simular.",3:"Tempo esgotado ao obter GPS."};this.cb.onError(a[e.code]??e.message)},{enableHighAccuracy:!0,maximumAge:1e3,timeout:15e3})}stop(){this.watchId!=null&&(navigator.geolocation.clearWatch(this.watchId),this.watchId=null)}}class Kt{constructor(e){m(this,"approaches",new Map);m(this,"passages",[]);m(this,"lastAlert",null);this.radars=e}reset(){this.approaches.clear(),this.passages=[],this.lastAlert=null}getPassages(){return[...this.passages]}upcoming(e,a=3){const i=new Set(this.passages.map(n=>n.radar.id));return this.radars.filter(n=>!i.has(n.id)).map(n=>({radar:n,distanceM:T(e,n)})).sort((n,r)=>n.distanceM-r.distanceM).slice(0,a)}getAlert(){return this.lastAlert}update(e){let a=null,i=null;for(const n of this.radars){const r=T(e,n);let o=this.approaches.get(n.id);if(r<=n.alertRadiusM){const c=r<=n.passRadiusM*1.4?"imminent":r<=n.alertRadiusM*.55?"near":"far";(!a||r<a.distanceM)&&(a={radar:n,distanceM:r,level:c})}if(r<=n.passRadiusM)o?(o.entered=!0,r<o.closestM&&(o.closestM=r,o.speedAtClosest=e.speedKmh,o.atClosest=e.at)):(o={radar:n,entered:!0,closestM:r,speedAtClosest:e.speedKmh,atClosest:e.at},this.approaches.set(n.id,o));else if(o!=null&&o.entered){const c=Math.max(0,o.speedAtClosest-n.limitKmh),d={radar:n,passedAt:o.atClosest,speedKmh:o.speedAtClosest,overLimit:c>0,excessKmh:c,closestDistanceM:o.closestM};this.passages.push(d),this.approaches.delete(n.id),i=d}}return this.lastAlert=a,{alert:a,newPassage:i}}}class Lt{constructor(e){m(this,"raf",0);m(this,"startedAt",0);m(this,"distanceM",0);m(this,"speedKmh",90);m(this,"timeScale",4);m(this,"running",!1);m(this,"totalM",Et(P));this.cb=e}setSpeedKmh(e){this.speedKmh=Math.max(10,Math.min(140,e))}getSpeedKmh(){return this.speedKmh}setTimeScale(e){this.timeScale=Math.max(1,Math.min(12,e))}getTimeScale(){return this.timeScale}start(){this.stop(),this.running=!0,this.startedAt=performance.now(),this.distanceM=0,this.cb.onStatus(`Simulação · ${Math.round(this.speedKmh)} km/h · ${this.timeScale}×`);let e=performance.now();const a=i=>{if(!this.running)return;const n=Math.min(.25,(i-e)/1e3*this.timeScale);e=i;const r=this.speedKmh/3.6;if(this.distanceM+=r*n,this.distanceM>=this.totalM){const{point:u,heading:v}=H(P,this.totalM);this.cb.onSample({lat:u.lat,lng:u.lng,speedKmh:this.speedKmh,accuracyM:5,heading:v,at:Date.now()}),this.running=!1,this.cb.onStatus("Simulação concluída"),this.cb.onFinished();return}const{point:o,heading:c}=H(P,this.distanceM),d=Math.sin((i-this.startedAt)/700)*.8;this.cb.onSample({lat:o.lat,lng:o.lng,speedKmh:Math.max(0,this.speedKmh+d),accuracyM:5,heading:c,at:Date.now()}),this.raf=requestAnimationFrame(a)};this.raf=requestAnimationFrame(a)}stop(){this.running=!1,this.raf&&cancelAnimationFrame(this.raf),this.raf=0}}const kt=document.querySelector("#app"),s={mode:"idle",startedAt:null,samples:[],passages:[],lastSample:null,alert:null,report:null,status:"Escolha GPS real ou Simular no sofá.",error:null,alertDistanceM:J()},b=new Kt(nt);let w=null,l=null;function ct(t,e){return e?t>e.radar.limitKmh+.5?"over":"ok":"idle"}function R(){var d,u;const t=((d=s.lastSample)==null?void 0:d.speedKmh)??0,e=((u=s.alert)==null?void 0:u.radar.limitKmh)??null,a=s.alert?Math.round(s.alert.distanceM):null,i=ct(t,s.alert),n=s.mode!=="idle"&&!s.report,r=!!s.report,o=s.alert!=null&&s.alert.distanceM<=s.alertDistanceM,c=s.lastSample!=null?b.upcoming(s.lastSample,3):nt.slice(0,3).map(v=>({radar:v,distanceM:NaN}));kt.innerHTML=`
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
          <div class="speed-ring ring-${i}" id="speed-ring">
            <div class="speed-inner">
              <div class="limit-label">${e!=null?"Baixe para":"Limite"}</div>
              <div class="speed-value" id="limit-value">${e!=null?h(e):"—"}</div>
              <div class="speed-unit">km/h</div>
              <div class="dist-line" id="dist-line">
                ${a!=null?o?`Radar a ${a} m`:`Radar a ${a} m · alerta em ${s.alertDistanceM} m`:"Sem radar próximo"}
              </div>
            </div>
          </div>

          <aside class="upcoming" id="upcoming-list">
            <div class="upcoming-title">Próximos</div>
            ${dt(c)}
          </aside>
        </div>
      </section>

      <div class="alert-banner live-only ${i==="over"?"active-imminent":i==="ok"&&s.alert?"active-far":""}">
        <div class="alert-dot" aria-hidden="true"></div>
        <div class="alert-copy">
          ${s.alert?`<strong>${i==="over"?"Acima do limite — reduza":"No limite ou abaixo"}</strong>
                 <span>${s.alert.radar.name} · alvo ${s.alert.radar.limitKmh} km/h</span>`:`<strong>Sem radar no alcance de alerta</strong>
                 <span>${n?"Monitorando…":"Inicie uma viagem."}</span>`}
        </div>
      </div>

      <div class="controls live-only">
        <div class="btn-row">
          <button type="button" class="btn-primary" id="btn-gps" ${n?"disabled":""}>GPS real</button>
          <button type="button" class="btn-secondary" id="btn-sim" ${n&&s.mode!=="sim"?"disabled":""}>Simular no sofá</button>
        </div>

        <div class="settings-panel open">
          <label>
            Sirene/voz a partir de
            <strong id="alert-dist-label">${s.alertDistanceM} m</strong>
          </label>
          <input type="range" id="alert-dist" min="100" max="800" step="50" value="${s.alertDistanceM}" />
          <label class="email-label" for="report-email">
            E-mail do relatório
          </label>
          <input
            type="email"
            id="report-email"
            class="email-input"
            placeholder="seu@email.com"
            value="${Pt(U())}"
            autocomplete="email"
            inputmode="email"
          />
          <p class="hint">Ao tocar Simular/GPS, deve falar “Monitoramento iniciado”. Ao finalizar, o Mail abre com o relatório.</p>
        </div>

        <div class="btn-row">
          <button type="button" class="btn-secondary" id="btn-test-sound">Testar voz + sirene</button>
        </div>

        <div class="sim-panel ${s.mode==="sim"&&!s.report?"open":""}" id="sim-panel">
          <label>
            Vel. simulação
            <strong id="sim-speed-label">${(l==null?void 0:l.getSpeedKmh())??90} km/h</strong>
          </label>
          <input type="range" id="sim-speed" min="30" max="120" step="5" value="${(l==null?void 0:l.getSpeedKmh())??90}" ${n?"":"disabled"} />
          <label>
            Tempo
            <strong id="sim-scale-label">${(l==null?void 0:l.getTimeScale())??4}×</strong>
          </label>
          <input type="range" id="sim-scale" min="1" max="10" step="1" value="${(l==null?void 0:l.getTimeScale())??4}" ${n?"":"disabled"} />
        </div>

        <div class="btn-row">
          <button type="button" class="btn-danger" id="btn-finish" ${n?"":"disabled"}>Finalizar</button>
        </div>
      </div>

      <p class="status-line live-only ${s.error?"error":""}">${s.error??s.status}</p>

      <section class="report ${r?"open":""}" aria-live="polite">
        ${r&&s.report?Bt(s.report):""}
      </section>
    </div>
    <div class="toast" id="toast" role="status"></div>
  `,Dt()}function dt(t){return t.length===0?'<div class="upcoming-empty">Nenhum à frente</div>':t.map((e,a)=>{const i=Number.isFinite(e.distanceM)?`${Math.round(e.distanceM)} m`:"—";return`
        <div class="upcoming-item" data-radar="${e.radar.id}">
          <div class="upcoming-rank">${a+1}</div>
          <div class="upcoming-body">
            <strong>${e.radar.limitKmh}</strong>
            <span>${e.radar.name.replace(/^Radar\s+/i,"")}</span>
          </div>
          <div class="upcoming-dist" data-dist="${e.radar.id}">${i}</div>
        </div>`}).join("")}function Bt(t){const e=t.overs.length;return`
    <h2>Viagem finalizada</h2>
    <div class="report-summary">
      <div class="stat"><em>Duração</em><strong>${st(t.durationMs)}</strong></div>
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
                · ${x(a.passedAt)}
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
  `}function Pt(t){return t.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Dt(){var n,r,o,c,d,u,v,$;(n=document.getElementById("btn-gps"))==null||n.addEventListener("click",Vt),(r=document.getElementById("btn-sim"))==null||r.addEventListener("click",Ft),(o=document.getElementById("btn-finish"))==null||o.addEventListener("click",Gt),(c=document.getElementById("btn-new"))==null||c.addEventListener("click",zt),(d=document.getElementById("btn-copy"))==null||d.addEventListener("click",Ut),(u=document.getElementById("btn-email"))==null||u.addEventListener("click",()=>mt()),(v=document.getElementById("btn-share"))==null||v.addEventListener("click",()=>{Ot()}),($=document.getElementById("btn-test-sound"))==null||$.addEventListener("click",()=>{wt(60).then(()=>A("Falou: Baixa a velocidade para 60"))});const t=document.getElementById("report-email");t==null||t.addEventListener("change",()=>{V(t.value)}),t==null||t.addEventListener("blur",()=>{V(t.value)});const e=document.getElementById("alert-dist");e==null||e.addEventListener("input",()=>{const p=Number(e.value);ht(p),s.alertDistanceM=J();const g=document.getElementById("alert-dist-label");g&&(g.textContent=`${s.alertDistanceM} m`)});const a=document.getElementById("sim-speed");a==null||a.addEventListener("input",()=>{const p=Number(a.value);l==null||l.setSpeedKmh(p);const g=document.getElementById("sim-speed-label");g&&(g.textContent=`${p} km/h`),Q()});const i=document.getElementById("sim-scale");i==null||i.addEventListener("input",()=>{const p=Number(i.value);l==null||l.setTimeScale(p);const g=document.getElementById("sim-scale-label");g&&(g.textContent=`${p}×`),Q()})}function Q(){if(s.mode!=="sim"||!l)return;s.status=`Simulação · ${l.getSpeedKmh()} km/h · ${l.getTimeScale()}×`;const t=document.querySelector(".status-line");t&&!s.error&&(t.textContent=s.status)}function k(){w==null||w.stop(),l==null||l.stop(),w=null,l=null}function Nt(t){k(),b.reset(),s.mode=t,s.startedAt=Date.now(),s.samples=[],s.passages=[],s.lastSample=null,s.alert=null,s.report=null,s.error=null,s.status="GPS…",R()}function ut(t){s.lastSample=t,s.samples.push(t),s.samples.length>5e3&&s.samples.shift();const{alert:e,newPassage:a}=b.update(t);s.alert=e,s.passages=b.getPassages(),qt(t,e),$t(e,t.speedKmh),a&&(a.overLimit?(St(),A(`${a.radar.name}: ${h(a.speedKmh)} km/h — Você foi multado`,!0)):A(`${a.radar.name}: OK`,!1))}function qt(t,e){const a=t.speedKmh,i=(e==null?void 0:e.radar.limitKmh)??null,n=e?Math.round(e.distanceM):null,r=ct(a,e),o=e!=null&&e.distanceM<=s.alertDistanceM,c=document.getElementById("my-speed-value");c&&(c.textContent=h(a));const d=document.getElementById("limit-value");d&&(d.textContent=i!=null?h(i):"—");const u=document.getElementById("speed-ring");u&&(u.className=`speed-ring ring-${r}`);const v=document.getElementById("dist-line");v&&(v.textContent=n!=null?o?`Radar a ${n} m`:`Radar a ${n} m · alerta em ${s.alertDistanceM} m`:"Sem radar próximo");const $=document.querySelector(".limit-label");$&&($.textContent=i!=null?"Baixe para":"Limite");const p=document.querySelector(".alert-banner");if(p){p.className=`alert-banner live-only ${r==="over"?"active-imminent":r==="ok"&&e?"active-far":""}`;const E=p.querySelector(".alert-copy");E&&(E.innerHTML=e?`<strong>${r==="over"?"Acima do limite — reduza":"No limite ou abaixo"}</strong>
           <span>${e.radar.name} · alvo ${e.radar.limitKmh} km/h</span>`:`<strong>Sem radar no alcance de alerta</strong>
           <span>Monitorando…</span>`)}const g=document.getElementById("upcoming-list");if(g){const E=b.upcoming(t,3);g.innerHTML=`<div class="upcoming-title">Próximos</div>${dt(E)}`}}async function Vt(){L(),await F(),Nt("gps"),w=new Ct({onSample:ut,onError:t=>{s.error=t,s.status=t;const e=document.querySelector(".status-line");e&&(e.classList.add("error"),e.textContent=t)},onStatus:t=>{s.status=t,s.error=null;const e=document.querySelector(".status-line");e&&(e.classList.remove("error"),e.textContent=t)}}),w.start()}async function Ft(){L(),await F(),k(),b.reset(),s.mode="sim",s.startedAt=Date.now(),s.samples=[],s.passages=[],s.lastSample=null,s.alert=null,s.report=null,s.error=null,s.status="Simulação · voz liberada",l=new Lt({onSample:ut,onStatus:t=>{s.status=t;const e=document.querySelector(".status-line");e&&!s.error&&(e.textContent=t)},onFinished:()=>{s.status="Fim do trecho — Finalizar";const t=document.querySelector(".status-line");t&&(t.textContent=s.status)}}),l.setSpeedKmh(90),l.setTimeScale(4),R(),l.start()}function Gt(){if(s.mode==="idle"||!s.startedAt)return;const t=document.getElementById("report-email");t&&V(t.value),k(),L(),at(),s.lastSample&&b.update({...s.lastSample,lat:s.lastSample.lat+1,lng:s.lastSample.lng+1,at:Date.now()});const e=Date.now();s.report=xt({mode:s.mode==="sim"?"sim":"gps",startedAt:s.startedAt,endedAt:e,samples:s.samples,passages:b.getPassages()}),s.mode="idle",s.status="Relatório pronto.",s.alert=null,R(),mt({auto:!0})}function mt(t={}){if(!s.report)return;const e=U();if(!e){A(t.auto?"Informe o e-mail nas configurações para enviar o relatório":"Informe o e-mail antes de enviar",!0);return}if(!ot(e)){A("E-mail inválido",!0);return}lt(s.report)?A(t.auto?"Abrindo Mail com o relatório…":"Abrindo Mail…"):A("Não foi possível abrir o Mail",!0)}async function Ot(){if(!s.report)return;const t=await It(s.report);t==="share"?A("Compartilhado"):t==="mailto"?A("Abrindo Mail…"):A("Não foi possível compartilhar",!0)}function zt(){k(),L(),at(),b.reset(),s.mode="idle",s.startedAt=null,s.samples=[],s.passages=[],s.lastSample=null,s.alert=null,s.report=null,s.error=null,s.status="Escolha GPS real ou Simular no sofá.",R()}async function Ut(){if(s.report)try{await navigator.clipboard.writeText(z(s.report)),A("Relatório copiado")}catch{A("Não foi possível copiar",!0)}}function A(t,e=!1){const a=document.getElementById("toast");a&&(a.textContent=t,a.className=`toast show${e?" bad":""}`,window.setTimeout(()=>a.classList.remove("show"),2600))}R();
