var W=Object.defineProperty;var X=(t,e,a)=>e in t?W(t,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):t[e]=a;var p=(t,e,a)=>X(t,typeof e!="symbol"?e+"":e,a);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const l of s)if(l.type==="childList")for(const i of l.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function a(s){const l={};return s.integrity&&(l.integrity=s.integrity),s.referrerPolicy&&(l.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?l.credentials="include":s.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function o(s){if(s.ep)return;s.ep=!0;const l=a(s);fetch(s.href,l)}})();const V="radar_alert_distance_m";let K=null,A=!1,E=null,L=0,M=Y(),h=null;function Y(){const t=localStorage.getItem(V),e=t?Number(t):300;return Number.isFinite(e)?Math.min(1e3,Math.max(50,e)):300}function F(){return M}function J(t){M=Math.min(1e3,Math.max(50,Math.round(t))),localStorage.setItem(V,String(M))}function G(){if(!K){const t=window.AudioContext||window.webkitAudioContext;K=new t}return K}async function k(){const t=G();try{t.state==="suspended"&&await t.resume()}catch{}const e=t.currentTime,a=t.createOscillator(),o=t.createGain();if(a.type="sine",a.frequency.value=880,o.gain.setValueAtTime(1e-4,e),o.gain.exponentialRampToValueAtTime(.18,e+.02),o.gain.exponentialRampToValueAtTime(1e-4,e+.15),a.connect(o),o.connect(t.destination),a.start(e),a.stop(e+.16),A=!0,"speechSynthesis"in window)try{window.speechSynthesis.cancel();const s=new SpeechSynthesisUtterance(" ");s.volume=.01,s.rate=1,s.lang="pt-BR",window.speechSynthesis.speak(s),window.speechSynthesis.getVoices(),window.speechSynthesis.onvoiceschanged=()=>{window.speechSynthesis.getVoices()}}catch{}h||(h=new Audio,h.setAttribute("playsinline","true"))}function O(t=1.5,e=!1){if(!A&&!e)return;const a=Date.now();if(!e&&a-L<2200)return;L=a;const o=G();o.state==="suspended"&&o.resume();const s=o.currentTime,l=o.createGain();l.gain.setValueAtTime(1e-4,s),l.gain.exponentialRampToValueAtTime(.38,s+.04),l.gain.exponentialRampToValueAtTime(1e-4,s+t),l.connect(o.destination);const i=o.createOscillator(),c=o.createOscillator();i.type="square",c.type="sawtooth",i.frequency.setValueAtTime(740,s),i.frequency.linearRampToValueAtTime(1100,s+.35),i.frequency.linearRampToValueAtTime(740,s+.7),i.frequency.linearRampToValueAtTime(1100,s+1.05),c.frequency.setValueAtTime(520,s);const d=o.createGain(),u=o.createGain();d.gain.value=.55,u.gain.value=.25,i.connect(d),c.connect(u),d.connect(l),u.connect(l),i.start(s),c.start(s),i.stop(s+t),c.stop(s+t)}function z(t){return`Baixa a velocidade para ${Math.round(t)} quilômetros por hora`}function Q(){var e,a;const t=((a=(e=window.speechSynthesis)==null?void 0:e.getVoices)==null?void 0:a.call(e))??[];return t.find(o=>/pt-BR/i.test(o.lang))||t.find(o=>/portuguese/i.test(o.name))||t.find(o=>/^pt/i.test(o.lang))||null}function H(t){if(!("speechSynthesis"in window))return!1;try{window.speechSynthesis.cancel();const e=new SpeechSynthesisUtterance(z(t));e.lang="pt-BR",e.rate=.95,e.pitch=1,e.volume=1;const a=Q();return a&&(e.voice=a),window.speechSynthesis.resume(),window.speechSynthesis.speak(e),window.setTimeout(()=>{try{window.speechSynthesis.pause(),window.speechSynthesis.resume()}catch{}},60),!0}catch{return!1}}async function D(t){const e=z(t),a="https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=pt-BR&q="+encodeURIComponent(e);try{h||(h=new Audio,h.setAttribute("playsinline","true")),h.pause(),h.src=a,h.currentTime=0,await h.play()}catch{H(t)}}async function _(t,e=!1){if(!A&&!e)return;const a=H(t);e||!a?await D(t):window.setTimeout(()=>{D(t)},900)}async function tt(t=60){await k(),O(1.6,!0),await _(t,!0)}function et(t,e){!t||!A||t.distanceM>M||(e>t.radar.limitKmh+.5&&O(1.5),E!==t.radar.id&&(E=t.radar.id,_(t.radar.limitKmh)))}function $(){if(E=null,L=0,"speechSynthesis"in window)try{window.speechSynthesis.cancel()}catch{}try{h==null||h.pause()}catch{}}const T=[{lat:-23.5614,lng:-46.6558},{lat:-23.5602,lng:-46.6525},{lat:-23.5588,lng:-46.6491},{lat:-23.5571,lng:-46.6458},{lat:-23.5554,lng:-46.6426},{lat:-23.5539,lng:-46.6395},{lat:-23.5526,lng:-46.6362},{lat:-23.5514,lng:-46.6328},{lat:-23.5505,lng:-46.6291},{lat:-23.5499,lng:-46.6254},{lat:-23.5496,lng:-46.6216},{lat:-23.5498,lng:-46.6179},{lat:-23.5504,lng:-46.6143},{lat:-23.5515,lng:-46.6109},{lat:-23.553,lng:-46.6078}],at=[{id:"r1",name:"Radar Consolação",lat:-23.5595,lng:-46.6508,limitKmh:50,alertRadiusM:220,passRadiusM:55},{id:"r2",name:"Radar Augusta",lat:-23.5558,lng:-46.6435,limitKmh:50,alertRadiusM:220,passRadiusM:55},{id:"r3",name:"Radar Higienópolis",lat:-23.5518,lng:-46.6345,limitKmh:40,alertRadiusM:200,passRadiusM:50},{id:"r4",name:"Radar Pacaembu",lat:-23.5497,lng:-46.6235,limitKmh:60,alertRadiusM:250,passRadiusM:60},{id:"r5",name:"Radar Sumaré",lat:-23.5508,lng:-46.6125,limitKmh:50,alertRadiusM:220,passRadiusM:55}],nt=6371e3;function f(t){return t*Math.PI/180}function I(t,e){const a=f(e.lat-t.lat),o=f(e.lng-t.lng),s=f(t.lat),l=f(e.lat),i=Math.sin(a/2)**2+Math.cos(s)*Math.cos(l)*Math.sin(o/2)**2;return 2*nt*Math.asin(Math.min(1,Math.sqrt(i)))}function P(t,e){const a=f(t.lat),o=f(e.lat),s=f(e.lng-t.lng),l=Math.sin(s)*Math.cos(o),i=Math.cos(a)*Math.sin(o)-Math.sin(a)*Math.cos(o)*Math.cos(s);return(Math.atan2(l,i)*180/Math.PI+360)%360}function q(t,e){if(t.length===0)return{point:{lat:0,lng:0},heading:0,totalLengthM:0};if(t.length===1)return{point:t[0],heading:0,totalLengthM:0};let a=Math.max(0,e),o=0;const s=[];for(let i=0;i<t.length-1;i++){const c=I(t[i],t[i+1]);s.push({a:t[i],b:t[i+1],len:c}),o+=c}if(a>=o){const i=s[s.length-1];return{point:i.b,heading:P(i.a,i.b),totalLengthM:o}}for(const i of s){if(a<=i.len){const c=i.len===0?0:a/i.len;return{point:{lat:i.a.lat+(i.b.lat-i.a.lat)*c,lng:i.a.lng+(i.b.lng-i.a.lng)*c},heading:P(i.a,i.b),totalLengthM:o}}a-=i.len}return{point:t[t.length-1],heading:0,totalLengthM:o}}function st(t){let e=0;for(let a=0;a<t.length-1;a++)e+=I(t[a],t[a+1]);return e}function g(t){return`${Math.round(t)}`}function U(t){const e=Math.floor(t/1e3),a=Math.floor(e/60),o=Math.floor(a/60),s=a%60,l=e%60;return o>0?`${o}h ${String(s).padStart(2,"0")}m`:`${s}m ${String(l).padStart(2,"0")}s`}function b(t){return new Date(t).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}function it(t){return t.speed!=null&&Number.isFinite(t.speed)&&t.speed>=0?t.speed*3.6:0}class ot{constructor(e){p(this,"watchId",null);p(this,"last",null);this.cb=e}get lastSample(){return this.last}start(){if(!("geolocation"in navigator)){this.cb.onError("Geolocalização não disponível neste navegador.");return}if(!window.isSecureContext){this.cb.onError("Safari exige HTTPS para GPS. Abra o app via https://");return}this.cb.onStatus("Pedindo permissão de localização…"),this.watchId=navigator.geolocation.watchPosition(e=>{const a={lat:e.coords.latitude,lng:e.coords.longitude,speedKmh:it(e.coords),accuracyM:e.coords.accuracy??null,heading:e.coords.heading!=null&&Number.isFinite(e.coords.heading)?e.coords.heading:null,at:e.timestamp||Date.now()};this.last=a,this.cb.onStatus("GPS ativo"),this.cb.onSample(a)},e=>{const a={1:"Permissão de localização negada.",2:"Posição indisponível. Vá a um local aberto ou use Simular.",3:"Tempo esgotado ao obter GPS."};this.cb.onError(a[e.code]??e.message)},{enableHighAccuracy:!0,maximumAge:1e3,timeout:15e3})}stop(){this.watchId!=null&&(navigator.geolocation.clearWatch(this.watchId),this.watchId=null)}}class lt{constructor(e){p(this,"approaches",new Map);p(this,"passages",[]);p(this,"lastAlert",null);this.radars=e}reset(){this.approaches.clear(),this.passages=[],this.lastAlert=null}getPassages(){return[...this.passages]}getAlert(){return this.lastAlert}update(e){let a=null,o=null;for(const s of this.radars){const l=I(e,s);let i=this.approaches.get(s.id);if(l<=s.alertRadiusM){const c=l<=s.passRadiusM*1.4?"imminent":l<=s.alertRadiusM*.55?"near":"far";(!a||l<a.distanceM)&&(a={radar:s,distanceM:l,level:c})}if(l<=s.passRadiusM)i?(i.entered=!0,l<i.closestM&&(i.closestM=l,i.speedAtClosest=e.speedKmh,i.atClosest=e.at)):(i={radar:s,entered:!0,closestM:l,speedAtClosest:e.speedKmh,atClosest:e.at},this.approaches.set(s.id,i));else if(i!=null&&i.entered){const c=Math.max(0,i.speedAtClosest-s.limitKmh),d={radar:s,passedAt:i.atClosest,speedKmh:i.speedAtClosest,overLimit:c>0,excessKmh:c,closestDistanceM:i.closestM};this.passages.push(d),this.approaches.delete(s.id),o=d}}return this.lastAlert=a,{alert:a,newPassage:o}}}function rt(t){const e=t.samples.reduce((o,s)=>Math.max(o,s.speedKmh),0),a=t.passages.filter(o=>o.overLimit);return{mode:t.mode,startedAt:t.startedAt,endedAt:t.endedAt,durationMs:Math.max(0,t.endedAt-t.startedAt),maxSpeedKmh:e,samples:t.samples.length,passages:t.passages,overs:a}}function ct(t){const e=["Relatório Radar",`Modo: ${t.mode==="sim"?"Simulação":"GPS real"}`,`Início: ${b(t.startedAt)}`,`Fim: ${b(t.endedAt)}`,`Duração: ${U(t.durationMs)}`,`Vel. máx: ${g(t.maxSpeedKmh)} km/h`,`Radares passados: ${t.passages.length}`,`Acima do limite: ${t.overs.length}`,""];if(t.passages.length===0)e.push("Nenhuma passagem por radar registrada.");else for(const a of t.passages){const o=a.overLimit?"⚠️ ACIMA":"OK";e.push(`${o} · ${a.radar.name} · limite ${a.radar.limitKmh} · passou a ${g(a.speedKmh)} km/h`+(a.overLimit?` (+${g(a.excessKmh)})`:"")+` · ${b(a.passedAt)}`)}return e.join(`
`)}class dt{constructor(e){p(this,"raf",0);p(this,"startedAt",0);p(this,"distanceM",0);p(this,"speedKmh",90);p(this,"timeScale",4);p(this,"running",!1);p(this,"totalM",st(T));this.cb=e}setSpeedKmh(e){this.speedKmh=Math.max(10,Math.min(140,e))}getSpeedKmh(){return this.speedKmh}setTimeScale(e){this.timeScale=Math.max(1,Math.min(12,e))}getTimeScale(){return this.timeScale}start(){this.stop(),this.running=!0,this.startedAt=performance.now(),this.distanceM=0,this.cb.onStatus(`Simulação · ${Math.round(this.speedKmh)} km/h · ${this.timeScale}×`);let e=performance.now();const a=o=>{if(!this.running)return;const s=Math.min(.25,(o-e)/1e3*this.timeScale);e=o;const l=this.speedKmh/3.6;if(this.distanceM+=l*s,this.distanceM>=this.totalM){const{point:u,heading:m}=q(T,this.totalM);this.cb.onSample({lat:u.lat,lng:u.lng,speedKmh:this.speedKmh,accuracyM:5,heading:m,at:Date.now()}),this.running=!1,this.cb.onStatus("Simulação concluída"),this.cb.onFinished();return}const{point:i,heading:c}=q(T,this.distanceM),d=Math.sin((o-this.startedAt)/700)*.8;this.cb.onSample({lat:i.lat,lng:i.lng,speedKmh:Math.max(0,this.speedKmh+d),accuracyM:5,heading:c,at:Date.now()}),this.raf=requestAnimationFrame(a)};this.raf=requestAnimationFrame(a)}stop(){this.running=!1,this.raf&&cancelAnimationFrame(this.raf),this.raf=0}}const ut=document.querySelector("#app"),n={mode:"idle",startedAt:null,samples:[],passages:[],lastSample:null,alert:null,report:null,status:"Escolha GPS real ou Simular no sofá.",error:null,alertDistanceM:F()},v=new lt(at);let y=null,r=null;function j(t,e){return e?t>e.radar.limitKmh+.5?"over":"ok":"idle"}function S(){var c,d;const t=((c=n.lastSample)==null?void 0:c.speedKmh)??0,e=((d=n.alert)==null?void 0:d.radar.limitKmh)??null,a=n.alert?Math.round(n.alert.distanceM):null,o=j(t,n.alert),s=n.mode!=="idle"&&!n.report,l=!!n.report,i=n.alert!=null&&n.alert.distanceM<=n.alertDistanceM;ut.innerHTML=`
    <div class="shell ${l?"report-open":""}">
      <header class="brand live-only">
        <h1>Relatório <span>Radar</span></h1>
        <p>O círculo mostra o <strong>limite</strong>. Sua velocidade fica pequena em cima.</p>
      </header>

      <section class="speed-stage live-only" aria-live="polite">
        <div class="my-speed" id="my-speed">
          <span class="my-speed-label">Sua velocidade</span>
          <strong id="my-speed-value">${g(t)}</strong>
          <span class="my-speed-unit">km/h</span>
        </div>

        <div class="speed-ring ring-${o}" id="speed-ring">
          <div class="speed-inner">
            <div class="limit-label">${e!=null?"Baixe para":"Limite"}</div>
            <div class="speed-value" id="limit-value">${e!=null?g(e):"—"}</div>
            <div class="speed-unit">km/h</div>
            <div class="dist-line" id="dist-line">
              ${a!=null?i?`Radar a ${a} m`:`Radar a ${a} m · alerta em ${n.alertDistanceM} m`:"Sem radar próximo"}
            </div>
          </div>
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
          <p class="hint">Padrão 300 m. A voz diz: “Baixa a velocidade para X”.</p>
        </div>

        <div class="btn-row">
          <button type="button" class="btn-secondary" id="btn-test-sound">Testar voz + sirene</button>
        </div>

        <div class="sim-panel ${n.mode==="sim"&&!n.report?"open":""}" id="sim-panel">
          <label>
            Vel. simulação
            <strong id="sim-speed-label">${(r==null?void 0:r.getSpeedKmh())??90} km/h</strong>
          </label>
          <input type="range" id="sim-speed" min="30" max="120" step="5" value="${(r==null?void 0:r.getSpeedKmh())??90}" ${s?"":"disabled"} />
          <label>
            Tempo
            <strong id="sim-scale-label">${(r==null?void 0:r.getTimeScale())??4}×</strong>
          </label>
          <input type="range" id="sim-scale" min="1" max="10" step="1" value="${(r==null?void 0:r.getTimeScale())??4}" ${s?"":"disabled"} />
        </div>

        <div class="btn-row">
          <button type="button" class="btn-danger" id="btn-finish" ${s?"":"disabled"}>Finalizar</button>
        </div>
      </div>

      <p class="status-line live-only ${n.error?"error":""}">${n.error??n.status}</p>

      <section class="report ${l?"open":""}" aria-live="polite">
        ${l&&n.report?mt(n.report):""}
      </section>
    </div>
    <div class="toast" id="toast" role="status"></div>
  `,pt()}function mt(t){const e=t.overs.length;return`
    <h2>Viagem finalizada</h2>
    <div class="report-summary">
      <div class="stat"><em>Duração</em><strong>${U(t.durationMs)}</strong></div>
      <div class="stat"><em>Vel. máx</em><strong>${g(t.maxSpeedKmh)} km/h</strong></div>
      <div class="stat"><em>Radares</em><strong>${t.passages.length}</strong></div>
      <div class="stat"><em>Acima do limite</em><strong class="${e?"bad":"good"}">${e}</strong></div>
    </div>
    <ul class="passage-list">
      ${t.passages.length===0?'<li><span class="detail">Nenhuma passagem por radar.</span></li>':t.passages.map(a=>`
            <li>
              <span class="tag ${a.overLimit?"bad":"ok"}">${a.overLimit?"Acima do limite":"Dentro do limite"}</span>
              <span class="title">${a.radar.name}</span>
              <span class="detail">
                Limite ${a.radar.limitKmh} · passou a ${g(a.speedKmh)} km/h
                ${a.overLimit?` (+${g(a.excessKmh)})`:""}
                · ${b(a.passedAt)}
              </span>
            </li>`).join("")}
    </ul>
    <div class="btn-row">
      <button type="button" class="btn-secondary" id="btn-copy">Copiar relatório</button>
      <button type="button" class="btn-primary" id="btn-new">Nova viagem</button>
    </div>
  `}function pt(){var o,s,l,i,c,d;(o=document.getElementById("btn-gps"))==null||o.addEventListener("click",ft),(s=document.getElementById("btn-sim"))==null||s.addEventListener("click",vt),(l=document.getElementById("btn-finish"))==null||l.addEventListener("click",yt),(i=document.getElementById("btn-new"))==null||i.addEventListener("click",St),(c=document.getElementById("btn-copy"))==null||c.addEventListener("click",bt),(d=document.getElementById("btn-test-sound"))==null||d.addEventListener("click",()=>{tt(60).then(()=>w("Falou: Baixa a velocidade para 60"))});const t=document.getElementById("alert-dist");t==null||t.addEventListener("input",()=>{const u=Number(t.value);J(u),n.alertDistanceM=F();const m=document.getElementById("alert-dist-label");m&&(m.textContent=`${n.alertDistanceM} m`)});const e=document.getElementById("sim-speed");e==null||e.addEventListener("input",()=>{const u=Number(e.value);r==null||r.setSpeedKmh(u);const m=document.getElementById("sim-speed-label");m&&(m.textContent=`${u} km/h`),N()});const a=document.getElementById("sim-scale");a==null||a.addEventListener("input",()=>{const u=Number(a.value);r==null||r.setTimeScale(u);const m=document.getElementById("sim-scale-label");m&&(m.textContent=`${u}×`),N()})}function N(){if(n.mode!=="sim"||!r)return;n.status=`Simulação · ${r.getSpeedKmh()} km/h · ${r.getTimeScale()}×`;const t=document.querySelector(".status-line");t&&!n.error&&(t.textContent=n.status)}function x(){y==null||y.stop(),r==null||r.stop(),y=null,r=null}function ht(t){x(),v.reset(),n.mode=t,n.startedAt=Date.now(),n.samples=[],n.passages=[],n.lastSample=null,n.alert=null,n.report=null,n.error=null,n.status="GPS…",S()}function Z(t){n.lastSample=t,n.samples.push(t),n.samples.length>5e3&&n.samples.shift();const{alert:e,newPassage:a}=v.update(t);n.alert=e,n.passages=v.getPassages(),gt(t,e),et(e,t.speedKmh),a&&w(a.overLimit?`${a.radar.name}: ${g(a.speedKmh)} km/h — acima`:`${a.radar.name}: OK`,a.overLimit)}function gt(t,e){const a=t.speedKmh,o=(e==null?void 0:e.radar.limitKmh)??null,s=e?Math.round(e.distanceM):null,l=j(a,e),i=e!=null&&e.distanceM<=n.alertDistanceM,c=document.getElementById("my-speed-value");c&&(c.textContent=g(a));const d=document.getElementById("limit-value");d&&(d.textContent=o!=null?g(o):"—");const u=document.getElementById("speed-ring");u&&(u.className=`speed-ring ring-${l}`);const m=document.getElementById("dist-line");m&&(m.textContent=s!=null?i?`Radar a ${s} m`:`Radar a ${s} m · alerta em ${n.alertDistanceM} m`:"Sem radar próximo");const C=document.querySelector(".limit-label");C&&(C.textContent=o!=null?"Baixe para":"Limite");const R=document.querySelector(".alert-banner");if(R){R.className=`alert-banner live-only ${l==="over"?"active-imminent":l==="ok"&&e?"active-far":""}`;const B=R.querySelector(".alert-copy");B&&(B.innerHTML=e?`<strong>${l==="over"?"Acima do limite — reduza":"No limite ou abaixo"}</strong>
           <span>${e.radar.name} · alvo ${e.radar.limitKmh} km/h</span>`:`<strong>Sem radar no alcance de alerta</strong>
           <span>Monitorando…</span>`)}}function ft(){k(),$(),ht("gps"),y=new ot({onSample:Z,onError:t=>{n.error=t,n.status=t;const e=document.querySelector(".status-line");e&&(e.classList.add("error"),e.textContent=t)},onStatus:t=>{n.status=t,n.error=null;const e=document.querySelector(".status-line");e&&(e.classList.remove("error"),e.textContent=t)}}),y.start()}function vt(){k(),$(),x(),v.reset(),n.mode="sim",n.startedAt=Date.now(),n.samples=[],n.passages=[],n.lastSample=null,n.alert=null,n.report=null,n.error=null,n.status="Simulação · áudio liberado",r=new dt({onSample:Z,onStatus:t=>{n.status=t;const e=document.querySelector(".status-line");e&&!n.error&&(e.textContent=t)},onFinished:()=>{n.status="Fim do trecho — Finalizar";const t=document.querySelector(".status-line");t&&(t.textContent=n.status)}}),r.setSpeedKmh(90),r.setTimeScale(4),S(),r.start()}function yt(){if(n.mode==="idle"||!n.startedAt)return;x(),$(),n.lastSample&&v.update({...n.lastSample,lat:n.lastSample.lat+1,lng:n.lastSample.lng+1,at:Date.now()});const t=Date.now();n.report=rt({mode:n.mode==="sim"?"sim":"gps",startedAt:n.startedAt,endedAt:t,samples:n.samples,passages:v.getPassages()}),n.mode="idle",n.status="Relatório pronto.",n.alert=null,S()}function St(){x(),$(),v.reset(),n.mode="idle",n.startedAt=null,n.samples=[],n.passages=[],n.lastSample=null,n.alert=null,n.report=null,n.error=null,n.status="Escolha GPS real ou Simular no sofá.",S()}async function bt(){if(n.report)try{await navigator.clipboard.writeText(ct(n.report)),w("Relatório copiado")}catch{w("Não foi possível copiar",!0)}}function w(t,e=!1){const a=document.getElementById("toast");a&&(a.textContent=t,a.className=`toast show${e?" bad":""}`,window.setTimeout(()=>a.classList.remove("show"),2600))}S();
