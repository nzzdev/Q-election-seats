define(['exports', 'core-js/es6/object', './rendererConfigDefaults', 'fg-loadcss', './resources/onloadCSS'], function (exports, _coreJsEs6Object, _rendererConfigDefaults, _fgLoadcss, _resourcesOnloadCSS) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.display = display;

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _rendererConfigDefaults2 = _interopRequireDefault(_rendererConfigDefaults);

  var _onloadCSS = _interopRequireDefault(_resourcesOnloadCSS);

  function wrapEmojisInSpan(text) {
    text = text.replace(/([\ud800-\udbff])([\udc00-\udfff])/g, '<span class="emoji">$&</span>');
    return text;
  }

  function getContextHtml(item) {
    var html = '<h3 class="q-item__title">' + wrapEmojisInSpan(item.title) + '</h3>';
    html += '<div class="q-item-container"></div><div class="q-item__footer">';
    if (item.notes) {
      html += '<div class="q-item__footer__notes">' + item.notes + '</div>';
    }

    html += '<div class="q-item__footer__sources">';
    if (item.sources && item.sources.length && item.sources.length > 0 && item.sources[0].text && item.sources[0].text.length > 0) {
      var sources = item.sources.filter(function (source) {
        return source.text && source.text.length > 0;
      });

      html += 'Quelle' + (sources.length > 1 ? 'n' : '') + ': ';
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = sources[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var source = _step.value;

          if (source.href && source.href.length > 0 && source.validHref) {
            html += '<a href="' + source.href + '">' + source.text + '</a> ';
          } else {
            html += '' + source.text + (sources.indexOf(source) !== sources.length - 1 ? ', ' : ' ');
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    } else {
      html += 'Quelle: nicht angegeben';
    }
    html += '</div></div>';
    return html;
  }

  function displayWithContext(item, element) {
    var el = document.createElement('section');
    el.setAttribute('class', 'q-renderer-item');
    el.innerHTML = getContextHtml(item, chartistConfig);
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
    element.appendChild(el);

    return render(item, el.querySelector('.q-item-container'));
  }

  function displayWithoutContext(item, element) {
    return render(item, element);
  }

  function render(item, element) {
    return new Promise(function (resolve, reject) {
      resolve();
    });
  }

  function display(item, element, rendererConfig) {
    var withoutContext = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

    return new Promise(function (resolve, reject) {
      try {
        (function () {
          if (!element) throw 'Element is not defined';

          if (rendererConfig && typeof rendererConfig === 'object') {
            rendererConfig = Object.assign(_rendererConfigDefaults2['default'], rendererConfig);
          } else {
            rendererConfig = _rendererConfigDefaults2['default'];
          }

          var graphic = undefined;

          var rendererPromises = [];

          if (rendererConfig.loadStyles) {
            (function () {
              var themeUrl = rendererConfig.themeUrl || rendererConfig.rendererBaseUrl + 'themes/' + rendererConfig.theme;
              var themeLoadCSS = (0, _fgLoadcss.loadCSS)(themeUrl + '/styles.css');
              var themeLoadPromise = new Promise(function (resolve, reject) {
                (0, _onloadCSS['default'])(themeLoadCSS, function () {
                  resolve();
                });
              });
              rendererPromises.push(themeLoadPromise);
            })();
          }

          render(item.element).then(function () {
            resolve({
              graphic: graphic,
              promises: rendererPromises
            });
          })['catch'](function (e) {
            reject(e);
          });
        })();
      } catch (e) {
        reject(e);
      }
    });
  }
});