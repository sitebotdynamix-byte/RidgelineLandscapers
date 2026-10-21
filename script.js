(function(){
"use strict";
var TZ="America/Denver";
var HOURS={0:[],1:[["07:00","12:00"],["13:00","17:00"]],2:[["07:00","12:00"],["13:00","17:00"]],3:[["07:00","12:00"],["13:00","17:00"]],4:[["07:00","12:00"],["13:00","17:00"]],5:[["07:00","12:00"],["13:00","17:00"]],6:[["08:00","14:00"]]};
var HOLIDAYS=[{d:"01-01",n:"New Year’s Day",h:[]},{d:"07-04",n:"Independence Day",h:[]},{d:"2026-11-26",n:"Thanksgiving",h:[]},{d:"2027-11-25",n:"Thanksgiving",h:[]},{d:"12-24",n:"Christmas Eve",h:[["08:00","12:00"]]},{d:"12-25",n:"Christmas Day",h:[]}];
var DAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
var PHONE="(307) 555-0142";
function mins(s){var p=s.split(":");return +p[0]*60+ +p[1];}
function fmt(m){var h=Math.floor(m/60),mm=m%60,ap=h>=12?"PM":"AM";h=h%12||12;return h+(mm?":"+String(mm).padStart(2,"0"):"")+" "+ap;}
function pad(n){return String(n).padStart(2,"0");}
function segText(segs){return segs.length?segs.map(function(s){return fmt(mins(s[0]))+" to "+fmt(mins(s[1]));}).join(" and "):"Closed";}
function now(){
 var o={};
 new Intl.DateTimeFormat("en-US",{timeZone:TZ,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date()).forEach(function(p){o[p.type]=p.value;});
 return {y:+o.year,m:+o.month,d:+o.day,min:+o.hour*60+ +o.minute};
}
function dayInfo(y,m,d,add){
 var dt=new Date(Date.UTC(y,m-1,d+add));
 var Y=dt.getUTCFullYear(),M=pad(dt.getUTCMonth()+1),D=pad(dt.getUTCDate()),wd=dt.getUTCDay();
 var hol=null;HOLIDAYS.forEach(function(h){if(h.d===Y+"-"+M+"-"+D||h.d===M+"-"+D)hol=h;});
 var raw=hol?hol.h:HOURS[wd];
 return {wd:wd,hol:hol,raw:raw,segs:raw.map(function(s){return [mins(s[0]),mins(s[1])];})};
}
function status(){
 var t=now(),today=dayInfo(t.y,t.m,t.d,0),i,info,seg,cur=null,next=null;
 today.segs.forEach(function(s){if(t.min>=s[0]&&t.min<s[1])cur=s;else if(s[0]>t.min&&!next)next=s;});
 if(cur){var left=cur[1]-t.min;return {open:true,text:"Open now, closes at "+fmt(cur[1])+(left<=60?" (closing soon)":"")};}
 var pre=today.hol&&!today.segs.length?today.hol.n+": closed. ":"";
 if(next)return {open:false,text:"Closed now, "+pre+"opens today at "+fmt(next[0])};
 for(i=1;i<=14;i++){info=dayInfo(t.y,t.m,t.d,i);if(info.segs.length){seg=info.segs[0];
  return {open:false,text:"Closed now, "+pre+"opens "+(i===1?"tomorrow":DAYS[info.wd])+" at "+fmt(seg[0])};}}
 return {open:false,text:"Closed now"};
}
function hoursText(){
 return "Mon to Fri "+segText(HOURS[1])+"; Sat "+segText(HOURS[6])+"; Sun "+segText(HOURS[0]).toLowerCase()+".";
}
var ICON={open:'<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="currentColor"/><path d="M4.5 8.2l2.4 2.3 4.6-5" stroke="#fff" stroke-width="2" fill="none"/></svg>',closed:'<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="currentColor"/><path d="M5 5l6 6M11 5l-6 6" stroke="#fff" stroke-width="2"/></svg>'};
var last="";
function render(){
 try{
  var s=status(),key=s.text,t=now(),wd=dayInfo(t.y,t.m,t.d,0).wd;
  document.querySelectorAll(".js-status").forEach(function(el){
   if(el.dataset.k!==key){el.className="status js-status "+(s.open?"open":"closed");el.innerHTML=ICON[s.open?"open":"closed"]+"<span></span>";el.lastChild.textContent=s.text;el.dataset.k=key;}
   el.hidden=false;
  });
  var tb=document.getElementById("hours");
  if(tb){
   if(!tb.children.length){[1,2,3,4,5,6,0].forEach(function(d){var tr=document.createElement("tr");tr.dataset.wd=d;
    var th=document.createElement("th");th.scope="row";th.textContent=DAYS[d];var td=document.createElement("td");td.textContent=segText(HOURS[d]);tr.append(th,td);tb.appendChild(tr);});}
   Array.prototype.forEach.call(tb.children,function(tr){var on=+tr.dataset.wd===wd;tr.className=on?"today":"";var th=tr.firstChild;th.textContent=DAYS[+tr.dataset.wd]+(on?" (today)":"");});
  }
 }catch(e){document.querySelectorAll(".js-status").forEach(function(el){el.hidden=true;});}
}
render();setInterval(render,30000);
document.addEventListener("visibilitychange",function(){if(!document.hidden)render();});

})();
