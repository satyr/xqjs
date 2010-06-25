var {fromCharCode: chr, charCodeAt: ord} = String;

function sum(a){
  for each(let key in Array.slice(arguments, 1))
    a = Array.map(a, typeof key === 'function' ? key : function(x) x[key], a);
  return a.reduce(function(x, y) x + y);
}
function last(a, i) a[(a.length >>> 0) - (i >>> 0) - 1];
