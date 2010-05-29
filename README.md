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


##tips

###execution
- `__` keeps last results. `_` equals `__[0]`.

###invocation
- Hold _shift_ to target the current page by default.
- Access __chrome://xqjs/content__ to open it within the browser.
