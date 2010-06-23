#xqjs
is a simple JavaScript console for [Firefox](http://firefox.com) that:

- executes JS
  (like [Execute JS](http://code.google.com/p/executejs/))
  under target window you choose
  (in [DOMi](https://developer.mozilla.org/en/DOM_Inspector) style).
- can preprocess code with:
  - Macro written in JS which can be either:
    - an object of regexp:replacement pairs (see default setting).
    - a function that performs arbitrary string conversion.
  - [CoffeeScript](http://jashkenas.github.com/coffee-script/).
- has minimal capabilities of history conservation,
  [word completion](http://www.emacswiki.org/emacs/DynamicAbbreviations)
  and [key](https://developer.mozilla.org/en/XUL/key)
  [customization](http://www.json.org).

##default macros
    #{x} //=> f(x,y,z){return x}
    #(x) //=> f(x,y,z)(x)

    #'#se.le[ct=or]'
    //=> document.querySelector('#se.le[ct=or]')
    #a'#se.le[ct=or]'
    //=> Array.slice(document.querySelectorAll('#se.le[ct=or]'))
    #x'//x:p[@th]'
    //=> this.xpath('//x:p[@th]',1)
    #X'//x:p[@th]'
    //=> this.xpath('//x:p[@th]',0)
    #z'zen+code'
    //=> this.dom(this.zen('zen+code'))

    p(#<<END)
      here
      document
    END
    /*=>
    p(String(<![CDATA[  here
      document]]>))
    */

##tips

###execution
- `this` holds various predefined utilities.
- `__` keeps previous results. `_` equals `__[0]`.

###invocation
- Hold _shift_ to target the current page by default.
- Access __chrome://xqjs/content__ to open it within the browser.
