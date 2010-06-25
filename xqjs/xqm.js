({
'#(?=[({])': 'function f(x,y,z)',
'#<<(\\w+)(.*)\\n([^]*?)(?:\\n\\1\\b|$)': 'String(<![CDATA[$3]]\>)$2',
"#[axXz]?('.*?')": function sq($, q){
  switch($[1]){
    case 'a': return 'Array.slice(document.querySelectorAll('+ q +'))';
    case 'x': var one = 1;
    case 'X': return 'this.xpath('+ q +','+ ~~one +')';
    case 'z': return 'this.dom(this.zen('+ q +'))';
  }
  return 'document.querySelector('+ q +')';
},
})
