var P=Object.defineProperty;var C=(t,e,a)=>e in t?P(t,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):t[e]=a;var c=(t,e,a)=>C(t,typeof e!="symbol"?e+"":e,a);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const l of n)if(l.type==="childList")for(const i of l.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function a(n){const l={};return n.integrity&&(l.integrity=n.integrity),n.referrerPolicy&&(l.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?l.credentials="include":n.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function o(n){if(n.ep)return;n.ep=!0;const l=a(n);fetch(n.href,l)}})();const S=[{lat:-23.5614,lng:-46.6558},{lat:-23.5602,lng:-46.6525},{lat:-23.5588,lng:-46.6491},{lat:-23.5571,lng:-46.6458},{lat:-23.5554,lng:-46.6426},{lat:-23.5539,lng:-46.6395},{lat:-23.5526,lng:-46.6362},{lat:-23.5514,lng:-46.6328},{lat:-23.5505,lng:-46.6291},{lat:-23.5499,lng:-46.6254},{lat:-23.5496,lng:-46.6216},{lat:-23.5498,lng:-46.6179},{lat:-23.5504,lng:-46.6143},{lat:-23.5515,lng:-46.6109},{lat:-23.553,lng:-46.6078}],T=[{id:"r1",name:"Radar Consolação",lat:-23.5595,lng:-46.6508,limitKmh:50,alertRadiusM:220,passRadiusM:55},{id:"r2",name:"Radar Augusta",lat:-23.5558,lng:-46.6435,limitKmh:50,alertRadiusM:220,passRadiusM:55},{id:"r3",name:"Radar Higienópolis",lat:-23.5518,lng:-46.6345,limitKmh:40,alertRadiusM:200,passRadiusM:50},{id:"r4",name:"Radar Pacaembu",lat:-23.5497,lng:-46.6235,limitKmh:60,alertRadiusM:250,passRadiusM:60},{id:"r5",name:"Radar Sumaré",lat:-23.5508,lng:-46.6125,limitKmh:50,alertRadiusM:220,passRadiusM:55}],I=6371e3;function h(t){return t*Math.PI/180}function $(t,e){const a=h(e.lat-t.lat),o=h(e.lng-t.lng),n=h(t.lat),l=h(e.lat),i=Math.sin(a/2)**2+Math.cos(n)*Math.cos(l)*Math.sin(o/2)**2;return 2*I*Math.asin(Math.min(1,Math.sqrt(i)))}function A(t,e){const a=h(t.lat),o=h(e.lat),n=h(e.lng-t.lng),l=Math.sin(n)*Math.cos(o),i=Math.cos(a)*Math.sin(o)-Math.sin(a)*Math.cos(o)*Math.cos(n);return(Math.atan2(l,i)*180/Math.PI+360)%360}function K(t,e){if(t.length===0)return{point:{lat:0,lng:0},heading:0,totalLengthM:0};if(t.length===1)return{point:t[0],heading:0,totalLengthM:0};let a=Math.max(0,e),o=0;const n=[];for(let i=0;i<t.length-1;i++){const d=$(t[i],t[i+1]);n.push({a:t[i],b:t[i+1],len:d}),o+=d}if(a>=o){const i=n[n.length-1];return{point:i.b,heading:A(i.a,i.b),totalLengthM:o}}for(const i of n){if(a<=i.len){const d=i.len===0?0:a/i.len;return{point:{lat:i.a.lat+(i.b.lat-i.a.lat)*d,lng:i.a.lng+(i.b.lng-i.a.lng)*d},heading:A(i.a,i.b),totalLengthM:o}}a-=i.len}return{point:t[t.length-1],heading:0,totalLengthM:o}}function k(t){let e=0;for(let a=0;a<t.length-1;a++)e+=$(t[a],t[a+1]);return e}function u(t){return`${Math.round(t)}`}function L(t){const e=Math.floor(t/1e3),a=Math.floor(e/60),o=Math.floor(a/60),n=a%60,l=e%60;return o>0?`${o}h ${String(n).padStart(2,"0")}m`:`${n}m ${String(l).padStart(2,"0")}s`}function v(t){return new Date(t).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}function q(t){return t.speed!=null&&Number.isFinite(t.speed)&&t.speed>=0?t.speed*3.6:0}class D{constructor(e){c(this,"watchId",null);c(this,"last",null);this.cb=e}get lastSample(){return this.last}start(){if(!("geolocation"in navigator)){this.cb.onError("Geolocalização não disponível neste navegador.");return}if(!window.isSecureContext){this.cb.onError("Safari exige HTTPS para GPS. Abra o app via https://");return}this.cb.onStatus("Pedindo permissão de localização…"),this.watchId=navigator.geolocation.watchPosition(e=>{const a={lat:e.coords.latitude,lng:e.coords.longitude,speedKmh:q(e.coords),accuracyM:e.coords.accuracy??null,heading:e.coords.heading!=null&&Number.isFinite(e.coords.heading)?e.coords.heading:null,at:e.timestamp||Date.now()};this.last=a,this.cb.onStatus("GPS ativo"),this.cb.onSample(a)},e=>{const a={1:"Permissão de localização negada.",2:"Posição indisponível. Vá a um local aberto ou use Simular.",3:"Tempo esgotado ao obter GPS."};this.cb.onError(a[e.code]??e.message)},{enableHighAccuracy:!0,maximumAge:1e3,timeout:15e3})}stop(){this.watchId!=null&&(navigator.geolocation.clearWatch(this.watchId),this.watchId=null)}}class F{constructor(e){c(this,"approaches",new Map);c(this,"passages",[]);c(this,"lastAlert",null);this.radars=e}reset(){this.approaches.clear(),this.passages=[],this.lastAlert=null}getPassages(){return[...this.passages]}getAlert(){return this.lastAlert}update(e){let a=null,o=null;for(const n of this.radars){const l=$(e,n);let i=this.approaches.get(n.id);if(l<=n.alertRadiusM){const d=l<=n.passRadiusM*1.4?"imminent":l<=n.alertRadiusM*.55?"near":"far";(!a||l<a.distanceM)&&(a={radar:n,distanceM:l,level:d})}if(l<=n.passRadiusM)i?(i.entered=!0,l<i.closestM&&(i.closestM=l,i.speedAtClosest=e.speedKmh,i.atClosest=e.at)):(i={radar:n,entered:!0,closestM:l,speedAtClosest:e.speedKmh,atClosest:e.at},this.approaches.set(n.id,i));else if(i!=null&&i.entered){const d=Math.max(0,i.speedAtClosest-n.limitKmh),m={radar:n,passedAt:i.atClosest,speedKmh:i.speedAtClosest,overLimit:d>0,excessKmh:d,closestDistanceM:i.closestM};this.passages.push(m),this.approaches.delete(n.id),o=m}}return this.lastAlert=a,{alert:a,newPassage:o}}}function N(t){const e=t.samples.reduce((o,n)=>Math.max(o,n.speedKmh),0),a=t.passages.filter(o=>o.overLimit);return{mode:t.mode,startedAt:t.startedAt,endedAt:t.endedAt,durationMs:Math.max(0,t.endedAt-t.startedAt),maxSpeedKmh:e,samples:t.samples.length,passages:t.passages,overs:a}}function B(t){const e=["Relatório Radar",`Modo: ${t.mode==="sim"?"Simulação":"GPS real"}`,`Início: ${v(t.startedAt)}`,`Fim: ${v(t.endedAt)}`,`Duração: ${L(t.durationMs)}`,`Vel. máx: ${u(t.maxSpeedKmh)} km/h`,`Radares passados: ${t.passages.length}`,`Acima do limite: ${t.overs.length}`,""];if(t.passages.length===0)e.push("Nenhuma passagem por radar registrada.");else for(const a of t.passages){const o=a.overLimit?"⚠️ ACIMA":"OK";e.push(`${o} · ${a.radar.name} · limite ${a.radar.limitKmh} · passou a ${u(a.speedKmh)} km/h`+(a.overLimit?` (+${u(a.excessKmh)})`:"")+` · ${v(a.passedAt)}`)}return e.join(`
`)}class G{constructor(e){c(this,"raf",0);c(this,"startedAt",0);c(this,"distanceM",0);c(this,"speedKmh",90);c(this,"timeScale",4);c(this,"running",!1);c(this,"totalM",k(S));this.cb=e}setSpeedKmh(e){this.speedKmh=Math.max(10,Math.min(140,e))}getSpeedKmh(){return this.speedKmh}setTimeScale(e){this.timeScale=Math.max(1,Math.min(12,e))}getTimeScale(){return this.timeScale}start(){this.stop(),this.running=!0,this.startedAt=performance.now(),this.distanceM=0,this.cb.onStatus(`Simulação · ${Math.round(this.speedKmh)} km/h · ${this.timeScale}×`);let e=performance.now();const a=o=>{if(!this.running)return;const n=Math.min(.25,(o-e)/1e3*this.timeScale);e=o;const l=this.speedKmh/3.6;if(this.distanceM+=l*n,this.distanceM>=this.totalM){const{point:y,heading:E}=K(S,this.totalM);this.cb.onSample({lat:y.lat,lng:y.lng,speedKmh:this.speedKmh,accuracyM:5,heading:E,at:Date.now()}),this.running=!1,this.cb.onStatus("Simulação concluída"),this.cb.onFinished();return}const{point:i,heading:d}=K(S,this.distanceM),m=Math.sin((o-this.startedAt)/700)*.8;this.cb.onSample({lat:i.lat,lng:i.lng,speedKmh:Math.max(0,this.speedKmh+m),accuracyM:5,heading:d,at:Date.now()}),this.raf=requestAnimationFrame(a)};this.raf=requestAnimationFrame(a)}stop(){this.running=!1,this.raf&&cancelAnimationFrame(this.raf),this.raf=0}}const O=document.querySelector("#app"),s={mode:"idle",startedAt:null,samples:[],passages:[],lastSample:null,alert:null,report:null,status:"Escolha GPS real ou Simular no sofá.",error:null},p=new F(T);let g=null,r=null;function f(){var l;const t=((l=s.lastSample)==null?void 0:l.speedKmh)??0,e=s.alert?`active-${s.alert.level}`:"",a=s.alert?s.alert.level==="imminent"?"alert-imminent":s.alert.level==="near"?"alert-near":"":"",o=s.mode!=="idle"&&!s.report,n=!!s.report;O.innerHTML=`
    <div class="shell ${n?"report-open":""}">
      <header class="brand live-only">
        <h1>Relatório <span>Radar</span></h1>
        <p>GPS, alerta de radares e relatório dos que você passou acima do limite.</p>
      </header>

      <section class="speed-stage live-only" aria-live="polite">
        <div class="speed-ring ${a}">
          <div class="speed-inner">
            <div class="speed-value">${u(t)}</div>
            <div class="speed-unit">km/h</div>
            <div class="meta-row">
              <div>
                Limite
                <strong>${s.alert?s.alert.radar.limitKmh:"—"}</strong>
              </div>
              <div>
                Distância
                <strong>${s.alert?`${Math.round(s.alert.distanceM)} m`:"—"}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="alert-banner live-only ${e}">
        <div class="alert-dot" aria-hidden="true"></div>
        <div class="alert-copy">
          ${s.alert?`<strong>${R(s.alert)}</strong>
                 <span>${s.alert.radar.name} · máx ${s.alert.radar.limitKmh} km/h</span>`:`<strong>Sem radar próximo</strong>
                 <span>${o?"Monitorando o percurso…":"Inicie uma viagem para monitorar."}</span>`}
        </div>
      </div>

      <div class="controls live-only">
        <div class="btn-row">
          <button type="button" class="btn-primary" id="btn-gps" ${o?"disabled":""}>
            GPS real
          </button>
          <button type="button" class="btn-secondary" id="btn-sim" ${o&&s.mode!=="sim"?"disabled":""}>
            Simular no sofá
          </button>
        </div>

        <div class="sim-panel ${s.mode==="sim"&&!s.report?"open":""}" id="sim-panel">
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
            ${o?"":"disabled"}
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
            ${o?"":"disabled"}
          />
        </div>

        <div class="btn-row">
          <button type="button" class="btn-danger" id="btn-finish" ${o?"":"disabled"}>
            Finalizar
          </button>
        </div>
      </div>

      <p class="status-line live-only ${s.error?"error":""}">
        ${s.error??s.status}
      </p>

      <section class="report ${n?"open":""}" aria-live="polite">
        ${n&&s.report?z(s.report):""}
      </section>
    </div>
    <div class="toast" id="toast" role="status"></div>
  `,H()}function R(t){return t.level==="imminent"?"Radar à frente — reduza":t.level==="near"?"Aproximando do radar":"Radar no trecho"}function z(t){const e=t.overs.length;return`
    <h2>Viagem finalizada</h2>
    <div class="report-summary">
      <div class="stat">
        <em>Duração</em>
        <strong>${L(t.durationMs)}</strong>
      </div>
      <div class="stat">
        <em>Vel. máx</em>
        <strong>${u(t.maxSpeedKmh)} km/h</strong>
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
      ${t.passages.length===0?'<li><span class="detail">Nenhuma passagem por radar nesta viagem.</span></li>':t.passages.map(a=>`
            <li>
              <span class="tag ${a.overLimit?"bad":"ok"}">${a.overLimit?"Acima do limite":"Dentro do limite"}</span>
              <span class="title">${a.radar.name}</span>
              <span class="detail">
                Limite ${a.radar.limitKmh} · passou a ${u(a.speedKmh)} km/h
                ${a.overLimit?` (+${u(a.excessKmh)})`:""}
                · ${v(a.passedAt)}
              </span>
            </li>`).join("")}
    </ul>

    <div class="btn-row">
      <button type="button" class="btn-secondary" id="btn-copy">Copiar relatório</button>
      <button type="button" class="btn-primary" id="btn-new">Nova viagem</button>
    </div>
  `}function H(){var a,o,n,l,i;(a=document.getElementById("btn-gps"))==null||a.addEventListener("click",U),(o=document.getElementById("btn-sim"))==null||o.addEventListener("click",W),(n=document.getElementById("btn-finish"))==null||n.addEventListener("click",_),(l=document.getElementById("btn-new"))==null||l.addEventListener("click",J),(i=document.getElementById("btn-copy"))==null||i.addEventListener("click",Q);const t=document.getElementById("sim-speed");t==null||t.addEventListener("input",()=>{const d=Number(t.value);r==null||r.setSpeedKmh(d);const m=document.getElementById("sim-speed-label");m&&(m.textContent=`${d} km/h`),x()});const e=document.getElementById("sim-scale");e==null||e.addEventListener("input",()=>{const d=Number(e.value);r==null||r.setTimeScale(d);const m=document.getElementById("sim-scale-label");m&&(m.textContent=`${d}×`),x()})}function x(){if(s.mode!=="sim"||!r)return;s.status=`Simulação · ${r.getSpeedKmh()} km/h · ${r.getTimeScale()}×`;const t=document.querySelector(".status-line");t&&!s.error&&(t.textContent=s.status)}function b(){g==null||g.stop(),r==null||r.stop(),g=null,r=null}function V(t){b(),p.reset(),s.mode=t,s.startedAt=Date.now(),s.samples=[],s.passages=[],s.lastSample=null,s.alert=null,s.report=null,s.error=null,s.status="Iniciando GPS…",f()}function w(t){s.lastSample=t,s.samples.push(t),s.samples.length>5e3&&s.samples.shift();const{alert:e,newPassage:a}=p.update(t);s.alert=e,s.passages=p.getPassages(),j(t,e),a&&M(a.overLimit?`${a.radar.name}: ${u(a.speedKmh)} km/h — acima do limite`:`${a.radar.name}: passagem OK`,a.overLimit)}function j(t,e){const a=document.querySelector(".speed-value");a&&(a.textContent=u(t.speedKmh));const o=document.querySelector(".speed-ring");o&&(o.classList.remove("alert-near","alert-imminent"),(e==null?void 0:e.level)==="near"&&o.classList.add("alert-near"),(e==null?void 0:e.level)==="imminent"&&o.classList.add("alert-imminent"));const n=document.querySelector(".alert-banner");if(n){n.className=`alert-banner live-only ${e?`active-${e.level}`:""}`;const i=n.querySelector(".alert-copy");i&&(i.innerHTML=e?`<strong>${R(e)}</strong>
           <span>${e.radar.name} · máx ${e.radar.limitKmh} km/h</span>`:`<strong>Sem radar próximo</strong>
           <span>Monitorando o percurso…</span>`)}const l=document.querySelectorAll(".meta-row strong");l.length>=2&&(l[0].textContent=e?String(e.radar.limitKmh):"—",l[1].textContent=e?`${Math.round(e.distanceM)} m`:"—")}function U(){V("gps"),g=new D({onSample:w,onError:t=>{s.error=t,s.status=t;const e=document.querySelector(".status-line");e&&(e.classList.add("error"),e.textContent=t)},onStatus:t=>{s.status=t,s.error=null;const e=document.querySelector(".status-line");e&&(e.classList.remove("error"),e.textContent=t)}}),g.start()}function W(){b(),p.reset(),s.mode="sim",s.startedAt=Date.now(),s.samples=[],s.passages=[],s.lastSample=null,s.alert=null,s.report=null,s.error=null,s.status="Simulação · 90 km/h · 4×",r=new G({onSample:w,onStatus:t=>{s.status=t;const e=document.querySelector(".status-line");e&&!s.error&&(e.textContent=t)},onFinished:()=>{s.status="Fim do trecho simulado — toque em Finalizar.";const t=document.querySelector(".status-line");t&&(t.textContent=s.status)}}),r.setSpeedKmh(90),r.setTimeScale(4),f(),r.start()}function _(){if(s.mode==="idle"||!s.startedAt)return;b(),s.lastSample&&p.update({...s.lastSample,lat:s.lastSample.lat+1,lng:s.lastSample.lng+1,at:Date.now()});const t=Date.now(),e=N({mode:s.mode==="sim"?"sim":"gps",startedAt:s.startedAt,endedAt:t,samples:s.samples,passages:p.getPassages()});s.report=e,s.mode="idle",s.status="Relatório pronto.",s.alert=null,f()}function J(){b(),p.reset(),s.mode="idle",s.startedAt=null,s.samples=[],s.passages=[],s.lastSample=null,s.alert=null,s.report=null,s.error=null,s.status="Escolha GPS real ou Simular no sofá.",f()}async function Q(){if(!s.report)return;const t=B(s.report);try{await navigator.clipboard.writeText(t),M("Relatório copiado")}catch{M("Não foi possível copiar",!0)}}function M(t,e=!1){const a=document.getElementById("toast");a&&(a.textContent=t,a.className=`toast show${e?" bad":""}`,window.setTimeout(()=>{a.classList.remove("show")},2600))}f();
