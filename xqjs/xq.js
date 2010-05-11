Cu.import('resource://xqjs/coffee.jsm');
const O2S = Object.prototype.toString;

var __ = [];
var utils =
[function p(x)(say(inspect(x)), x),
 function say(s){
   var {editor} = results;
   editor.beginningOfDocument();
   editor.QueryInterface(Ci.nsIPlaintextEditor).insertText(s +'\n');
   editor.beginningOfDocument();
   results.inputField.scrollTop = 0
   return s;
 },
 function log(s)(Services.console.logStringMessage('xqjs: '+ s), s),
 function copy(s)(
   s && (Cc['@mozilla.org/widget/clipboardhelper;1']
         .getService(Ci.nsIClipboardHelper).copyString(s)),
   s),
 function type(x) x == null ? '' : O2S.call(x).slice(8, -1),
 function keys(x) [k for(k in x && new Iterator(x, true))],
 function xmls(x) XMLSerializer().serializeToString(x),
 function unwrap(x){
   try { return XPCNativeWrapper(x).wrappedJSObject || x }
   catch([]){ return x }
 },
 function xpath(xp, doc, one){
   if(typeof doc !== 'object') one = doc, doc = 0;
   doc = doc || target.win.document;
   var ns = doc.documentElement.namespaceURI;
   var r = doc.evaluate(xp, doc, function() ns, XPathResult.ANY_TYPE, null);
   switch(r.resultType){
     case r.STRING_TYPE : return r.stringValue;
     case r.NUMBER_TYPE : return r.numberValue;
     case r.BOOLEAN_TYPE: return r.booleanValue;
     case r.UNORDERED_NODE_ITERATOR_TYPE:
     if(one) return r.iterateNext();
     let a = [], n;
     while((n = r.iterateNext())) a.push(n);
     return a;
   }
 },
 function domi(x)(
   main()[x && x.nodeType ? 'inspectDOMNode' : 'inspectObject'](x), x),
 function fbug(){
   var {Firebug} = main(), args = Array.slice(arguments);
   if(Firebug.Console.isEnabled() && Firebug.toggleBar(true, 'console'))
     Firebug.Console.logFormatted(args);
   return args;
 },
 function target(win)(
   target.win = win,
   target.chrome = chromep(win),
   document.title = 'xqjs'+ (win === self ? '' : ': '+ fmtitle(win))),
 ];
for each(let f in utils) this[f.name] = f;
utils.push(hurl);

