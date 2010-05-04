Cu.import('resource://xqjs/coffee.jsm');

var o2s = Object.prototype.toString;
var utils =
[function p(x) say(inspect(x)),
 function say(s){
   results.value = s +'\n'+ results.value;
   return s;
 },
 function log(s){
   Services.console.logStringMessage(s);
   return s;
 },
 function copy(s){
   s && (Cc['@mozilla.org/widget/clipboardhelper;1']
         .getService(Ci.nsIClipboardHelper).copyString(s));
   return s;
 },
 function type(x) x == null ? '' : o2s.call(x).slice(8, -1),
 function keys(x) [k for(k in new Iterator(x, true))],
 function xmls(x) XMLSerializer().serializeToString(x),
 function main() Services.wm.getMostRecentWindow('navigator:browser'),
 function domi(x)(
   main()[x && x.nodeType ? 'inspectDOMNode' : 'inspectObject'](x), x),
 function fbug(x){
   var {Firebug} = main();
   if(Firebug.Console.isEnabled() && Firebug.toggleBar(true, 'console'))
     Firebug.Console.logFormatted(Array.slice(arguments));
   return x;
 },
 function xpath(xp, doc, one){
   if(typeof doc !== 'object') one = doc, doc = 0;
   doc = doc || target.win.document;
   var ns = doc.documentElement.namespaceURI
   var r = doc.evaluate(
     xp, doc, function() ns, XPathResult.ANY_TYPE, null);
   switch(r.resultType){
     case XPathResult.STRING_TYPE : return r.stringValue;
     case XPathResult.NUMBER_TYPE : return r.numberValue;
     case XPathResult.BOOLEAN_TYPE: return r.booleanValue;
     case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
     if(one) return r.iterateNext();
     let a = [], n;
     while((n = r.iterateNext())) a.push(n);
     return a;
   }
 }];
for each(let f in utils) this[f.name] = f;

{ let apop = qs('#Actions').appendChild(lmn('menupopup'));
  for each(let key in qsa('key')){
    let {id} = key, json = prefs.get(id), atrs;
    try { atrs = JSON.parse(json) } catch(e){
      Cu.reportError(SyntaxError(
        'failed to parse '+ id +'\n'+ json, e.fileName, e.lineNumber));
      prefs.reset(id);
      atrs = JSON.parse(prefs.get(id));
    }
    for(let k in atrs) key.setAttribute(k, atrs[k]);
    apop.appendChild(lmn('menuitem', {
      key: key.id,
      label: key.getAttribute('label'),
      oncommand: key.getAttribute('oncommand'),
    }));
  }
}

function onload(){
  target((this.arguments || 0)[0] || opener || this);
  for each(let lm in qsa('textbox, checkbox')) self[lm.id] = lm;
  this.bin =
    JSON.parse(prefs.get('history', '[]')).reverse();
  this.pos = 0;
  macload();
  macros.checked = prefs.get('macros.on');
  coffee.checked = prefs.get('coffee.on');
  code.focus();
  for each(let menu in qsa('#Chrome, #Content'))
    menu.appendChild(lmn('menupopup', {
      oncommand: 'target(event.target.win)',
      onpopupshowing: 'fillwin(this)',
      onpopuphidden: 'empty(this)',
    }));
}

function execute(){
  code.focus();
  var js = expand(save(code.value));
  if(js) try { return p(evaluate(js)) } catch(e){
    Cu.reportError(e);
    return say(e);
  }
}
function evaluate(js){
  var {win} = target, sb = Cu.Sandbox(win);
  for each(let f in utils) sb[f.name] = f;
  sb.__defineGetter__('main', main);
  sb.__win__ = win.wrappedJSObject || win;
  return Cu.evalInSandbox(
    'with(__win__){\n'+ js +'\n}',
    sb, 1.8, 'data:;charset=utf-8,'+ encodeURI(js));
}
function target(win){
  target.win = win;
  document.title = 'xqjs'+ (win === self ? '' : ': '+ fmtitle(win));
}
function macload(){
  try {
    var m = Cu.evalInSandbox(
      prefs.get('macros', ''),
      Cu.Sandbox('about:blank'), 1.8);
  } catch(e){ Cu.reportError(e) }
  if(!m) m = String;
  else if(typeof m !== 'function'){
    let maclist = [[RegExp(k, 'g'), v] for([k, v] in Iterator(m))];
    m = function macrun(s){
      for each(let [re, xp] in maclist) s = s.replace(re, xp);
      return s;
    };
  }
  self.macrun = m;
}

function copand() say(copy(expand(code.value)));
function options(){
  showModalDialog('xqo.xul', 1, 'resizable=1');
  macload();
}
function reload() opener ? opener.xqjs(target.win) : location.reload();

