addEventListener('DOMContentLoaded', function xqjsInit(ev){
  for each(let id in ['mi_xqjs', 'key_xqjs']){
    var lm = document.getElementById(id);
    lm.setAttribute('label', 'xqjs');
    lm.setAttribute('oncommand', 'xqjs(event.shiftKey && content)');
  }
  var pkey = 'extensions.xqjs.keyOpen', i = 2;
  do try {
    var atrs = JSON.parse(
      gPrefService.getComplexValue(pkey, Ci.nsISupportsString).data);
  } catch(e){
    Cu.reportError(e);
    gPrefService.clearUserPref(pkey);
  } while(!atrs && --i);
  for(let [k, v] in new Iterator(atrs)) lm.setAttribute(k, v);
}, false);

function xqjs(win){
  var me = this.openDialog(
    'chrome://xqjs/content', 'xqjs', 'resizable,dialog=0', win);
  me.focus();
  return me;
}
