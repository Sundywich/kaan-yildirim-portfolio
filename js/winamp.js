/**
 * ==========================================================================
 * KAAN YILDIRIM // TECHNICAL GAME DESIGNER PORTFOLIO
 * SCRUBBABLE SCROLL-LINKED ENGINE & SHOWCASE CAROUSEL
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  checkStaticMedia();
  initScrollScrubber();
  initShowcaseCarousel();
  initProjectTabs();
  initProfileDropZone();
  initContactSection();
  initAudioClicks();
});

function checkStaticMedia() {
  const images = document.querySelectorAll('.profile-avatar-img, .game-img-elem, .game-card-media-elem');
  images.forEach(img => {
    const placeholder = img.nextElementSibling || document.getElementById('profilePlaceholder');
    function showImage() {
      if (img.naturalWidth > 0) {
        img.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
      }
    }
    if (img.complete) {
      showImage();
    }
    img.addEventListener('load', showImage);
  });
}

/* ==========================================================================
   1. SCRUBBABLE SCROLL-LINKED ANIMATION ENGINE
   ========================================================================== */

function initScrollScrubber() {
  const header = document.getElementById('dynamicHeader');
  const subtitle = document.getElementById('dynamicSubtitle');
  const badge = document.getElementById('dynamicBadge');
  const dock = document.getElementById('dynamicIconDock');
  const dockTiles = document.querySelectorAll('.dock-icon-tile');
  const dockSvgs = document.querySelectorAll('.dock-svg');
  const dockLabels = document.querySelectorAll('.dock-label');
  const dockItems = document.querySelectorAll('.dock-item');
  const welcomeCard = document.getElementById('welcomeCardStage');
  const scrollHint = document.getElementById('scrollHintBar');
  const dockAbout = document.getElementById('dockAbout');
  const dockGames = document.getElementById('dockGames');
  const dockProjects = document.getElementById('dockProjects');
  const dockContact = document.getElementById('dockContact');
  const gamesSection = document.getElementById('gamesSection');
  const projectsSection = document.getElementById('projectsSection');
  const contactSection = document.getElementById('contactSection');

  const compactShell = document.getElementById('compactNavShell');
  const mainTitle = document.querySelector('.dynamic-main-title');
  const brandBolt = document.querySelector('.brand-bolt');

  function getScrollMetrics() {
    const isMobile = window.innerWidth <= 600;
    const maxWelcome = isMobile ? 400 : 500; // Distance to complete Hero -> About transition
    const plateau = isMobile ? 250 : 350;    // Resting buffer: About stays pinned in center
    return {
      isMobile,
      maxWelcomeScroll: maxWelcome,
      aboutPlateau: plateau,
      exitStartScroll: maxWelcome + plateau  // When About begins scrolling up & Games enters
    };
  }

  function updateScrubbedAnimation() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    const { isMobile, maxWelcomeScroll, exitStartScroll } = getScrollMetrics();
    const p = Math.min(1, Math.max(0, scrollY / maxWelcomeScroll)); // 0.0 to 1.0

    // 0. Compact Navbar Shell (Fades in depth bezel when compact)
    if (compactShell) {
      const shellOpacity = Math.max(0, Math.min(1, (p - 0.25) / 0.75));
      compactShell.style.opacity = shellOpacity;
    }

    // 1. Header Transition (Kaan Yıldırım & Subtitle)
    if (header) {
      // Interpolate from ~36px (2.25rem) to 14px (high up inside compact shell)
      const startTop = isMobile ? 28 : 34;
      const endTop = isMobile ? 11 : 14;
      const topPx = startTop + (endTop - startTop) * p;
      header.style.top = `${topPx}px`;
    }

    if (mainTitle) {
      // Scale down title when compact (2.2rem -> 1.3rem)
      const startTitle = isMobile ? 1.6 : 2.2;
      const endTitle = isMobile ? 1.05 : 1.3;
      const titleSize = startTitle + (endTitle - startTitle) * p;
      mainTitle.style.fontSize = `${titleSize}rem`;
      mainTitle.style.letterSpacing = `${(3 - p * 1.0)}px`;
    }

    if (brandBolt) {
      const boltSize = 26 - p * 8; // 26px -> 18px
      brandBolt.style.width = `${boltSize}px`;
      brandBolt.style.height = `${boltSize}px`;
      brandBolt.style.fontSize = `${0.85 - p * 0.22}rem`;
    }

    if (subtitle) {
      const subOpacity = Math.max(0, 1 - p * 2.2);
      subtitle.style.opacity = subOpacity;
      subtitle.style.transform = `scale(${1 - p * 0.15})`;
      subtitle.style.display = subOpacity <= 0.01 ? 'none' : 'block';
    }

    if (badge) {
      const badgeOpacity = Math.max(0, Math.min(1, (p - 0.45) * 2));
      badge.style.opacity = badgeOpacity;
      badge.style.display = badgeOpacity <= 0.01 ? 'none' : 'inline-block';
      badge.style.fontSize = `${0.72 - p * 0.1}rem`;
    }

    // 2. 5-Icon Dock Transition (Center of screen -> Anchored near bottom border of compact shell)
    if (dock) {
      if (p >= 0.35) {
        dock.classList.add('compact-mode');
      } else {
        dock.classList.remove('compact-mode');
      }

      // 77px puts the 38px tiles right next to the 94px shell's bottom border (~8px padding), far from the top text
      const endTopPx = isMobile ? 68 : 77;
      const vhInPx = window.innerHeight * 0.5;
      const currentTopPx = vhInPx + (endTopPx - vhInPx) * p;
      dock.style.top = `${currentTopPx}px`;
      dock.style.transform = `translate(-50%, -50%)`;

      // Gap interpolation between icons
      const gap = 2 - p * 1.0; // 2rem -> 1.0rem
      dock.style.gap = `${gap}rem`;
    }

    // Icon tiles & SVGs scaling (Enlarged prominent button tiles in compact mode)
    const tileSize = 66 - p * 28; // 66px -> 38px (larger, easier to click!)
    const svgSize = 32 - p * 13; // 32px -> 19px
    const itemGap = Math.max(0, (1 - p * 1.5) * 0.6); // collapses to 0
    const itemWidth = 96 - p * 46; // 96px -> 50px
    const labelOpacity = Math.max(0, 1 - p * 2.2);

    dockTiles.forEach(tile => {
      tile.style.width = `${tileSize}px`;
      tile.style.height = `${tileSize}px`;
    });

    dockSvgs.forEach(svg => {
      svg.style.width = `${svgSize}px`;
      svg.style.height = `${svgSize}px`;
    });

    dockLabels.forEach(lbl => {
      lbl.style.opacity = labelOpacity;
    });

    dockItems.forEach(item => {
      item.style.width = `${itemWidth}px`;
      item.style.gap = `${itemGap}rem`;
    });

    // 3. Welcome Card Stage Transition (From bottom into view, holds in center, then scrolls up into Games)
    if (welcomeCard) {
      if (scrollY <= maxWelcomeScroll) {
        // Phase 1: Fade-in and slide into resting position
        const cardOpacity = Math.max(0, Math.min(1, (p - 0.15) / 0.85));
        const translateY = (1 - p) * 100; // 100px -> 0px
        const scale = 0.88 + p * 0.12; // 0.88 -> 1.0

        welcomeCard.style.opacity = cardOpacity;
        welcomeCard.style.transform = `translate(-50%, -50%) translateY(${translateY}px) scale(${scale})`;
        welcomeCard.style.pointerEvents = p >= 0.6 ? 'auto' : 'none';
      } else if (scrollY <= exitStartScroll) {
        // Phase 2 (Resting Plateau): Card stays firmly locked in center so casual scrolling doesn't push it away
        welcomeCard.style.opacity = 1;
        welcomeCard.style.transform = 'translate(-50%, -50%) translateY(0px) scale(1)';
        welcomeCard.style.pointerEvents = 'auto';
      } else {
        // Phase 3: Scrolling past Plateau into Games: scrolls up naturally 1:1 as Games enters from bottom
        const scrollPast = scrollY - exitStartScroll;
        welcomeCard.style.opacity = 1;
        welcomeCard.style.transform = `translate(-50%, -50%) translateY(${-scrollPast}px) scale(1)`;
        welcomeCard.style.pointerEvents = scrollPast > window.innerHeight ? 'none' : 'auto';
      }
    }

    // 4. Scroll Down Hint Bar
    if (scrollHint) {
      const hintOpacity = Math.max(0, 1 - p * 3.5);
      scrollHint.style.opacity = hintOpacity;
      scrollHint.style.pointerEvents = hintOpacity <= 0.01 ? 'none' : 'auto';
    }

    // 5. Active Section Indicator in Dock (About vs Games vs Projects vs Contact)
    const midScreen = window.innerHeight * 0.45;
    if (contactSection && contactSection.getBoundingClientRect().top <= midScreen && contactSection.getBoundingClientRect().bottom >= 100) {
      dockItems.forEach(i => i.classList.remove('active'));
      if (dockContact) dockContact.classList.add('active');
    } else if (projectsSection && projectsSection.getBoundingClientRect().top <= midScreen && projectsSection.getBoundingClientRect().bottom >= 100) {
      dockItems.forEach(i => i.classList.remove('active'));
      if (dockProjects) dockProjects.classList.add('active');
    } else if (gamesSection && gamesSection.getBoundingClientRect().top <= midScreen && gamesSection.getBoundingClientRect().bottom >= 100) {
      dockItems.forEach(i => i.classList.remove('active'));
      if (dockGames) dockGames.classList.add('active');
    } else if (p >= 0.7) {
      dockItems.forEach(i => i.classList.remove('active'));
      if (dockAbout) dockAbout.classList.add('active');
    } else {
      dockItems.forEach(i => i.classList.remove('active'));
      if (dockAbout) dockAbout.classList.add('active');
    }
  }

  // Bind scroll and resize listeners with requestAnimationFrame
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateScrubbedAnimation();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateScrubbedAnimation);
  updateScrubbedAnimation(); // Initial pass

  // Click on "About" button or Scroll Hint → scroll to About card
  if (dockAbout) {
    dockAbout.addEventListener('click', (e) => {
      e.preventDefault();
      playRetroSound(580);
      const { maxWelcomeScroll } = getScrollMetrics();
      window.scrollTo({
        top: maxWelcomeScroll,
        behavior: 'smooth'
      });
    });
  }

  if (scrollHint) {
    scrollHint.addEventListener('click', (e) => {
      e.preventDefault();
      playRetroSound(580);
      const { maxWelcomeScroll } = getScrollMetrics();
      window.scrollTo({
        top: maxWelcomeScroll,
        behavior: 'smooth'
      });
    });
  }

  // Click on "Games" button (formerly Showcase carousel)
  if (dockGames) {
    dockGames.addEventListener('click', (e) => {
      e.preventDefault();
      playRetroSound(650);
      if (gamesSection) {
        gamesSection.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    });
  }

  // Click on "Projects" button (formerly Games grid)
  if (dockProjects) {
    dockProjects.addEventListener('click', (e) => {
      e.preventDefault();
      playRetroSound(700);
      if (projectsSection) {
        projectsSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }

  // Click on "Contact" button
  if (dockContact) {
    dockContact.addEventListener('click', (e) => {
      e.preventDefault();
      playRetroSound(750);
      if (contactSection) {
        contactSection.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    });
  }

  // Click on "Kaan Yıldırım" header title: Scroll back to top
  if (header) {
    header.addEventListener('click', (e) => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (scrollY > 50) {
        e.preventDefault();
        playRetroSound(420);
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    });
  }
}

/* ==========================================================================
   2. SHOWCASE CAROUSEL & PEEK GALLERY ENGINE
   ========================================================================== */

function initShowcaseCarousel() {
  const track = document.getElementById('carouselTrack');
  const cards = document.querySelectorAll('.showcase-card');
  const btnPrev = document.getElementById('btnPrevProject');
  const btnNext = document.getElementById('btnNextProject');
  const counterText = document.getElementById('carouselCounter');
  const dotsContainer = document.getElementById('carouselDots');

  if (!track || cards.length === 0) return;

  let currentIndex = 0;
  const totalCards = cards.length;

  // Build pagination dots dynamically
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalCards; i++) {
      const dot = document.createElement('div');
      dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        playRetroSound(620);
        goToSlide(i);
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateCarousel() {
    cards.forEach((card, index) => {
      card.classList.remove('card-active', 'card-peek');
      if (index === currentIndex) {
        card.classList.add('card-active');
      } else {
        card.classList.add('card-peek');
      }
    });

    // Calculate exact translation offset to center the active card in viewport
    const viewport = document.querySelector('.carousel-viewport');
    const activeCard = cards[currentIndex];
    if (activeCard && viewport && track) {
      const viewportCenter = viewport.offsetWidth / 2;
      const cardCenter = activeCard.offsetLeft + (activeCard.offsetWidth / 2);
      const targetTranslateX = viewportCenter - cardCenter;
      track.style.transform = `translateX(${targetTranslateX}px)`;
    }

    // Update Counter Text
    if (counterText && cards[currentIndex]) {
      const titleElem = cards[currentIndex].querySelector('.game-title-text');
      const title = titleElem ? titleElem.textContent.trim() : 'PROJECT';
      counterText.textContent = `0${currentIndex + 1} / 0${totalCards} • ${title.toUpperCase()}`;
    }

    // Update Dots
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach((d, idx) => {
        if (idx === currentIndex) d.classList.add('active');
        else d.classList.remove('active');
      });
    }
  }

  function goToSlide(index) {
    if (index < 0) currentIndex = totalCards - 1;
    else if (index >= totalCards) currentIndex = 0;
    else currentIndex = index;
    updateCarousel();
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      playRetroSound(540);
      goToSlide(currentIndex - 1);
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      playRetroSound(640);
      goToSlide(currentIndex + 1);
    });
  }

  // Click on peek cards to select them
  cards.forEach((card, idx) => {
    card.addEventListener('click', (e) => {
      if (idx !== currentIndex) {
        playRetroSound(600);
        goToSlide(idx);
      }
    });
  });

  // Touch Swipe Support
  let startX = 0;
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToSlide(currentIndex + 1);
      else goToSlide(currentIndex - 1);
    }
  }, { passive: true });

  // Initial layout pass
  updateCarousel();
  setTimeout(updateCarousel, 60);
  window.addEventListener('resize', updateCarousel);
}

