const O2S = Object.prototype.toString;
const ELLIPSIS = Preferences.get('intl.ellipsis', '\u2026');
const NS = {
  x: 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
  e: 'http://www.mozilla.org/2004/em-rdf#',
  a: 'http://www.w3.org/2005/Atom',
  s: 'http://www.w3.org/2000/svg',
  r: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  h: 'http://www.w3.org/1999/xhtml',
  m: 'http://www.w3.org/1998/Math/MathML',
};

var __ = [], cur = 0, utils =
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
 function sum(a){
   for each(let key in Array.slice(arguments, 1))
     a = Array.map(a, typeof key === 'function' ? key : function(x) x[key], a);
   return a.reduce(function(x, y) x + y);
 },
 function copy(s)(
   s && (Cc['@mozilla.org/widget/clipboardhelper;1']
         .getService(Ci.nsIClipboardHelper).copyString(s)),
   s),
 function type(x) x == null ? '' : O2S.call(x).slice(8, -1),
 function keys(x){
   try { var it = x && new Iterator(x, true) } catch([]){ return [] }
   return [k for(k in it)];
 },
 function xmls(x) XMLSerializer().serializeToString(x),
 XPCNativeWrapper.unwrap || function unwrap(x){
   try { return new XPCNativeWrapper(x).wrappedJSObject }
   catch([]){ return x }
 },
 function xpath(xp, doc, one){
   if(typeof doc !== 'object') one = doc, doc = 0;
   doc = doc || target.win.document;
   var r = doc.evaluate(
     xp, doc, function([c]) NS[c], XPathResult.ANY_TYPE, null);
   switch(r.resultType){
     case r.STRING_TYPE: return r.stringValue;
     case r.NUMBER_TYPE: return r.numberValue;
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
   target.win = win = win && win.document ? win : opener || self,
   target.chrome = chromep(win),
   target.sb = sandbox(win),
   document.title = 'xqjs'+ (win === self ? '' : ': '+ fmtitle(win))),
 ];
for each(let f in utils) this[f.name] = f;
utils.push(hurl);

[function bin() JSON.parse(prefs.get('history', '[]')),
 function CoffeeScript() Cu.import('resource://xqjs/coffee.jsm').CoffeeScript,
 ].reduce(lazy, this);

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
  var js = expand(save(code.value)), cn = '';
  if(js){
    try { var r = p(evaluate(js)) } catch(e){
      Cu.reportError(r = say(e));
      cn = 'error';
    }
    r === __[0] || __.unshift(r);
    document.documentElement.className = cn;
  }
  return r;
}
function evaluate(js){
  var {sb} = target;
  [sb._] = __;
  return Cu.evalInSandbox(
    target.chrome
    ? 'with(win) eval('+ uneval(js) +')'
    : ((sb.__proto__ = sb.win), js),
    sb, 1.8, 'data:xqjs;charset=utf-8,'+ encodeURI(js));
}
function sandbox(win){
  var sb = Cu.Sandbox(win);
  for each(let f in utils) sb[f.name] = f;
  sb.__defineGetter__('main', main);
  sb.ns = NS;
  sb.win = unwrap(win);
  sb.__ = __;
  sb.Number.prototype.__iterator__ = function numit(){
    if(this < 0) for(var i = -this; --i >= 0;) yield i;
    else for(i = -1; ++i < this;) yield i;
  };
  return sb;
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
  if((cur -= dir) < 1){
    if(save(code.value)) code.value = '';
    return cur = 0;
  }
  if(bin.length < cur) return cur = bin.length;
  code.value = bin[cur - 1];
  return cur;
}
function save(s){
  var i = s && bin.indexOf(s);
  if(!i) return s;
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
  gen = gen || wordig(RegExp('\\b'+ rescape(abr) +'[\\w$]+', 'g'));
  try { var word = gen.next() } catch(e if e === StopIteration){}
  code.selectionStart = pos;
  if(word)
    code.editor.QueryInterface(Ci.nsIPlaintextEditor)
      .insertText(word.slice(abr.length));
  else if(complete.gen)
    code.editor.deleteSelection(code.editor.ePrevious);
  [complete.pos, complete.gen, complete.abr] =
    word ? [code.selectionStart, gen, abr] : [];
}
function wordig(re){
  var word, dic = {__proto__: null};
  for(var s in new function(){
    yield results.value;
    for each(var s in bin) yield s;
  }) while([word] = re(s) || 0) word in dic || (yield dic[word] = word);
}

function inspect(x){
  if(x == null) return String(x);
  var t = typeof x;
  switch(t){
    case 'object': case 'function': break;
    case 'string': return x;
    case 'xml': x = x.toXMLString();
    default: return x +'  '+ t;
  }
  var os = O2S.call(x), t = os.slice(8, -1);
  switch(t){
    case 'Function': return x.toSource(0);
    case 'XPCNativeWrapper': case 'XPCCrossOriginWrapper':
    let wos = O2S.call(unwrap(x));
    os = t[3] === 'N' ? '[object '+ t +' '+ wos +']' : wos;
    t += ':'+ wos.slice(8, -1);
  }
  var s, nt = x.nodeType;
  if(nt === 1) s = xmls(x.cloneNode(0)).replace(/ xmlns=".+?"/, '');
  else if(nt) s = x.nodeValue;
  if(s == null){
    try { s = String(x) } catch(e){
      x.__proto__ ? Cu.reportError(e) : t = 'Null';
      s = os;
    }
    if(s === os) s = '{'+ keys(unwrap(x)).join(', ') +'}';
  }
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
  if(end) return str.slice(0, num - 1) + ELLIPSIS;
  var i = num / 2;
  return str.slice(0, num - i) + ELLIPSIS + str.slice(str.length - i + 1);
}

function fillwin(menu){
  const {nsIXULWindow, nsIDocShell} = Ci;
  const FS = (Cc['@mozilla.org/browser/favicon-service;1']
              .getService(Ci.nsIFaviconService));
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
    var label = fmtitle(win), mi = lmn('menuitem', {
      class: 'menuitem-iconic',
      image: FS.getFaviconImageForPage(win.document.documentURIObject).spec,
    });
    if(win === target.win) mi.setAttribute('disabled', true);
    else if(++len <= 36){
      let key = len < 11 ? len % 10 : (len-1).toString(36).toUpperCase();
      mi.setAttribute('accesskey', key);
      label = key +' '+ label;
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
