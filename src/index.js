import 'core-js/es6/object';

import rendererConfigDefaults from './rendererConfigDefaults';

function wrapEmojisInSpan(text) {
  text = text.replace(
    /([\ud800-\udbff])([\udc00-\udfff])/g,
    '<span class="emoji">$&</span>');
  return text;
}

function getContextHtml(item) {
  let html = `<h3 class="q-item__title">${wrapEmojisInSpan(item.title)}</h3>`;
  html += '<div class="q-item-container"></div><div class="q-item__footer">';
  if (item.notes) {
    html += `<div class="q-item__footer__notes">${item.notes}</div>`;
  }

  html += '<div class="q-item__footer__sources">';
  if (item.sources && item.sources.length && item.sources.length > 0 && item.sources[0].text && item.sources[0].text.length > 0) {
    let sources = item.sources
      .filter(source => source.text && source.text.length > 0);

    html += `Quelle${sources.length > 1 ? 'n' : ''}: `;
    for (let source of sources) {
      if (source.href && source.href.length > 0 && source.validHref) {
        html += `<a href="${source.href}">${source.text}</a> `;
      } else {
        html += `${source.text}${sources.indexOf(source) !== sources.length -1 ? ', ' : ' '}`;
      }
    }
    
  } else {
    html += 'Quelle: nicht angegeben';
  }
  html += '</div></div>';
  return html;
}

function displayWithContext(item, element) {
  let el = document.createElement('section');
  el.setAttribute('class','q-renderer-item');                     // <-- replace this classname probably
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
  return new Promise((resolve, reject) => {
    resolve();
  });
}

export function display(item, element, rendererConfig, withoutContext = false) {
  return new Promise((resolve, reject) => {
    try {
      if (!element) throw 'Element is not defined';

      if (rendererConfig && typeof rendererConfig === 'object') {
        rendererConfig = Object.assign(rendererConfigDefaults, rendererConfig);
      } else {
        rendererConfig = rendererConfigDefaults;
      }

      let graphic;

      let themeUrl = rendererConfig.themeUrl || `${rendererConfig.rendererBaseUrl}themes/${rendererConfig.theme}`;
      System.import(`${themeUrl}/styles.css!`);

      // use this if your rendering is depending on container size

      // sizeObserver.onResize((rect) => {
      //   let drawSize = getElementSize(rect);
        
      //   try {
      //     if (withoutContext) {
      //       graphic = displayWithoutContext(item, element, drawSize);
      //     } else {
      //       graphic = displayWithContext(item, element, drawSize);
      //     }
      //   } catch (e) {
      //     reject(e);
      //   }
        
      //   resolve(graphic);

      // }, element, true);

      // use this if container size doesn't influence your rendering
      render(item.element)
        .then(() => {
          resolve(graphic);
        })
        .catch((e) => {
          reject(e);
        })

    } catch (e) {
      reject(e);
    } 
  });
}
