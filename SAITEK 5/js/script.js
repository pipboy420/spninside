(function() {
  'use strict';

  // Функция-дебаунс (для оптимизации scroll events)
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Кнопка "Вверх"
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  window.addEventListener('scroll', debounce(() => {
    if (window.scrollY > 300) {
      scrollTopBtn.style.opacity = '1';
      scrollTopBtn.style.pointerEvents = 'auto';
    } else {
      scrollTopBtn.style.opacity = '0';
      scrollTopBtn.style.pointerEvents = 'none';
    }
  }, 100));

  // Бургер-меню
  const burgerBtn = document.getElementById('burgerBtn');
  const mainNav = document.getElementById('mainNav');
  burgerBtn.addEventListener('click', () => {
    mainNav.classList.toggle('open');
  });
  document.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => { 
      mainNav.classList.remove('open');
    });
  });

  // Плавная прокрутка по кнопкам с data-scroll
  document.querySelectorAll('[data-scroll]').forEach(btn => {
    btn.addEventListener('click', function() {
      const targetId = this.getAttribute('data-scroll');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        window.scrollTo({ top: targetEl.offsetTop - 70, behavior: 'smooth' });
      }
    });
  });

  // Модальное окно для деталей экскурсии
  const detailsModal = document.getElementById('detailsModal');
  const modalImage = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalInfo = document.getElementById('modalInfo');
  const modalBookingBtn = document.getElementById('modalBookingBtn');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const carouselDots = document.getElementById('carouselDots');
  let currentImages = [];
  let currentImageIndex = 0;
  let lastFocusedElement;

  function showImage(index) {
    if (index < 0) index = currentImages.length - 1;
    if (index >= currentImages.length) index = 0;
    currentImageIndex = index;
    modalImage.src = currentImages[currentImageIndex];
    updateCarouselDots();
  }

  function updateCarouselDots() {
    carouselDots.innerHTML = '';
    currentImages.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.classList.add('dot');
      if (i === currentImageIndex) dot.classList.add('active');
      dot.addEventListener('click', () => showImage(i));
      carouselDots.appendChild(dot);
    });
  }

  function openDetailsModal(data) {
    lastFocusedElement = document.activeElement;
    modalTitle.textContent = data.title;
    modalInfo.textContent = data.info;
    currentImages = data.images || [];
    if (currentImages.length) {
      showImage(0);
    } else {
      modalImage.src = '';
      carouselDots.innerHTML = '';
    }
    detailsModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modalTitle.focus();
  }

  function closeDetailsModal() {
    detailsModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  modalCloseBtn.addEventListener('click', closeDetailsModal);
  detailsModal.addEventListener('click', (e) => {
    if (e.target === detailsModal) {
      closeDetailsModal();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && detailsModal.getAttribute('aria-hidden') === 'false') {
      closeDetailsModal();
    }
  });
  document.querySelectorAll('.tour__button').forEach(button => {
    button.addEventListener('click', function() {
      const modalData = JSON.parse(this.getAttribute('data-modal'));
      openDetailsModal(modalData);
    });
  });

  // Боковая панель бронирования
  const bookingSidebar = document.getElementById('bookingSidebar');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  const bookingForm = document.getElementById('bookingForm');
  const bookingTourSelect = document.getElementById('bookingTourSelect');
  const bookingTypeSelect = document.getElementById('bookingTypeSelect');
  const bookingTimeSelect = document.getElementById('bookingTimeSelect');
  const bookingDateField = document.getElementById('bookingDateField');
  const adultCountEl = document.getElementById('adultCount');
  const childCountEl = document.getElementById('childCount');
  const totalPriceEl = document.getElementById('totalPrice');

  const tourPrices = {
    "Речная прогулка по каналам": { group: 1500, individual: 2000 },
    "Ночной развод мостов": { group: 2000, individual: 2500 },
    "Дворцовый Петербург": { group: 1800, individual: 2300 }
  };

  function updateTotalPrice() {
    const adultCount = parseInt(adultCountEl.innerText, 10);
    const childCount = parseInt(childCountEl.innerText, 10);
    let priceAdult = 0, priceChild = 0;
    const selectedTour = bookingTourSelect.value;
    const selectedType = bookingTypeSelect.value;
    if (selectedTour && tourPrices[selectedTour]) {
      const prices = tourPrices[selectedTour];
      if (selectedType === "Групповая") {
        priceAdult = prices.group;
        priceChild = Math.round(prices.group * 0.67);
      } else if (selectedType === "Индивидуальная") {
        priceAdult = prices.individual;
        priceChild = Math.round(prices.individual * 0.67);
      }
    }
    const totalPrice = (adultCount * priceAdult) + (childCount * priceChild);
    totalPriceEl.innerText = totalPrice;
  }

  // Update price when changing tour or type
  bookingTourSelect.addEventListener('change', updateTotalPrice);
  bookingTypeSelect.addEventListener('change', updateTotalPrice);

  document.querySelectorAll('.counter__btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const action = this.getAttribute('data-action');
      const targetId = this.getAttribute('data-target');
      const countEl = document.getElementById(targetId);
      let count = parseInt(countEl.innerText, 10);
      if (action === 'increase') {
        countEl.innerText = count + 1;
      } else if (action === 'decrease' && count > 0) {
        countEl.innerText = count - 1;
      }
      updateTotalPrice();
    });
  });

  const bookNowBtn = document.getElementById('bookNowBtn');
  const modalBookingBtn2 = document.getElementById('modalBookingBtn');
  bookNowBtn.addEventListener('click', () => openBookingSidebar(''));
  modalBookingBtn2.addEventListener('click', () => {
    const preselectedTour = modalTitle.textContent;
    closeDetailsModal();
    openBookingSidebar(preselectedTour);
  });

  function openBookingSidebar(preselectedTour) {
    bookingSidebar.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (preselectedTour && bookingTourSelect) {
      bookingTourSelect.value = preselectedTour;
    }
    updateTotalPrice();
    // Optionally, focus first field for accessibility
    bookingTourSelect.focus();
  }
  function closeBookingSidebar() {
    bookingSidebar.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  sidebarCloseBtn.addEventListener('click', closeBookingSidebar);
  bookingSidebar.addEventListener('click', (e) => {
    if (e.target === bookingSidebar) {
      closeBookingSidebar();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bookingSidebar.getAttribute('aria-hidden') === 'false') {
      closeBookingSidebar();
    }
  });

  bookingForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const bookingData = {
      tour: bookingTourSelect.value,
      type: bookingTypeSelect.value,
      time: bookingTimeSelect.value,
      date: bookingDateField.value,
      adultCount: adultCountEl.innerText,
      childCount: childCountEl.innerText,
      name: document.getElementById('bookingNameField').value.trim(),
      phone: document.getElementById('bookingPhoneField').value.trim(),
      comment: document.getElementById('bookingComment').value.trim()
    };

    if (!bookingData.name || !bookingData.phone) {
      alert("Пожалуйста, заполните все обязательные поля.");
      return;
    }

    try {
      // Замените '/api/bookings' на актуальный URL серверного API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      if (!response.ok) throw new Error("Ошибка отправки данных");
      const result = await response.json();
      alert("Спасибо! Ваша заявка отправлена.");
      bookingForm.reset();
      // Reset counters to default (1 adult, 0 child)
      adultCountEl.innerText = '1';
      childCountEl.innerText = '0';
      updateTotalPrice();
      closeBookingSidebar();
    } catch (error) {
      console.error(error);
      alert("Произошла ошибка. Попробуйте позже.");
    }
  });

  // FAQ аккордеон
  document.querySelectorAll('.faq__question').forEach(question => {
    question.addEventListener('click', function() {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      const answer = this.nextElementSibling;
      answer.classList.toggle('open', !expanded);
    });
  });

  // IntersectionObserver для анимаций появления секций при скролле
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.scroll-section').forEach(el => { 
    observer.observe(el);
  });

})();