const {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components

Cu.import('resource://gre/modules/Services.jsm')
Cu.import('resource://xqjs/Preferences.jsm')

const PREF_ROOT = 'extensions.xqjs.'
, O2S = {}.toString
, NS  = {
  x: 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
  e: 'http://www.mozilla.org/2004/em-rdf#',
  a: 'http://www.w3.org/2005/Atom',
  s: 'http://www.w3.org/2000/svg',
  r: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  h: 'http://www.w3.org/1999/xhtml',
  m: 'http://www.w3.org/1998/Math/MathML',
}
lazy(this, function ELLIPSIS(){
  try {
    return Services.prefs.getComplexValue(
      'intl.ellipsis', Ci.nsIPrefLocalizedString).data;
  } catch([]){ return '\u2026' }
});

var prefs = new Preferences(PREF_ROOT);

function q(id) document.getElementById(id);
function qs(s) document.querySelector(s);
function qsa(s) Array.slice(document.querySelectorAll(s));
function lmn() node(Array.slice(arguments), document);

function node(ls, doc){
  if(ls instanceof Node) return ls;
  switch(type(ls)){
    case 'Array': break; // ['name', {attr}, ...children]
    case 'XML': return node4x(ls, doc);
    default: return doc.createTextNode(ls);
  }
  if(typeof ls[0] != 'string'){
    let df = doc.createDocumentFragment();
    for each(let l in ls) df.appendChild(node(l, doc));
    return df;
  }
  let lm = doc.createElement(ls[0]);
  if(type((ls = ls.slice(1))[0]) == 'Object')
    for each(let [k, v] in Iterator(ls.shift())) lm.setAttribute(k, v);
  for each(let l in ls) lm.appendChild(node(l, doc));
  return lm;
}
function node4x(xml, doc){
  if(xml.length() === 1) switch(xml.nodeKind()){
    case 'attribute': let at = true;
    case 'element':
    let {uri, localName: name} = xml.name();
    if(at){
      at = uri ? doc.createAttributeNS(uri, name) : doc.createAttribute(name);
      at.nodeValue = xml;
      return at;
    }
    let lm = uri ? doc.createElementNS(uri, name) : doc.createElement(name);
    for each(let a in xml.@*::*){
      let {uri, localName: name} = a.name();
      uri ? lm.setAttributeNS(uri, name, a) : lm.setAttribute(name, a);
    }
    lm.appendChild(node4x(xml.*::*, doc));
    return lm;
    case 'text': return doc.createTextNode(xml);
    case 'comment': return doc.createComment(xml.toString().slice(4, -3));
    case 'processing-instruction':
    let [, target, data] = /^<\?(\S+) ?([^]*)\?>$/(xml);
    return doc.createProcessingInstruction(target, data);
  }
  if(0 in xml && xml[0].nodeKind() == 'attribute')
    return [node4x(x, doc) for each(x in xml)];
  var df = doc.createDocumentFragment();
  for each(let x in xml) df.appendChild(node4x(x, doc));
  return df;
}
function empty(lm){
  while(lm.hasChildNodes()) lm.removeChild(lm.lastChild);
  return lm;
}
function xmls(node)
XMLSerializer().serializeToString(node).replace(/(<\S+) xmlns=".+?"/g, '$1');
function fmnodes(ns)
'['+ Array.map(ns, function(n) n.nodeName).join(' ') +']';

function main() Services.wm.getMostRecentWindow('navigator:browser');
function hurl() let(b = main().gBrowser) b.addTab.apply(b, arguments);

function chromep(win){
  try { return !!Cu.evalInSandbox('Components.utils', Cu.Sandbox(win)) }
  catch([]){ return false }
}
function fmtitle(win){
  const LEN = 80;
  var ttl = win.document.title.trim();
  var url = win.location.href.replace(/^http:\/+/, '');
  if(!ttl) return ellipsize(url, LEN);
  ttl = ellipsize(ttl, LEN/2, true);
  return ttl +' <'+ ellipsize(url, LEN - ttl.length) +'>';
}
function enumerate(fn, nm, ci){
  ci = Ci[ci];
  while(nm.hasMoreElements()) try {
    fn.call(this, nm.getNext().QueryInterface(ci));
  } catch(e){ Cu.reportError(e) }
  return this;
}
lazy(this, function furl()(
  Services.io.getProtocolHandler('file')
  .QueryInterface(Ci.nsIFileProtocolHandler).getURLSpecFromFile));

function log(s)(Services.console.logStringMessage('xqjs: '+ s), s);
function pick(mode, filters){
  const IFP = Ci.nsIFilePicker;
  var fp = Cc['@mozilla.org/filepicker;1'].createInstance(IFP);
  fp.init(self, mode = mode || 'Open', IFP['mode'+ mode]);
  if(filters) for(let [t, f] in Iterator(filters)) fp.appendFilter(t, f);
  fp.appendFilters(IFP.filterAll);
  return fp.show() == IFP.returnCancel ? null :
    fp.file || enumerate.call([], [].push, fp.files, 'nsIFile');
}
function domi(x)(
  main()[x instanceof Node &&
         !(x.compareDocumentPosition(x.ownerDocument || x) &
           x.DOCUMENT_POSITION_DISCONNECTED)
         ? 'inspectDOMNode' : 'inspectObject'](x),
  x);
function fbug(){
  var {Firebug} = main(), args = Array.slice(arguments);
  if(Firebug.Console.isEnabled() && Firebug.toggleBar(true, 'console'))
    Firebug.Console.logFormatted(args);
  return args.length > 1 ? args : args[0];
}
function clip(x)(
  x == null ? clip.img || clip.htm || clip.txt :
  clip[x instanceof HTMLImageElement ? 'img' :
       x instanceof HTMLElement ? 'htm' : 'txt'] = x);
lazy(clip, function board()
     Cc['@mozilla.org/widget/clipboard;1'].getService(Ci.nsIClipboard));
clip.dic = {txt: 'text/unicode', htm: 'text/html', img: 'image/png'};
clip.get = function clipget(flavors){
  const {board, dic} = clip, GC = board.kGlobalClipboard;
  var rs = Array.map(1 in arguments ? arguments : [].concat(flavors), get);
  return 1 in rs ? rs : rs[0];
  function get(flv){
    flv = dic[flv] || flv;
    if(!board.hasDataMatchingFlavors([flv], 1, GC)) return '';
    var dat = {}, xfer = (Cc['@mozilla.org/widget/transferable;1']
                          .createInstance(Ci.nsITransferable));
    xfer.addDataFlavor(flv);
    board.getData(xfer, GC);
    xfer.getTransferData(flv, dat, {});
    if(~flv.lastIndexOf('text/', 0))
      return dat.value.QueryInterface(Ci.nsISupportsString).data;
    var bis = (Cc['@mozilla.org/binaryinputstream;1']
               .createInstance(Ci.nsIBinaryInputStream));
    bis.setInputStream(dat.value.QueryInterface(Ci.nsIInputStream));
    return 'data:'+ flv +';base64,'+
      btoa(String.fromCharCode.apply(0, bis.readByteArray(bis.available())));
  }
};
clip.set = function clipset(kv){ // {txt: 't', htm: '<b>t</b>'}
  const {board, dic} = clip;
  const xfer = (Cc['@mozilla.org/widget/transferable;1']
                .createInstance(Ci.nsITransferable));
  for(let [flv, val] in Iterator(kv)){
    let ss = (Cc['@mozilla.org/supports-string;1']
              .createInstance(Ci.nsISupportsString));
    ss.data = String(val);
    xfer.addDataFlavor(flv = dic[flv] || flv);
    xfer.setTransferData(flv, ss, ss.data.length * 2);
  }
  board.setData(xfer, null, board.kGlobalClipboard);
  return kv;
};
for(let key in clip.dic) let(k = key)(
  clip.__defineGetter__(k, function() this.get(k)));
clip.__defineSetter__('txt', function(t) this.set({txt: t}));
clip.__defineSetter__('htm', function(h){
  this.set(h instanceof HTMLElement ? {
    txt: h.textContent,
    htm: xmls(h.cloneNode(false))
      .replace('><', function() '>'+ h.innerHTML +'<'),
  } : {txt: h, htm: h});
});
clip.__defineSetter__('img', function(i){
  i instanceof HTMLImageElement || (i = let(img = Image())(img.src = i, img));
  i.complete ? cic.call(i) : i.addEventListener('load', cic, false);
  function cic(){
    this.removeEventListener('load', cic, false);
    const CIC = 'cmd_copyImageContents';
    var doc = main().document, pop = doc.popupNode;
    doc.popupNode = this;
    with(doc.commandDispatcher.getControllerForCommand(CIC))
      isCommandEnabled(CIC) && doCommand(CIC);
    doc.popupNode = pop;
  }
});

var keys = Object.getOwnPropertyNames
function unwrap(x){
  try { return XPCNativeWrapper.unwrap(x) } catch([]){ return x }
}
function type(x) O2S.call(x).slice(8, -1)
function lazy(o, fn, p){
  if(typeof p != 'string') p = fn.name
  o.__defineGetter__(p, function() o[p] = delete o[p] && fn.call(o))
  return o
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
    case 'Function': return x.toString(0);
    case 'XPCNativeWrapper': case 'XPCCrossOriginWrapper':
    let wos = O2S.call(unwrap(x));
    os = t[3] == 'N' ? '[object '+ t +' '+ wos +']' : wos;
    t += ':'+ wos.slice(8, -1);
  }
  var s = (
    x instanceof Ci.nsIDOMNodeList || x instanceof NamedNodeMap
    ? fmnodes(x):
    x instanceof Node
    ? let(nt = x.nodeType)(
      nt == x.DOCUMENT_FRAGMENT_NODE
      ? fmnodes(x.childNodes):
      nt == x.ELEMENT_NODE
      ? xmls(x.cloneNode(0))
      : x.nodeValue)
    : null);
  if(s == null){
    try { s = String(x) }
    catch(e){ x.__proto__ ? Cu.reportError(e) : t = 'Null' }
    if(s == null || s === os) s = '{'+ keys(x).join(' ') +'}';
  }
  return s +'  '+ t;
}

