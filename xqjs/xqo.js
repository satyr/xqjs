const {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;
Cu.import('resource://xqjs/Preferences.jsm');

const DEFAULT_MACROS = String(<![CDATA[({
  '#(?=[({])': 'function f(x,y,z)',
  '#<<(\\w+)(.*)\\n([^]*?)\\n\\1': 'String(<![CDATA[$3]]\>)$2',
  "#[axX]?('.*?')": function selector($, q){
    switch($[1]){
      case 'a': return 'Array.slice(document.querySelectorAll('+ q +'))';
      case 'x': var one = 1;
      case 'X': return 'this.xpath('+ q +','+ !!one +')';
    }
    return 'document.querySelector('+ q +')';
  },
})]]>);

function onload(){
  document.getElementById('macros').value =
    Preferences.get('extensions.xqjs.macros', '') || DEFAULT_MACROS;
}
function onunload(){
  Preferences.set(
    'extensions.xqjs.macros',
    document.getElementById('macros').value || DEFAULT_MACROS);
}
