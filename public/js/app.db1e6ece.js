(function(t){function e(e){for(var r,a,c=e[0],s=e[1],u=e[2],l=0,p=[];l<c.length;l++)a=c[l],Object.prototype.hasOwnProperty.call(o,a)&&o[a]&&p.push(o[a][0]),o[a]=0;for(r in s)Object.prototype.hasOwnProperty.call(s,r)&&(t[r]=s[r]);v&&v(e);while(p.length)p.shift()();return i.push.apply(i,u||[]),n()}function n(){for(var t,e=0;e<i.length;e++){for(var n=i[e],r=!0,a=1;a<n.length;a++){var c=n[a];0!==o[c]&&(r=!1)}r&&(i.splice(e--,1),t=s(s.s=n[0]))}return t}var r={},a={app:0},o={app:0},i=[];function c(t){return s.p+"js/"+({about:"about",home:"home"}[t]||t)+"."+{about:"234b6de5",home:"69fe2785"}[t]+".js"}function s(e){if(r[e])return r[e].exports;var n=r[e]={i:e,l:!1,exports:{}};return t[e].call(n.exports,n,n.exports,s),n.l=!0,n.exports}s.e=function(t){var e=[],n={about:1};a[t]?e.push(a[t]):0!==a[t]&&n[t]&&e.push(a[t]=new Promise((function(e,n){for(var r="css/"+({about:"about",home:"home"}[t]||t)+"."+{about:"8689fec2",home:"31d6cfe0"}[t]+".css",o=s.p+r,i=document.getElementsByTagName("link"),c=0;c<i.length;c++){var u=i[c],l=u.getAttribute("data-href")||u.getAttribute("href");if("stylesheet"===u.rel&&(l===r||l===o))return e()}var p=document.getElementsByTagName("style");for(c=0;c<p.length;c++){u=p[c],l=u.getAttribute("data-href");if(l===r||l===o)return e()}var v=document.createElement("link");v.rel="stylesheet",v.type="text/css",v.onload=e,v.onerror=function(e){var r=e&&e.target&&e.target.src||o,i=new Error("Loading CSS chunk "+t+" failed.\n("+r+")");i.code="CSS_CHUNK_LOAD_FAILED",i.request=r,delete a[t],v.parentNode.removeChild(v),n(i)},v.href=o;var f=document.getElementsByTagName("head")[0];f.appendChild(v)})).then((function(){a[t]=0})));var r=o[t];if(0!==r)if(r)e.push(r[2]);else{var i=new Promise((function(e,n){r=o[t]=[e,n]}));e.push(r[2]=i);var u,l=document.createElement("script");l.charset="utf-8",l.timeout=120,s.nc&&l.setAttribute("nonce",s.nc),l.src=c(t);var p=new Error;u=function(e){l.onerror=l.onload=null,clearTimeout(v);var n=o[t];if(0!==n){if(n){var r=e&&("load"===e.type?"missing":e.type),a=e&&e.target&&e.target.src;p.message="Loading chunk "+t+" failed.\n("+r+": "+a+")",p.name="ChunkLoadError",p.type=r,p.request=a,n[1](p)}o[t]=void 0}};var v=setTimeout((function(){u({type:"timeout",target:l})}),12e4);l.onerror=l.onload=u,document.head.appendChild(l)}return Promise.all(e)},s.m=t,s.c=r,s.d=function(t,e,n){s.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},s.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},s.t=function(t,e){if(1&e&&(t=s(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(s.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)s.d(n,r,function(e){return t[e]}.bind(null,r));return n},s.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return s.d(e,"a",e),e},s.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},s.p="/",s.oe=function(t){throw console.error(t),t};var u=window["webpackJsonp"]=window["webpackJsonp"]||[],l=u.push.bind(u);u.push=e,u=u.slice();for(var p=0;p<u.length;p++)e(u[p]);var v=l;i.push([0,"chunk-vendors"]),n()})({0:function(t,e,n){t.exports=n("56d7")},"56d7":function(t,e,n){"use strict";n.r(e);n("e260"),n("e6cf"),n("cca6"),n("a79d");var r=n("2b0e"),a=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-app",{attrs:{id:"app"}},[n("navDrawer"),n("navbar"),n("v-main",[n("div",{staticClass:"content mx-2 my-1"},[n("router-view")],1)])],1)},o=[],i=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-app-bar",{attrs:{app:"",absolute:"","elevate-on-scroll":"",dense:"",flat:""}},[t.ismobile?n("v-app-bar-nav-icon",{on:{click:function(e){null==t.$state.navbar.active?t.$state.navbar.active=!0:t.$state.navbar.active=!t.$state.navbar.active}}}):t._e(),n("v-avatar",{staticClass:"mx-2 point-cursor",attrs:{color:"primary",size:"30"},on:{click:function(e){return t.$router.push("/")}}},[n("v-img",{attrs:{src:t.avatar}})],1),t.ismobile?n("v-toolbar-title",{staticClass:"text-h6 font-weight-black point-cursor",on:{click:function(e){return t.$router.push("/")}}},[t._v(" "+t._s(t.title)+" ")]):t._e(),t.ismobile?t._e():n("v-icon",{attrs:{color:"primary"}},[t._v("mdi-chevron-double-right")]),n("v-slide-y-transition",{attrs:{mode:"out-in"}},[t.ismobile?t._e():n("v-toolbar-title",{key:t.routeKey,staticClass:"text-h6 font-weight-black"},[t._v(" "+t._s(t.$route.name)+" ")])],1),n("v-spacer"),n("v-btn",{attrs:{icon:""}},[n("v-icon",{on:{click:function(e){return t.$router.push("about")}}},[t._v(" mdi-github ")])],1)],1)},c=[];n("b0c0");function s(){var t=window.innerWidth>0?window.innerWidth:screen.width;return!(t>950)}var u={data:function(){return{title:"Shan.tk",currentPage:"",routeKey:0,avatar:"https://i.ibb.co/9YwxPwZ/IMG-20191218-222419-347.webp"}},computed:{ismobile:function(){return s()}},watch:{$route:function(t){this.currentPage=t.name,this.routeKey++}}},l=u,p=n("2877"),v=n("6544"),f=n.n(v),d=n("40dc"),m=n("5bc1"),h=n("8212"),b=n("8336"),g=n("132d"),y=n("adda"),w=n("0789"),k=n("2fa4"),_=n("2a7f"),x=Object(p["a"])(l,i,c,!1,null,null,null),C=x.exports;f()(x,{VAppBar:d["a"],VAppBarNavIcon:m["a"],VAvatar:h["a"],VBtn:b["a"],VIcon:g["a"],VImg:y["a"],VSlideYTransition:w["a"],VSpacer:k["a"],VToolbarTitle:_["a"]});var V=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-navigation-drawer",{attrs:{app:""},model:{value:t.$state.navbar.active,callback:function(e){t.$set(t.$state.navbar,"active",e)},expression:"$state.navbar.active"}},[n("v-container",[n("div",{staticClass:"text-center"},[t.ismobile?t._e():n("v-toolbar-title",{staticClass:"text-h6 font-weight-black"},[t._v(" "+t._s(t.title)+" ")]),n("div",{class:t.ismobile?"text-subtitle-2 font-weight-normal":"text-caption font-weight-light"},[t._v(" Backend API Docs ")])],1),n("v-divider",{staticClass:"my-1"}),n("div",{staticClass:"text-center"},t._l(t.icons,(function(e,r){return n("v-tooltip",{key:r,attrs:{bottom:"",transition:"slide-y-transition"},scopedSlots:t._u([{key:"activator",fn:function(r){var a=r.on,o=r.attrs;return[n("v-btn",t._g(t._b({attrs:{icon:""},on:{click:function(n){return t.goToUrl(e.link)}}},"v-btn",o,!1),a),[n("v-icon",{staticClass:"mx-1",attrs:{color:"primary"}},[t._v(t._s(e.icon))])],1)]}}],null,!0)},[n("span",[t._v(t._s(e.tooltip))])])})),1),n("v-divider",{staticClass:"my-1"})],1)],1)},$=[],T={data:function(){return{title:"Shan.tk"}},methods:{goToUrl:function(t){window.open(t)}},computed:{ismobile:function(){return s()},icons:function(){return[{icon:"mdi-twitter",link:"https://twitter.com/shantk18",tooltip:"Twitter"},{icon:"mdi-github",link:"https://github.com/tks18",tooltip:"Github"},{icon:"mdi-mail",link:"mailto:me@shaaan.tk",tooltip:"Email Me"},{icon:"mdi-linkedin",link:"https://www.linkedin.com/in/shantk18/",tooltip:"Linked In"},{icon:"mdi-camera",link:"https://unsplash.com/@shantk18",tooltip:"Photos"}]}}},P=T,O=n("a523"),j=n("ce7e"),A=n("f774"),E=n("3a2f"),S=Object(p["a"])(P,V,$,!1,null,null,null),B=S.exports;f()(S,{VBtn:b["a"],VContainer:O["a"],VDivider:j["a"],VIcon:g["a"],VNavigationDrawer:A["a"],VToolbarTitle:_["a"],VTooltip:E["a"]});var I={components:{navbar:C,navDrawer:B},data:function(){return{}},methods:{}},D=I,F=n("7496"),M=n("f6c4"),N=Object(p["a"])(D,a,o,!1,null,null,null),L=N.exports;f()(N,{VApp:F["a"],VMain:M["a"]});n("d3b7"),n("3ca3"),n("ddb0");var K=n("8c4f");r["a"].use(K["a"]);var U=[{path:"/",name:"Home",component:function(){return n.e("home").then(n.bind(null,"bb51"))}},{path:"/about",name:"About",component:function(){return n.e("about").then(n.bind(null,"f820"))}}],q=new K["a"]({routes:U,mode:"history"}),G=q,H=n("f309");r["a"].use(H["a"]);var J=new H["a"]({theme:{dark:!0,options:{customProperties:!0},themes:{dark:{primary:"#fff600",secondary:"#424242",accent:"#E64A19",error:"#FF5252",info:"#2196F3",success:"#4CAF50",warning:"#FFC107"}}}}),W=r["a"].observable({navbar:{active:null}}),Y=W;n("b20f"),n("d5e8"),n("5363");r["a"].config.productionTip=!1,r["a"].prototype.$state=Y,new r["a"]({router:G,vuetify:J,render:function(t){return t(L)}}).$mount("#app")},b20f:function(t,e,n){}});
//# sourceMappingURL=app.db1e6ece.js.map