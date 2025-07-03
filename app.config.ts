export default defineAppConfig({
  head: {
    script: [
      {
        hid: 'yandex-metrika',
        innerHTML: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
        ym(103178484, "init", {
          clickmap:true,
          trackLinks:true,
          accurateTrackBounce:true,
          webvisor:true
        });`,
        type: 'text/javascript',
        charset: 'utf-8'
      }
    ],
    noscript: [
      {
        hid: 'yandex-metrika-noscript',
        innerHTML: '<div><img src="https://mc.yandex.ru/watch/103178484" style="position:absolute; left:-9999px;" alt="" /></div>'
      }
    ],
    __dangerouslyDisableSanitizersByTagID: {
      'yandex-metrika': ['innerHTML'],
      'yandex-metrika-noscript': ['innerHTML']
    }
  }
}); 