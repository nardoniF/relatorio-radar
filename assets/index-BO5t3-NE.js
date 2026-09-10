var ht=Object.defineProperty;var gt=(t,e,a)=>e in t?ht(t,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):t[e]=a;var m=(t,e,a)=>gt(t,typeof e!="symbol"?e+"":e,a);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function a(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=a(s);fetch(s.href,r)}})();const Q="radar_alert_distance_m",X=[40,50,60,70,80,90,100,110,120];let B=null,tt=!1,I=!1,N=null,F=0,q=0,L=ft(),M=null,v=null,R=!1;const j=new Map;function ft(){const t=localStorage.getItem(Q),e=t?Number(t):300;return Number.isFinite(e)?Math.min(1e3,Math.max(50,e)):300}function et(){return L}function vt(t){L=Math.min(1e3,Math.max(50,Math.round(t))),localStorage.setItem(Q,String(L))}function bt(){const t="/relatorio-radar/";return t.endsWith("/")?t:`${t}/`}function V(t){return`${bt()}voice/${t}`}function yt(t){let e=60,a=1/0;for(const i of X){const s=Math.abs(i-t);s<a&&(e=i,a=s)}return e}function Mt(t){return`baixa_${yt(t)}.mp3`}function C(){if(!B){const t=window.AudioContext||window.webkitAudioContext;B=new t}return B}function St(){return M||(M=new Audio,M.setAttribute("playsinline","true"),M.setAttribute("webkit-playsinline","true"),M.preload="auto",M.volume=1),M}function $t(){return v||(v=new Audio(V("silence.mp3")),v.setAttribute("playsinline","true"),v.loop=!0,v.volume=.01,v.preload="auto"),v}function wt(){const t=C(),e=t.currentTime,a=t.createOscillator(),i=t.createGain();a.type="sine",a.frequency.value=880,i.gain.setValueAtTime(1e-4,e),i.gain.exponentialRampToValueAtTime(.16,e+.02),i.gain.exponentialRampToValueAtTime(1e-4,e+.12),a.connect(i),i.connect(t.destination),a.start(e),a.stop(e+.13)}function At(){const t=["monitoramento.mp3","multado.mp3",...X.map(e=>`baixa_${e}.mp3`)];for(const e of t){if(j.has(e))continue;const a=new Audio;a.setAttribute("playsinline","true"),a.preload="auto",a.src=V(e);try{a.load()}catch{}j.set(e,a)}}function Et(t,e=12e3){return new Promise(a=>{let i=!1;const s=()=>{i||(i=!0,t.removeEventListener("ended",s),t.removeEventListener("error",s),a())};t.addEventListener("ended",s),t.addEventListener("error",s),window.setTimeout(s,e)})}async function G(t){const e=St();R=!0;try{try{const a=C();a.state==="suspended"&&await a.resume()}catch{}return e.pause(),e.src=V(t),e.load(),e.currentTime=0,await e.play(),await Et(e),R=!1,!0}catch{return R=!1,!1}}async function O(){const t=C();try{t.state==="suspended"&&t.resume()}catch{}if(wt(),At(),!await G("monitoramento.mp3"))try{if("speechSynthesis"in window){const a=new SpeechSynthesisUtterance("Monitoramento iniciado");a.lang="pt-BR",a.volume=1,window.speechSynthesis.speak(a)}}catch{}try{const a=$t();a.currentTime=0,await a.play()}catch{}tt=!0,I=!0}function z(t=1.5,e=!1){if(!tt&&!e)return;const a=Date.now();if(!e&&a-q<2200)return;q=a;const i=C();i.state==="suspended"&&i.resume();const s=i.currentTime,r=i.createGain();r.gain.setValueAtTime(1e-4,s),r.gain.exponentialRampToValueAtTime(.38,s+.04),r.gain.exponentialRampToValueAtTime(1e-4,s+t),r.connect(i.destination);const o=i.createOscillator(),c=i.createOscillator();o.type="square",c.type="sawtooth",o.frequency.setValueAtTime(740,s),o.frequency.linearRampToValueAtTime(1100,s+.35),o.frequency.linearRampToValueAtTime(740,s+.7),o.frequency.linearRampToValueAtTime(1100,s+1.05),c.frequency.setValueAtTime(520,s);const d=i.createGain(),u=i.createGain();d.gain.value=.55,u.gain.value=.25,o.connect(d),c.connect(u),d.connect(r),u.connect(r),o.start(s),c.start(s),o.stop(s+t),c.stop(s+t)}async function at(t,e=!1){!I&&!e||R&&!e||(F=Date.now(),await G(Mt(t)))}async function Rt(t=!1){!I&&!t||(z(1.8,!0),await G("multado.mp3"))}async function xt(t=60){await O(),z(1.6,!0),await new Promise(e=>setTimeout(e,500)),await at(t,!0)}function Kt(t,e){if(!t||!I||t.distanceM>L)return;const a=e>t.radar.limitKmh+.5;a&&z(1.5);const i=Date.now(),s=N!==t.radar.id,r=a&&i-F>7e3;(s||r)&&(N=t.radar.id,at(t.radar.limitKmh))}function D(){if(N=null,q=0,F=0,"speechSynthesis"in window)try{window.speechSynthesis.cancel()}catch{}}function nt(){try{v==null||v.pause()}catch{}}const P=[{lat:-23.5614,lng:-46.6558},{lat:-23.5602,lng:-46.6525},{lat:-23.5588,lng:-46.6491},{lat:-23.5571,lng:-46.6458},{lat:-23.5554,lng:-46.6426},{lat:-23.5539,lng:-46.6395},{lat:-23.5526,lng:-46.6362},{lat:-23.5514,lng:-46.6328},{lat:-23.5505,lng:-46.6291},{lat:-23.5499,lng:-46.6254},{lat:-23.5496,lng:-46.6216},{lat:-23.5498,lng:-46.6179},{lat:-23.5504,lng:-46.6143},{lat:-23.5515,lng:-46.6109},{lat:-23.553,lng:-46.6078}],st=[{id:"r1",name:"Radar Consolação",lat:-23.5595,lng:-46.6508,limitKmh:50,alertRadiusM:220,passRadiusM:55},{id:"r2",name:"Radar Augusta",lat:-23.5558,lng:-46.6435,limitKmh:50,alertRadiusM:220,passRadiusM:55},{id:"r3",name:"Radar Higienópolis",lat:-23.5518,lng:-46.6345,limitKmh:40,alertRadiusM:200,passRadiusM:50},{id:"r4",name:"Radar Pacaembu",lat:-23.5497,lng:-46.6235,limitKmh:60,alertRadiusM:250,passRadiusM:60},{id:"r5",name:"Radar Sumaré",lat:-23.5508,lng:-46.6125,limitKmh:50,alertRadiusM:220,passRadiusM:55}],Lt=6371e3;function S(t){return t*Math.PI/180}function T(t,e){const a=S(e.lat-t.lat),i=S(e.lng-t.lng),s=S(t.lat),r=S(e.lat),o=Math.sin(a/2)**2+Math.cos(s)*Math.cos(r)*Math.sin(i/2)**2;return 2*Lt*Math.asin(Math.min(1,Math.sqrt(o)))}function W(t,e){const a=S(t.lat),i=S(e.lat),s=S(e.lng-t.lng),r=Math.sin(s)*Math.cos(i),o=Math.cos(a)*Math.sin(i)-Math.sin(a)*Math.cos(i)*Math.cos(s);return(Math.atan2(r,o)*180/Math.PI+360)%360}function Y(t,e){if(t.length===0)return{point:{lat:0,lng:0},heading:0,totalLengthM:0};if(t.length===1)return{point:t[0],heading:0,totalLengthM:0};let a=Math.max(0,e),i=0;const s=[];for(let o=0;o<t.length-1;o++){const c=T(t[o],t[o+1]);s.push({a:t[o],b:t[o+1],len:c}),i+=c}if(a>=i){const o=s[s.length-1];return{point:o.b,heading:W(o.a,o.b),totalLengthM:i}}for(const o of s){if(a<=o.len){const c=o.len===0?0:a/o.len;return{point:{lat:o.a.lat+(o.b.lat-o.a.lat)*c,lng:o.a.lng+(o.b.lng-o.a.lng)*c},heading:W(o.a,o.b),totalLengthM:i}}a-=o.len}return{point:t[t.length-1],heading:0,totalLengthM:i}}function Tt(t){let e=0;for(let a=0;a<t.length-1;a++)e+=T(t[a],t[a+1]);return e}function f(t){return`${Math.round(t)}`}function it(t){const e=Math.floor(t/1e3),a=Math.floor(e/60),i=Math.floor(a/60),s=a%60,r=e%60;return i>0?`${i}h ${String(s).padStart(2,"0")}m`:`${s}m ${String(r).padStart(2,"0")}s`}function x(t){return new Date(t).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}function It(t){const e=t.samples.reduce((i,s)=>Math.max(i,s.speedKmh),0),a=t.passages.filter(i=>i.overLimit);return{mode:t.mode,startedAt:t.startedAt,endedAt:t.endedAt,durationMs:Math.max(0,t.endedAt-t.startedAt),maxSpeedKmh:e,samples:t.samples.length,passages:t.passages,overs:a}}function _(t){const e=["Relatório Radar",`Modo: ${t.mode==="sim"?"Simulação":"GPS real"}`,`Início: ${x(t.startedAt)}`,`Fim: ${x(t.endedAt)}`,`Duração: ${it(t.durationMs)}`,`Vel. máx: ${f(t.maxSpeedKmh)} km/h`,`Radares passados: ${t.passages.length}`,`Acima do limite: ${t.overs.length}`,""];if(t.passages.length===0)e.push("Nenhuma passagem por radar registrada.");else for(const a of t.passages){const i=a.overLimit?"⚠️ ACIMA":"OK";e.push(`${i} · ${a.radar.name} · limite ${a.radar.limitKmh} · passou a ${f(a.speedKmh)} km/h`+(a.overLimit?` (+${f(a.excessKmh)})`:"")+` · ${x(a.passedAt)}`)}return e.join(`
`)}const ot="radar_report_email";function U(){var t;return((t=localStorage.getItem(ot))==null?void 0:t.trim())??""}function K(t){localStorage.setItem(ot,t.trim())}function rt(t){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t.trim())}function lt(t){const e=t.overs.length,a=new Date(t.endedAt).toLocaleDateString("pt-BR");return e>0?`Relatório Radar ${a} — ${e} acima do limite`:`Relatório Radar ${a}`}function Z(t,e,a){return`mailto:${t}?subject=${encodeURIComponent(e)}&body=${encodeURIComponent(a)}`}function ct(t,e){const a=U().trim();if(!a||!rt(a))return!1;const i=_(t),s=lt(t);let r=Z(a,s,i);if(r.length>1800){const o=i.slice(0,1400)+`

…(relatório truncado; use Copiar relatório para o texto completo)`;r=Z(a,s,o)}return window.location.href=r,!0}async function Ct(t){const e=_(t),a=lt(t);if(navigator.share)try{return await navigator.share({title:a,text:e}),"share"}catch{}return ct(t)?"mailto":"none"}function Dt(t){return t.speed!=null&&Number.isFinite(t.speed)&&t.speed>=0?t.speed*3.6:0}class kt{constructor(e){m(this,"watchId",null);m(this,"last",null);this.cb=e}get lastSample(){return this.last}start(){if(!("geolocation"in navigator)){this.cb.onError("Geolocalização não disponível neste navegador.");return}if(!window.isSecureContext){this.cb.onError("Safari exige HTTPS para GPS. Abra o app via https://");return}this.cb.onStatus("Pedindo permissão de localização…"),this.watchId=navigator.geolocation.watchPosition(e=>{const a={lat:e.coords.latitude,lng:e.coords.longitude,speedKmh:Dt(e.coords),accuracyM:e.coords.accuracy??null,heading:e.coords.heading!=null&&Number.isFinite(e.coords.heading)?e.coords.heading:null,at:e.timestamp||Date.now()};this.last=a,this.cb.onStatus("GPS ativo"),this.cb.onSample(a)},e=>{const a={1:"Permissão de localização negada.",2:"Posição indisponível. Vá a um local aberto ou use Simular.",3:"Tempo esgotado ao obter GPS."};this.cb.onError(a[e.code]??e.message)},{enableHighAccuracy:!0,maximumAge:1e3,timeout:15e3})}stop(){this.watchId!=null&&(navigator.geolocation.clearWatch(this.watchId),this.watchId=null)}}class Bt{constructor(e){m(this,"approaches",new Map);m(this,"passages",[]);m(this,"lastAlert",null);this.radars=e}reset(){this.approaches.clear(),this.passages=[],this.lastAlert=null}getPassages(){return[...this.passages]}upcoming(e,a=3){const i=new Set(this.passages.map(s=>s.radar.id));return this.radars.filter(s=>!i.has(s.id)).map(s=>({radar:s,distanceM:T(e,s)})).sort((s,r)=>s.distanceM-r.distanceM).slice(0,a)}getAlert(){return this.lastAlert}update(e){let a=null,i=null;for(const s of this.radars){const r=T(e,s);let o=this.approaches.get(s.id);if(r<=s.alertRadiusM){const c=r<=s.passRadiusM*1.4?"imminent":r<=s.alertRadiusM*.55?"near":"far";(!a||r<a.distanceM)&&(a={radar:s,distanceM:r,level:c})}if(r<=s.passRadiusM)o?(o.entered=!0,r<o.closestM&&(o.closestM=r,o.speedAtClosest=e.speedKmh,o.atClosest=e.at)):(o={radar:s,entered:!0,closestM:r,speedAtClosest:e.speedKmh,atClosest:e.at},this.approaches.set(s.id,o));else if(o!=null&&o.entered){const c=Math.max(0,o.speedAtClosest-s.limitKmh),d={radar:s,passedAt:o.atClosest,speedKmh:o.speedAtClosest,overLimit:c>0,excessKmh:c,closestDistanceM:o.closestM};this.passages.push(d),this.approaches.delete(s.id),i=d}}return this.lastAlert=a,{alert:a,newPassage:i}}}class Pt{constructor(e){m(this,"raf",0);m(this,"startedAt",0);m(this,"distanceM",0);m(this,"speedKmh",90);m(this,"timeScale",4);m(this,"running",!1);m(this,"totalM",Tt(P));this.cb=e}setSpeedKmh(e){this.speedKmh=Math.max(10,Math.min(140,e))}getSpeedKmh(){return this.speedKmh}setTimeScale(e){this.timeScale=Math.max(1,Math.min(12,e))}getTimeScale(){return this.timeScale}start(){this.stop(),this.running=!0,this.startedAt=performance.now(),this.distanceM=0,this.cb.onStatus(`Simulação · ${Math.round(this.speedKmh)} km/h · ${this.timeScale}×`);let e=performance.now();const a=i=>{if(!this.running)return;const s=Math.min(.25,(i-e)/1e3*this.timeScale);e=i;const r=this.speedKmh/3.6;if(this.distanceM+=r*s,this.distanceM>=this.totalM){const{point:u,heading:b}=Y(P,this.totalM);this.cb.onSample({lat:u.lat,lng:u.lng,speedKmh:this.speedKmh,accuracyM:5,heading:b,at:Date.now()}),this.running=!1,this.cb.onStatus("Simulação concluída"),this.cb.onFinished();return}const{point:o,heading:c}=Y(P,this.distanceM),d=Math.sin((i-this.startedAt)/700)*.8;this.cb.onSample({lat:o.lat,lng:o.lng,speedKmh:Math.max(0,this.speedKmh+d),accuracyM:5,heading:c,at:Date.now()}),this.raf=requestAnimationFrame(a)};this.raf=requestAnimationFrame(a)}stop(){this.running=!1,this.raf&&cancelAnimationFrame(this.raf),this.raf=0}}const Nt=document.querySelector("#app"),n={mode:"idle",startedAt:null,samples:[],passages:[],lastSample:null,alert:null,report:null,status:"Escolha GPS real ou Simular no sofá.",error:null,alertDistanceM:et()},y=new Bt(st);let $=null,l=null;function dt(t,e){return e?t>e.radar.limitKmh+.5?"over":"ok":"idle"}function A(){var d,u;const t=((d=n.lastSample)==null?void 0:d.speedKmh)??0,e=((u=n.alert)==null?void 0:u.radar.limitKmh)??null,a=n.alert?Math.round(n.alert.distanceM):null,i=dt(t,n.alert),s=n.mode!=="idle"&&!n.report,r=!!n.report,o=n.alert!=null&&n.alert.distanceM<=n.alertDistanceM,c=n.lastSample!=null?y.upcoming(n.lastSample,3):st.slice(0,3).map(b=>({radar:b,distanceM:NaN}));Nt.innerHTML=`
    <div class="shell ${r?"report-open":""}">
      <header class="brand live-only">
        <h1>Relatório <span>Radar</span></h1>
        <p>Círculo = limite. Em cima = sua velocidade. Ao lado = próximos 3 radares.</p>
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
            ${ut(c)}
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
            value="${Ft(U())}"
            autocomplete="email"
            inputmode="email"
          />
          <p class="hint">Ao tocar Simular/GPS deve falar “Monitoramento iniciado”. Perto do radar, manda baixar sozinho (áudio local, sem internet).</p>
        </div>

        <div class="btn-row">
          <button type="button" class="btn-secondary" id="btn-test-sound">Testar voz + sirene</button>
        </div>

        <div class="sim-panel ${n.mode==="sim"&&!n.report?"open":""}" id="sim-panel">
          <label>
            Vel. simulação
            <strong id="sim-speed-label">${(l==null?void 0:l.getSpeedKmh())??90} km/h</strong>
          </label>
          <input type="range" id="sim-speed" min="30" max="120" step="5" value="${(l==null?void 0:l.getSpeedKmh())??90}" ${s?"":"disabled"} />
          <label>
            Tempo
            <strong id="sim-scale-label">${(l==null?void 0:l.getTimeScale())??4}×</strong>
          </label>
          <input type="range" id="sim-scale" min="1" max="10" step="1" value="${(l==null?void 0:l.getTimeScale())??4}" ${s?"":"disabled"} />
        </div>

        <div class="btn-row">
          <button type="button" class="btn-danger" id="btn-finish" ${s?"":"disabled"}>Finalizar</button>
        </div>
      </div>

      <p class="status-line live-only ${n.error?"error":""}">${n.error??n.status}</p>

      <section class="report ${r?"open":""}" aria-live="polite">
        ${r&&n.report?qt(n.report):""}
      </section>
    </div>
    <div class="toast" id="toast" role="status"></div>
  `,Vt()}function ut(t){return t.length===0?'<div class="upcoming-empty">Nenhum à frente</div>':t.map((e,a)=>{const i=Number.isFinite(e.distanceM)?`${Math.round(e.distanceM)} m`:"—";return`
        <div class="upcoming-item" data-radar="${e.radar.id}">
          <div class="upcoming-rank">${a+1}</div>
          <div class="upcoming-body">
            <strong>${e.radar.limitKmh}</strong>
            <span>${e.radar.name.replace(/^Radar\s+/i,"")}</span>
          </div>
          <div class="upcoming-dist" data-dist="${e.radar.id}">${i}</div>
        </div>`}).join("")}function qt(t){const e=t.overs.length;return`
    <h2>Viagem finalizada</h2>
    <div class="report-summary">
      <div class="stat"><em>Duração</em><strong>${it(t.durationMs)}</strong></div>
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
  `}function Ft(t){return t.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Vt(){var s,r,o,c,d,u,b,w;(s=document.getElementById("btn-gps"))==null||s.addEventListener("click",zt),(r=document.getElementById("btn-sim"))==null||r.addEventListener("click",_t),(o=document.getElementById("btn-finish"))==null||o.addEventListener("click",Ut),(c=document.getElementById("btn-new"))==null||c.addEventListener("click",jt),(d=document.getElementById("btn-copy"))==null||d.addEventListener("click",Wt),(u=document.getElementById("btn-email"))==null||u.addEventListener("click",()=>pt()),(b=document.getElementById("btn-share"))==null||b.addEventListener("click",()=>{Ht()}),(w=document.getElementById("btn-test-sound"))==null||w.addEventListener("click",()=>{xt(60).then(()=>p("Falou: Baixa a velocidade para 60"))});const t=document.getElementById("report-email");t==null||t.addEventListener("input",()=>{K(t.value)}),t==null||t.addEventListener("change",()=>{K(t.value)}),t==null||t.addEventListener("blur",()=>{K(t.value)});const e=document.getElementById("alert-dist");e==null||e.addEventListener("input",()=>{const h=Number(e.value);vt(h),n.alertDistanceM=et();const g=document.getElementById("alert-dist-label");g&&(g.textContent=`${n.alertDistanceM} m`)});const a=document.getElementById("sim-speed");a==null||a.addEventListener("input",()=>{const h=Number(a.value);l==null||l.setSpeedKmh(h);const g=document.getElementById("sim-speed-label");g&&(g.textContent=`${h} km/h`),J()});const i=document.getElementById("sim-scale");i==null||i.addEventListener("input",()=>{const h=Number(i.value);l==null||l.setTimeScale(h);const g=document.getElementById("sim-scale-label");g&&(g.textContent=`${h}×`),J()})}function J(){if(n.mode!=="sim"||!l)return;n.status=`Simulação · ${l.getSpeedKmh()} km/h · ${l.getTimeScale()}×`;const t=document.querySelector(".status-line");t&&!n.error&&(t.textContent=n.status)}function k(){$==null||$.stop(),l==null||l.stop(),$=null,l=null}function Gt(t){k(),y.reset(),n.mode=t,n.startedAt=Date.now(),n.samples=[],n.passages=[],n.lastSample=null,n.alert=null,n.report=null,n.error=null,n.status="GPS…",A()}function mt(t){n.lastSample=t,n.samples.push(t),n.samples.length>5e3&&n.samples.shift();const{alert:e,newPassage:a}=y.update(t);n.alert=e,n.passages=y.getPassages(),Ot(t,e),Kt(e,t.speedKmh),a&&(a.overLimit?(Rt(),p(`${a.radar.name}: ${f(a.speedKmh)} km/h — Você foi multado`,!0)):p(`${a.radar.name}: OK`,!1))}function Ot(t,e){const a=t.speedKmh,i=(e==null?void 0:e.radar.limitKmh)??null,s=e?Math.round(e.distanceM):null,r=dt(a,e),o=e!=null&&e.distanceM<=n.alertDistanceM,c=document.getElementById("my-speed-value");c&&(c.textContent=f(a));const d=document.getElementById("limit-value");d&&(d.textContent=i!=null?f(i):"—");const u=document.getElementById("speed-ring");u&&(u.className=`speed-ring ring-${r}`);const b=document.getElementById("dist-line");b&&(b.textContent=s!=null?o?`Radar a ${s} m`:`Radar a ${s} m · alerta em ${n.alertDistanceM} m`:"Sem radar próximo");const w=document.querySelector(".limit-label");w&&(w.textContent=i!=null?"Baixe para":"Limite");const h=document.querySelector(".alert-banner");if(h){h.className=`alert-banner live-only ${r==="over"?"active-imminent":r==="ok"&&e?"active-far":""}`;const E=h.querySelector(".alert-copy");E&&(E.innerHTML=e?`<strong>${r==="over"?"Acima do limite — reduza":"No limite ou abaixo"}</strong>
           <span>${e.radar.name} · alvo ${e.radar.limitKmh} km/h</span>`:`<strong>Sem radar no alcance de alerta</strong>
           <span>Monitorando…</span>`)}const g=document.getElementById("upcoming-list");if(g){const E=y.upcoming(t,3);g.innerHTML=`<div class="upcoming-title">Próximos</div>${ut(E)}`}}function H(){const t=document.getElementById("report-email");t&&K(t.value)}async function zt(){H(),D(),await O(),Gt("gps"),$=new kt({onSample:mt,onError:t=>{n.error=t,n.status=t;const e=document.querySelector(".status-line");e&&(e.classList.add("error"),e.textContent=t)},onStatus:t=>{n.status=t,n.error=null;const e=document.querySelector(".status-line");e&&(e.classList.remove("error"),e.textContent=t)}}),$.start()}async function _t(){H(),D(),await O(),k(),y.reset(),n.mode="sim",n.startedAt=Date.now(),n.samples=[],n.passages=[],n.lastSample=null,n.alert=null,n.report=null,n.error=null,n.status="Simulação · voz liberada",l=new Pt({onSample:mt,onStatus:t=>{n.status=t;const e=document.querySelector(".status-line");e&&!n.error&&(e.textContent=t)},onFinished:()=>{n.status="Fim do trecho — Finalizar";const t=document.querySelector(".status-line");t&&(t.textContent=n.status)}}),l.setSpeedKmh(90),l.setTimeScale(4),A(),l.start()}function Ut(){if(n.mode==="idle"||!n.startedAt)return;H(),k(),D(),nt(),n.lastSample&&y.update({...n.lastSample,lat:n.lastSample.lat+1,lng:n.lastSample.lng+1,at:Date.now()});const t=Date.now();n.report=It({mode:n.mode==="sim"?"sim":"gps",startedAt:n.startedAt,endedAt:t,samples:n.samples,passages:y.getPassages()}),n.mode="idle",n.status="Relatório pronto.",n.alert=null,A(),pt({auto:!0})}function pt(t={}){if(!n.report)return;const e=U();if(!e){p(t.auto?"Informe o e-mail nas configurações para enviar o relatório":"Informe o e-mail antes de enviar",!0);return}if(!rt(e)){p("E-mail inválido",!0);return}ct(n.report)?p(t.auto?"Abrindo Mail com o relatório…":"Abrindo Mail…"):p("Não foi possível abrir o Mail",!0)}async function Ht(){if(!n.report)return;const t=await Ct(n.report);t==="share"?p("Compartilhado"):t==="mailto"?p("Abrindo Mail…"):p("Não foi possível compartilhar",!0)}function jt(){k(),D(),nt(),y.reset(),n.mode="idle",n.startedAt=null,n.samples=[],n.passages=[],n.lastSample=null,n.alert=null,n.report=null,n.error=null,n.status="Escolha GPS real ou Simular no sofá.",A()}async function Wt(){if(n.report)try{await navigator.clipboard.writeText(_(n.report)),p("Relatório copiado")}catch{p("Não foi possível copiar",!0)}}function p(t,e=!1){const a=document.getElementById("toast");a&&(a.textContent=t,a.className=`toast show${e?" bad":""}`,window.setTimeout(()=>a.classList.remove("show"),2600))}A();
