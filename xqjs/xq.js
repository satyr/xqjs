var __ = [], cur = 0, root = document.documentElement, utils =
[p, say, err, target,
 log, copy, hurl, domi, fbug,
 dom, zen, xmls, xpath,
 type, keys, unwrap];

[function bin() JSON.parse(prefs.get('history', '[]')),
 function macrun() macload(),
 function Coffee() Cu.import('resource://xqjs/coffee.jsm', null).CoffeeScript,
 ].reduce(lazy, this);

{ let apop = q('Actions').appendChild(lmn('menupopup'));
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
  for each(let cb in [macros, coffee]){
    cb.checked = prefs.get(cb.id +'.on');
    cb.setAttribute('onclick', 'event.detail || code.focus()');
  }
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
    history: JSON.stringify(bin),
    'macros.on': macros.checked,
    'coffee.on': coffee.checked,
  });
}

function target(win){
  target.win = win = win && win.document ? win : opener || self;
  target.chrome = chromep(win);
  lazy(target, function sb() sandbox(this.win));
  root.setAttribute('target', win.location);
  document.title = 'xqjs'+ (win === self ? '' : ': '+ fmtitle(win));
  return win;
}
function execute(){
  root.className = '';
  var js = expand(save(code.value));
  if(js){
    try { var r = p(evaluate(js)) } catch(e){ r = err(e) }
    r === __[0] || __.unshift(r);
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
    sb, 1.8, sourl('xqjs', js), 1);
}
function sandbox(win){
  var sb = Cu.Sandbox(win);
  for each(let f in utils) sb[f.name] = f;
  sb.ns = NS;
  sb.__defineGetter__('main', main);
  sb.win = unwrap(win);
  sb.doc = unwrap(win.document);
  sb.__ = __;
  preval('userjs', sb);
  return sb;
}
function macload(){
  var m = preval('macros', Cu.Sandbox(this)) || String;
  if(typeof m == 'function') return m;
  m = [[RegExp(k, 'g'), v] for([k, v] in Iterator(m))];
  return function mac(s) m.reduce(function(s, [re, xp]) s.replace(re, xp), s);
}
function preval(id, sb){
  var js = prefs.get(id).trim();
  if(js) try {
    return (
      /^\w+:\/\/\S+$/.test(js)
      ? Services.scriptloader.loadSubScript(js, sb)
      : Cu.evalInSandbox(js, sb, 1.8, sourl('xq'+ id, js), 1));
  } catch(e){ Cu.reportError(e) }
}

function p(x)(say(inspect(x)), x);
function say(x){
  var {editor, inputField} = results, s = String(x), t;
  if(s === say.last){
    inputField.setSelectionRange(s.length, s.length + say.pad);
    t = '  x'+ ++say.dup;
    say.pad = t.length;
  } else {
    editor.beginningOfDocument();
    say.last = s, say.dup = 1, say.pad = 0;
    t = s +'\n';
  }
  editor.QueryInterface(Ci.nsIPlaintextEditor).insertText(t);
  editor.beginningOfDocument();
  inputField.scrollTop = 0;
  return x;
}
function err(e){
  root.className = 'error';
  if(e) Cu.reportError(say(e));
  return e;
}
function xpath(xp, node, one){
  if(typeof node != 'object') one = node, node = target.win.document;
  var r = (node.ownerDocument || node)
    .evaluate(xp, node, function nsr(x) NS[x] || NS[x[0]],
              XPathResult.ANY_TYPE, null);
  switch(r.resultType){
    case r.UNORDERED_NODE_ITERATOR_TYPE:
    if(one) return r.iterateNext();
    let a = [], n;
    while((n = r.iterateNext())) a.push(n);
    return a;
    case r.STRING_TYPE: return r.stringValue;
    case r.NUMBER_TYPE: return r.numberValue;
    case r.BOOLEAN_TYPE: return r.booleanValue;
  }
}
function dom(o, doc) unwrap(node(o, doc || target.win.document));

function copand() say(copy(expand(code.value)));
function options(){
  showModalDialog('xqo.xul', 1, 'resizable=1');
  lazy(self, macload, 'macrun');
}
function reload() opener ? opener.xqjs(target.win) : location.reload();

function expand(s){
  if(!s) return '';
  if(macros.checked) try { s = macrun(s) } catch(e){ err(e); return '' }
  if(coffee.checked) try { s = Coffee.compile(s, {noWrap: true}) } catch(e){
    if(/ on line (\d+)/.test(e.message)) cofferr(s, e.message, +RegExp.$1);
    else err(e);
    return '';
  }
  return s;
}
function cofferr(src, msg, lno, cno){
  err();
  let se = Cc['@mozilla.org/scripterror;1'].createInstance(Ci.nsIScriptError);
  se.init(say('coffee: '+ msg), sourl('coffee', src),
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
  const {nsIDocShell} = Ci;
  const DS_TYP = Ci.nsIDocShellTreeItem['type'+ menu.parentNode.id];
  const DS_DIR = nsIDocShell.ENUMERATE_FORWARDS;
  const FS = (Cc['@mozilla.org/browser/favicon-service;1']
              .getService(Ci.nsIFaviconService));
  var len = 0;
  enumerate(function(xw){
    enumerate(function(ds){
      var doc = (ds.contentViewer || 0).DOMDocument;
      if(!doc || doc.location.href === 'about:blank') return;
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
    }, xw.docShell.getDocShellEnumerator(DS_TYP, DS_DIR), nsIDocShell);
  }, Services.wm.getXULWindowEnumerator(null), Ci.nsIXULWindow);
  len || menu.appendChild(lmn('menuitem', {label: '-', disabled: true}));
}
