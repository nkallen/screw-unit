(function(Screw, Monarch, jQuery) {


Monarch.module("Screw.Require", {
  requiredPaths: [],
  includedStylesheets: {},
  cacheBuster:  parseInt(new Date().getTime()/(1*1000)),
  useCacheBuster: true,

  require: function(javascriptPath, onload) {
    if (Screw.Require.requiredPaths[javascriptPath]) return;
    var fullPath = javascriptPath + ".js";

    if (Screw.Require.useCacheBuster) {
      fullPath += '?' + Screw.Require.cacheBuster;
    }

    var scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.src = fullPath;
    scriptTag.onload = function() {
      if (onload) onload();
    };
    jQuery('head')[0].appendChild(scriptTag);

    Screw.Require.requiredPaths[javascriptPath] = true;
  },


  stylesheet: function(stylesheetPath) {
    if(Screw.Require.includedStylesheets[stylesheetPath]) return;
    var fullPath = stylesheetPath + ".css";
    if(Screw.Require.useCacheBuster) {
      fullPath += '?' + Screw.Require.cacheBuster;
    }
    jQuery('head').append(Screw.Require.tag("link", {rel: 'stylesheet', type: 'text/css', href: fullPath}));
    Screw.Require.includedStylesheets[stylesheetPath] = true;
  },

  tag: function(name, attributes) {
    var html = "<" + name;
    for(var attribute in attributes) {
      html += (" " + attribute + "='" + attributes[attribute]) + "'";
    };

    if (name == "script") {
      html += "></";
      html += name;
      html += ">";
    } else {
      html += "/>";
    }

    return html;
  }
});

})(Screw, Monarch, jQuery);

window.require = Screw.Require.require;
window.stylesheet = Screw.Require.stylesheet;
