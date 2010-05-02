pref('extensions.xqjs.macros', '({
  "#(?=[({])": "function f(x,y,z)",
  "@`(.*?)`": "Array.slice(document.querySelectorAll(\'$1\'))",
  "`(.*?)`": "document.querySelector(\'$1\')",
})');
pref('extensions.xqjs.macros.on', true);
pref('extensions.xqjs.coffee.on', false);
pref('extensions.xqjs.history', '[]');
pref('extensions.xqjs.history.max', 999);
