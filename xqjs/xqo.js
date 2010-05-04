const PREF_ROOT = 'extensions.xqjs.';
const DEFAULT_MACROS = String(<![CDATA[({
  '#(?=[({])': 'function f(x,y,z)',
  '#<<(\\w+)(.*)\\n([^]*?)\\n\\1\\b': 'String(<![CDATA[$3]]\>)$2',
  "#[axX]?('.*?')": function selector($, q){
    switch($[1]){
      case 'a': return 'Array.slice(document.querySelectorAll('+ q +'))';
      case 'x': var one = 1;
      case 'X': return 'this.xpath('+ q +','+ !!one +')';
    }
    return 'document.querySelector('+ q +')';
  },
})]]>);

{ let parent = qs('#keys'), i = 0;
  for each(let pref in Services.prefs.getChildList(PREF_ROOT +'key', {})){
    let id = pref.slice(PREF_ROOT.length);
    let row = parent.appendChild(lmn('row', {align: 'baseline'}));
    row.appendChild(lmn('label', {
      value: ++i +' '+ id.slice(3), control: id, accesskey: i,
    }));
    row.appendChild(lmn('textbox', {
      id: id, class: 'key', value: prefs.get(id),
    }));
  }
}

function onload(){
  qs('#macros').value = prefs.get('macros', '') || DEFAULT_MACROS;
}
function onunload(){
  for each(let tb in qsa('.key')) prefs.set(tb.id, tb.value);
  prefs.set('macros', qs('#macros').value || DEFAULT_MACROS);
}