function expand(s){
  if(!s) return '';
  if(macros.checked){
    try { s = macrun(s) }
    catch(e){
      Cu.reportError(e);
      say(e);
      return '';
    }
  }
  if(coffee.checked){
    try { s = CoffeeScript.compile(s, {no_wrap: true}) }
    catch(e){
      if(/^Parse error on line (\d+).*\n/.test(e.message))
        cofferr(
          s, 'ParseError: token position = '+ RegExp.rightContext, RegExp.$1);
      else if(/^(SyntaxError.+) on line (\d+)/.test(e.message))
        cofferr(s, RegExp.$1, RegExp.$2);
      else Cu.reportError(p(e));
      return '';
    }
  }
  return s;
}
function cofferr(src, msg, lno, cno){
  let se = (Cc['@mozilla.org/scripterror;1']
            .createInstance(Ci.nsIScriptError));
  se.init(say('Coffee'+ msg), 'data:;charset=utf-8,'+ encodeURI(src),
          src.split(/\r?\n/, lno).pop(), lno, cno, se.errorFlag, null);
  Services.console.logMessage(se);
}

function go(dir){
  if((pos -= dir) < 1){
    if(save(code.value)) code.value = '';
    pos = 0;
    return;
  }
  if(bin.length < pos){
    pos = bin.length;
    return;
  }
  code.value = bin[bin.length - pos] +'\n';
}
function save(s){
  if(!(s = s.trim())) return "";
  var i = bin.lastIndexOf(s);
  if(~i) bin.splice(i, 1);
  bin.push(s);
  return s;
}

function inspect(x){
  if(x == null) return String(x);
  var t = typeof x;
  switch(t){
    case 'object': break;
    case 'string': return x;
    case 'function': return x.toSource(0);
    case 'xml': x = x.toXMLString();
    default: return x +'  '+ t;
  }
  var os = o2s.call(x), t = os.slice(8, -1);
  switch(t){
    case 'XPCNativeWrapper':
    let wos = o2s.call(x.wrappedJSObject);
    os = '[object '+ t +' '+ wos +']';
    t += ':'+ wos.slice(8, -1);
    break;
    case 'XPCCrossOriginWrapper':
    let ot = String(x.constructor).slice(8, -1);
    os = '[object '+ ot +']';
    t += ':'+ ot;
  }
  var s, nt = x.nodeType;
  if(nt === 1) s = xmls(x.cloneNode(0)).replace(/ xmlns=".+?"/, '');
  else if(nt) s = x.nodeValue;
  if(s == null && (s = String(x)) === os) s = '{'+ keys(x).join(', ') +'}';
  return s +'  '+ t;
}
function fmtitle(win){
  const LEN = 72;
  var ttl = win.document.title.trim();
  var url = win.location.href.replace(/^http:\/+(?:www\.)?/, '');
  if(!ttl) return ellipsize(url, LEN);
  var over = (ttl.length + url.length - LEN) >> 1;
  if(over > 0){
    ttl = ellipsize(ttl, ttl.length - over, true);
    url = ellipsize(url, url.length - over);
  }
  return ttl + ' <'+ url +'>';
}
function ellipsize(str, num, end){
  if(num < 1) return '';
  if(str.length <= num) return str;
  const E = '..';
  if(end) return str.slice(0, num - 1) + E;
  var i = num / 2;
  return str.slice(0, num - i) + E + str.slice(str.length - i + 1);
}

function fillwin(menu){
  const {nsIXULWindow, nsIDocShell} = Ci;
  var type = Ci.nsIDocShellTreeItem['type'+ menu.parentNode.id], len = 0;
  var winum = Services.wm.getXULWindowEnumerator(null);
  while(winum.hasMoreElements()) try {
    let {docShell} = winum.getNext().QueryInterface(nsIXULWindow);
    let dshenum = docShell.getDocShellEnumerator(
      type, nsIDocShell.ENUMERATE_FORWARDS);
    while(dshenum.hasMoreElements()) try {
      let win = (dshenum.getNext().QueryInterface(nsIDocShell)
                 .contentViewer.DOMDocument.defaultView);
      if(win.location.href !== 'about:blank') add(win);
    } catch(e){ Cu.reportError(e) }
  } catch(e){ Cu.reportError(e) }

  function add(win){
    var mi = document.createElement('menuitem'), label = fmtitle(win);
    if(++len <= 36){
      let key = len < 11 ? len % 10 : (len-1).toString(36).toUpperCase();
      mi.setAttribute('accesskey', key);
      label = key + ' ' + label;
    }
    mi.setAttribute('label', label);
    menu.appendChild(mi).win = win;
  }

  menu.hasChildNodes() || menu.appendChild(lmn('menuitem', {
    label: '-',
    disabled: true,
  }));
}

function onunload(){
  save(code.value);
  bin.reverse();
  var max = prefs.get('history.max');
  if(bin.length > max) bin.length = max;
  prefs.set({
    'history': JSON.stringify(bin),
    'macros.on': macros.checked,
    'coffee.on': coffee.checked,
  });
}