/* ==========================================================================
   3. RETRO SOUND SYNTHESIZER (Web Audio API)
   ========================================================================== */

let audioContext = null;

function playRetroSound(freq = 600, dur = 0.04) {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq / 2, audioContext.currentTime + dur);

    gain.gain.setValueAtTime(0.05, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + dur);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start();
    osc.stop(audioContext.currentTime + dur + 0.01);
  } catch (e) {
    // Graceful fallback
  }
}

function initAudioClicks() {
  const interactiveBtns = document.querySelectorAll('.grid-icon-btn, .dock-item, .carousel-nav-btn, .game-card-action-btn, .contact-action-btn, .contact-copy-btn, .project-tab-btn');
  interactiveBtns.forEach(btn => {
    btn.addEventListener('mouseenter', () => playRetroSound(800, 0.02));
    btn.addEventListener('click', () => playRetroSound(500, 0.05));
  });
}

/* ==========================================================================
   PROJECTS SECTION TABS (PROTOTYPES | JAMS | OTHER)
   ========================================================================== */

function initProjectTabs() {
  const tabButtons = document.querySelectorAll('.project-tab-btn');
  const tabPanes = document.querySelectorAll('.projects-tab-pane');

  if (tabButtons.length === 0 || tabPanes.length === 0) return;

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      if (!targetId) return;

      playRetroSound(640, 0.08);

      // Deactivate all buttons
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });

      // Activate clicked button
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Switch panes with smooth animation
      tabPanes.forEach(pane => {
        if (pane.id === targetId) {
          pane.style.display = 'block';
          requestAnimationFrame(() => {
            pane.classList.add('active');
          });
        } else {
          pane.classList.remove('active');
          pane.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   4. CONTACT SECTION INTERACTION (CLIPBOARD COPY & SOUND)
   ========================================================================== */

function initContactSection() {
  const copyBtn = document.getElementById('contactCopyBtn');
  const emailText = document.getElementById('contactEmailText');
  const copyLabel = document.getElementById('copyLabel');
  const copyIcon = document.getElementById('copyIcon');

  if (copyBtn && emailText) {
    copyBtn.addEventListener('click', () => {
      const email = emailText.textContent.trim();
      navigator.clipboard.writeText(email).then(() => {
        playRetroSound(950, 0.08);
        copyBtn.classList.add('copied');
        if (copyLabel) copyLabel.textContent = 'Copied!';
        if (copyIcon) copyIcon.textContent = '✓';

        setTimeout(() => {
          copyBtn.classList.remove('copied');
          if (copyLabel) copyLabel.textContent = 'Copy';
          if (copyIcon) copyIcon.textContent = '📋';
        }, 2200);
      }).catch(err => {
        console.error('Clipboard copy failed: ', err);
      });
    });
  }
}

/* ==========================================================================
   4. PROFILE & GAME MEDIA DRAG & DROP PREVIEWS (IMAGES & VIDEOS)
   ========================================================================== */

function initProfileDropZone() {
  // Avatar drop
  const dropFrame = document.getElementById('profileAvatarFrame');
  const imgElem = document.getElementById('profileAvatarImg');
  const placeholder = document.getElementById('profilePlaceholder');

  if (dropFrame) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropFrame.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropFrame.style.borderColor = '#00f0ff';
        dropFrame.style.boxShadow = '0 0 15px rgba(0, 240, 255, 0.8)';
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropFrame.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropFrame.style.borderColor = '#244970';
        dropFrame.style.boxShadow = '';
      }, false);
    });

    dropFrame.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files[0] && files[0].type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (imgElem) {
            imgElem.src = event.target.result;
            imgElem.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
          }
        };
        reader.readAsDataURL(files[0]);
      }
    });
  }

  // Showcase project images drop support
  const projectBoxes = document.querySelectorAll('.game-image-box');
  projectBoxes.forEach(box => {
    const pImg = box.querySelector('.game-img-elem');
    const pPlaceholder = box.querySelector('.game-image-placeholder');

    box.addEventListener('dragover', (e) => {
      e.preventDefault();
      box.style.borderColor = '#00f0ff';
    });

    box.addEventListener('dragleave', () => {
      box.style.borderColor = '#244970';
    });

    box.addEventListener('drop', (e) => {
      e.preventDefault();
      box.style.borderColor = '#244970';
      const files = e.dataTransfer.files;
      if (files && files[0] && files[0].type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (pImg) {
            pImg.src = event.target.result;
            pImg.style.display = 'block';
            if (pPlaceholder) pPlaceholder.style.display = 'none';
          }
        };
        reader.readAsDataURL(files[0]);
      }
    });
  });

  // Games section media drop support (images AND videos)
  const gameMediaBoxes = document.querySelectorAll('.game-card-media-box');
  gameMediaBoxes.forEach(box => {
    const gImg = box.querySelector('.game-card-media-elem');
    const gPlaceholder = box.querySelector('.game-card-media-placeholder');

    box.addEventListener('dragover', (e) => {
      e.preventDefault();
      box.style.borderColor = '#00f0ff';
      box.style.boxShadow = 'inset 0 0 15px rgba(0, 240, 255, 0.4)';
    });

    box.addEventListener('dragleave', () => {
      box.style.borderColor = 'rgba(0, 240, 255, 0.2)';
      box.style.boxShadow = '';
    });

    box.addEventListener('drop', (e) => {
      e.preventDefault();
      box.style.borderColor = 'rgba(0, 240, 255, 0.2)';
      box.style.boxShadow = '';
      const files = e.dataTransfer.files;
      if (files && files[0]) {
        const file = files[0];
        const fileURL = URL.createObjectURL(file);
        
        if (file.type.startsWith('video/')) {
          // If a video is dropped, replace or show a video element
          let videoElem = box.querySelector('video.game-card-media-elem');
          if (!videoElem) {
            videoElem = document.createElement('video');
            videoElem.className = 'game-card-media-elem';
            videoElem.autoplay = true;
            videoElem.loop = true;
            videoElem.muted = true;
            videoElem.playsInline = true;
            box.insertBefore(videoElem, gPlaceholder);
          }
          videoElem.src = fileURL;
          videoElem.style.display = 'block';
          if (gImg) gImg.style.display = 'none';
          if (gPlaceholder) gPlaceholder.style.display = 'none';
        } else if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (gImg) {
              gImg.src = event.target.result;
              gImg.style.display = 'block';
            }
            const videoElem = box.querySelector('video.game-card-media-elem');
            if (videoElem) videoElem.style.display = 'none';
            if (gPlaceholder) gPlaceholder.style.display = 'none';
          };
          reader.readAsDataURL(file);
        }
      }
    });
  });
}
