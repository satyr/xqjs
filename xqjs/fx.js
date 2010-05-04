addEventListener('DOMContentLoaded', function xqjsInit(ev){
  for each(let id in ['mi_xqjs', 'key_xqjs']){
    var lm = document.getElementById(id);
    lm.setAttribute('label', 'xqjs');
    lm.setAttribute('oncommand', 'xqjs()');
  }
  try {
    let {data} = gPrefService.getComplexValue(
      'extensions.xqjs.keyOpen', Ci.nsISupportsString);
    for(let [k, v] in new Iterator(JSON.parse(data))) lm.setAttribute(k, v);
  } catch(e){ Cu.reportError(e) }
}, false);

function xqjs(win)
this.openDialog('chrome://xqjs/content', 'xqjs', 'resizable', win);
