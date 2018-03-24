// document scrollingElement pollyfill
(function () {
  if (document.scrollingElement) {
    return
  }
  var element = null
  function scrollingElement () {
    if (element) {
      return element
    } else if (document.body.scrollTop) {
      // speed up if scrollTop > 0
      return (element = document.body)
    }
    var iframe = document.createElement('iframe')
    iframe.style.height = '1px'
    document.documentElement.appendChild(iframe)
    var doc = iframe.contentWindow.document
    doc.write('<!DOCTYPE html><div style="height:9999em">x</div>')
    doc.close()
    var isCompliant = doc.documentElement.scrollHeight > doc.body.scrollHeight
    iframe.parentNode.removeChild(iframe)
    return (element = isCompliant ? document.documentElement : document.body)
  }
  Object.defineProperty(document, 'scrollingElement', {
    get: scrollingElement
  })
})();

// Image Preloading

let fetchedDesktopImages = false;
window.onload = () => {
  const desktopImages = document.querySelectorAll('img[data-desktop="true"]');
  const mobileImages = document.querySelectorAll('img[data-mobile="true"]');

  if (window.innerWidth > 769) {
    fetchImages(desktopImages);
    fetchImages(mobileImages)
    fetchedDesktopImages = true;
  } else {
    fetchImages(mobileImages)
  }

  window.addEventListener('resize', () => {
    if (!fetchedDesktopImages && window.innerWidth > 769) {
      fetchImages(desktopImages);
      fetchedDesktopImages = true;
    }
  });

  function fetchImages(images) {
    images.forEach(img => {
      const gifSrc = img.src.replace(/(png|jpg|jpeg)$/, 'gif')
      const nextImg = new Image();
      nextImg.height = img.height;
      nextImg.width = img.width;
      nextImg.className = "demo";

      nextImg.onload = () => {
        img.parentElement.replaceChild(nextImg, img);
      }
      nextImg.src = gifSrc;
    });
  }
}

// Fixed Header

var ticking = false;

const navbarEl = document.getElementById('nav');
const navbarPlaceholderEl = document.getElementById('nav-placeholder');
window.addEventListener('scroll', function (e) {
  var currentY = window.scrollY;

  if (!ticking) {
    window.requestAnimationFrame(function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop

      if (scrollTop > 0) {
        navbarEl.className = 'navbar is-dark is-fixed-top';
        navbarPlaceholderEl.style.display = 'block';
      } else {
        navbarEl.className = 'navbar is-transparent';
        navbarPlaceholderEl.style.display = 'none';
      }

      ticking = false;
    });
  }

  ticking = true;
});

// Tab Container
const singerTab = document.getElementById('singerTab');
const teacherTab = document.getElementById('teacherTab');
const singerPane = document.getElementById('singerPane');
const teacherPane = document.getElementById('teacherPane');

function scrollToTabs() {
  document.scrollingElement.scrollTop = document.scrollingElement.scrollTop + singerTab.getBoundingClientRect().top - 52
}

function showSingerTab() {
  singerPane.style.display = '';
  singerTab.className = "is-active";

  teacherPane.style.display = 'none';
  teacherTab.className = "";
  scrollToTabs();
}

function showTeacherTab(dontScroll) {
  teacherPane.style.display = '';
  teacherTab.className = "is-active";

  singerPane.style.display = 'none';
  singerTab.className = "";
  dontScroll !== true && scrollToTabs();
}

singerTab.addEventListener('click', showSingerTab);
teacherTab.addEventListener('click', showTeacherTab);

showTeacherTab(true);

