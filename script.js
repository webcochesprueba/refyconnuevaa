/* =============================================
   REFYCON - script.js
   ============================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* --- Navbar scroll shadow --- */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  /* --- Hamburger / Mobile Nav --- */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  hamburger.addEventListener('click', function () {
    const isOpen = mobileNav.classList.toggle('open');
    // Animate hamburger lines
    const spans = hamburger.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close mobile nav when a link is clicked
  if (mobileNav) {
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      });
    });
  }

  /* --- Before/After Project Sliders --- */
  document.querySelectorAll('.project-slider').forEach(function (slider) {
    const slides = slider.querySelector('.project-slides');
    const prevBtn = slider.querySelector('.slider-btn.prev');
    const nextBtn = slider.querySelector('.slider-btn.next');
    let current = 0; // 0 = showing ANTES | 1 = showing DESPUES

    function goTo(index) {
      current = index;
      // Each slide is 50% wide, showing two at a time
      // When current = 0, show slides[0] + slides[1] (antes + despues side by side)
      // We use a simple toggle: shift left by 50% to show "after" panel centered
      slides.style.transform = current === 0 ? 'translateX(0)' : 'translateX(-25%)';
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        goTo(0);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        goTo(1);
      });
    }

    // Touch/swipe support
    let touchStartX = 0;
    slider.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    slider.addEventListener('touchend', function (e) {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 40) {
        goTo(diff > 0 ? 1 : 0);
      }
    }, { passive: true });
  });

  /* --- Upload Box --- */
  const uploadBox = document.getElementById('uploadBox');
  const uploadInput = document.getElementById('uploadInput');
  const uploadText = document.getElementById('uploadText');

  if (uploadBox && uploadInput) {
    uploadBox.addEventListener('click', function () {
      uploadInput.click();
    });

    uploadBox.addEventListener('dragover', function (e) {
      e.preventDefault();
      uploadBox.style.borderColor = 'var(--blue-light)';
    });
    uploadBox.addEventListener('dragleave', function () {
      uploadBox.style.borderColor = '';
    });
    uploadBox.addEventListener('drop', function (e) {
      e.preventDefault();
      uploadBox.style.borderColor = '';
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        updateUploadText(files);
      }
    });

    uploadInput.addEventListener('change', function () {
      if (this.files.length > 0) {
        updateUploadText(this.files);
      }
    });

    function updateUploadText(files) {
      if (uploadText) {
        uploadText.textContent = files.length === 1
          ? files[0].name
          : files.length + ' archivos seleccionados';
      }
    }
  }


  /* --- Smooth scroll for anchor links --- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 70;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* --- Intersection Observer: fade-in on scroll --- */
  const fadeEls = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    fadeEls.forEach(function (el) { observer.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }

});