for each(let id in ['macros', 'userjs']){
  let tb = q(id)
  tb.value = prefs.get(id)
  tb.parentNode.appendChild(lmn('hbox', {class: 'buttons'}, [
    ['button', {label: 'Pick ', oncommand: 'pq ("'+ id +'")'}],
    ['button', {label: 'View ', oncommand: 'vu ("'+ id +'")'}],
    ['button', {label: 'Reset', oncommand: 'rst("'+ id +'")'}],
  ]))
}
{ let parent = q('keys'), i = 0
  for each(let pref in Services.prefs.getChildList(PREF_ROOT +'key', {})){
    let id  = pref.slice(PREF_ROOT.length)
      , row = parent.appendChild(lmn('row', {align: 'baseline'}))
    row.appendChild(lmn('label', {
      value: ++i +' '+ id.slice(3), control: id, accesskey: i,
    }))
    row.appendChild(lmn('textbox', {
      id: id, class: 'key', value: prefs.get(id),
    }))
  }
}

this.onunload = function onunload(){
  for each(let tb in qsa('.key')) prefs.set(tb.id, tb.value)
  for each(let id in ['macros', 'userjs']) prefs.set(id, q(id).value)
}

function pq(id){
  var file = pick('Open', {JS: '*.js'})
  if(file) q(id).value = furl(file)
}
function vu(id) hurl('view-source:'+ q(id).value)
function rst(id){
  prefs.reset(id)
  q(id).value = prefs.get(id)
}
