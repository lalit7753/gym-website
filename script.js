
(function () {
  let index = 0;
  const slides = document.getElementById('slides');
  const slideElems = slides ? slides.querySelectorAll('.slide') : [];
  const slideCount = slideElems.length || 0;

  function updateSlide() {
    if (!slides) return;
    slides.style.transform = `translateX(-${index * 100}vw)`;
  }

  function nextSlide() {
    if (!slideCount) return;
    index = (index + 1) % slideCount;
    updateSlide();
  }

  function prevSlide() {
    if (!slideCount) return;
    index = (index - 1 + slideCount) % slideCount;
    updateSlide();
  }

  // Expose to global because HTML uses onclick attributes
  window.nextSlide = nextSlide;
  window.prevSlide = prevSlide;

  const autoId = slideCount ? setInterval(nextSlide, 5000) : null;

  try {
    document.querySelectorAll('.btn-cta').forEach(btn => {
      btn.addEventListener('click', (e) => {
        try {
          const active = slideElems[index] || slideElems[0];
          const bg = active ? (active.style.backgroundImage || getComputedStyle(active).backgroundImage || '') : '';
          const pre = active ? (active.querySelector('.pre')?.textContent?.trim() || '') : '';
          const h1 = active ? (active.querySelector('h1')?.innerHTML?.trim() || '') : '';
          const lead = active ? (active.querySelector('.lead')?.textContent?.trim() || '') : '';
          const heroData = { bg, pre, h1, lead };
          localStorage.setItem('heroData', JSON.stringify(heroData));
        } catch (err) {
          console.error('Failed to save heroData:', err);
        }
      });
    });
  } catch (err) {

  }

  const sliderEl = document.querySelector('.slider');
  if (sliderEl) {
    sliderEl.addEventListener('mouseenter', () => { if (autoId) clearInterval(autoId); });
    sliderEl.addEventListener('mouseleave', () => setInterval(nextSlide, 5000));
  }


  let trainerIndex = 0;
  const trainers = [
    {
      name: "John Smith",
      position: "Head Fitness Trainer",
      bio: "With over 10 years of experience in personal training, John specializes in strength training and weight management.",
      specialties: ["Strength Training", "Weight Management", "Nutrition Planning"]
    },
    {
      name: "Sarah Johnson",
      position: "Yoga & Wellness Expert",
      bio: "Sarah is a certified yoga instructor focusing on physical and mental wellness through yoga and meditation.",
      specialties: ["Hatha Yoga", "Meditation", "Flexibility Training"]
    },
    {
      name: "Mike Wilson",
      position: "Sports Performance Specialist",
      bio: "Former athlete who builds sport-specific programs to improve performance and reduce injury risk.",
      specialties: ["Sports Conditioning", "Speed Training", "Injury Prevention"]
    },
    {
      name: "Deni Danials",
      position: "Gymnastics Coach",
      bio: "Deni coaches agility and gymnastics-inspired strength training for all levels.",
      specialties: ["Gymnastics", "Bodyweight Strength", "Mobility"]
    },
    {
      name: "Jon Sinaa",
      position: "Weight Trainer",
      bio: "Jon focuses on hypertrophy and functional strength programming for long-term results.",
      specialties: ["Hypertrophy", "Functional Training", "Program Design"]
    }
  ];

  const slidesEl = document.querySelector('.trainer-slides');
  const getCards = () => document.querySelectorAll('.trainer-slides .expert-card');
  let autoTrainerInterval = null;

  function getVisibleCount() {
    if (window.innerWidth < 480) return 1;
    if (window.innerWidth < 900) return 2;
    return 3;
  }

  // Looping trainer slider: clone ends and jump on transitionend for seamless loop
  let _currentPosIndex = 0; // includes cloned nodes
  let _cardWidth = 0;
  let _gap = 0;
  let _cloneCount = 0;
  let _totalReal = 0;

  function clearClones() {
    if (!slidesEl) return;
    slidesEl.querySelectorAll('.clone').forEach(n => n.remove());
  }

  function setupTrainerLoop() {
    if (!slidesEl) return;
    clearClones();
    const realCards = Array.from(getCards());
    _totalReal = realCards.length;
    const visible = getVisibleCount();
    _cloneCount = Math.min(visible, _totalReal);
    _gap = parseFloat(getComputedStyle(slidesEl).gap) || 30;

    if (_totalReal === 0) return;

    // If not enough cards, don't clone
    if (_totalReal <= _cloneCount) {
      _cardWidth = realCards[0].offsetWidth + _gap;
      _currentPosIndex = 0;
      slidesEl.style.transition = 'none';
      slidesEl.style.transform = `translateX(0px)`;
      requestAnimationFrame(() => slidesEl.style.transition = 'transform 0.5s ease');
      return;
    }

    // prepend clones of last N
    const toPrepend = realCards.slice(-_cloneCount).map(n => n.cloneNode(true));
    toPrepend.forEach(n => { n.classList.add('clone'); slidesEl.insertBefore(n, slidesEl.firstChild); });

    // append clones of first N
    const toAppend = realCards.slice(0, _cloneCount).map(n => n.cloneNode(true));
    toAppend.forEach(n => { n.classList.add('clone'); slidesEl.appendChild(n); });

    const allCards = Array.from(getCards());
    _cardWidth = allCards[0].offsetWidth + _gap;

    // position to first real card
    _currentPosIndex = _cloneCount;
    slidesEl.style.transition = 'none';
    slidesEl.style.transform = `translateX(-${_currentPosIndex * _cardWidth}px)`;
    requestAnimationFrame(() => { slidesEl.style.transition = 'transform 0.5s ease'; });
  }

  function updateTrainerSlide() {
    if (!slidesEl) return;
    const cards = Array.from(getCards());
    if (!cards.length) return;
    _gap = parseFloat(getComputedStyle(slidesEl).gap) || 30;
    _cardWidth = cards[0].offsetWidth + _gap;
    slidesEl.style.transform = `translateX(-${_currentPosIndex * _cardWidth}px)`;
  }

  function _onTrainerTransitionEnd(e) {
    if (e.propertyName !== 'transform') return;
    if (_totalReal <= 0) return;
    const lastRealPos = _cloneCount + _totalReal - 1;
    if (_currentPosIndex > lastRealPos) {
      // jumped past end -> reset to first real
      slidesEl.style.transition = 'none';
      _currentPosIndex = _cloneCount;
      slidesEl.style.transform = `translateX(-${_currentPosIndex * _cardWidth}px)`;
      void slidesEl.offsetWidth;
      slidesEl.style.transition = 'transform 0.5s ease';
    } else if (_currentPosIndex < _cloneCount) {
      // jumped before start -> reset to last real
      slidesEl.style.transition = 'none';
      _currentPosIndex = _cloneCount + _totalReal - 1;
      slidesEl.style.transform = `translateX(-${_currentPosIndex * _cardWidth}px)`;
      void slidesEl.offsetWidth;
      slidesEl.style.transition = 'transform 0.5s ease';
    }
  }

  function nextTrainer() {
    const cards = Array.from(getCards());
    if (!cards.length || !slidesEl) return;
    _currentPosIndex += 1;
    slidesEl.style.transform = `translateX(-${_currentPosIndex * _cardWidth}px)`;
  }

  function prevTrainer() {
    const cards = Array.from(getCards());
    if (!cards.length || !slidesEl) return;
    _currentPosIndex -= 1;
    slidesEl.style.transform = `translateX(-${_currentPosIndex * _cardWidth}px)`;
  }

  window.nextTrainer = nextTrainer;
  window.prevTrainer = prevTrainer;

  if (slidesEl) slidesEl.addEventListener('transitionend', _onTrainerTransitionEnd);
  window.showTrainerInfo = function (index, el) {
    const trainer = trainers[index] || {};
    const modal = document.getElementById('trainerModal');
    const img = document.getElementById('trainerModalImg');

    document.querySelectorAll('.expert-card.card-active').forEach(c => c.classList.remove('card-active'));

    if (el && el.classList) el.classList.add('card-active');

    document.getElementById('trainerName').textContent = trainer.name || document.querySelectorAll('.expert-card img')[index].alt || 'Trainer';
    document.getElementById('trainerPosition').textContent = trainer.position || '';
    document.getElementById('trainerBio').textContent = trainer.bio || '';

    const specialtiesList = document.getElementById('trainerSpecialties');
    specialtiesList.innerHTML = (trainer.specialties || []).map(s => `<li>${s}</li>`).join('');

    img.src = document.querySelectorAll('.expert-card img')[index].src;

    setTimeout(() => {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }, 120);

    stopAuto();
  };

  window.closeTrainerModal = function () {
    const modal = document.getElementById('trainerModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    document.querySelectorAll('.expert-card.card-active').forEach(c => c.classList.remove('card-active'));
    startAuto();
  };

  document.addEventListener('click', (e) => {
    const trainerModal = document.getElementById('trainerModal');
    if (trainerModal && e.target.id === 'trainerModal') closeTrainerModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeTrainerModal();
  });

  function startAuto() {
    stopAuto();
    autoTrainerInterval = setInterval(nextTrainer, 5000);
  }

  function stopAuto() {
    if (autoTrainerInterval) {
      clearInterval(autoTrainerInterval);
      autoTrainerInterval = null;
    }
  }

  const trainerSliderEl = document.querySelector('.trainer-slider');
  if (trainerSliderEl) {
    trainerSliderEl.addEventListener('mouseenter', stopAuto);
    trainerSliderEl.addEventListener('mouseleave', startAuto);
  }

  window.addEventListener('resize', () => setTimeout(() => { setupTrainerLoop(); updateTrainerSlide(); }, 120));

  window.addEventListener('load', () => {
    // initialize trainer loop and sliders
    setupTrainerLoop();
    updateTrainerSlide();
    startAuto();
    updateSlide();
  });

  function isElementInView(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    );
  }

  function handleScroll() {
    document.querySelectorAll('.section').forEach(section => {
      if (isElementInView(section)) {
        section.classList.add('visible');
      }
    });
  }

  handleScroll();
  window.addEventListener('scroll', handleScroll);

  document.querySelectorAll('nav a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;
      const navHeight = document.querySelector('nav')?.offsetHeight || 70;
      const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 10;
      window.scrollTo({ top, behavior: 'smooth' });

      document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
      history.replaceState(null, '', '#' + targetId);
    });
  });

  const sectionIds = ['home','features','classes','pricing','trainers','registration'];
  function updateActiveLinkOnScroll() {
    const scrollPos = window.pageYOffset + (document.querySelector('nav')?.offsetHeight || 80) + 20;
    for (let id of sectionIds) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (el.offsetTop <= scrollPos && (el.offsetTop + el.offsetHeight) > scrollPos) {
        document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
        const a = document.querySelector(`nav a[href="#${id}"]`);
        if (a) a.classList.add('active');
        break;
      }
    }
  }
  window.addEventListener('scroll', updateActiveLinkOnScroll);
  window.addEventListener('load', updateActiveLinkOnScroll);

  // Registration modal
  window.openModal = function () {
    const modal = document.getElementById('registrationModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  window.closeModal = function () {
    const modal = document.getElementById('registrationModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.btn-cta').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  document.getElementById('registrationModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'registrationModal') {
      closeModal();
    }
  });

  window.handleSubmit = function (event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    console.log('Form submitted:', data);

    alert('Thank you for your interest! We will contact you soon.');
    closeModal();
    event.target.reset();
  };

})();