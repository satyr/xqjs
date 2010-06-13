const {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;
Cu.import('resource://xqjs/Services.jsm');
Cu.import('resource://xqjs/Preferences.jsm');

const O2S = Object.prototype.toString;
const NS = {
  x: 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
  e: 'http://www.mozilla.org/2004/em-rdf#',
  a: 'http://www.w3.org/2005/Atom',
  s: 'http://www.w3.org/2000/svg',
  r: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  h: 'http://www.w3.org/1999/xhtml',
  m: 'http://www.w3.org/1998/Math/MathML',
};

var prefs = new Preferences('extensions.xqjs.');

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
  if(typeof ls[0] !== 'string'){
    let df = doc.createDocumentFragment();
    for each(let l in ls) df.appendChild(node(l, doc));
    return df;
  }
  let lm = doc.createElement(ls[0]);
  if(type((ls = ls.slice(1))[0]) === 'Object')
    for each(let [k, v] in Iterator(ls.shift())) lm.setAttribute(k, v);
  for each(let l in ls) lm.appendChild(node(l, doc));
  return lm;
}
function node4x(xs, doc){
  let df = doc.createDocumentFragment();
  for each(let x in XMLList(xs)) switch(x.nodeKind()){
    case 'element':
    let {uri, localName: name} = x.name();
    let lm = uri ? doc.createElementNS(uri, name) : doc.createElement(name);
    for each(let a in x.@*::*){
      let {uri, localName: name} = a.name();
      uri ? lm.setAttributeNS(uri, name, a) : lm.setAttribute(name, a);
    }
    lm.appendChild(node4x(x.*::*, doc));
    df.appendChild(lm);
    break;
    case 'text':
    df.appendChild(doc.createTextNode(x)); break;
    case 'comment':
    df.appendChild(doc.createComment(x.toString().slice(4, -3))); break;
    case 'processing-instruction':
    let [, t, d] = /^<\?(\S+) ?([^]*)\?>$/(x);
    df.appendChild(doc.createProcessingInstruction(t, d));
  }
  return df.childNodes.length === 1 ? df.lastChild : df;
}
function empty(lm){
  while(lm.hasChildNodes()) lm.removeChild(lm.lastChild);
  return lm;
}
function xmls(node) XMLSerializer().serializeToString(node);
function fmnodes(ns)(
  '['+ Array.map(ns, function(n) n.nodeName).join(', ') +']');

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
  return ttl + ' <'+ ellipsize(url, LEN - ttl.length) +'>';
}

function log(s)(Services.console.logStringMessage('xqjs: '+ s), s);
function copy(s)(
  s && (Cc['@mozilla.org/widget/clipboardhelper;1']
        .getService(Ci.nsIClipboardHelper).copyString(s)),
  s);
function domi(x)(
  main()[x && x.nodeType ? 'inspectDOMNode' : 'inspectObject'](x), x);
function fbug(){
  var {Firebug} = main(), args = Array.slice(arguments);
  if(Firebug.Console.isEnabled() && Firebug.toggleBar(true, 'console'))
    Firebug.Console.logFormatted(args);
  return args;
}

var unwrap = XPCNativeWrapper.unwrap || function unwrap(x){
  try { return new XPCNativeWrapper(x).wrappedJSObject } catch([]){ return x }
};
function type(x) x == null ? '' : O2S.call(x).slice(8, -1);
function lazy(o, fn, p){
  if(typeof p !== 'string') p = fn.name;
  o.__defineGetter__(p, function() o[p] = delete o[p] && fn.call(o));
  return o;
}
function sum(a){
  for each(let key in Array.slice(arguments, 1))
    a = Array.map(a, typeof key === 'function' ? key : function(x) x[key], a);
  return a.reduce(function(x, y) x + y);
}
function keys(x){
  try { var it = x && new Iterator(x, true) } catch([]){ return [] }
  return [k for(k in it)];
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
  var s = (
    x instanceof Node
    ? let(nt = x.nodeType)(
      nt === x.DOCUMENT_FRAGMENT_NODE
      ? fmnodes(x.childNodes):
      nt === x.ELEMENT_NODE
      ? xmls(x.cloneNode(0))
      : x.nodeValue)
    : x instanceof NodeList ? fmnodes(x) : null);
  if(s == null){
    try { s = String(x) } catch(e){
      x.__proto__ ? Cu.reportError(e) : t = 'Null';
      s = os;
    }
    if(s === os) s = '{'+ keys(unwrap(x)).join(', ') +'}';
  }
  return s +'  '+ t;
}

function rescape(s) String(s).replace(/[.?*+^$|()\{\[\\]/g, '\\$&');
function ellipsize(str, num, end){
  if(num < 1) return '';
  if(str.length <= num) return str;
  const ELLIPSIS = Preferences.get('intl.ellipsis', '\u2026');
  if(end) return str.slice(0, num - 1) + ELLIPSIS;
  var i = num / 2;
  return str.slice(0, num - i) + ELLIPSIS + str.slice(str.length - i + 1);
}

function zen(code){
  var word = /[-\w$]+/, char = /^[^]/, digits = /\d+/;
  var kv = /([-\w$]+)(?:=([^\]]*))?\]?/, content = /{([^\}]*)}?/;
  var zs = code.trim().split(/\s{0,}([>+])\s{0,}/);
  var root = <_/>, curs = [root], sep;
  for(let i = -1, l = zs.length; ++i < l; sep = zs[++i]) if(word.test(zs[i])){
    let lm = <{RegExp.lastMatch}/>, n = 1;
    for(let _, m; char.test(_ = RegExp.rightContext);) switch(_[0]){
      case '#': lm.@id = word(_) || '';
      break;
      case '.': lm.@class += (lm.@class +'' && ' ') + (word(_) || '');
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
