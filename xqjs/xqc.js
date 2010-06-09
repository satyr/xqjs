const {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;
Cu.import('resource://xqjs/Services.jsm');
Cu.import('resource://xqjs/Preferences.jsm');

var prefs = new Preferences('extensions.xqjs.');

function qs(s) document.querySelector(s);
function qsa(s) Array.slice(document.querySelectorAll(s));
function lmn(name, atrs){
  var lm = document.createElement(name);
  for(let key in atrs) lm.setAttribute(key, atrs[key]);
  return lm;
}
function empty(lm){
  while(lm.hasChildNodes()) lm.removeChild(lm.lastChild);
  return lm;
}
function main() Services.wm.getMostRecentWindow('navigator:browser');
function hurl() let(b = main().gBrowser) b.addTab.apply(b, arguments);
function lazy(o, fn, p){
  if(typeof p !== 'string') p = fn.name;
  o.__defineGetter__(p, function() o[p] = delete o[p] && fn.call(o));
  return o;
}
function rescape(s) String(s).replace(/[.?*+^$|()\{\[\\]/g, '\\$&');
