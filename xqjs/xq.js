var __ = [], cur = 0, utils =
[p, say, target, hurl,
 log, copy, domi, fbug,
 dom, zen, xmls, xpath,
 type, keys, unwrap,
 sum, last];

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
function onunload(){
  save(code.value);
  bin.length = Math.min(bin.length, prefs.get('history.max'));
  prefs.set({
    'history': JSON.stringify(bin),
    'macros.on': macros.checked,
    'coffee.on': coffee.checked,
  });
}

function target(win){
  target.win = win = win && win.document ? win : opener || self;
  target.chrome = chromep(win);
  target.sb = sandbox(win);
  document.documentElement.setAttribute('target', win.location);
  document.title = 'xqjs'+ (win === self ? '' : ': '+ fmtitle(win));
  return win;
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
  sb.doc = unwrap(win.document);
  sb.__ = __;
  sb.Number.prototype.__iterator__ = function numit(){
    if(this < 0) for(var i = -this; --i >= 0;) yield i;
    else for(i = -1; ++i < this;) yield i;
  };
  sb.XML.setSettings({
    ignoreComments: false,
    ignoreProcessingInstructions: false,
  });
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

function p(x)(say(inspect(x)), x);
function say(s){
  var {editor} = results;
  editor.beginningOfDocument();
  editor.QueryInterface(Ci.nsIPlaintextEditor).insertText(s +'\n');
  editor.beginningOfDocument();
  results.inputField.scrollTop = 0;
  return s;
}
function xpath(xp, doc, one){
  if(typeof doc !== 'object') one = doc, doc = target.win.document;
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
}
function dom(o, doc) unwrap(node(o, doc || target.win.document));

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

function fillwin(menu){
  function each(fn, nmr, ifc){
    while(nmr.hasMoreElements()) fn(nmr.getNext().QueryInterface(ifc));
  }
  const {nsIXULWindow, nsIDocShell} = Ci;
  const DS_TYPE = Ci.nsIDocShellTreeItem['type'+ menu.parentNode.id];
  const DS_DIR  = nsIDocShell.ENUMERATE_FORWARDS;
  const FS = (Cc['@mozilla.org/browser/favicon-service;1']
              .getService(Ci.nsIFaviconService));
  var len = 0;
  each(function(xw){
    each(function(ds){
      var doc = ds.contentViewer.DOMDocument;
      if(doc.location.href === 'about:blank') return;
      var win = doc.defaultView, label = fmtitle(win);
      var icon = FS.getFaviconImageForPage(doc.documentURIObject).spec;
      var mi = lmn('menuitem', {class: 'menuitem-iconic', image: icon});
      if(win === target.win) mi.setAttribute('disabled', true);
      else if(++len <= 36){
        let key = len < 11 ? len % 10 : (len-1).toString(36).toUpperCase();
        mi.setAttribute('accesskey', key);
        label = key +' '+ label;
      }
      mi.setAttribute('label', label);
      menu.appendChild(mi).win = win;
    }, xw.docShell.getDocShellEnumerator(DS_TYPE, DS_DIR), nsIDocShell);
  }, Services.wm.getXULWindowEnumerator(null), nsIXULWindow);
  len || menu.appendChild(lmn(<menuitem label="×" disabled="true"/>));
}