{ let apop = qs('#Actions').appendChild(lmn('menupopup'));
  for each(let key in qsa('key')){
    let {id} = key, json = prefs.get(id, '{}'), atrs;
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
  for each(let lm in qsa('textbox, checkbox')) this[lm.id] = lm;
  this.bin = JSON.parse(prefs.get('history', '[]'));
  this.pos = 0;
  macload();
  macros.checked = prefs.get('macros.on');
  coffee.checked = prefs.get('coffee.on');
  for each(let menu in qsa('#Chrome, #Content'))
    menu.appendChild(lmn('menupopup', {
      oncommand: 'target(event.target.win)',
      onpopupshowing: 'fillwin(this)',
      onpopuphidden: 'empty(this)',
    }));
  code.focus();
}

function execute(){
  code.focus();
  var js = expand(save(code.value));
  if(js){
    try { var r = p(evaluate(js)) } catch(e){ Cu.reportError(r = say(e)) }
    __.unshift(r);
  }
  return r;
}
function evaluate(js){
  var {win} = target, barewin = unwrap(win), sb = Cu.Sandbox(barewin);
  for each(let f in utils) sb[f.name] = f;
  sb.__defineGetter__('main', main);
  sb.win = barewin;
  sb.__ = __;
  sb._ = __[0];
  sb.Number.prototype.__iterator__ = function numit(){
    if(this < 0) for(var i = -this; --i >= 0;) yield i;
    else for(i = -1; ++i < this;) yield i;
  };
  return Cu.evalInSandbox(
    (target.chrome
     ? 'with(win)(function()eval('+ uneval(js) +'))()'
     : (sb.__proto__ = barewin, js)),
    sb, 1.8, 'data:xqjs;charset=utf-8,'+ encodeURI(js));
}
function macload(){
  try {
    var m = Cu.evalInSandbox(prefs.get('macros', ''), Cu.Sandbox(this), 1.8);
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
function chromep(win){
  try { return !!Cu.evalInSandbox('Components.utils', Cu.Sandbox(win)) }
  catch([]){ return false }
}

function copand() say(copy(expand(code.value)));
function options(){
  showModalDialog('xqo.xul', 1, 'resizable=1');
  macload();
}
function reload() opener ? opener.xqjs(target.win) : location.reload();

function expand(s){
  if(!s) return '';
  if(macros.checked) try { s = macrun(s) } catch(e){
    Cu.reportError(say(e));
    return '';
  }
  if(coffee.checked) try {
    s = CoffeeScript.compile(s, {no_wrap: true});
  } catch(e){
    if(/^Parse error on line (\d+).*\n/.test(e.message))
      cofferr(s, 'ParseError: token position = '+ RegExp["$'"], RegExp.$1);
    else if(/^(SyntaxError.+) on line (\d+)/.test(e.message))
      cofferr(s, RegExp.$1, RegExp.$2);
    else Cu.reportError(p(e));
    return '';
  }
  return s;
}
function cofferr(src, msg, lno, cno){
  let se = Cc['@mozilla.org/scripterror;1'].createInstance(Ci.nsIScriptError);
  se.init(say('Coffee'+ msg), 'data:coffee;charset=utf-8,'+ encodeURI(src),
          src.split(/\r?\n/, lno).pop(), lno, cno, se.errorFlag, null);
  Services.console.logMessage(se);
}

function go(dir){
  if((pos -= dir) < 1){
    if(save(code.value)) code.value = '';
    return pos = 0;
  }
  if(bin.length < pos) return pos = bin.length;
  code.value = bin[pos - 1];
  return pos;
}
function save(s){
  if(!s) return s;
  var i = bin.indexOf(s);
  if(~i) bin.splice(i, 1);
  bin.unshift(s);
  return s;
}

function complete(){
  var pos = code.selectionStart, abr = /[\w$]*$/(code.value.slice(0, pos))[0];
  if(!abr) return;
  if(pos === complete.pos && ~abr.lastIndexOf(complete.abr, 0)){
    pos -= abr.length - complete.abr.length;
    var {gen, abr} = complete;
  }
  gen = gen || wordig();
  try { for(;;){
    let word = gen.next();
    if(!~word.lastIndexOf(abr, 0)) continue;
    code.selectionStart = pos;
    code.editor.QueryInterface(Ci.nsIPlaintextEditor)
      .insertText(word.slice(abr.length));
    complete.pos = code.selectionStart;
    complete.gen = gen;
    complete.abr = abr;
    break;
  }} catch(e if e === StopIteration){ complete.gen = null };
}
function wordig(){
  var re = /[\w$]{3,}/g, dic = {__proto__: null}, word;
  for(var s in new function(){
    yield results.value;
    for each(var s in bin) yield s;
  }) while([word] = re(s) || 0) word in dic || (yield dic[word] = word);
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
  var os = O2S.call(x), t = os.slice(8, -1);
  switch(t){
    case 'XPCNativeWrapper': case 'XPCCrossOriginWrapper':
    let wos = O2S.call(unwrap(x));
    os = t[3] === 'N' ? '[object '+ t +' '+ wos +']' : wos;
    t += ':'+ wos.slice(8, -1);
  }
  var s, nt = x.nodeType;
  if(nt === 1) s = xmls(x.cloneNode(0)).replace(/ xmlns=".+?"/, '');
  else if(nt) s = x.nodeValue;
  if(s == null && (s = String(x)) === os)
    s = '{'+ keys(unwrap(x)).join(', ') +'}';
  return s +'  '+ t;
}
function fmtitle(win){
  const LEN = 80;
  var ttl = win.document.title.trim();
  var url = win.location.href.replace(/^http:\/+/, '');
  if(!ttl) return ellipsize(url, LEN);
  ttl = ellipsize(ttl, LEN/2, true);
  return ttl + ' <'+ ellipsize(url, LEN - ttl.length) +'>';
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

  menu.hasChildNodes() ||
    menu.appendChild(lmn('menuitem', {label: '-', disabled: true}));
}

function onunload(){
  save(code.value);
  bin.length = Math.min(bin.length, prefs.get('history.max'));
  prefs.set({
    'history': JSON.stringify(bin),
    'macros.on': macros.checked,
    'coffee.on': coffee.checked,
  });
}
