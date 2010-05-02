const {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;
Cu.import('resource://xqjs/Preferences.jsm');

function onload(){
  document.getElementById('macros').value =
    Preferences.get('extensions.xqjs.macros');
}
function onunload(){
  Preferences.set(
    'extensions.xqjs.macros', document.getElementById('macros').value);
}
