/*
*   Json Diff Patch
*   ---------------
*   https://github.com/benjamine/JsonDiffPatch
*   by Benjamin Eidelman - beneidel@gmail.com
*/(function(){"use strict";var e={};typeof t!="undefined"&&(e=t);var t=e;e.version="0.0.7",e.config={textDiffMinLength:60,detectArrayMove:!0,includeValueOnArrayMove:!1};var n={diff:function(t,n,r,i){var s=0,o=0,u,a,f=t.length,l=n.length,c,h=[],p=[],d=typeof r=="function"?function(e,t,n,i){if(e===t)return!0;if(typeof e!="object"||typeof t!="object")return!1;var s,o;return typeof n=="number"?(s=h[n],typeof s=="undefined"&&(h[n]=s=r(e))):s=r(e),typeof i=="number"?(o=p[i],typeof o=="undefined"&&(p[i]=o=r(t))):o=r(t),s===o}:function(e,t){return e===t},v=function(e,r){return d(t[e],n[r],e,r)},m=function(e,r){if(!i)return;if(typeof t[e]!="object"||typeof n[r]!="object")return;var s=i(t[e],n[r]);if(typeof s=="undefined")return;c||(c={_t:"a"}),c[r]=s};while(s<f&&s<l&&v(s,s))m(s,s),s++;while(o+s<f&&o+s<l&&v(f-1-o,l-1-o))m(f-1-o,l-1-o),o++;if(s+o===f){if(f===l)return c;c=c||{_t:"a"};for(u=s;u<l-o;u++)c[u]=[n[u]];return c}if(s+o===l){c=c||{_t:"a"};for(u=s;u<f-o;u++)c["_"+u]=[t[u],0,0];return c}var g=this.lcs(t.slice(s,f-o),n.slice(s,l-o),{areTheSameByIndex:function(e,t){return v(e+s,t+s)}});c=c||{_t:"a"};var y=[];for(u=s;u<f-o;u++)g.indices1.indexOf(u-s)<0&&(c["_"+u]=[t[u],0,0],y.push(u));var b=y.length;for(u=s;u<l-o;u++){var w=g.indices2.indexOf(u-s);if(w<0){var E=!1;if(e.config.detectArrayMove&&b>0)for(a=0;a<b;a++)if(v(y[a],u)){c["_"+y[a]].splice(1,2,u,3),e.config.includeValueOnArrayMove||(c["_"+y[a]][0]=""),m(y[a],u),y.splice(a,1),E=!0;break}E||(c[u]=[n[u]])}else m(g.indices1[w]+s,g.indices2[w]+s)}return c},getArrayIndexBefore:function(e,t){var n,r=t;for(var s in e)if(e.hasOwnProperty(s)&&i(e[s])){s.slice(0,1)==="_"?n=parseInt(s.slice(1),10):n=parseInt(s,10);if(e[s].length===1){if(n<t)r--;else if(n===t)return-1}else if(e[s].length===3)if(e[s][2]===0)n<=t&&r++;else if(e[s][2]===3){n<=t&&r++;if(e[s][1]>t)r--;else if(e[s][1]===t)return n}}return r},patch:function(e,t,n,r){var i,s,o=function(e,t){return e-t},u=function(e){return function(t,n){return t[e]-n[e]}},a=[],f=[],l=[];for(i in t)if(i!=="_t")if(i[0]=="_"){if(t[i][2]!==0&&t[i][2]!==3)throw new Error("only removal or move can be applied at original array indices, invalid diff type: "+t[i][2]);a.push(parseInt(i.slice(1),10))}else t[i].length===1?f.push({index:parseInt(i,10),value:t[i][0]}):l.push({index:parseInt(i,10),diff:t[i]});a=a.sort(o);for(i=a.length-1;i>=0;i--){s=a[i];var c=t["_"+s],h=e.splice(s,1)[0];c[2]===3&&f.push({index:c[1],value:h})}f=f.sort(u("index"));var p=f.length;for(i=0;i<p;i++){var d=f[i];e.splice(d.index,0,d.value)}var v=l.length;if(v>0){if(typeof n!="function")throw new Error("to patch items in the array an objectInnerPatch function must be provided");for(i=0;i<v;i++){var m=l[i];n(e,m.index.toString(),m.diff,r)}}return e},lcs:function(e,t,n){n.areTheSameByIndex=n.areTheSameByIndex||function(n,r){return e[n]===t[r]};var r=this.lengthMatrix(e,t,n),i=this.backtrack(r,e,t,e.length,t.length);return typeof e=="string"&&typeof t=="string"&&(i.sequence=i.sequence.join("")),i},lengthMatrix:function(e,t,n){var r=e.length,i=t.length,s,o,u=[r+1];for(s=0;s<r+1;s++){u[s]=[i+1];for(o=0;o<i+1;o++)u[s][o]=0}u.options=n;for(s=1;s<r+1;s++)for(o=1;o<i+1;o++)n.areTheSameByIndex(s-1,o-1)?u[s][o]=u[s-1][o-1]+1:u[s][o]=Math.max(u[s-1][o],u[s][o-1]);return u},backtrack:function(e,t,n,r,i){if(r===0||i===0)return{sequence:[],indices1:[],indices2:[]};if(e.options.areTheSameByIndex(r-1,i-1)){var s=this.backtrack(e,t,n,r-1,i-1);return s.sequence.push(t[r-1]),s.indices1.push(r-1),s.indices2.push(i-1),s}return e[r][i-1]>e[r-1][i]?this.backtrack(e,t,n,r,i-1):this.backtrack(e,t,n,r-1,i)}};e.sequenceDiffer=n,e.dateReviver=function(e,t){var n;if(typeof t=="string"){n=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)(Z|([+\-])(\d{2}):(\d{2}))$/.exec(t);if(n)return new Date(Date.UTC(+n[1],+n[2]-1,+n[3],+n[4],+n[5],+n[6]))}return t};var r=function(){var t;e.config.diff_match_patch&&(t=new e.config.diff_match_patch.diff_match_patch),typeof diff_match_patch!="undefined"&&(typeof diff_match_patch=="function"?t=new diff_match_patch:typeof diff_match_patch=="object"&&typeof diff_match_patch.diff_match_patch=="function"&&(t=new diff_match_patch.diff_match_patch));if(t)return e.config.textDiff=function(e,n){return t.patch_toText(t.patch_make(e,n))},e.config.textPatch=function(e,n){var r=t.patch_apply(t.patch_fromText(n),e);for(var i=0;i<r[1].length;i++)if(!r[1][i])throw new Error("text patch failed");return r[0]},!0},i=e.isArray=typeof Array.isArray=="function"?Array.isArray:function(e){return typeof e=="object"&&e instanceof Array},s=e.isDate=function(e){return e instanceof Date||Object.prototype.toString.call(e)==="[object Date]"},o=function(t,r){return n.diff(t,r,e.config.objectHash,e.diff)},u=function(e,t){var n,r,i,s;s=function(i){r=a(e[i],t[i]),typeof r!="undefined"&&(typeof n=="undefined"&&(n={}),n[i]=r)};for(i in t)t.hasOwnProperty(i)&&s(i);for(i in e)e.hasOwnProperty(i)&&typeof t[i]=="undefined"&&s(i);return n},a=e.diff=function(t,n){var a,f,l,c,h;if(t===n)return;if(t!==t&&n!==n)return;a=typeof n,f=typeof t,l=n===null,c=t===null,f=="object"&&s(t)&&(f="date");if(a=="object"&&s(n)){a="date";if(f=="date"&&t.getTime()===n.getTime())return}if(l||c||a=="undefined"||a!=f||a=="number"||f=="number"||a=="boolean"||f=="boolean"||a=="string"||f=="string"||a=="date"||f=="date"||a==="object"&&i(n)!=i(t)){h=[];if(typeof t!="undefined")if(typeof n!="undefined"){var p=a=="string"&&f=="string"&&Math.min(t.length,n.length)>e.config.textDiffMinLength;p&&!e.config.textDiff&&r(),p&&e.config.textDiff?h.push(e.config.textDiff(t,n),0,2):(h.push(t),h.push(n))}else h.push(t),h.push(0,0);else h.push(n);return h}return i(n)?o(t,n):u(t,n)},f=function(e,t){return i(e)?e[parseInt(t,10)]:e[t]};e.getByKey=f;var l=function(e,t,n){if(i(e)&&e._key){var r=e._key;typeof e._key!="function"&&(r=function(t){return t[e._key]});for(var s=0;s<e.length;s++)if(r(e[s])===t){typeof n=="undefined"?(e.splice(s,1),s--):e[s]=n;return}typeof n!="undefined"&&e.push(n);return}typeof n=="undefined"?i(e)?e.splice(t,1):delete e[t]:e[t]=n},c=function(t){return e.config.textDiffReverse||(e.config.textDiffReverse=function(e){var t,n,r,i,s,o=null,u=/^@@ +\-(\d+),(\d+) +\+(\d+),(\d+) +@@$/,a,f,l,c=function(){f!==null&&(r[f]="-"+r[f].slice(1)),l!==null&&(r[l]="+"+r[l].slice(1),f!==null&&(s=r[f],r[f]=r[l],r[l]=s)),r[a]="@@ -"+o[3]+","+o[4]+" +"+o[1]+","+o[2]+" @@",o=null,a=null,f=null,l=null};r=e.split("\n");for(t=0,n=r.length;t<n;t++){i=r[t];var h=i.slice(0,1);h==="@"?(o!==null,o=u.exec(i),a=t,f=null,l=null,r[a]="@@ -"+o[3]+","+o[4]+" +"+o[1]+","+o[2]+" @@"):h=="+"?(f=t,r[t]="-"+r[t].slice(1)):h=="-"&&(l=t,r[t]="+"+r[t].slice(1))}return o!==null,r.join("\n")}),e.config.textDiffReverse(t)},h=e.reverse=function(e){var t,r;if(typeof e=="undefined")return;if(e===null)return null;if(typeof e=="object"&&!s(e)){if(i(e)){if(e.length<3)return e.length===1?[e[0],0,0]:[e[1],e[0]];if(e[2]===0)return[e[0]];if(e[2]===2)return[c(e[0]),0,2];throw new Error("invalid diff type")}r={};if(e._t==="a"){for(t in e)if(e.hasOwnProperty(t)&&t!=="_t"){var o,u=t;t.slice(0,1)==="_"?o=parseInt(t.slice(1),10):o=parseInt(t,10);if(i(e[t]))if(e[t].length===1)u="_"+o;else if(e[t].length===2)u=n.getArrayIndexBefore(e,o);else if(e[t][2]===0)u=o.toString();else{if(e[t][2]===3){u="_"+e[t][1],r[u]=[e[t][0],o,3];continue}u=n.getArrayIndexBefore(e,o)}else u=n.getArrayIndexBefore(e,o);r[u]=h(e[t])}r._t="a"}else for(t in e)e.hasOwnProperty(t)&&(r[t]=h(e[t]));return r}return typeof e=="string"&&e.slice(0,2)==="@@"?c(e):e},p=e.patch=function(s,o,u,a){var c,h,d="",v;typeof o!="string"?(a=u,u=o,o=null):typeof s!="object"&&(o=null),a&&(d+=a),d+="/",o!==null&&(d+=o);if(typeof u=="object")if(i(u)){if(u.length<3)return h=u[u.length-1],o!==null&&l(s,o,h),h;if(u[2]!==0){if(u[2]===2){e.config.textPatch||r();if(!e.config.textPatch)throw new Error("textPatch function not found");try{h=e.config.textPatch(f(s,o),u[0])}catch(m){throw new Error('cannot apply patch at "'+d+'": '+m)}return o!==null&&l(s,o,h),h}throw u[2]===3?new Error("Not implemented diff type: "+u[2]):new Error("invalid diff type: "+u[2])}if(o===null)return;l(s,o)}else if(u._t=="a"){v=o===null?s:f(s,o);if(typeof v!="object"||!i(v))throw new Error('cannot apply patch at "'+d+'": array expected');n.patch(v,u,t.patch,d)}else{v=o===null?s:f(s,o);if(typeof v!="object"||i(v))throw new Error('cannot apply patch at "'+d+'": object expected');for(c in u)u.hasOwnProperty(c)&&p(v,c,u[c],d)}return s},d=e.unpatch=function(e,t,n,r){return typeof t!="string"?p(e,h(t),n):p(e,t,h(n),r)};typeof require=="function"&&typeof exports=="object"?module.exports=e:typeof define=="function"&&define.amd?define(e):window.jsondiffpatch=e})();