function rescape(s) String(s).replace(/[.?*+^$|()\{\[\\]/g, '\\$&');
function ellipsize(str, num, end){
  if(num < 1) return '';
  if(str.length <= num) return str;
  if(end) return str.slice(0, num - 1) + ELLIPSIS;
  var i = num / 2;
  return str.slice(0, num - i) + ELLIPSIS + str.slice(str.length - i + 1);
}
function sourl(type, code) 'data:'+ type +';charset=utf-8,'+ encodeURI(code);
function insert(editor, s)
( editor.QueryInterface(Ci.nsIPlaintextEditor).insertText(s)
, editor )

function zen(code){
  var name = /(?:([\w$]*)\|)?([A-Za-z_][-.\w]*)/;
  var ident = /-?(?![\d-])[-\w\xA1-\uFFFF]+/, char = /^[^]/, digits = /\d+/;
  var kv = /([A-Za-z_][-.\w]*)(?:=([^\]]*))?\]?/, content = /{([^\}]*)}?/;
  var zs = code.trim().split(/\s{0,}([>+])\s{0,}/);
  var root = <_/>, curs = [root], sep;
  for(let i = -1, l = zs.length; ++i < l; sep = zs[++i]){
    if(!name.test(zs[i])) continue;
    let ns = RegExp.$1, lm = <{RegExp.$2}/>, n = 1;
    if(ns) lm.setNamespace(NS[ns] || NS[ns[0]]);
    for(let _, m; char.test(_ = RegExp.rightContext);) switch(_[0]){
      case '#': lm.@id = ident(_) || '';
      break;
      case '.': lm.@class += ('@class' in lm ? ' ' : '') + (ident(_) || '');
      break;
      case '[': if((m = kv(_))) lm['@'+ m[1]] = m[2] || '';
      break;
      case '{': if((m = content(_))) lm.appendChild(m[1]);
      break;
      case '*': n *= +digits(_) || 1;
    }
    let _curs = [], p = sep === '+';
    let sl = n > 1 && ~code.indexOf('$') && lm.toXMLString();
    for each(let cur in curs){
      if(p) cur = cur.parent() || cur;
      for(let i = 1; i <= n; ++i){
        let clm = sl ? XML(sl.replace(/\$/g, i)) : lm.copy();
        cur.appendChild(clm);
        _curs.push(clm);
      }
    }
    curs = _curs;
  }
  return root.*;
}
