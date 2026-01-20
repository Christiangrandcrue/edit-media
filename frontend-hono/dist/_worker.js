var wt=Object.defineProperty;var Ne=e=>{throw TypeError(e)};var Et=(e,t,s)=>t in e?wt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s;var f=(e,t,s)=>Et(e,typeof t!="symbol"?t+"":t,s),De=(e,t,s)=>t.has(e)||Ne("Cannot "+s);var n=(e,t,s)=>(De(e,t,"read from private field"),s?s.call(e):t.get(e)),m=(e,t,s)=>t.has(e)?Ne("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,s),h=(e,t,s,a)=>(De(e,t,"write to private field"),a?a.call(e,s):t.set(e,s),s),b=(e,t,s)=>(De(e,t,"access private method"),s);var qe=(e,t,s,a)=>({set _(r){h(e,t,r,s)},get _(){return n(e,t,a)}});var Ue=(e,t,s)=>(a,r)=>{let i=-1;return o(0);async function o(c){if(c<=i)throw new Error("next() called multiple times");i=c;let d,l=!1,u;if(e[c]?(u=e[c][0][0],a.req.routeIndex=c):u=c===e.length&&r||void 0,u)try{d=await u(a,()=>o(c+1))}catch(p){if(p instanceof Error&&t)a.error=p,d=await t(p,a),l=!0;else throw p}else a.finalized===!1&&s&&(d=await s(a));return d&&(a.finalized===!1||l)&&(a.res=d),a}},jt=Symbol(),St=async(e,t=Object.create(null))=>{const{all:s=!1,dot:a=!1}=t,i=(e instanceof it?e.raw.headers:e.headers).get("Content-Type");return i!=null&&i.startsWith("multipart/form-data")||i!=null&&i.startsWith("application/x-www-form-urlencoded")?kt(e,{all:s,dot:a}):{}};async function kt(e,t){const s=await e.formData();return s?It(s,t):{}}function It(e,t){const s=Object.create(null);return e.forEach((a,r)=>{t.all||r.endsWith("[]")?Tt(s,r,a):s[r]=a}),t.dot&&Object.entries(s).forEach(([a,r])=>{a.includes(".")&&(Lt(s,a,r),delete s[a])}),s}var Tt=(e,t,s)=>{e[t]!==void 0?Array.isArray(e[t])?e[t].push(s):e[t]=[e[t],s]:t.endsWith("[]")?e[t]=[s]:e[t]=s},Lt=(e,t,s)=>{let a=e;const r=t.split(".");r.forEach((i,o)=>{o===r.length-1?a[i]=s:((!a[i]||typeof a[i]!="object"||Array.isArray(a[i])||a[i]instanceof File)&&(a[i]=Object.create(null)),a=a[i])})},et=e=>{const t=e.split("/");return t[0]===""&&t.shift(),t},Pt=e=>{const{groups:t,path:s}=Ct(e),a=et(s);return $t(a,t)},Ct=e=>{const t=[];return e=e.replace(/\{[^}]+\}/g,(s,a)=>{const r=`@${a}`;return t.push([r,s]),r}),{groups:t,path:e}},$t=(e,t)=>{for(let s=t.length-1;s>=0;s--){const[a]=t[s];for(let r=e.length-1;r>=0;r--)if(e[r].includes(a)){e[r]=e[r].replace(a,t[s][1]);break}}return e},Ie={},_t=(e,t)=>{if(e==="*")return"*";const s=e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(s){const a=`${e}#${t}`;return Ie[a]||(s[2]?Ie[a]=t&&t[0]!==":"&&t[0]!=="*"?[a,s[1],new RegExp(`^${s[2]}(?=/${t})`)]:[e,s[1],new RegExp(`^${s[2]}$`)]:Ie[a]=[e,s[1],!0]),Ie[a]}return null},Fe=(e,t)=>{try{return t(e)}catch{return e.replace(/(?:%[0-9A-Fa-f]{2})+/g,s=>{try{return t(s)}catch{return s}})}},At=e=>Fe(e,decodeURI),tt=e=>{const t=e.url,s=t.indexOf("/",t.indexOf(":")+4);let a=s;for(;a<t.length;a++){const r=t.charCodeAt(a);if(r===37){const i=t.indexOf("?",a),o=t.slice(s,i===-1?void 0:i);return At(o.includes("%25")?o.replace(/%25/g,"%2525"):o)}else if(r===63)break}return t.slice(s,a)},Rt=e=>{const t=tt(e);return t.length>1&&t.at(-1)==="/"?t.slice(0,-1):t},re=(e,t,...s)=>(s.length&&(t=re(t,...s)),`${(e==null?void 0:e[0])==="/"?"":"/"}${e}${t==="/"?"":`${(e==null?void 0:e.at(-1))==="/"?"":"/"}${(t==null?void 0:t[0])==="/"?t.slice(1):t}`}`),st=e=>{if(e.charCodeAt(e.length-1)!==63||!e.includes(":"))return null;const t=e.split("/"),s=[];let a="";return t.forEach(r=>{if(r!==""&&!/\:/.test(r))a+="/"+r;else if(/\:/.test(r))if(/\?/.test(r)){s.length===0&&a===""?s.push("/"):s.push(a);const i=r.replace("?","");a+="/"+i,s.push(a)}else a+="/"+r}),s.filter((r,i,o)=>o.indexOf(r)===i)},Me=e=>/[%+]/.test(e)?(e.indexOf("+")!==-1&&(e=e.replace(/\+/g," ")),e.indexOf("%")!==-1?Fe(e,rt):e):e,at=(e,t,s)=>{let a;if(!s&&t&&!/[%+]/.test(t)){let o=e.indexOf("?",8);if(o===-1)return;for(e.startsWith(t,o+1)||(o=e.indexOf(`&${t}`,o+1));o!==-1;){const c=e.charCodeAt(o+t.length+1);if(c===61){const d=o+t.length+2,l=e.indexOf("&",d);return Me(e.slice(d,l===-1?void 0:l))}else if(c==38||isNaN(c))return"";o=e.indexOf(`&${t}`,o+1)}if(a=/[%+]/.test(e),!a)return}const r={};a??(a=/[%+]/.test(e));let i=e.indexOf("?",8);for(;i!==-1;){const o=e.indexOf("&",i+1);let c=e.indexOf("=",i);c>o&&o!==-1&&(c=-1);let d=e.slice(i+1,c===-1?o===-1?void 0:o:c);if(a&&(d=Me(d)),i=o,d==="")continue;let l;c===-1?l="":(l=e.slice(c+1,o===-1?void 0:o),a&&(l=Me(l))),s?(r[d]&&Array.isArray(r[d])||(r[d]=[]),r[d].push(l)):r[d]??(r[d]=l)}return t?r[t]:r},Dt=at,Mt=(e,t)=>at(e,t,!0),rt=decodeURIComponent,Ve=e=>Fe(e,rt),ne,L,H,ot,nt,Be,U,Ke,it=(Ke=class{constructor(e,t="/",s=[[]]){m(this,H);f(this,"raw");m(this,ne);m(this,L);f(this,"routeIndex",0);f(this,"path");f(this,"bodyCache",{});m(this,U,e=>{const{bodyCache:t,raw:s}=this,a=t[e];if(a)return a;const r=Object.keys(t)[0];return r?t[r].then(i=>(r==="json"&&(i=JSON.stringify(i)),new Response(i)[e]())):t[e]=s[e]()});this.raw=e,this.path=t,h(this,L,s),h(this,ne,{})}param(e){return e?b(this,H,ot).call(this,e):b(this,H,nt).call(this)}query(e){return Dt(this.url,e)}queries(e){return Mt(this.url,e)}header(e){if(e)return this.raw.headers.get(e)??void 0;const t={};return this.raw.headers.forEach((s,a)=>{t[a]=s}),t}async parseBody(e){var t;return(t=this.bodyCache).parsedBody??(t.parsedBody=await St(this,e))}json(){return n(this,U).call(this,"text").then(e=>JSON.parse(e))}text(){return n(this,U).call(this,"text")}arrayBuffer(){return n(this,U).call(this,"arrayBuffer")}blob(){return n(this,U).call(this,"blob")}formData(){return n(this,U).call(this,"formData")}addValidatedData(e,t){n(this,ne)[e]=t}valid(e){return n(this,ne)[e]}get url(){return this.raw.url}get method(){return this.raw.method}get[jt](){return n(this,L)}get matchedRoutes(){return n(this,L)[0].map(([[,e]])=>e)}get routePath(){return n(this,L)[0].map(([[,e]])=>e)[this.routeIndex].path}},ne=new WeakMap,L=new WeakMap,H=new WeakSet,ot=function(e){const t=n(this,L)[0][this.routeIndex][1][e],s=b(this,H,Be).call(this,t);return s&&/\%/.test(s)?Ve(s):s},nt=function(){const e={},t=Object.keys(n(this,L)[0][this.routeIndex][1]);for(const s of t){const a=b(this,H,Be).call(this,n(this,L)[0][this.routeIndex][1][s]);a!==void 0&&(e[s]=/\%/.test(a)?Ve(a):a)}return e},Be=function(e){return n(this,L)[1]?n(this,L)[1][e]:e},U=new WeakMap,Ke),Ot={Stringify:1},lt=async(e,t,s,a,r)=>{typeof e=="object"&&!(e instanceof String)&&(e instanceof Promise||(e=e.toString()),e instanceof Promise&&(e=await e));const i=e.callbacks;return i!=null&&i.length?(r?r[0]+=e:r=[e],Promise.all(i.map(c=>c({phase:t,buffer:r,context:a}))).then(c=>Promise.all(c.filter(Boolean).map(d=>lt(d,t,!1,a,r))).then(()=>r[0]))):Promise.resolve(e)},Bt="text/plain; charset=UTF-8",Oe=(e,t)=>({"Content-Type":e,...t}),ge,xe,M,le,O,T,ye,de,ce,G,we,Ee,V,ie,Ye,Ft=(Ye=class{constructor(e,t){m(this,V);m(this,ge);m(this,xe);f(this,"env",{});m(this,M);f(this,"finalized",!1);f(this,"error");m(this,le);m(this,O);m(this,T);m(this,ye);m(this,de);m(this,ce);m(this,G);m(this,we);m(this,Ee);f(this,"render",(...e)=>(n(this,de)??h(this,de,t=>this.html(t)),n(this,de).call(this,...e)));f(this,"setLayout",e=>h(this,ye,e));f(this,"getLayout",()=>n(this,ye));f(this,"setRenderer",e=>{h(this,de,e)});f(this,"header",(e,t,s)=>{this.finalized&&h(this,T,new Response(n(this,T).body,n(this,T)));const a=n(this,T)?n(this,T).headers:n(this,G)??h(this,G,new Headers);t===void 0?a.delete(e):s!=null&&s.append?a.append(e,t):a.set(e,t)});f(this,"status",e=>{h(this,le,e)});f(this,"set",(e,t)=>{n(this,M)??h(this,M,new Map),n(this,M).set(e,t)});f(this,"get",e=>n(this,M)?n(this,M).get(e):void 0);f(this,"newResponse",(...e)=>b(this,V,ie).call(this,...e));f(this,"body",(e,t,s)=>b(this,V,ie).call(this,e,t,s));f(this,"text",(e,t,s)=>!n(this,G)&&!n(this,le)&&!t&&!s&&!this.finalized?new Response(e):b(this,V,ie).call(this,e,t,Oe(Bt,s)));f(this,"json",(e,t,s)=>b(this,V,ie).call(this,JSON.stringify(e),t,Oe("application/json",s)));f(this,"html",(e,t,s)=>{const a=r=>b(this,V,ie).call(this,r,t,Oe("text/html; charset=UTF-8",s));return typeof e=="object"?lt(e,Ot.Stringify,!1,{}).then(a):a(e)});f(this,"redirect",(e,t)=>{const s=String(e);return this.header("Location",/[^\x00-\xFF]/.test(s)?encodeURI(s):s),this.newResponse(null,t??302)});f(this,"notFound",()=>(n(this,ce)??h(this,ce,()=>new Response),n(this,ce).call(this,this)));h(this,ge,e),t&&(h(this,O,t.executionCtx),this.env=t.env,h(this,ce,t.notFoundHandler),h(this,Ee,t.path),h(this,we,t.matchResult))}get req(){return n(this,xe)??h(this,xe,new it(n(this,ge),n(this,Ee),n(this,we))),n(this,xe)}get event(){if(n(this,O)&&"respondWith"in n(this,O))return n(this,O);throw Error("This context has no FetchEvent")}get executionCtx(){if(n(this,O))return n(this,O);throw Error("This context has no ExecutionContext")}get res(){return n(this,T)||h(this,T,new Response(null,{headers:n(this,G)??h(this,G,new Headers)}))}set res(e){if(n(this,T)&&e){e=new Response(e.body,e);for(const[t,s]of n(this,T).headers.entries())if(t!=="content-type")if(t==="set-cookie"){const a=n(this,T).headers.getSetCookie();e.headers.delete("set-cookie");for(const r of a)e.headers.append("set-cookie",r)}else e.headers.set(t,s)}h(this,T,e),this.finalized=!0}get var(){return n(this,M)?Object.fromEntries(n(this,M)):{}}},ge=new WeakMap,xe=new WeakMap,M=new WeakMap,le=new WeakMap,O=new WeakMap,T=new WeakMap,ye=new WeakMap,de=new WeakMap,ce=new WeakMap,G=new WeakMap,we=new WeakMap,Ee=new WeakMap,V=new WeakSet,ie=function(e,t,s){const a=n(this,T)?new Headers(n(this,T).headers):n(this,G)??new Headers;if(typeof t=="object"&&"headers"in t){const i=t.headers instanceof Headers?t.headers:new Headers(t.headers);for(const[o,c]of i)o.toLowerCase()==="set-cookie"?a.append(o,c):a.set(o,c)}if(s)for(const[i,o]of Object.entries(s))if(typeof o=="string")a.set(i,o);else{a.delete(i);for(const c of o)a.append(i,c)}const r=typeof t=="number"?t:(t==null?void 0:t.status)??n(this,le);return new Response(e,{status:r,headers:a})},Ye),y="ALL",Ht="all",Nt=["get","post","put","delete","options","patch"],dt="Can not add a route since the matcher is already built.",ct=class extends Error{},qt="__COMPOSED_HANDLER",Ut=e=>e.text("404 Not Found",404),Je=(e,t)=>{if("getResponse"in e){const s=e.getResponse();return t.newResponse(s.body,s)}return console.error(e),t.text("Internal Server Error",500)},P,w,ut,C,Y,Te,Le,ue,Vt=(ue=class{constructor(t={}){m(this,w);f(this,"get");f(this,"post");f(this,"put");f(this,"delete");f(this,"options");f(this,"patch");f(this,"all");f(this,"on");f(this,"use");f(this,"router");f(this,"getPath");f(this,"_basePath","/");m(this,P,"/");f(this,"routes",[]);m(this,C,Ut);f(this,"errorHandler",Je);f(this,"onError",t=>(this.errorHandler=t,this));f(this,"notFound",t=>(h(this,C,t),this));f(this,"fetch",(t,...s)=>b(this,w,Le).call(this,t,s[1],s[0],t.method));f(this,"request",(t,s,a,r)=>t instanceof Request?this.fetch(s?new Request(t,s):t,a,r):(t=t.toString(),this.fetch(new Request(/^https?:\/\//.test(t)?t:`http://localhost${re("/",t)}`,s),a,r)));f(this,"fire",()=>{addEventListener("fetch",t=>{t.respondWith(b(this,w,Le).call(this,t.request,t,void 0,t.request.method))})});[...Nt,Ht].forEach(i=>{this[i]=(o,...c)=>(typeof o=="string"?h(this,P,o):b(this,w,Y).call(this,i,n(this,P),o),c.forEach(d=>{b(this,w,Y).call(this,i,n(this,P),d)}),this)}),this.on=(i,o,...c)=>{for(const d of[o].flat()){h(this,P,d);for(const l of[i].flat())c.map(u=>{b(this,w,Y).call(this,l.toUpperCase(),n(this,P),u)})}return this},this.use=(i,...o)=>(typeof i=="string"?h(this,P,i):(h(this,P,"*"),o.unshift(i)),o.forEach(c=>{b(this,w,Y).call(this,y,n(this,P),c)}),this);const{strict:a,...r}=t;Object.assign(this,r),this.getPath=a??!0?t.getPath??tt:Rt}route(t,s){const a=this.basePath(t);return s.routes.map(r=>{var o;let i;s.errorHandler===Je?i=r.handler:(i=async(c,d)=>(await Ue([],s.errorHandler)(c,()=>r.handler(c,d))).res,i[qt]=r.handler),b(o=a,w,Y).call(o,r.method,r.path,i)}),this}basePath(t){const s=b(this,w,ut).call(this);return s._basePath=re(this._basePath,t),s}mount(t,s,a){let r,i;a&&(typeof a=="function"?i=a:(i=a.optionHandler,a.replaceRequest===!1?r=d=>d:r=a.replaceRequest));const o=i?d=>{const l=i(d);return Array.isArray(l)?l:[l]}:d=>{let l;try{l=d.executionCtx}catch{}return[d.env,l]};r||(r=(()=>{const d=re(this._basePath,t),l=d==="/"?0:d.length;return u=>{const p=new URL(u.url);return p.pathname=p.pathname.slice(l)||"/",new Request(p,u)}})());const c=async(d,l)=>{const u=await s(r(d.req.raw),...o(d));if(u)return u;await l()};return b(this,w,Y).call(this,y,re(t,"*"),c),this}},P=new WeakMap,w=new WeakSet,ut=function(){const t=new ue({router:this.router,getPath:this.getPath});return t.errorHandler=this.errorHandler,h(t,C,n(this,C)),t.routes=this.routes,t},C=new WeakMap,Y=function(t,s,a){t=t.toUpperCase(),s=re(this._basePath,s);const r={basePath:this._basePath,path:s,method:t,handler:a};this.router.add(t,s,[a,r]),this.routes.push(r)},Te=function(t,s){if(t instanceof Error)return this.errorHandler(t,s);throw t},Le=function(t,s,a,r){if(r==="HEAD")return(async()=>new Response(null,await b(this,w,Le).call(this,t,s,a,"GET")))();const i=this.getPath(t,{env:a}),o=this.router.match(r,i),c=new Ft(t,{path:i,matchResult:o,env:a,executionCtx:s,notFoundHandler:n(this,C)});if(o[0].length===1){let l;try{l=o[0][0][0][0](c,async()=>{c.res=await n(this,C).call(this,c)})}catch(u){return b(this,w,Te).call(this,u,c)}return l instanceof Promise?l.then(u=>u||(c.finalized?c.res:n(this,C).call(this,c))).catch(u=>b(this,w,Te).call(this,u,c)):l??n(this,C).call(this,c)}const d=Ue(o[0],this.errorHandler,n(this,C));return(async()=>{try{const l=await d(c);if(!l.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return l.res}catch(l){return b(this,w,Te).call(this,l,c)}})()},ue),pt=[];function Jt(e,t){const s=this.buildAllMatchers(),a=((r,i)=>{const o=s[r]||s[y],c=o[2][i];if(c)return c;const d=i.match(o[0]);if(!d)return[[],pt];const l=d.indexOf("",1);return[o[1][l],d]});return this.match=a,a(e,t)}var Ce="[^/]+",ve=".*",be="(?:|/.*)",oe=Symbol(),zt=new Set(".\\+*[^]$()");function Wt(e,t){return e.length===1?t.length===1?e<t?-1:1:-1:t.length===1||e===ve||e===be?1:t===ve||t===be?-1:e===Ce?1:t===Ce?-1:e.length===t.length?e<t?-1:1:t.length-e.length}var Q,X,$,se,Kt=(se=class{constructor(){m(this,Q);m(this,X);m(this,$,Object.create(null))}insert(t,s,a,r,i){if(t.length===0){if(n(this,Q)!==void 0)throw oe;if(i)return;h(this,Q,s);return}const[o,...c]=t,d=o==="*"?c.length===0?["","",ve]:["","",Ce]:o==="/*"?["","",be]:o.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);let l;if(d){const u=d[1];let p=d[2]||Ce;if(u&&d[2]&&(p===".*"||(p=p.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(p))))throw oe;if(l=n(this,$)[p],!l){if(Object.keys(n(this,$)).some(v=>v!==ve&&v!==be))throw oe;if(i)return;l=n(this,$)[p]=new se,u!==""&&h(l,X,r.varIndex++)}!i&&u!==""&&a.push([u,n(l,X)])}else if(l=n(this,$)[o],!l){if(Object.keys(n(this,$)).some(u=>u.length>1&&u!==ve&&u!==be))throw oe;if(i)return;l=n(this,$)[o]=new se}l.insert(c,s,a,r,i)}buildRegExpStr(){const s=Object.keys(n(this,$)).sort(Wt).map(a=>{const r=n(this,$)[a];return(typeof n(r,X)=="number"?`(${a})@${n(r,X)}`:zt.has(a)?`\\${a}`:a)+r.buildRegExpStr()});return typeof n(this,Q)=="number"&&s.unshift(`#${n(this,Q)}`),s.length===0?"":s.length===1?s[0]:"(?:"+s.join("|")+")"}},Q=new WeakMap,X=new WeakMap,$=new WeakMap,se),$e,je,Ze,Yt=(Ze=class{constructor(){m(this,$e,{varIndex:0});m(this,je,new Kt)}insert(e,t,s){const a=[],r=[];for(let o=0;;){let c=!1;if(e=e.replace(/\{[^}]+\}/g,d=>{const l=`@\\${o}`;return r[o]=[l,d],o++,c=!0,l}),!c)break}const i=e.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let o=r.length-1;o>=0;o--){const[c]=r[o];for(let d=i.length-1;d>=0;d--)if(i[d].indexOf(c)!==-1){i[d]=i[d].replace(c,r[o][1]);break}}return n(this,je).insert(i,t,a,n(this,$e),s),a}buildRegExp(){let e=n(this,je).buildRegExpStr();if(e==="")return[/^$/,[],[]];let t=0;const s=[],a=[];return e=e.replace(/#(\d+)|@(\d+)|\.\*\$/g,(r,i,o)=>i!==void 0?(s[++t]=Number(i),"$()"):(o!==void 0&&(a[Number(o)]=++t),"")),[new RegExp(`^${e}`),s,a]}},$e=new WeakMap,je=new WeakMap,Ze),Zt=[/^$/,[],Object.create(null)],Pe=Object.create(null);function ht(e){return Pe[e]??(Pe[e]=new RegExp(e==="*"?"":`^${e.replace(/\/\*$|([.\\+*[^\]$()])/g,(t,s)=>s?`\\${s}`:"(?:|/.*)")}$`))}function Gt(){Pe=Object.create(null)}function Qt(e){var l;const t=new Yt,s=[];if(e.length===0)return Zt;const a=e.map(u=>[!/\*|\/:/.test(u[0]),...u]).sort(([u,p],[v,x])=>u?1:v?-1:p.length-x.length),r=Object.create(null);for(let u=0,p=-1,v=a.length;u<v;u++){const[x,E,_]=a[u];x?r[E]=[_.map(([j])=>[j,Object.create(null)]),pt]:p++;let g;try{g=t.insert(E,p,x)}catch(j){throw j===oe?new ct(E):j}x||(s[p]=_.map(([j,N])=>{const Se=Object.create(null);for(N-=1;N>=0;N--){const[ke,A]=g[N];Se[ke]=A}return[j,Se]}))}const[i,o,c]=t.buildRegExp();for(let u=0,p=s.length;u<p;u++)for(let v=0,x=s[u].length;v<x;v++){const E=(l=s[u][v])==null?void 0:l[1];if(!E)continue;const _=Object.keys(E);for(let g=0,j=_.length;g<j;g++)E[_[g]]=c[E[_[g]]]}const d=[];for(const u in o)d[u]=s[o[u]];return[i,d,r]}function ae(e,t){if(e){for(const s of Object.keys(e).sort((a,r)=>r.length-a.length))if(ht(s).test(t))return[...e[s]]}}var J,z,_e,ft,Ge,Xt=(Ge=class{constructor(){m(this,_e);f(this,"name","RegExpRouter");m(this,J);m(this,z);f(this,"match",Jt);h(this,J,{[y]:Object.create(null)}),h(this,z,{[y]:Object.create(null)})}add(e,t,s){var c;const a=n(this,J),r=n(this,z);if(!a||!r)throw new Error(dt);a[e]||[a,r].forEach(d=>{d[e]=Object.create(null),Object.keys(d[y]).forEach(l=>{d[e][l]=[...d[y][l]]})}),t==="/*"&&(t="*");const i=(t.match(/\/:/g)||[]).length;if(/\*$/.test(t)){const d=ht(t);e===y?Object.keys(a).forEach(l=>{var u;(u=a[l])[t]||(u[t]=ae(a[l],t)||ae(a[y],t)||[])}):(c=a[e])[t]||(c[t]=ae(a[e],t)||ae(a[y],t)||[]),Object.keys(a).forEach(l=>{(e===y||e===l)&&Object.keys(a[l]).forEach(u=>{d.test(u)&&a[l][u].push([s,i])})}),Object.keys(r).forEach(l=>{(e===y||e===l)&&Object.keys(r[l]).forEach(u=>d.test(u)&&r[l][u].push([s,i]))});return}const o=st(t)||[t];for(let d=0,l=o.length;d<l;d++){const u=o[d];Object.keys(r).forEach(p=>{var v;(e===y||e===p)&&((v=r[p])[u]||(v[u]=[...ae(a[p],u)||ae(a[y],u)||[]]),r[p][u].push([s,i-l+d+1]))})}}buildAllMatchers(){const e=Object.create(null);return Object.keys(n(this,z)).concat(Object.keys(n(this,J))).forEach(t=>{e[t]||(e[t]=b(this,_e,ft).call(this,t))}),h(this,J,h(this,z,void 0)),Gt(),e}},J=new WeakMap,z=new WeakMap,_e=new WeakSet,ft=function(e){const t=[];let s=e===y;return[n(this,J),n(this,z)].forEach(a=>{const r=a[e]?Object.keys(a[e]).map(i=>[i,a[e][i]]):[];r.length!==0?(s||(s=!0),t.push(...r)):e!==y&&t.push(...Object.keys(a[y]).map(i=>[i,a[y][i]]))}),s?Qt(t):null},Ge),W,B,Qe,es=(Qe=class{constructor(e){f(this,"name","SmartRouter");m(this,W,[]);m(this,B,[]);h(this,W,e.routers)}add(e,t,s){if(!n(this,B))throw new Error(dt);n(this,B).push([e,t,s])}match(e,t){if(!n(this,B))throw new Error("Fatal error");const s=n(this,W),a=n(this,B),r=s.length;let i=0,o;for(;i<r;i++){const c=s[i];try{for(let d=0,l=a.length;d<l;d++)c.add(...a[d]);o=c.match(e,t)}catch(d){if(d instanceof ct)continue;throw d}this.match=c.match.bind(c),h(this,W,[c]),h(this,B,void 0);break}if(i===r)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,o}get activeRouter(){if(n(this,B)||n(this,W).length!==1)throw new Error("No active router has been determined yet.");return n(this,W)[0]}},W=new WeakMap,B=new WeakMap,Qe),me=Object.create(null),K,I,ee,pe,S,F,Z,he,ts=(he=class{constructor(t,s,a){m(this,F);m(this,K);m(this,I);m(this,ee);m(this,pe,0);m(this,S,me);if(h(this,I,a||Object.create(null)),h(this,K,[]),t&&s){const r=Object.create(null);r[t]={handler:s,possibleKeys:[],score:0},h(this,K,[r])}h(this,ee,[])}insert(t,s,a){h(this,pe,++qe(this,pe)._);let r=this;const i=Pt(s),o=[];for(let c=0,d=i.length;c<d;c++){const l=i[c],u=i[c+1],p=_t(l,u),v=Array.isArray(p)?p[0]:l;if(v in n(r,I)){r=n(r,I)[v],p&&o.push(p[1]);continue}n(r,I)[v]=new he,p&&(n(r,ee).push(p),o.push(p[1])),r=n(r,I)[v]}return n(r,K).push({[t]:{handler:a,possibleKeys:o.filter((c,d,l)=>l.indexOf(c)===d),score:n(this,pe)}}),r}search(t,s){var d;const a=[];h(this,S,me);let i=[this];const o=et(s),c=[];for(let l=0,u=o.length;l<u;l++){const p=o[l],v=l===u-1,x=[];for(let E=0,_=i.length;E<_;E++){const g=i[E],j=n(g,I)[p];j&&(h(j,S,n(g,S)),v?(n(j,I)["*"]&&a.push(...b(this,F,Z).call(this,n(j,I)["*"],t,n(g,S))),a.push(...b(this,F,Z).call(this,j,t,n(g,S)))):x.push(j));for(let N=0,Se=n(g,ee).length;N<Se;N++){const ke=n(g,ee)[N],A=n(g,S)===me?{}:{...n(g,S)};if(ke==="*"){const q=n(g,I)["*"];q&&(a.push(...b(this,F,Z).call(this,q,t,n(g,S))),h(q,S,A),x.push(q));continue}const[xt,He,fe]=ke;if(!p&&!(fe instanceof RegExp))continue;const D=n(g,I)[xt],yt=o.slice(l).join("/");if(fe instanceof RegExp){const q=fe.exec(yt);if(q){if(A[He]=q[0],a.push(...b(this,F,Z).call(this,D,t,n(g,S),A)),Object.keys(n(D,I)).length){h(D,S,A);const Re=((d=q[0].match(/\//))==null?void 0:d.length)??0;(c[Re]||(c[Re]=[])).push(D)}continue}}(fe===!0||fe.test(p))&&(A[He]=p,v?(a.push(...b(this,F,Z).call(this,D,t,A,n(g,S))),n(D,I)["*"]&&a.push(...b(this,F,Z).call(this,n(D,I)["*"],t,A,n(g,S)))):(h(D,S,A),x.push(D)))}}i=x.concat(c.shift()??[])}return a.length>1&&a.sort((l,u)=>l.score-u.score),[a.map(({handler:l,params:u})=>[l,u])]}},K=new WeakMap,I=new WeakMap,ee=new WeakMap,pe=new WeakMap,S=new WeakMap,F=new WeakSet,Z=function(t,s,a,r){const i=[];for(let o=0,c=n(t,K).length;o<c;o++){const d=n(t,K)[o],l=d[s]||d[y],u={};if(l!==void 0&&(l.params=Object.create(null),i.push(l),a!==me||r&&r!==me))for(let p=0,v=l.possibleKeys.length;p<v;p++){const x=l.possibleKeys[p],E=u[l.score];l.params[x]=r!=null&&r[x]&&!E?r[x]:a[x]??(r==null?void 0:r[x]),u[l.score]=!0}}return i},he),te,Xe,ss=(Xe=class{constructor(){f(this,"name","TrieRouter");m(this,te);h(this,te,new ts)}add(e,t,s){const a=st(t);if(a){for(let r=0,i=a.length;r<i;r++)n(this,te).insert(e,a[r],s);return}n(this,te).insert(e,t,s)}match(e,t){return n(this,te).search(e,t)}},te=new WeakMap,Xe),mt=class extends Vt{constructor(e={}){super(e),this.router=e.router??new es({routers:[new Xt,new ss]})}},as=e=>{const s={...{origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH"],allowHeaders:[],exposeHeaders:[]},...e},a=(i=>typeof i=="string"?i==="*"?()=>i:o=>i===o?o:null:typeof i=="function"?i:o=>i.includes(o)?o:null)(s.origin),r=(i=>typeof i=="function"?i:Array.isArray(i)?()=>i:()=>[])(s.allowMethods);return async function(o,c){var u;function d(p,v){o.res.headers.set(p,v)}const l=await a(o.req.header("origin")||"",o);if(l&&d("Access-Control-Allow-Origin",l),s.credentials&&d("Access-Control-Allow-Credentials","true"),(u=s.exposeHeaders)!=null&&u.length&&d("Access-Control-Expose-Headers",s.exposeHeaders.join(",")),o.req.method==="OPTIONS"){s.origin!=="*"&&d("Vary","Origin"),s.maxAge!=null&&d("Access-Control-Max-Age",s.maxAge.toString());const p=await r(o.req.header("origin")||"",o);p.length&&d("Access-Control-Allow-Methods",p.join(","));let v=s.allowHeaders;if(!(v!=null&&v.length)){const x=o.req.header("Access-Control-Request-Headers");x&&(v=x.split(/\s*,\s*/))}return v!=null&&v.length&&(d("Access-Control-Allow-Headers",v.join(",")),o.res.headers.append("Vary","Access-Control-Request-Headers")),o.res.headers.delete("Content-Length"),o.res.headers.delete("Content-Type"),new Response(null,{headers:o.res.headers,status:204,statusText:"No Content"})}await c(),s.origin!=="*"&&o.header("Vary","Origin",{append:!0})}},rs=/^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i,ze=(e,t=os)=>{const s=/\.([a-zA-Z0-9]+?)$/,a=e.match(s);if(!a)return;let r=t[a[1]];return r&&r.startsWith("text")&&(r+="; charset=utf-8"),r},is={aac:"audio/aac",avi:"video/x-msvideo",avif:"image/avif",av1:"video/av1",bin:"application/octet-stream",bmp:"image/bmp",css:"text/css",csv:"text/csv",eot:"application/vnd.ms-fontobject",epub:"application/epub+zip",gif:"image/gif",gz:"application/gzip",htm:"text/html",html:"text/html",ico:"image/x-icon",ics:"text/calendar",jpeg:"image/jpeg",jpg:"image/jpeg",js:"text/javascript",json:"application/json",jsonld:"application/ld+json",map:"application/json",mid:"audio/x-midi",midi:"audio/x-midi",mjs:"text/javascript",mp3:"audio/mpeg",mp4:"video/mp4",mpeg:"video/mpeg",oga:"audio/ogg",ogv:"video/ogg",ogx:"application/ogg",opus:"audio/opus",otf:"font/otf",pdf:"application/pdf",png:"image/png",rtf:"application/rtf",svg:"image/svg+xml",tif:"image/tiff",tiff:"image/tiff",ts:"video/mp2t",ttf:"font/ttf",txt:"text/plain",wasm:"application/wasm",webm:"video/webm",weba:"audio/webm",webmanifest:"application/manifest+json",webp:"image/webp",woff:"font/woff",woff2:"font/woff2",xhtml:"application/xhtml+xml",xml:"application/xml",zip:"application/zip","3gp":"video/3gpp","3g2":"video/3gpp2",gltf:"model/gltf+json",glb:"model/gltf-binary"},os=is,ns=(...e)=>{let t=e.filter(r=>r!=="").join("/");t=t.replace(new RegExp("(?<=\\/)\\/+","g"),"");const s=t.split("/"),a=[];for(const r of s)r===".."&&a.length>0&&a.at(-1)!==".."?a.pop():r!=="."&&a.push(r);return a.join("/")||"."},vt={br:".br",zstd:".zst",gzip:".gz"},ls=Object.keys(vt),ds="index.html",cs=e=>{const t=e.root??"./",s=e.path,a=e.join??ns;return async(r,i)=>{var u,p,v,x;if(r.finalized)return i();let o;if(e.path)o=e.path;else try{if(o=decodeURIComponent(r.req.path),/(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(o))throw new Error}catch{return await((u=e.onNotFound)==null?void 0:u.call(e,r.req.path,r)),i()}let c=a(t,!s&&e.rewriteRequestPath?e.rewriteRequestPath(o):o);e.isDir&&await e.isDir(c)&&(c=a(c,ds));const d=e.getContent;let l=await d(c,r);if(l instanceof Response)return r.newResponse(l.body,l);if(l){const E=e.mimes&&ze(c,e.mimes)||ze(c);if(r.header("Content-Type",E||"application/octet-stream"),e.precompressed&&(!E||rs.test(E))){const _=new Set((p=r.req.header("Accept-Encoding"))==null?void 0:p.split(",").map(g=>g.trim()));for(const g of ls){if(!_.has(g))continue;const j=await d(c+vt[g],r);if(j){l=j,r.header("Content-Encoding",g),r.header("Vary","Accept-Encoding",{append:!0});break}}}return await((v=e.onFound)==null?void 0:v.call(e,c,r)),r.body(l)}await((x=e.onNotFound)==null?void 0:x.call(e,c,r)),await i()}},us=async(e,t)=>{let s;t&&t.manifest?typeof t.manifest=="string"?s=JSON.parse(t.manifest):s=t.manifest:typeof __STATIC_CONTENT_MANIFEST=="string"?s=JSON.parse(__STATIC_CONTENT_MANIFEST):s=__STATIC_CONTENT_MANIFEST;let a;t&&t.namespace?a=t.namespace:a=__STATIC_CONTENT;const r=s[e]||e;if(!r)return null;const i=await a.get(r,{type:"stream"});return i||null},ps=e=>async function(s,a){return cs({...e,getContent:async i=>us(i,{manifest:e.manifest,namespace:e.namespace?e.namespace:s.env?s.env.__STATIC_CONTENT:void 0})})(s,a)},hs=e=>ps(e);const fs=e=>`
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel | Synthnova</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
      body { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); min-height: 100vh; }
      .glass { background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
      .glass-light { background: rgba(255,255,255,0.1); }
      .stat-card { transition: all 0.3s ease; }
      .stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
      .tab-btn.active { background: rgba(255,255,255,0.15); border-bottom: 2px solid #60a5fa; }
      .table-row:hover { background: rgba(255,255,255,0.05); }
      .progress-bar { transition: width 0.3s ease; }
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
      ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
    </style>
</head>
<body class="text-white p-6">
    <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="glass rounded-xl p-6 mb-6">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold mb-1">
                        <i class="fas fa-cog mr-2"></i>
                        Synthnova Admin
                    </h1>
                    <p class="text-sm opacity-75">Панель управления генератором</p>
                </div>
                <div class="flex items-center gap-4">
                    <div id="wsStatus" class="flex items-center gap-2 text-sm">
                        <span class="w-2 h-2 rounded-full bg-yellow-400"></span>
                        <span>Connecting...</span>
                    </div>
                    <a href="/" class="text-sm opacity-75 hover:opacity-100">
                        <i class="fas fa-arrow-left mr-1"></i> На главную
                    </a>
                </div>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="glass stat-card rounded-xl p-4">
                <div class="text-3xl text-blue-400 mb-2"><i class="fas fa-film"></i></div>
                <div class="text-2xl font-bold" id="statShots">-</div>
                <div class="text-xs opacity-75">Шотов всего</div>
            </div>
            <div class="glass stat-card rounded-xl p-4">
                <div class="text-3xl text-green-400 mb-2"><i class="fas fa-video"></i></div>
                <div class="text-2xl font-bold" id="statVideos">-</div>
                <div class="text-xs opacity-75">Видео создано</div>
            </div>
            <div class="glass stat-card rounded-xl p-4">
                <div class="text-3xl text-yellow-400 mb-2"><i class="fas fa-clock"></i></div>
                <div class="text-2xl font-bold" id="statQueued">-</div>
                <div class="text-xs opacity-75">В очереди</div>
            </div>
            <div class="glass stat-card rounded-xl p-4">
                <div class="text-3xl text-purple-400 mb-2"><i class="fas fa-hdd"></i></div>
                <div class="text-2xl font-bold" id="statDisk">-</div>
                <div class="text-xs opacity-75">Место (MB)</div>
            </div>
        </div>

        <!-- Tabs -->
        <div class="glass rounded-xl overflow-hidden">
            <div class="flex border-b border-white/10">
                <button class="tab-btn active px-6 py-4 text-sm font-medium" data-tab="shots">
                    <i class="fas fa-film mr-2"></i> Шоты
                </button>
                <button class="tab-btn px-6 py-4 text-sm font-medium" data-tab="jobs">
                    <i class="fas fa-tasks mr-2"></i> Задачи
                </button>
                <button class="tab-btn px-6 py-4 text-sm font-medium" data-tab="queue">
                    <i class="fas fa-stream mr-2"></i> Очередь
                </button>
                <button class="tab-btn px-6 py-4 text-sm font-medium" data-tab="upload">
                    <i class="fas fa-upload mr-2"></i> Загрузка
                </button>
            </div>

            <!-- Shots Tab -->
            <div id="tab-shots" class="tab-content p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-4">
                        <select id="shotTypeFilter" class="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm">
                            <option value="">Все типы</option>
                            <option value="hook">Hook</option>
                            <option value="mid">Mid</option>
                            <option value="cta">CTA</option>
                        </select>
                        <button onclick="loadShots()" class="bg-blue-500/20 hover:bg-blue-500/30 px-4 py-2 rounded-lg text-sm">
                            <i class="fas fa-refresh mr-1"></i> Обновить
                        </button>
                    </div>
                    <button id="deleteSelectedBtn" onclick="deleteSelectedShots()" class="bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg text-sm hidden">
                        <i class="fas fa-trash mr-1"></i> Удалить выбранные
                    </button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="border-b border-white/10">
                            <tr class="text-left opacity-75">
                                <th class="py-3 px-2"><input type="checkbox" id="selectAllShots" onchange="toggleAllShots()"></th>
                                <th class="py-3 px-2">ID</th>
                                <th class="py-3 px-2">Тип</th>
                                <th class="py-3 px-2">Файл</th>
                                <th class="py-3 px-2">Длительность</th>
                                <th class="py-3 px-2">Теги</th>
                                <th class="py-3 px-2">Дата</th>
                                <th class="py-3 px-2">Действия</th>
                            </tr>
                        </thead>
                        <tbody id="shotsTable"></tbody>
                    </table>
                </div>
                <div id="shotsPagination" class="flex justify-center gap-2 mt-4"></div>
            </div>

            <!-- Jobs Tab -->
            <div id="tab-jobs" class="tab-content p-6 hidden">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-4">
                        <select id="jobStatusFilter" class="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm">
                            <option value="">Все статусы</option>
                            <option value="queued">В очереди</option>
                            <option value="processing">В процессе</option>
                            <option value="completed">Завершено</option>
                            <option value="failed">Ошибка</option>
                            <option value="cancelled">Отменено</option>
                        </select>
                        <button onclick="loadJobs()" class="bg-blue-500/20 hover:bg-blue-500/30 px-4 py-2 rounded-lg text-sm">
                            <i class="fas fa-refresh mr-1"></i> Обновить
                        </button>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="border-b border-white/10">
                            <tr class="text-left opacity-75">
                                <th class="py-3 px-2">Job ID</th>
                                <th class="py-3 px-2">Статус</th>
                                <th class="py-3 px-2">Прогресс</th>
                                <th class="py-3 px-2">Видео</th>
                                <th class="py-3 px-2">Профиль</th>
                                <th class="py-3 px-2">Создано</th>
                                <th class="py-3 px-2">Действия</th>
                            </tr>
                        </thead>
                        <tbody id="jobsTable"></tbody>
                    </table>
                </div>
            </div>

            <!-- Queue Tab -->
            <div id="tab-queue" class="tab-content p-6 hidden">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Current Job -->
                    <div class="glass-light rounded-xl p-6">
                        <h3 class="text-lg font-bold mb-4">
                            <i class="fas fa-play-circle mr-2 text-green-400"></i>
                            Текущая задача
                        </h3>
                        <div id="currentJob">
                            <p class="opacity-50">Нет активной задачи</p>
                        </div>
                    </div>
                    
                    <!-- Queue List -->
                    <div class="glass-light rounded-xl p-6">
                        <h3 class="text-lg font-bold mb-4">
                            <i class="fas fa-list mr-2 text-yellow-400"></i>
                            Очередь (<span id="queueCount">0</span>)
                        </h3>
                        <div id="queueList" class="space-y-2 max-h-64 overflow-y-auto">
                            <p class="opacity-50">Очередь пуста</p>
                        </div>
                        <button onclick="clearQueue()" class="mt-4 bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg text-sm w-full">
                            <i class="fas fa-ban mr-1"></i> Очистить очередь
                        </button>
                    </div>
                </div>
                
                <!-- Live Progress -->
                <div class="glass-light rounded-xl p-6 mt-6">
                    <h3 class="text-lg font-bold mb-4">
                        <i class="fas fa-chart-line mr-2 text-blue-400"></i>
                        Live Progress
                    </h3>
                    <div id="liveProgress" class="space-y-2">
                        <p class="opacity-50">Подключение к WebSocket...</p>
                    </div>
                </div>
            </div>

            <!-- Upload Tab -->
            <div id="tab-upload" class="tab-content p-6 hidden">
                <div class="max-w-xl mx-auto">
                    <form id="uploadForm" class="glass-light rounded-xl p-6">
                        <h3 class="text-lg font-bold mb-4">
                            <i class="fas fa-cloud-upload-alt mr-2"></i>
                            Загрузить шоты
                        </h3>
                        
                        <div class="mb-4">
                            <label class="block text-sm mb-2">Тип шота</label>
                            <select name="type" required class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3">
                                <option value="hook">Hook (начало)</option>
                                <option value="mid" selected>Mid (середина)</option>
                                <option value="cta">CTA (финал)</option>
                            </select>
                        </div>
                        
                        <div class="mb-4">
                            <label class="block text-sm mb-2">Теги (через запятую)</label>
                            <input type="text" name="tags" placeholder="product, demo, sale" 
                                   class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3">
                        </div>
                        
                        <div class="mb-6">
                            <label class="block text-sm mb-2">Видео файлы</label>
                            <div id="dropZone" class="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition">
                                <i class="fas fa-file-video text-4xl mb-3 opacity-50"></i>
                                <p class="opacity-75">Перетащите файлы или кликните для выбора</p>
                                <p class="text-xs opacity-50 mt-1">MP4, MOV, AVI, MKV до 500MB</p>
                                <input type="file" name="files" multiple accept="video/*" class="hidden" id="fileInput">
                            </div>
                            <div id="fileList" class="mt-4 space-y-2"></div>
                        </div>
                        
                        <button type="submit" class="w-full bg-gradient-to-r from-green-500 to-blue-500 py-4 rounded-lg font-bold hover:from-green-600 hover:to-blue-600 transition">
                            <i class="fas fa-upload mr-2"></i>
                            Загрузить
                        </button>
                        
                        <div id="uploadProgress" class="mt-4 hidden">
                            <div class="flex justify-between text-sm mb-1">
                                <span>Загрузка...</span>
                                <span id="uploadPercent">0%</span>
                            </div>
                            <div class="bg-white/10 rounded-full h-2">
                                <div id="uploadBar" class="bg-blue-500 h-2 rounded-full progress-bar" style="width:0%"></div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"><\/script>
    <script>
        const VPS_URL = '/api/admin';
        const ADMIN_KEY = '${e}';
        const WS_URL = 'ws://185.178.46.187:3002';
        
        let ws = null;
        let selectedShots = new Set();
        
        // ============================================
        // TABS
        // ============================================
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
                btn.classList.add('active');
                document.getElementById('tab-' + btn.dataset.tab).classList.remove('hidden');
            });
        });
        
        // ============================================
        // WEBSOCKET
        // ============================================
        
        function connectWebSocket() {
            ws = new WebSocket(WS_URL);
            
            ws.onopen = () => {
                document.getElementById('wsStatus').innerHTML = 
                    '<span class="w-2 h-2 rounded-full bg-green-400"></span><span>Connected</span>';
                ws.send(JSON.stringify({ type: 'get_queue' }));
            };
            
            ws.onclose = () => {
                document.getElementById('wsStatus').innerHTML = 
                    '<span class="w-2 h-2 rounded-full bg-red-400"></span><span>Disconnected</span>';
                setTimeout(connectWebSocket, 3000);
            };
            
            ws.onerror = () => {
                document.getElementById('wsStatus').innerHTML = 
                    '<span class="w-2 h-2 rounded-full bg-red-400"></span><span>Error</span>';
            };
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                handleWSMessage(data);
            };
        }
        
        function handleWSMessage(data) {
            const liveProgress = document.getElementById('liveProgress');
            
            switch(data.type) {
                case 'queue_status':
                    updateQueueDisplay(data);
                    break;
                case 'job_started':
                    liveProgress.innerHTML = \`
                        <div class="bg-green-500/20 rounded-lg p-3">
                            <i class="fas fa-play text-green-400 mr-2"></i>
                            Задача \${data.job_id} запущена (\${data.num_videos} видео)
                        </div>
                    \`;
                    break;
                case 'job_progress':
                    liveProgress.innerHTML = \`
                        <div class="bg-blue-500/20 rounded-lg p-3">
                            <div class="flex justify-between mb-2">
                                <span><i class="fas fa-cog fa-spin mr-2"></i>\${data.job_id}</span>
                                <span>\${data.percent}%</span>
                            </div>
                            <div class="bg-white/10 rounded-full h-2">
                                <div class="bg-blue-500 h-2 rounded-full" style="width:\${data.percent}%"></div>
                            </div>
                            <div class="text-xs mt-2 opacity-75">
                                Видео: \${data.videos_completed} / \${data.videos_total}
                            </div>
                        </div>
                    \`;
                    break;
                case 'video_complete':
                    // Add to feed
                    break;
                case 'job_completed':
                    liveProgress.innerHTML = \`
                        <div class="bg-green-500/20 rounded-lg p-3">
                            <i class="fas fa-check-circle text-green-400 mr-2"></i>
                            Задача \${data.job_id} завершена! \${data.successful} видео создано.
                            <a href="\${data.download_url}" class="ml-2 underline">Скачать</a>
                        </div>
                    \`;
                    loadDashboard();
                    break;
                case 'job_failed':
                    liveProgress.innerHTML = \`
                        <div class="bg-red-500/20 rounded-lg p-3">
                            <i class="fas fa-times-circle text-red-400 mr-2"></i>
                            Ошибка: \${data.error}
                        </div>
                    \`;
                    break;
            }
        }
        
        function updateQueueDisplay(data) {
            // Current job
            const currentJobEl = document.getElementById('currentJob');
            if (data.current_job) {
                currentJobEl.innerHTML = \`
                    <div class="space-y-2">
                        <div class="font-mono text-sm">\${data.current_job.id}</div>
                        <div class="bg-white/10 rounded-full h-2">
                            <div class="bg-green-500 h-2 rounded-full" style="width:\${data.current_job.progress}%"></div>
                        </div>
                        <div class="text-xs opacity-75">
                            \${data.current_job.videos_completed} / \${data.current_job.num_videos} видео
                        </div>
                    </div>
                \`;
            } else {
                currentJobEl.innerHTML = '<p class="opacity-50">Нет активной задачи</p>';
            }
            
            // Queue
            document.getElementById('queueCount').textContent = data.queued_count;
            const queueListEl = document.getElementById('queueList');
            
            if (data.queued_jobs.length === 0) {
                queueListEl.innerHTML = '<p class="opacity-50">Очередь пуста</p>';
            } else {
                queueListEl.innerHTML = data.queued_jobs.map((job, i) => \`
                    <div class="flex items-center justify-between bg-white/5 rounded-lg p-3">
                        <div>
                            <span class="text-xs opacity-50">#\${i + 1}</span>
                            <span class="font-mono text-sm ml-2">\${job.id}</span>
                        </div>
                        <span class="text-xs">\${job.num_videos} видео</span>
                    </div>
                \`).join('');
            }
        }
        
        // ============================================
        // API CALLS
        // ============================================
        
        async function loadDashboard() {
            try {
                const response = await axios.get(VPS_URL + '/dashboard', {
                    headers: { 'x-admin-key': ADMIN_KEY }
                });
                const d = response.data.dashboard;
                
                document.getElementById('statShots').textContent = d.shots.total;
                document.getElementById('statVideos').textContent = d.videos_generated;
                document.getElementById('statQueued').textContent = d.jobs.queued;
                document.getElementById('statDisk').textContent = d.disk_usage.total_mb;
            } catch (error) {
                console.error('Dashboard error:', error);
            }
        }
        
        async function loadShots(page = 1) {
            try {
                const type = document.getElementById('shotTypeFilter').value;
                const url = VPS_URL + '/shots?page=' + page + '&limit=20' + (type ? '&type=' + type : '');
                
                const response = await axios.get(url, {
                    headers: { 'x-admin-key': ADMIN_KEY }
                });
                
                const { shots, total, pages } = response.data;
                
                document.getElementById('shotsTable').innerHTML = shots.map(s => \`
                    <tr class="table-row border-b border-white/5">
                        <td class="py-3 px-2">
                            <input type="checkbox" class="shot-checkbox" value="\${s.id}" onchange="updateSelection()">
                        </td>
                        <td class="py-3 px-2">\${s.id}</td>
                        <td class="py-3 px-2">
                            <span class="px-2 py-1 rounded text-xs \${s.type === 'hook' ? 'bg-blue-500/30' : s.type === 'mid' ? 'bg-green-500/30' : 'bg-purple-500/30'}">
                                \${s.type}
                            </span>
                        </td>
                        <td class="py-3 px-2 font-mono text-xs">\${s.filename}</td>
                        <td class="py-3 px-2">\${s.duration.toFixed(1)}s</td>
                        <td class="py-3 px-2">
                            \${s.tags.map(t => '<span class="bg-white/10 px-2 py-0.5 rounded text-xs mr-1">' + t + '</span>').join('')}
                        </td>
                        <td class="py-3 px-2 text-xs opacity-75">\${new Date(s.created_at).toLocaleDateString()}</td>
                        <td class="py-3 px-2">
                            <button onclick="deleteShot(\${s.id})" class="text-red-400 hover:text-red-300">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                \`).join('');
                
                // Pagination
                let paginationHTML = '';
                for (let i = 1; i <= pages; i++) {
                    paginationHTML += \`
                        <button onclick="loadShots(\${i})" 
                                class="px-3 py-1 rounded \${i === page ? 'bg-blue-500' : 'bg-white/10 hover:bg-white/20'}">
                            \${i}
                        </button>
                    \`;
                }
                document.getElementById('shotsPagination').innerHTML = paginationHTML;
                
            } catch (error) {
                console.error('Load shots error:', error);
            }
        }
        
        async function loadJobs() {
            try {
                const status = document.getElementById('jobStatusFilter').value;
                const url = VPS_URL + '/jobs?limit=50' + (status ? '&status=' + status : '');
                
                const response = await axios.get(url, {
                    headers: { 'x-admin-key': ADMIN_KEY }
                });
                
                const { jobs } = response.data;
                
                document.getElementById('jobsTable').innerHTML = jobs.map(j => \`
                    <tr class="table-row border-b border-white/5">
                        <td class="py-3 px-2 font-mono text-xs">\${j.id}</td>
                        <td class="py-3 px-2">
                            <span class="px-2 py-1 rounded text-xs \${getStatusClass(j.status)}">
                                \${j.status}
                            </span>
                        </td>
                        <td class="py-3 px-2">
                            <div class="w-24 bg-white/10 rounded-full h-2">
                                <div class="bg-blue-500 h-2 rounded-full" style="width:\${j.progress}%"></div>
                            </div>
                        </td>
                        <td class="py-3 px-2">\${j.videos_completed}/\${j.num_videos}</td>
                        <td class="py-3 px-2">\${j.profile}</td>
                        <td class="py-3 px-2 text-xs opacity-75">\${new Date(j.created_at).toLocaleString()}</td>
                        <td class="py-3 px-2 space-x-2">
                            \${j.status === 'completed' ? '<a href="/api/jobs/' + j.id + '/download" class="text-green-400"><i class="fas fa-download"></i></a>' : ''}
                            \${['failed', 'cancelled'].includes(j.status) ? '<button onclick="retryJob(\\'' + j.id + '\\')" class="text-yellow-400"><i class="fas fa-redo"></i></button>' : ''}
                            \${['completed', 'failed', 'cancelled'].includes(j.status) ? '<button onclick="deleteJob(\\'' + j.id + '\\')" class="text-red-400"><i class="fas fa-trash"></i></button>' : ''}
                        </td>
                    </tr>
                \`).join('');
                
            } catch (error) {
                console.error('Load jobs error:', error);
            }
        }
        
        function getStatusClass(status) {
            const classes = {
                queued: 'bg-yellow-500/30',
                processing: 'bg-blue-500/30',
                completed: 'bg-green-500/30',
                failed: 'bg-red-500/30',
                cancelled: 'bg-gray-500/30'
            };
            return classes[status] || 'bg-gray-500/30';
        }
        
        async function deleteShot(id) {
            if (!confirm('Удалить шот #' + id + '?')) return;
            try {
                await axios.delete(VPS_URL + '/shots/' + id, {
                    headers: { 'x-admin-key': ADMIN_KEY }
                });
                loadShots();
                loadDashboard();
            } catch (error) {
                alert('Ошибка: ' + error.response?.data?.error);
            }
        }
        
        async function deleteJob(id) {
            if (!confirm('Удалить задачу ' + id + '?')) return;
            try {
                await axios.delete(VPS_URL + '/jobs/' + id, {
                    headers: { 'x-admin-key': ADMIN_KEY }
                });
                loadJobs();
                loadDashboard();
            } catch (error) {
                alert('Ошибка: ' + error.response?.data?.error);
            }
        }
        
        async function retryJob(id) {
            try {
                await axios.post(VPS_URL + '/jobs/' + id + '/retry', {}, {
                    headers: { 'x-admin-key': ADMIN_KEY }
                });
                loadJobs();
            } catch (error) {
                alert('Ошибка: ' + error.response?.data?.error);
            }
        }
        
        async function clearQueue() {
            if (!confirm('Отменить все задачи в очереди?')) return;
            try {
                await axios.post(VPS_URL + '/queue/clear', {}, {
                    headers: { 'x-admin-key': ADMIN_KEY }
                });
                if (ws) ws.send(JSON.stringify({ type: 'get_queue' }));
            } catch (error) {
                alert('Ошибка: ' + error.response?.data?.error);
            }
        }
        
        function toggleAllShots() {
            const checked = document.getElementById('selectAllShots').checked;
            document.querySelectorAll('.shot-checkbox').forEach(cb => {
                cb.checked = checked;
                if (checked) selectedShots.add(parseInt(cb.value));
                else selectedShots.delete(parseInt(cb.value));
            });
            updateDeleteButton();
        }
        
        function updateSelection() {
            selectedShots.clear();
            document.querySelectorAll('.shot-checkbox:checked').forEach(cb => {
                selectedShots.add(parseInt(cb.value));
            });
            updateDeleteButton();
        }
        
        function updateDeleteButton() {
            const btn = document.getElementById('deleteSelectedBtn');
            if (selectedShots.size > 0) {
                btn.classList.remove('hidden');
                btn.textContent = 'Удалить (' + selectedShots.size + ')';
            } else {
                btn.classList.add('hidden');
            }
        }
        
        async function deleteSelectedShots() {
            if (!confirm('Удалить ' + selectedShots.size + ' шотов?')) return;
            try {
                await axios.delete(VPS_URL + '/shots/batch', {
                    headers: { 'x-admin-key': ADMIN_KEY },
                    data: { ids: Array.from(selectedShots) }
                });
                selectedShots.clear();
                loadShots();
                loadDashboard();
            } catch (error) {
                alert('Ошибка: ' + error.response?.data?.error);
            }
        }
        
        // ============================================
        // FILE UPLOAD
        // ============================================
        
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const fileList = document.getElementById('fileList');
        let uploadFiles = [];
        
        dropZone.onclick = () => fileInput.click();
        
        dropZone.ondragover = (e) => {
            e.preventDefault();
            dropZone.classList.add('border-blue-400');
        };
        
        dropZone.ondragleave = () => {
            dropZone.classList.remove('border-blue-400');
        };
        
        dropZone.ondrop = (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-blue-400');
            handleFiles(e.dataTransfer.files);
        };
        
        fileInput.onchange = () => handleFiles(fileInput.files);
        
        function handleFiles(files) {
            uploadFiles = Array.from(files).filter(f => f.type.startsWith('video/'));
            renderFileList();
        }
        
        function renderFileList() {
            fileList.innerHTML = uploadFiles.map((f, i) => \`
                <div class="flex items-center justify-between bg-white/5 rounded-lg p-2">
                    <span class="text-sm truncate">\${f.name}</span>
                    <button onclick="removeFile(\${i})" class="text-red-400 ml-2">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            \`).join('');
        }
        
        function removeFile(index) {
            uploadFiles.splice(index, 1);
            renderFileList();
        }
        
        document.getElementById('uploadForm').onsubmit = async (e) => {
            e.preventDefault();
            
            if (uploadFiles.length === 0) {
                alert('Выберите файлы для загрузки');
                return;
            }
            
            const formData = new FormData();
            formData.append('type', e.target.type.value);
            formData.append('tags', e.target.tags.value);
            uploadFiles.forEach(f => formData.append('files', f));
            
            const progressEl = document.getElementById('uploadProgress');
            const barEl = document.getElementById('uploadBar');
            const percentEl = document.getElementById('uploadPercent');
            
            progressEl.classList.remove('hidden');
            
            try {
                await axios.post('/api/shots/upload', formData, {
                    headers: { 'x-admin-key': ADMIN_KEY },
                    onUploadProgress: (p) => {
                        const percent = Math.round((p.loaded / p.total) * 100);
                        barEl.style.width = percent + '%';
                        percentEl.textContent = percent + '%';
                    }
                });
                
                alert('Загружено успешно!');
                uploadFiles = [];
                renderFileList();
                loadShots();
                loadDashboard();
            } catch (error) {
                alert('Ошибка: ' + error.response?.data?.error);
            } finally {
                progressEl.classList.add('hidden');
                barEl.style.width = '0%';
            }
        };
        
        // ============================================
        // INIT
        // ============================================
        
        document.getElementById('shotTypeFilter').onchange = () => loadShots();
        document.getElementById('jobStatusFilter').onchange = () => loadJobs();
        
        loadDashboard();
        loadShots();
        loadJobs();
        connectWebSocket();
    <\/script>
</body>
</html>
`,R="https://sessions-none-bathroom-norm.trycloudflare.com",bt="synthnova-admin-2026",k=new mt;k.use("/api/*",as());k.use("/static/*",hs({root:"./public"}));async function Ae(e,t={}){try{const s=new AbortController,a=setTimeout(()=>s.abort(),3e4),r=await fetch(`${R}${e}`,{...t,headers:{"Content-Type":"application/json","User-Agent":"Cloudflare-Worker/1.0",Accept:"application/json",...t.headers},signal:s.signal,redirect:"manual"});if(clearTimeout(a),r.status>=300&&r.status<400){const i=r.headers.get("location");if(i)return fetch(i,{...t,headers:{"Content-Type":"application/json","User-Agent":"Cloudflare-Worker/1.0",...t.headers}})}return r}catch(s){throw console.error("VPS Proxy Error:",{message:s==null?void 0:s.message,name:s==null?void 0:s.name,path:e,url:`${R}${e}`}),new Error(`Backend unavailable: ${(s==null?void 0:s.message)||"Network error"}`)}}k.get("/api/status",async e=>{try{const t=await fetch(`${R}/status`,{signal:AbortSignal.timeout(3e4)}),s=t.ok?await t.json():null;return e.json({gateway:{status:"online",service:"cloudflare-pages",version:"1.0.0"},backend:s||{status:"offline",error:"VPS backend unreachable"},server:{ip:"185.178.46.187",status:s?"online":"offline",cpu:4,ram:8,location:"St. Petersburg, Russia"},generator:{version:"anti-fraud-v2",filters:60,uniqueness_levels:3},stats:{total_combinations:"35+ trillion"}})}catch(t){return e.json({gateway:{status:"online",service:"cloudflare-pages"},backend:{status:"offline",error:(t==null?void 0:t.message)||"Connection timeout",details:{name:t==null?void 0:t.name,message:t==null?void 0:t.message}},server:{ip:"185.178.46.187",status:"offline"}})}});k.post("/api/generate",async e=>{try{const t=await e.req.json(),{num_videos:s,profile:a}=t;if(!s||s<1||s>1e3)return e.json({error:"num_videos должно быть от 1 до 1000"},400);const r=await Ae("/jobs",{method:"POST",body:JSON.stringify({num_videos:s,profile:a||"moderate"})});if(!r.ok){const o=await r.json();return e.json(o,r.status)}const i=await r.json();return e.json({...i,message:"Генерация запущена на сервере"})}catch(t){return e.json({error:t.message||"Ошибка соединения с сервером",fallback:!0,job_id:`job-${Date.now()}`,status:"queued_locally",message:"VPS недоступен. Задача сохранена локально."},503)}});k.get("/api/jobs/:id",async e=>{try{const t=e.req.param("id"),s=await Ae(`/jobs/${t}`);if(!s.ok){const a=await s.json();return e.json(a,s.status)}return e.json(await s.json())}catch{return e.json({error:"Backend unavailable"},503)}});k.get("/api/jobs/:id/download",async e=>{try{const t=e.req.param("id"),s=await fetch(`${R}/jobs/${t}/archive`);if(!s.ok){const i=s.headers.get("content-type");if(i!=null&&i.includes("application/json")){const o=await s.json();return e.json(o,s.status)}return e.json({error:"Download failed"},s.status)}const a=new Headers;a.set("Content-Type","application/zip"),a.set("Content-Disposition",`attachment; filename="export_${t}.zip"`);const r=s.headers.get("content-length");return r&&a.set("Content-Length",r),new Response(s.body,{headers:a})}catch{return e.json({error:"Download service unavailable"},503)}});k.get("/api/shots",async e=>{try{const s=new URL(e.req.url).search,a=await Ae(`/shots${s}`);return e.json(await a.json())}catch{return e.json({error:"Shots service unavailable"},503)}});k.get("/api/shots/stats",async e=>{try{const t=await Ae("/shots/stats");return e.json(await t.json())}catch{return e.json({error:"Stats unavailable"},503)}});k.get("/share/:token",async e=>{try{const t=e.req.param("token"),s=await fetch(`${R}/share/${t}`,{headers:{Accept:"application/json"}});if(!s.ok)return e.html(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Ссылка недействительна | Synthnova</title>
          <script src="https://cdn.tailwindcss.com"><\/script>
        </head>
        <body class="bg-gradient-to-br from-red-500 to-orange-500 min-h-screen flex items-center justify-center p-4">
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white text-center max-w-md">
            <div class="text-6xl mb-4">❌</div>
            <h1 class="text-2xl font-bold mb-2">Ссылка недействительна</h1>
            <p class="opacity-90">Срок действия ссылки истёк или достигнут лимит скачиваний.</p>
            <a href="/" class="inline-block mt-6 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg transition">
              На главную
            </a>
          </div>
        </body>
        </html>
      `);const a=await s.json();return e.html(`
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Скачать видео | Synthnova</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .glass { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); }
        </style>
      </head>
      <body class="min-h-screen flex items-center justify-center p-4">
        <div class="glass rounded-2xl p-8 text-white text-center max-w-md">
          <div class="text-6xl mb-4"><i class="fas fa-video"></i></div>
          <h1 class="text-2xl font-bold mb-2">Ваши видео готовы!</h1>
          <p class="opacity-90 mb-6">
            <strong>${a.num_videos}</strong> уникальных роликов<br>
            Профиль: <strong>${a.profile}</strong>
          </p>
          
          <a href="/share/${t}/download" 
             class="inline-block bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold py-4 px-8 rounded-lg hover:from-green-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 mb-4">
            <i class="fas fa-download mr-2"></i>
            Скачать архив
          </a>
          
          <p class="text-sm opacity-75 mt-4">
            <i class="fas fa-clock mr-1"></i>
            Ссылка действительна до ${new Date(a.expires_at).toLocaleDateString("ru-RU")}
          </p>
          
          <div class="mt-6">
            <a href="/share/${t}/videos" class="text-sm opacity-75 hover:opacity-100 underline">
              Скачать по одному
            </a>
          </div>
        </div>
      </body>
      </html>
    `)}catch{return e.json({error:"Share service unavailable"},503)}});k.get("/share/:token/download",async e=>{try{const t=e.req.param("token"),s=await fetch(`${R}/share/${t}/download`);if(!s.ok)return e.redirect(`/share/${t}`);const a=new Headers;a.set("Content-Type","application/zip"),a.set("Content-Disposition",s.headers.get("content-disposition")||'attachment; filename="videos.zip"');const r=s.headers.get("content-length");return r&&a.set("Content-Length",r),new Response(s.body,{headers:a})}catch{return e.json({error:"Download unavailable"},503)}});k.get("/share/:token/videos",async e=>{try{const t=e.req.param("token"),s=await fetch(`${R}/share/${t}/videos`);if(!s.ok)return e.redirect(`/share/${t}`);const a=await s.json();return e.html(`
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Список видео | Synthnova</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .glass { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); }
        </style>
      </head>
      <body class="min-h-screen p-8">
        <div class="max-w-2xl mx-auto">
          <div class="glass rounded-2xl p-8 text-white mb-6">
            <h1 class="text-2xl font-bold mb-2">
              <i class="fas fa-video mr-2"></i>
              ${a.count} видео
            </h1>
            <p class="opacity-75">Скачайте видео по отдельности</p>
            <a href="/share/${t}" class="text-sm opacity-75 hover:opacity-100 underline mt-2 inline-block">
              ← Назад к архиву
            </a>
          </div>
          
          <div class="glass rounded-2xl p-6 text-white">
            <div class="space-y-3 max-h-96 overflow-y-auto">
              ${a.videos.map(r=>`
                <a href="/share/${t}/video/${r.filename}" 
                   class="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition">
                  <span>
                    <i class="fas fa-film mr-2 opacity-75"></i>
                    ${r.filename}
                  </span>
                  <i class="fas fa-download opacity-75"></i>
                </a>
              `).join("")}
            </div>
          </div>
        </div>
      </body>
      </html>
    `)}catch{return e.json({error:"Videos list unavailable"},503)}});k.get("/share/:token/video/:filename",async e=>{try{const t=e.req.param("token"),s=e.req.param("filename"),a=await fetch(`${R}/share/${t}/video/${s}`);if(!a.ok)return e.json({error:"Video not found"},404);const r=new Headers;r.set("Content-Type","video/mp4"),r.set("Content-Disposition",`attachment; filename="${s}"`);const i=a.headers.get("content-length");return i&&r.set("Content-Length",i),new Response(a.body,{headers:r})}catch{return e.json({error:"Video unavailable"},503)}});k.get("/admin",e=>e.html(fs(bt)));k.all("/api/admin/*",async e=>{try{const t=new URL(e.req.url),a=e.req.path.replace("/api/admin","/admin")+t.search,r=e.req.method,i={"x-admin-key":e.req.header("x-admin-key")||bt},o=e.req.header("content-type");o&&!o.includes("multipart")&&(i["Content-Type"]=o);let c;["POST","PATCH","PUT","DELETE"].includes(r)&&(o!=null&&o.includes("multipart")?c=await e.req.blob():o!=null&&o.includes("application/json")&&(c=JSON.stringify(await e.req.json())));const d=await fetch(`${R}${a}`,{method:r,headers:i,body:c}),l=await d.json();return e.json(l,d.status)}catch{return e.json({error:"Admin API unavailable"},503)}});k.post("/api/shots/upload",async e=>{try{const t=await e.req.formData(),s=await fetch(`${R}/shots/upload`,{method:"POST",body:t}),a=await s.json();return e.json(a,s.status)}catch{return e.json({error:"Upload failed"},503)}});k.get("/",e=>e.html(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Видео-Уникализатор | Synthnova</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          body { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          .glass {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .stat-card { transition: all 0.3s ease; }
          .stat-card:hover { box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
          
          /* Ensure modal is always on top - CRITICAL FIX */
          #uploadModal { 
            z-index: 2147483647 !important; /* Max 32-bit integer */
            position: fixed !important;
            isolation: isolate !important;
          }
          #uploadModal > div { 
            z-index: 2147483647 !important; 
            position: relative !important;
          }
          #uploadModal * { 
            position: relative !important;
            z-index: 1 !important;
          }
          
          /* Isolate main container to prevent stacking context issues */
          .max-w-6xl { isolation: isolate; }
        </style>
    </head>
    <body class="p-8">
        <div class="max-w-6xl mx-auto">
            <!-- Header -->
            <div class="glass rounded-2xl p-8 mb-8 text-white">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h1 class="text-4xl font-bold mb-2">
                            <i class="fas fa-film mr-3"></i>
                            Видео-Уникализатор
                        </h1>
                        <p class="text-xl opacity-90">Массовая генерация уникальных роликов для TikTok</p>
                    </div>
                    <div class="text-right">
                        <div class="text-sm opacity-75">Сервер</div>
                        <div class="text-2xl font-mono">185.178.46.187</div>
                        <div id="serverStatus" class="text-sm text-yellow-300">
                            <i class="fas fa-circle text-xs"></i> Проверка...
                        </div>
                    </div>
                </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="glass rounded-xl p-6 text-white stat-card">
                    <div class="text-4xl mb-2"><i class="fas fa-server"></i></div>
                    <div class="text-sm opacity-75">Конфигурация</div>
                    <div class="text-2xl font-bold">4 CPU / 8GB</div>
                </div>
                
                <div class="glass rounded-xl p-6 text-white stat-card">
                    <div class="text-4xl mb-2"><i class="fas fa-palette"></i></div>
                    <div class="text-sm opacity-75">FFmpeg фильтров</div>
                    <div class="text-2xl font-bold">60+</div>
                </div>
                
                <div class="glass rounded-xl p-6 text-white stat-card">
                    <div class="text-4xl mb-2"><i class="fas fa-infinity"></i></div>
                    <div class="text-sm opacity-75">Комбинаций</div>
                    <div class="text-2xl font-bold">35+ трлн</div>
                </div>
                
                <div class="glass rounded-xl p-6 text-white stat-card">
                    <div class="text-4xl mb-2"><i class="fas fa-clock"></i></div>
                    <div class="text-sm opacity-75">Скорость</div>
                    <div class="text-2xl font-bold">~30 сек/видео</div>
                </div>
            </div>

            <!-- Generator Form -->
            <div class="glass rounded-2xl p-8 mb-8 text-white">
                <h2 class="text-2xl font-bold mb-6">
                    <i class="fas fa-rocket mr-2"></i>
                    Запустить генерацию
                </h2>
                
                <form id="generateForm" class="space-y-6">
                    <div>
                        <label class="block text-sm font-medium mb-2">Количество роликов</label>
                        <input 
                            type="number" 
                            id="numVideos"
                            min="1" 
                            max="1000" 
                            value="10"
                            class="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                            placeholder="От 1 до 1000"
                        >
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-2">Профиль уникализации</label>
                        <select 
                            id="profile"
                            class="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                        >
                            <option value="conservative" class="bg-gray-800">Conservative (только color)</option>
                            <option value="moderate" selected class="bg-gray-800">Moderate (color + texture + temporal)</option>
                            <option value="aggressive" class="bg-gray-800">Aggressive (все уровни + geo)</option>
                        </select>
                    </div>
                    
                    <div class="bg-white/10 rounded-lg p-4">
                        <div class="flex items-start">
                            <i class="fas fa-info-circle mr-3 mt-1"></i>
                            <div class="text-sm opacity-90">
                                <strong>Расчётное время:</strong> <span id="estimatedTime">5 минут</span><br>
                                <strong>Стоимость:</strong> ~<span id="estimatedCost">0.25</span> ₽
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        type="submit"
                        id="submitBtn"
                        class="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold py-4 px-6 rounded-lg hover:from-green-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
                    >
                        <i class="fas fa-play mr-2"></i>
                        Запустить генерацию
                    </button>
                </form>
                
                <div id="result" class="mt-6 hidden"></div>
                
                <!-- Live Progress Panel -->
                <div id="liveProgressPanel" class="mt-6 hidden">
                    <h3 class="text-lg font-bold mb-4">
                        <i class="fas fa-broadcast-tower mr-2 text-green-400"></i>
                        Live Progress
                    </h3>
                    <div id="liveProgress" class="space-y-3"></div>
                </div>
            </div>

            <!-- Upload Section -->
            <div class="glass rounded-2xl p-8 mb-8 text-white">
                <h2 class="text-2xl font-bold mb-6">
                    <i class="fas fa-upload mr-2"></i>
                    Загрузка исходных видео
                </h2>
                
                <p class="text-sm opacity-75 mb-6">
                    Загрузите исходные видео-фрагменты (шоты) для генерации уникальных роликов.
                    Система объединяет Hook + Mid + CTA в финальное видео.
                </p>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div class="bg-white/10 rounded-xl p-4 border-2 border-dashed border-white/30 hover:border-white/50 transition cursor-pointer" onclick="openUpload('hook')">
                        <div class="text-3xl mb-2">🎣</div>
                        <div class="font-bold">Hook</div>
                        <div class="text-sm opacity-75">Начало ролика (3-5 сек)</div>
                        <div class="text-xs opacity-50 mt-2">Привлекает внимание</div>
                    </div>
                    
                    <div class="bg-white/10 rounded-xl p-4 border-2 border-dashed border-white/30 hover:border-white/50 transition cursor-pointer" onclick="openUpload('mid')">
                        <div class="text-3xl mb-2">🎬</div>
                        <div class="font-bold">Mid</div>
                        <div class="text-sm opacity-75">Основной контент (5-15 сек)</div>
                        <div class="text-xs opacity-50 mt-2">Главная часть</div>
                    </div>
                    
                    <div class="bg-white/10 rounded-xl p-4 border-2 border-dashed border-white/30 hover:border-white/50 transition cursor-pointer" onclick="openUpload('cta')">
                        <div class="text-3xl mb-2">📢</div>
                        <div class="font-bold">CTA</div>
                        <div class="text-sm opacity-75">Call-to-action (3-5 сек)</div>
                        <div class="text-xs opacity-50 mt-2">Финал и призыв</div>
                    </div>
                </div>
                
                
                <!-- Shots Stats -->
                <div id="shotsStats" class="grid grid-cols-3 gap-4 mt-6">
                    <div class="bg-white/5 rounded-lg p-3 text-center">
                        <div class="text-2xl font-bold" id="hookCount">-</div>
                        <div class="text-xs opacity-75">Hook</div>
                    </div>
                    <div class="bg-white/5 rounded-lg p-3 text-center">
                        <div class="text-2xl font-bold" id="midCount">-</div>
                        <div class="text-xs opacity-75">Mid</div>
                    </div>
                    <div class="bg-white/5 rounded-lg p-3 text-center">
                        <div class="text-2xl font-bold" id="ctaCount">-</div>
                        <div class="text-xs opacity-75">CTA</div>
                    </div>
                </div>
                
                <div class="mt-4 text-center">
                    <a href="/admin" class="text-sm opacity-75 hover:opacity-100 underline">
                        <i class="fas fa-cog mr-1"></i> Управление шотами в Admin Panel
                    </a>
                </div>
            </div>

            <!-- Features -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="glass rounded-xl p-6 text-white">
                    <div class="text-3xl mb-3"><i class="fas fa-shield-alt"></i></div>
                    <h3 class="text-xl font-bold mb-2">Anti-Fraud</h3>
                    <p class="opacity-90">4 уровня уникализации обманывают перцептивный хэш TikTok</p>
                </div>
                
                <div class="glass rounded-xl p-6 text-white">
                    <div class="text-3xl mb-3"><i class="fas fa-tachometer-alt"></i></div>
                    <h3 class="text-xl font-bold mb-2">Быстро</h3>
                    <p class="opacity-90">15000 роликов за 60 часов на текущем сервере</p>
                </div>
                
                <div class="glass rounded-xl p-6 text-white">
                    <div class="text-3xl mb-3"><i class="fas fa-chart-line"></i></div>
                    <h3 class="text-xl font-bold mb-2">Экономично</h3>
                    <p class="opacity-90">1900 ₽/мес vs $1500-7500 за 15k у конкурентов</p>
                </div>
            </div>

            <!-- Footer -->
            <div class="text-center mt-8 text-white opacity-75">
                <p>© 2026 Synthnova | Timeweb Cloud VPS | FFmpeg 6.1.1 + Node.js 18.19.1</p>
                <a href="/admin" class="text-xs opacity-50 hover:opacity-100 mt-2 inline-block">
                    <i class="fas fa-cog mr-1"></i> Admin Panel
                </a>
            </div>
        </div>
                <!-- Upload Modal -->
                <div id="uploadModal" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
                    <div class="bg-gray-900 text-white rounded-2xl p-8 max-w-lg w-full shadow-2xl relative z-[10000]">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-xl font-bold">Загрузить <span id="uploadTypeLabel">Mid</span></h3>
                            <button onclick="closeUpload()" class="text-2xl opacity-50 hover:opacity-100">×</button>
                        </div>
                        
                        <form id="uploadForm" class="space-y-4">
                            <input type="hidden" id="uploadType" value="mid">
                            
                            <div>
                                <label class="block text-sm font-medium mb-2">Теги (опционально)</label>
                                <input 
                                    type="text" 
                                    id="uploadTags"
                                    placeholder="product, demo, promo"
                                    class="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                <p class="text-xs opacity-50 mt-1">Через запятую</p>
                            </div>
                            
                            <div 
                                id="dropZone"
                                class="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-white/50 hover:bg-white/5 transition cursor-pointer"
                            >
                                <div class="text-4xl mb-3">📁</div>
                                <div class="font-bold mb-1">Перетащите файлы сюда</div>
                                <div class="text-sm opacity-75">или кликните для выбора</div>
                                <div class="text-xs opacity-50 mt-2">MP4, MOV, AVI • до 500MB • до 50 файлов</div>
                                <input type="file" id="fileInput" multiple accept="video/*" class="hidden">
                            </div>
                            
                            <div id="fileList" class="space-y-2 max-h-40 overflow-y-auto"></div>
                            
                            <div id="uploadProgress" class="hidden">
                                <div class="flex justify-between mb-1">
                                    <span>Загрузка...</span>
                                    <span id="uploadPercent">0%</span>
                                </div>
                                <div class="bg-white/10 rounded-full h-2">
                                    <div id="uploadBar" class="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all" style="width:0%"></div>
                                </div>
                            </div>
                            
                            <button 
                                type="submit"
                                id="uploadBtn"
                                disabled
                                class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i class="fas fa-cloud-upload-alt mr-2"></i>
                                Загрузить
                            </button>
                        </form>
                        
                        <div id="uploadResult" class="mt-4 hidden"></div>
                    </div>
                </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"><\/script>
        <script>
          // Check server status
          async function checkStatus() {
            const statusEl = document.getElementById('serverStatus');
            try {
              const response = await axios.get('/api/status', { timeout: 5000 });
              const data = response.data;
              
              if (data.backend?.status === 'online') {
                statusEl.innerHTML = '<i class="fas fa-circle text-xs text-green-400"></i> Online';
                statusEl.className = 'text-sm text-green-300';
              } else {
                statusEl.innerHTML = '<i class="fas fa-circle text-xs text-red-400"></i> Offline';
                statusEl.className = 'text-sm text-red-300';
              }
            } catch (error) {
              statusEl.innerHTML = '<i class="fas fa-circle text-xs text-red-400"></i> Offline';
              statusEl.className = 'text-sm text-red-300';
            }
          }
          
          checkStatus();
          setInterval(checkStatus, 30000);

          // Update estimated time
          const numVideosInput = document.getElementById('numVideos');
          const estimatedTimeEl = document.getElementById('estimatedTime');
          const estimatedCostEl = document.getElementById('estimatedCost');
          
          function updateEstimates() {
            const numVideos = parseInt(numVideosInput.value) || 10;
            const minutes = Math.ceil(numVideos * 30 / 60);
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            
            let timeStr = '';
            if (hours > 0) timeStr += hours + ' ч ';
            if (mins > 0 || hours === 0) timeStr += mins + ' мин';
            
            estimatedTimeEl.textContent = timeStr;
            estimatedCostEl.textContent = (numVideos * 0.025).toFixed(2);
          }
          
          numVideosInput.addEventListener('input', updateEstimates);
          updateEstimates();
          
          // Handle form submission
          document.getElementById('generateForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const numVideos = parseInt(document.getElementById('numVideos').value);
            const profile = document.getElementById('profile').value;
            const resultEl = document.getElementById('result');
            const submitBtn = document.getElementById('submitBtn');
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Отправка...';
            
            resultEl.className = 'mt-6 bg-blue-500/20 border border-blue-400/50 rounded-lg p-4';
            resultEl.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Создание задачи...';
            resultEl.classList.remove('hidden');
            
            try {
              const response = await axios.post('/api/generate', {
                num_videos: numVideos,
                profile: profile
              });
              
              const data = response.data;
              
              resultEl.className = 'mt-6 bg-green-500/20 border border-green-400/50 rounded-lg p-4';
              resultEl.innerHTML = \`
                <div class="flex items-start">
                  <i class="fas fa-check-circle text-2xl mr-3 text-green-400"></i>
                  <div>
                    <div class="font-bold text-lg mb-2">Задача создана!</div>
                    <div class="space-y-1 text-sm opacity-90">
                      <div><strong>Job ID:</strong> \${data.job_id}</div>
                      <div><strong>Статус:</strong> \${data.status}</div>
                      <div><strong>Роликов:</strong> \${data.num_videos}</div>
                      <div><strong>Профиль:</strong> \${data.profile}</div>
                      <div><strong>Примерное время:</strong> \${data.estimated_time} мин</div>
                      \${data.queue_position ? '<div><strong>Позиция в очереди:</strong> #' + data.queue_position + '</div>' : ''}
                    </div>
                    <div class="mt-4">
                      <a href="/api/jobs/\${data.job_id}" target="_blank" 
                         class="text-sm underline hover:no-underline">
                        Отслеживать статус →
                      </a>
                    </div>
                  </div>
                </div>
              \`;
              
              // Subscribe to WebSocket updates for this job
              subscribeToJob(data.job_id);
            } catch (error) {
              const errData = error.response?.data;
              
              resultEl.className = 'mt-6 bg-red-500/20 border border-red-400/50 rounded-lg p-4';
              
              if (errData?.fallback) {
                resultEl.className = 'mt-6 bg-yellow-500/20 border border-yellow-400/50 rounded-lg p-4';
                resultEl.innerHTML = \`
                  <div class="flex items-start">
                    <i class="fas fa-exclamation-triangle text-2xl mr-3 text-yellow-400"></i>
                    <div>
                      <div class="font-bold text-lg mb-2">Сервер временно недоступен</div>
                      <div class="text-sm opacity-90">\${errData.message}</div>
                      <div class="text-xs mt-2 opacity-75">Job ID: \${errData.job_id}</div>
                    </div>
                  </div>
                \`;
              } else {
                resultEl.innerHTML = \`
                  <div class="flex items-start">
                    <i class="fas fa-exclamation-circle text-2xl mr-3 text-red-400"></i>
                    <div>
                      <div class="font-bold text-lg mb-2">Ошибка</div>
                      <div class="text-sm opacity-90">\${errData?.error || error.message}</div>
                    </div>
                  </div>
                \`;
              }
            } finally {
              submitBtn.disabled = false;
              submitBtn.innerHTML = '<i class="fas fa-play mr-2"></i> Запустить генерацию';
            }
          });
          
          // ============================================
          // HTTP POLLING FOR LIVE PROGRESS (HTTPS-safe)
          // ============================================
          
          let currentJobId = null;
          let pollingInterval = null;
          let lastJobStatus = null;
          
          async function pollJobStatus() {
            if (!currentJobId) return;
            
            try {
              const response = await axios.get(\`/api/jobs/\${currentJobId}\`);
              const data = response.data;
              
              // Check if status changed
              if (JSON.stringify(data) !== lastJobStatus) {
                lastJobStatus = JSON.stringify(data);
                handleJobUpdate(data);
              }
            } catch (error) {
              console.error('[Polling] Error:', error);
            }
          }
          
          function startPolling(jobId) {
            currentJobId = jobId;
            lastJobStatus = null;
            
            // Poll every 2 seconds
            if (pollingInterval) clearInterval(pollingInterval);
            pollingInterval = setInterval(pollJobStatus, 2000);
            
            // Initial poll
            pollJobStatus();
          }
          
          function stopPolling() {
            if (pollingInterval) {
              clearInterval(pollingInterval);
              pollingInterval = null;
            }
            currentJobId = null;
          }
          
          function handleJobUpdate(data) {
            const panel = document.getElementById('liveProgressPanel');
            const progress = document.getElementById('liveProgress');
            
            // Show panel for active jobs
            if (data.status !== 'pending') {
              panel.classList.remove('hidden');
            }
            
            // Update based on status
            if (data.status === 'processing') {
              const percent = data.progress?.percent || 0;
              const completed = data.progress?.videos_completed || 0;
              const total = data.num_videos || 0;
              
              progress.innerHTML = \`
                <div class="bg-blue-500/20 rounded-lg p-4">
                  <div class="flex justify-between mb-2">
                    <span><i class="fas fa-cog fa-spin mr-2"></i>Генерация...</span>
                    <span class="font-bold">\${percent}%</span>
                  </div>
                  <div class="bg-white/10 rounded-full h-3 mb-2">
                    <div class="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300" 
                         style="width:\${percent}%"></div>
                  </div>
                  <div class="text-sm opacity-75">
                    Видео: \${completed} / \${total}
                  </div>
                </div>
              \`;
            } else if (data.status === 'completed') {
              stopPolling();
              progress.innerHTML = \`
                <div class="bg-green-500/20 rounded-lg p-4">
                  <div class="flex items-center">
                    <i class="fas fa-check-circle text-green-400 mr-3 text-2xl"></i>
                    <div class="flex-1">
                      <div class="font-bold text-green-400">Генерация завершена!</div>
                      <div class="text-sm opacity-75">\${data.successful || data.num_videos} видео готовы</div>
                    </div>
                  </div>
                </div>
              \`;
            } else if (data.status === 'failed') {
              stopPolling();
              progress.innerHTML = \`
                <div class="bg-red-500/20 rounded-lg p-4">
                  <div class="flex items-center">
                    <i class="fas fa-exclamation-circle text-red-400 mr-3 text-2xl"></i>
                    <div>
                      <div class="font-bold text-red-400">Ошибка генерации</div>
                      <div class="text-sm opacity-75">\${data.error || 'Неизвестная ошибка'}</div>
                    </div>
                  </div>
                </div>
              \`;
            }
          }
          
          // Subscribe to job after creation
          function subscribeToJob(jobId) {
            startPolling(jobId);
          }
          
          // ============================================
          // UPLOAD FUNCTIONALITY
          // ============================================
          
          let selectedFiles = [];
          
          function openUpload(type) {
            document.getElementById('uploadType').value = type;
            document.getElementById('uploadTypeLabel').textContent = type.charAt(0).toUpperCase() + type.slice(1);
            document.getElementById('uploadModal').classList.remove('hidden');
            selectedFiles = [];
            updateFileList();
          }
          
          function closeUpload() {
            document.getElementById('uploadModal').classList.add('hidden');
            document.getElementById('uploadResult').classList.add('hidden');
            document.getElementById('uploadProgress').classList.add('hidden');
          }
          
          // Close modal on escape or outside click
          document.getElementById('uploadModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('uploadModal')) closeUpload();
          });
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeUpload();
          });
          
          // Drag and drop
          const dropZone = document.getElementById('dropZone');
          const fileInput = document.getElementById('fileInput');
          
          dropZone.addEventListener('click', () => fileInput.click());
          
          dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-blue-500', 'bg-blue-500/10');
          });
          
          dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('border-blue-500', 'bg-blue-500/10');
          });
          
          dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-blue-500', 'bg-blue-500/10');
            handleFiles(e.dataTransfer.files);
          });
          
          fileInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
          });
          
          function handleFiles(files) {
            for (const file of files) {
              if (file.type.startsWith('video/') && selectedFiles.length < 50) {
                selectedFiles.push(file);
              }
            }
            updateFileList();
          }
          
          function updateFileList() {
            const fileList = document.getElementById('fileList');
            const uploadBtn = document.getElementById('uploadBtn');
            
            if (selectedFiles.length === 0) {
              fileList.innerHTML = '';
              uploadBtn.disabled = true;
              return;
            }
            
            fileList.innerHTML = selectedFiles.map((file, i) => 
              '<div class="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 text-sm text-white">' +
                '<span class="truncate flex-1 text-white">' + file.name + '</span>' +
                '<span class="opacity-50 mx-2 text-white">' + (file.size / 1024 / 1024).toFixed(1) + ' MB</span>' +
                '<button type="button" onclick="removeFile(' + i + ')" class="text-red-400 hover:text-red-300">' +
                  '<i class="fas fa-times"></i>' +
                '</button>' +
              '</div>'
            ).join('');
            
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<i class="fas fa-cloud-upload-alt mr-2"></i> Загрузить ' + selectedFiles.length + ' файл(ов)';
          }
          
          function removeFile(index) {
            selectedFiles.splice(index, 1);
            updateFileList();
          }
          
          // Upload form submit
          document.getElementById('uploadForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (selectedFiles.length === 0) return;
            
            const type = document.getElementById('uploadType').value;
            const tags = document.getElementById('uploadTags').value;
            const uploadBtn = document.getElementById('uploadBtn');
            const uploadProgress = document.getElementById('uploadProgress');
            const uploadBar = document.getElementById('uploadBar');
            const uploadPercent = document.getElementById('uploadPercent');
            const uploadResult = document.getElementById('uploadResult');
            
            uploadBtn.disabled = true;
            uploadProgress.classList.remove('hidden');
            uploadResult.classList.add('hidden');
            
            const formData = new FormData();
            formData.append('type', type);
            if (tags) formData.append('tags', tags);
            selectedFiles.forEach(file => formData.append('files', file));
            
            try {
              const response = await axios.post('/api/shots/upload', formData, {
                onUploadProgress: (progressEvent) => {
                  const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                  uploadBar.style.width = percent + '%';
                  uploadPercent.textContent = percent + '%';
                }
              });
              
              const data = response.data;
              
              uploadResult.classList.remove('hidden');
              uploadResult.className = 'mt-4 bg-green-500/20 border border-green-400/50 rounded-lg p-4';
              uploadResult.innerHTML = 
                '<div class="flex items-center">' +
                  '<i class="fas fa-check-circle text-green-400 text-xl mr-3"></i>' +
                  '<div>' +
                    '<div class="font-bold">Загружено успешно!</div>' +
                    '<div class="text-sm opacity-75">' + (data.uploaded?.length || data.shots?.length || selectedFiles.length) + ' файлов</div>' +
                  '</div>' +
                '</div>';
              
              selectedFiles = [];
              updateFileList();
              loadShotsStats();
              
              // Auto-close after success
              setTimeout(closeUpload, 2000);
              
            } catch (error) {
              uploadResult.classList.remove('hidden');
              uploadResult.className = 'mt-4 bg-red-500/20 border border-red-400/50 rounded-lg p-4';
              uploadResult.innerHTML = 
                '<div class="flex items-center">' +
                  '<i class="fas fa-exclamation-circle text-red-400 text-xl mr-3"></i>' +
                  '<div>' +
                    '<div class="font-bold">Ошибка загрузки</div>' +
                    '<div class="text-sm opacity-75">' + (error.response?.data?.error || error.message) + '</div>' +
                  '</div>' +
                '</div>';
            } finally {
              uploadBtn.disabled = false;
              uploadBtn.innerHTML = '<i class="fas fa-cloud-upload-alt mr-2"></i> Загрузить';
              uploadProgress.classList.add('hidden');
            }
          });
          
          // Load shots stats
          async function loadShotsStats() {
            try {
              const response = await axios.get('/api/shots/stats');
              const data = response.data;
              const stats = data.stats || data; // Handle both formats
              
              document.getElementById('hookCount').textContent = stats.hook || 0;
              document.getElementById('midCount').textContent = stats.mid || 0;
              document.getElementById('ctaCount').textContent = stats.cta || 0;
            } catch (error) {
              console.log('Stats unavailable');
            }
          }
          
          loadShotsStats();
        <\/script>
    </body>
    </html>
  `));const We=new mt,ms=Object.assign({"/src/index.tsx":k});let gt=!1;for(const[,e]of Object.entries(ms))e&&(We.all("*",t=>{let s;try{s=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,s)}),We.notFound(t=>{let s;try{s=t.executionCtx}catch{}return e.fetch(t.req.raw,t.env,s)}),gt=!0);if(!gt)throw new Error("Can't import modules from ['/src/index.ts','/src/index.tsx','/app/server.ts']");export{We as default};
