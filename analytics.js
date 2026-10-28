/* Google Analytics (gtag.js). Fica em arquivo próprio pelo mesmo motivo do clarity.js:
   a CSP do site (_headers) não deixa rodar script escrito dentro do HTML. */
(function () {
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=G-254R250R5J";
  document.head.appendChild(s);
})();
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-254R250R5J');
