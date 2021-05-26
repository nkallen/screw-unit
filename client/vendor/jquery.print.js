(function($) {

  function printArray(obj, opts) {
    var result = [];
    for (var i = 0; i < Math.min(opts.maxArray, obj.length); i++)
      result.push($.print(obj[i], $.extend({}, opts, { maxArray: 3, maxString: 40 })));

    if (obj.length > opts.maxArray)
      result.push((obj.length - opts.maxArray) + ' more...');
    if (result.length == 0) return "[]"
      return "[ " + result.join(", ") + " ]";
  }

  function printElement(obj) {
    if (obj.nodeType == 1) {
      var result = [];
      var properties = [ 'className', 'id' ];
      var extra = {
        'input': ['type', 'name', 'value'],
        'a': ['href', 'target'],
        'form': ['method', 'action'],
        'script': ['src'],
        'link': ['href'],
        'img': ['src']
      };

      $.each(properties.concat(extra[obj.tagName.toLowerCase()] || []), function(){
        if (obj[this])
          result.push(' ' + this.replace('className', 'class') + "=" + $.print(obj[this]))
      });
      return "<" + obj.tagName.toLowerCase()
              + result.join('') + ">";
    }
  }

  function printObject(obj, opts) {
    var seen = opts.seen || [ obj ];

    var result = [], key, value;
    for (var k in obj) {
      if (obj.hasOwnProperty(k) && $.inArray(obj[k], seen) < 0) {
        seen.push(obj[k]);
        value = $.print(obj[k], $.extend({}, opts, { maxArray: 6, maxString: 40, seen: seen }));
      } else
        value = "...";
      result.push(k + ": " + value);
    }
    if (result.length == 0) return "{}";
    return "{ " + result.join(", ") + " }";
  }

  function printString(value, opts) {
    var characterSubstitutions = {
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\f': '\\f',
      '\r': '\\r',
      '"' : '\\"',
      '\\': '\\\\'
    };
    var r = /["\\\x00-\x1f\x7f-\x9f]/g;
    
    var str = r.test(value)
      ? '"' + value.replace(r, function (a) {
          var c = characterSubstitutions[a];
          if (c) return c;
          c = a.charCodeAt();
          return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
        }) + '"'
      : '"' + value + '"';
    if (str.length > opts.maxString)
      return str.slice(0, opts.maxString + 1) + '..."';
    else
      return str;
  }

  $.print = function(obj, options) {
    var opts = $.extend({}, { maxArray: 10, maxString: 100 }, options);

    if (obj && obj.inspect && typeof obj.inspect == "function") obj = obj.inspect();

    if (typeof obj == 'undefined')
      return "undefined";
    else if (typeof obj == 'boolean')
      return obj.toString();
    else if (typeof obj == 'number')
      return obj.toString();
    else if (!obj)
      return "null";
    else if (typeof obj == 'string')
      return printString(obj, opts);
    else if (obj instanceof RegExp)
      return obj.toString();
    else if (obj instanceof Array || obj.callee || obj.item)
      return printArray(obj, opts);
    else if (typeof obj == 'function' || obj instanceof Function)
      return obj.toString().match(/^([^)]*\))/)[1];
    else if (obj.nodeType)
      return printElement(obj);
    else if (obj instanceof Error)
      return printObject(obj, $.extend({}, options, { maxString: 200 }));
    else if (obj instanceof Object)
      return printObject(obj, opts);
    else
      return obj.toString().replace(/\n\s*/g, '');
  }

})(jQuery);