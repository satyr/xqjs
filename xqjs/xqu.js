var {fromCharCode: chr, charCodeAt: ord} = String;

function sum(a){
  for each(let key in Array.slice(arguments, 1))
    a = Array.map(a, typeof key === 'function' ? key : function(x) x[key], a);
  return Array.reduce(a, function(x, y) x + y);
}
function last(a, i) a[(a.length >>> 0) - (i >>> 0) - 1];

Number.prototype.__iterator__ = function numit(){
  if(this < 0) for(var i = -this; --i >= 0;) yield i;
  else for(i = -1; ++i < this;) yield i;
};

XML.setSettings({ignoreComments: false, ignoreProcessingInstructions: false});
