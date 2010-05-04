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
