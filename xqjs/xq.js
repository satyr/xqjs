const {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;
Cu.import('resource://xqjs/Services.jsm');
Cu.import('resource://xqjs/Preferences.jsm');
Cu.import('resource://xqjs/coffee.jsm');

var utils =
[function p(x) say(prettify(x)),
 function say(s){
   results.value = s + '\n' + results.value;
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
 function type(x) Object.prototype.toString.call(x).slice(8, -1),
 function main() Services.wm.getMostRecentWindow('navigator:browser'),
 function domi(x)(
   main()[x && x.nodeType ? 'inspectDOMNode' : 'inspectObject'](x), x),
 function fbug(x){
   var {Firebug} = main();
   if(Firebug.Console.isEnabled() && Firebug.toggleBar(true, 'console'))
     Firebug.Console.logFormatted(Array.slice(arguments));
   return x;
 }];
for each(let f in utils) this[f.name] = f;

function onload(){
  target(opener || this);
  for each(let lm in qsa('textbox, checkbox')) self[lm.id] = lm;
  this.bin =
    JSON.parse(Preferences.get('extensions.xqjs.history', '[]')).reverse();
  this.pos = 0;
  macload();
  macros.checked = Preferences.get('extensions.xqjs.macros.on');
  coffee.checked = Preferences.get('extensions.xqjs.coffee.on');
  code.onkeydown = keydown;
  code.focus();
  for each(let menu in qsa('#Chrome, #Content'))
    menu.appendChild(lmn('menupopup', {
      oncommand: 'target(event.target.win)',
      onpopupshowing: 'fillwin(this)',
      onpopuphidden: 'empty(this)',
    }));
  var apop = qs('#Actions').appendChild(lmn('menupopup'));
  for each(let key in qsa('key'))
    apop.appendChild(lmn('menuitem', {
      key: key.id,
      label: key.getAttribute('label'),
      oncommand: key.getAttribute('oncommand'),
    }));
}

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
  document.title = win === self ? 'xqjs' : 'xqjs: '+ fmtitle(win);
}
function macload(){
  try {
    var m = Cu.evalInSandbox(
      Preferences.get('extensions.xqjs.macros', ''),
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

function prettify(x){
  switch(typeof x){
    case 'function': return x.toSource(0);
    case 'xml': return x.toXMLString();
    case 'object':
    try {
      var ps = uneval(x).replace(/^(?:\({}\)|null)$/, '');
    } catch([]){
      ps = JSON.stringify(x);
    }
  }
  var r = String(x);
  if(ps && r !== ps) r += ' '+ ps;
  return r;
}
function fmtitle(win){
  var {location: {href}, document: {title}} = win;
  var r = '<'+ ellipsize(href.replace(/^http:\/+(?:www\.)?/, ''), 40) +'>';
  if((title = title.trim())) r = ellipsize(title, 32, true) +' '+ r;
  return r;
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

function keydown(ev){
  if(!ev.ctrlKey) return;
  switch(ev.keyCode){
    case KeyEvent.DOM_VK_UP  : go(-1); break;
    case KeyEvent.DOM_VK_DOWN: go(+1); break;
    case KeyEvent.DOM_VK_RETURN: execute(); break;
    default: return;
  }
  ev.preventDefault();
  ev.stopPropagation();
}

function onunload(){
  save(code.value);
  bin.reverse();
  var max = Preferences.get('extensions.xqjs.history.max');
  if(bin.length > max) bin.length = max;
  Preferences.set({
    'extensions.xqjs.history': JSON.stringify(bin),
    'extensions.xqjs.macros.on': macros.checked,
    'extensions.xqjs.coffee.on': coffee.checked,
  });
}
