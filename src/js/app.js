// Initialize AOS
AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: true,
  offset: 50
});

// Header Navigation functionality
const headerNav = {
  init() {
    this.setupHamburgerMenu();
    this.setupScrollBehavior();
    this.setupSmoothScroll();
  },

  setupHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const body = document.body;

    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        body.classList.toggle('menu-open');
      });

      // Close menu when clicking on a link
      const mobileLinks = document.querySelectorAll('.mobile-nav a');
      mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('active');
          mobileMenu.classList.remove('active');
          body.classList.remove('menu-open');
        });
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
          hamburger.classList.remove('active');
          mobileMenu.classList.remove('active');
          body.classList.remove('menu-open');
        }
      });
    }
  },

  setupScrollBehavior() {
    const header = document.querySelector('.main-header');
    let lastScroll = 0;

    if (header) {
      window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add scrolled class for styling
        if (currentScroll > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
      });
    }
  },

  setupSmoothScroll() {
    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Don't prevent default for # only links
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
          const headerOffset = 80; // Fixed header height
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }
};

// Language switching functionality
const languageSwitcher = {
  currentLang: 'fa',

  init() {
    // Load saved language or default to Farsi
    const savedLang = localStorage.getItem('language') || 'fa';
    this.setLanguage(savedLang);

    // Setup language dropdown toggle
    this.setupLanguageDropdown();

    // Add event listeners to OLD language buttons (for backward compatibility)
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lang = e.target.getAttribute('data-lang');
        this.setLanguage(lang);
      });
    });

    // Add event listeners to NEW language dropdown options
    const langOptions = document.querySelectorAll('.lang-option');
    langOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = option.getAttribute('data-lang');
        this.setLanguage(lang);
        // Close dropdown after selection
        const dropdown = document.querySelector('.language-dropdown');
        if (dropdown) dropdown.classList.remove('active');
      });
    });
  },

  setupLanguageDropdown() {
    const langToggle = document.querySelector('.lang-toggle');
    const dropdown = document.querySelector('.language-dropdown');

    if (langToggle && dropdown) {
      langToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
          dropdown.classList.remove('active');
        }
      });
    }
  },

  setLanguage(lang) {
    this.currentLang = lang;

    // Update HTML attributes
    document.documentElement.setAttribute('lang', lang);

    // Set text direction (RTL for Farsi and Arabic, LTR for English)
    const dir = (lang === 'fa' || lang === 'ar') ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);

    // Update page title
    const titles = {
      fa: 'OTP سیگنال - ارسال پیامک تأیید تضمینی',
      en: 'Signal OTP - Guaranteed Verification SMS Service',
      ar: 'سيجنال OTP - خدمة رسائل التحقق المضمونة'
    };
    document.title = titles[lang];

    // Update current language display in header
    const currentLangSpan = document.querySelector('.current-lang');
    const langCodes = { fa: 'فا', en: 'EN', ar: 'ع' };
    if (currentLangSpan) {
      currentLangSpan.textContent = langCodes[lang];
    }

    // Update active button state for OLD buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      }
    });

    // Update active state for NEW dropdown options
    document.querySelectorAll('.lang-option').forEach(option => {
      option.classList.remove('active');
      if (option.getAttribute('data-lang') === lang) {
        option.classList.add('active');
      }
    });

    // Update header navigation text
    this.updateHeaderNav(lang);

    // Translate all elements
    this.translatePage(lang);

    // Save language preference
    localStorage.setItem('language', lang);
  },

  updateHeaderNav(lang) {
    const headerTranslations = translations[lang]?.header;
    if (!headerTranslations) return;

    // Update logo text
    const logoText = document.querySelector('.logo-text');
    if (logoText) logoText.textContent = headerTranslations.logo;

    // Update navigation links
    const navLinks = document.querySelectorAll('.nav-menu a, .mobile-nav a');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === '#features') link.textContent = headerTranslations.features;
      if (href === '#connect') link.textContent = headerTranslations.connect;
      if (href === '#why') link.textContent = headerTranslations.why;
    });

    // Update CTA button
    const ctaBtn = document.querySelector('.header-cta');
    if (ctaBtn) ctaBtn.textContent = headerTranslations.cta;
  },

  translatePage(lang) {
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.getTranslation(key, lang);

      if (translation) {
        element.textContent = translation;
      }
    });
  },

  getTranslation(key, lang) {
    const keys = key.split('.');
    let translation = translations[lang];

    for (const k of keys) {
      if (translation && translation[k]) {
        translation = translation[k];
      } else {
        return null;
      }
    }

    return translation;
  }
};

// Scroll to Top functionality
const scrollToTop = {
  init() {
    const scrollButton = document.querySelector('.scroll-to-top');

    if (!scrollButton) return;

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
      } else {
        scrollButton.classList.remove('visible');
      }
    });

    // Scroll to top when button is clicked
    scrollButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
};

// Test Page Functionality
const testPage = {
  currentStep: 'phone',
  testCount: 0,
  maxTests: 999999,
  countdownInterval: null,
  countdownSeconds: 30,
  phoneNumber: '',
  currentOTP: '',
  uuid: '',

  init() {
    // Only initialize if we're on the test page
    if (!document.querySelector('.test-form')) return;

    this.setupFormSteps();
    this.setupVerificationInputs();
    this.setupTestCounter();
    this.loadTestCount();
    this.setupTabs();
    this.setupModal();
  },

  setupFormSteps() {
    // Phone input step
    const phoneInput = document.getElementById('phone-input');
    const startMissedCallBtn = document.getElementById('start-missed-call');
    
    if (phoneInput && startMissedCallBtn) {
      startMissedCallBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const phone = phoneInput.value.trim();
        if (phone && this.validatePhoneNumber(phone)) {
          this.phoneNumber = phone;
          this.startMissedCallTest();
        } else {
          this.showErrorMessage('لطفاً یک شماره تلفن معتبر وارد کنید');
        }
      });
    }

    // Missed call verification
    const verifyMissedCallBtn = document.getElementById('verify-missed-call');
    if (verifyMissedCallBtn) {
      verifyMissedCallBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.verifyMissedCallCode();
      });
    }

    // Retry options
    const retryMissedCallBtn = document.getElementById('retry-missed-call');
    
    if (retryMissedCallBtn) {
      retryMissedCallBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.retryMissedCall();
      });
    }

    // Start new test
    const startNewTestBtn = document.getElementById('start-new-test');
    if (startNewTestBtn) {
      startNewTestBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.resetToPhoneStep();
      });
    }
    
    // Restart test button in countdown step
    const restartTestBtn = document.getElementById('restart-test');
    if (restartTestBtn) {
      restartTestBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.resetToPhoneStep();
      });
    }
  },

  validatePhoneNumber(phone) {
    // Simple phone number validation
    return /^[+]?[0-9\s\-\(\)]+$/.test(phone);
  },

  async startMissedCallTest() {
    if (this.testCount >= this.maxTests) {
      this.showError();
      return;
    }

    // Show loading state
    const startBtn = document.getElementById('start-missed-call');
    const originalText = startBtn.textContent;
    startBtn.textContent = 'در حال ارسال...';
    startBtn.disabled = true;

    try {
      // Call API to send missed call OTP
      const response = await OTPService.sendMissedCallOTP(this.phoneNumber);
      
      if (response.success) {
        // Log response for debugging
        console.log('Send OTP Response:', response);
        // Store UUID from response - handle different possible response structures
        console.log('Raw response data:', response.data);
        
        // Try different possible locations for UUID
        this.uuid = response.data.uuid || 
                   response.data.id || 
                   response.data.otp_id || 
                   response.data.data?.uuid || 
                   response.data.data?.id || 
                   response.data.result?.uuid || 
                   response.data.result?.id || 
                   '';
        
        console.log('Extracted UUID:', this.uuid);
        
        // Update test counter
        this.testCount++;
        this.saveTestCount();
        this.updateTestCounter();

        // Show countdown step
        this.showStep('countdown');
        
        // Start countdown
        this.startCountdown();
      } else {
        this.showErrorMessage('خطا در ارسال تماس بی‌پاسخ: ' + response.error);
      }
    } catch (error) {
      this.showErrorMessage('خطا در ارسال تماس بی‌پاسخ: ' + error.message);
    } finally {
      // Reset button state
      startBtn.textContent = originalText;
      startBtn.disabled = false;
    }
  },

  startCountdown() {
    const timerText = document.querySelector('.timer-text');
    const timerProgress = document.querySelector('.timer-progress');
    
    // Reset countdown
    this.countdownSeconds = 30;
    if (timerText) timerText.textContent = this.countdownSeconds;
    
    // Update progress circle
    if (timerProgress) {
      const circumference = 2 * Math.PI * 45;
      timerProgress.style.strokeDasharray = circumference;
      timerProgress.style.strokeDashoffset = 0;
    }
    
    // Clear any existing interval
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    
    // Start new interval
    this.countdownInterval = setInterval(() => {
      this.countdownSeconds--;
      
      if (timerText) timerText.textContent = this.countdownSeconds;
      
      // Update progress circle
      if (timerProgress) {
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (this.countdownSeconds / 30) * circumference;
        timerProgress.style.strokeDashoffset = offset;
      }
      
      if (this.countdownSeconds <= 0) {
        clearInterval(this.countdownInterval);
        this.showMissedCallResult();
      }
    }, 1000);
  },

  showMissedCallResult() {
    // Stop countdown
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    
    // Show error message and reset to phone step
    this.showErrorMessage('زمان دریافت کد به پایان رسید. لطفاً دوباره تلاش کنید.');
    setTimeout(() => {
      this.resetToPhoneStep();
    }, 3000);
  },

  async verifyMissedCallCode() {
    // Get the 4-digit code from input fields in the correct order
    const inputContainer = document.querySelector('.verify-inputs');
    let code = '';
    
    if (inputContainer) {
      // Get input fields in the exact order they appear in the DOM
      const inputs = inputContainer.children;
      console.log('Input fields in DOM order:');
      
      for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].classList && inputs[i].classList.contains('verify-digit')) {
          console.log(`Field ${i}:`, inputs[i].value);
          code += inputs[i].value;
        }
      }
    } else {
      // Fallback to querySelectorAll if container not found
      const verifyDigits = document.querySelectorAll('.verify-digit');
      console.log('Fallback - Input fields order and values:');
      verifyDigits.forEach((input, index) => {
        console.log(`Field ${index}:`, input.value);
        code += input.value;
      });
    }
    
    console.log('Collected code:', code);

    if (code.length !== 4) {
      this.showErrorMessage('لطفاً ۴ رقم کد را وارد کنید');
      return;
    }
    
    // Debug: Check if we have a UUID
    console.log('Current UUID in app:', this.uuid);
    if (!this.uuid) {
      this.showErrorMessage('خطا: UUID یافت نشد. لطفاً دوباره تلاش کنید.');
      return;
    }

    // Show loading state
    const verifyBtn = document.getElementById('verify-missed-call');
    const originalText = verifyBtn.textContent;
    verifyBtn.textContent = 'در حال تأیید...';
    verifyBtn.disabled = true;

    try {
      // Log verification details
      console.log('Verifying with UUID:', this.uuid, 'Code:', code);
      // Call API to verify OTP with UUID
      const response = await OTPService.verifyOTP(this.uuid, code);
      
      if (response.success) {
        // Add to history
        this.addToHistory('missed-call', 'success', 'pending');
        
        // Show success message
        const resultMessage = document.querySelector('.step-missed-result .result-message');
        if (resultMessage) {
          resultMessage.classList.remove('fail');
          resultMessage.classList.add('success');
          resultMessage.innerHTML = `
            <span class="status-icon success">✅</span>
            <p>${translations[this.currentLang]?.test?.verification_success || 'تأیید موفقیت‌آمیز!'}</p>
          `;
        }
        
        this.showSuccessMessage('تأیید موفقیت‌آمیز!');
      } else {
        this.showErrorMessage('تأیید ناموفق: ' + response.error);
        // Add to history as failed
        this.addToHistory('missed-call', 'fail', 'pending');
      }
    } catch (error) {
      this.showErrorMessage('خطا در تأیید کد: ' + error.message);
      // Add to history as failed
      this.addToHistory('missed-call', 'fail', 'pending');
    } finally {
      // Reset button state
      verifyBtn.textContent = originalText;
      verifyBtn.disabled = false;
    }
  },

  retryMissedCall() {
    if (this.testCount >= this.maxTests) {
      this.showError();
      return;
    }
    
    this.testCount++;
    this.uuid = '';
    this.saveTestCount();
    this.updateTestCounter();
    this.startCountdown();
    this.showStep('countdown');
  },

  resetToPhoneStep() {
    // Reset to initial state
    this.currentStep = 'phone';
    this.uuid = '';
    this.showStep('phone');
    
    // Clear phone input
    const phoneInput = document.getElementById('phone-input');
    if (phoneInput) phoneInput.value = '';
    
    // Reset verification inputs
    const verifyDigits = document.querySelectorAll('.verify-digit');
    verifyDigits.forEach(input => input.value = '');
    
    const otpInput = document.getElementById('otp-input');
    if (otpInput) otpInput.value = '';
  },

  showStep(step) {
    // Hide all steps
    const steps = document.querySelectorAll('.form-step');
    steps.forEach(stepEl => {
      stepEl.classList.remove('active');
      stepEl.classList.add('hidden');
    });
    
    // Show requested step
    const targetStep = document.querySelector(`.step-${step}`);
    if (targetStep) {
      targetStep.classList.add('active');
      targetStep.classList.remove('hidden');
      this.currentStep = step;
    }
  },

  setupVerificationInputs() {
    const verifyDigits = document.querySelectorAll('.verify-digit');
    
    verifyDigits.forEach((input, index) => {
      // Allow only numeric input
      input.addEventListener('input', (e) => {
        // Remove any non-numeric characters
        let value = e.target.value.replace(/[^0-9]/g, '');
        
        // Ensure only one digit
        if (value.length > 1) {
          value = value.slice(0, 1);
        }
        
        e.target.value = value;
        
        // Auto move to next input
        if (value.length === 1 && index < verifyDigits.length - 1) {
          verifyDigits[index + 1].focus();
        }
        
        // Check if all 4 digits are filled (for UI feedback)
        let allFilled = true;
        verifyDigits.forEach(digit => {
          if (digit.value === '') {
            allFilled = false;
          }
        });
        
        // Note: Manual verification required via verify button
      });

      // Handle Enter key press
      input.addEventListener('keydown', (e) => {
        // If Enter key is pressed and all 4 digits are filled
        if (e.key === 'Enter') {
          e.preventDefault();
          
          // Check if all digits are filled
          let allFilled = true;
          let code = '';
          verifyDigits.forEach(digit => {
            if (digit.value === '') {
              allFilled = false;
            } else {
              code += digit.value;
            }
          });
          
          if (allFilled && code.length === 4) {
            this.verifyMissedCallCode();
          }
        }
      });

      // Handle paste events
      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const paste = (e.clipboardData || window.clipboardData).getData('text');
        const cleanPaste = paste.replace(/[^0-9]/g, '').substring(0, 4);
        
        // Always distribute pasted digits starting from the first field to maintain correct order
        for (let i = 0; i < verifyDigits.length; i++) {
          if (i < cleanPaste.length) {
            // Ensure only one digit per field
            verifyDigits[i].value = cleanPaste[i].substring(0, 1);
          } else {
            // Clear remaining fields
            verifyDigits[i].value = '';
          }
        }
        
        // Focus on the next empty field or last field
        let nextIndex = cleanPaste.length;
        if (nextIndex >= verifyDigits.length) nextIndex = verifyDigits.length - 1;
        if (nextIndex < 0) nextIndex = 0;
        verifyDigits[nextIndex].focus();
        
        // Check if all 4 digits are filled (for UI feedback)
        let allFilled = true;
        verifyDigits.forEach(digit => {
          if (digit.value === '') {
            allFilled = false;
          }
        });
        
        // Note: Manual verification required via verify button
      });

      input.addEventListener('keydown', (e) => {
        // Prevent non-numeric keys (except for control keys)
        if (e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && 
            e.key !== 'Tab' && e.key !== 'Enter' && e.key !== 'Escape' && 
            !/^[0-9]$/.test(e.key)) {
          e.preventDefault();
        }
        
        // Handle backspace
        if (e.key === 'Backspace' && input.value === '' && index > 0) {
          verifyDigits[index - 1].focus();
        }
        
        // Handle arrow keys for navigation
        if (e.key === 'ArrowLeft' && index > 0) {
          verifyDigits[index - 1].focus();
          e.preventDefault();
        }
        
        if (e.key === 'ArrowRight' && index < verifyDigits.length - 1) {
          verifyDigits[index + 1].focus();
          e.preventDefault();
        }
        
        // Handle delete key
        if (e.key === 'Delete' && input.value === '' && index < verifyDigits.length - 1) {
          verifyDigits[index + 1].focus();
        }
      });
      
      // Select content on focus for easier editing
      input.addEventListener('focus', () => {
        input.select();
      });
    });
  },

  setupTestCounter() {
    // Initialize test counter display
    this.updateTestCounter();
  },

  loadTestCount() {
    const savedCount = localStorage.getItem('testCount');
    if (savedCount) {
      this.testCount = parseInt(savedCount);
    }
  },

  saveTestCount() {
    localStorage.setItem('testCount', this.testCount.toString());
  },

  updateTestCounter() {
    const counter = document.querySelector('.test-counter .count');
    if (counter) {
      counter.textContent = this.testCount;
    }
  },

  showError() {
    // Show error message
    this.showStep('phone');
    
    const errorMessage = document.querySelector('.error-message');
    if (errorMessage) {
      errorMessage.classList.remove('hidden');
      
      // Hide error after 3 seconds
      setTimeout(() => {
        errorMessage.classList.add('hidden');
      }, 3000);
    }
  },

  showSuccessMessage(message) {
    this.showModal('success', 'تأیید موفق', message);
  },

  showErrorMessage(message) {
    this.showModal('error', 'تأیید ناموفق', message);
  },

  addToHistory(testType, callStatus, messageStatus) {
    const historyTable = document.querySelector('.history-table');
    if (!historyTable) return;
    
    // Create new row
    const row = document.createElement('div');
    row.className = 'table-row';
    
    // Format phone number (mask all but last 4 digits)
    const maskedPhone = this.phoneNumber.replace(/\d(?=\d{4})/g, 'X');
    
    // Get current time
    const now = new Date();
    const timeString = now.toLocaleString('fa-IR');
    
    // Test type translation
    const testTypeText = testType === 'missed-call' ? 
      (translations[this.currentLang]?.test?.toggle?.missed_call || 'تماس بی‌پاسخ') : 
      (translations[this.currentLang]?.test?.toggle?.sms || 'پیامک');
    
    // Status translations
    const successText = translations[this.currentLang]?.test?.verification_success || 'موفق';
    const failText = translations[this.currentLang]?.test?.verification_failed || 'ناموفق';
    
    const callStatusText = callStatus === 'success' ? 
      `<span class="status-icon success">✅</span> ${successText}` : 
      (callStatus === 'fail' ? 
        `<span class="status-icon fail">❌</span> ${failText}` : 
        'در انتظار');
    
    const messageStatusText = messageStatus === 'success' ? 
      `<span class="status-icon success">✅</span> ${successText}` : 
      (messageStatus === 'fail' ? 
        `<span class="status-icon fail">❌</span> ${failText}` : 
        'در انتظار');
    
    row.innerHTML = `
      <span dir="ltr">${maskedPhone}</span>
      <span>${timeString}</span>
      <span>${testTypeText}</span>
      <span>${callStatusText}</span>
      <span>${messageStatusText}</span>
    `;
    
    // Add to table (after header)
    const header = historyTable.querySelector('.table-header');
    if (header) {
      header.parentNode.insertBefore(row, header.nextSibling);
    } else {
      historyTable.appendChild(row);
    }
  },

  showModal(type, title, message) {
    const modal = document.getElementById('otpModal');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    
    if (modal && modalIcon && modalTitle && modalMessage && modalCloseBtn) {
      // Set modal content based on type
      if (type === 'success') {
        modalIcon.textContent = '✓';
        modalIcon.className = 'modal-icon success';
      } else {
        modalIcon.textContent = '✗';
        modalIcon.className = 'modal-icon error';
      }
      
      modalTitle.textContent = title;
      modalMessage.textContent = message;
      
      // Show modal
      modal.style.display = 'flex';
      
      // Close modal when close button is clicked
      modalCloseBtn.onclick = () => {
        modal.style.display = 'none';
      };
      
      // Close modal when clicking outside of modal content
      modal.onclick = (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      };
      
      // Close modal with Escape key
      document.onkeydown = (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
          modal.style.display = 'none';
        }
      };
    }
  },

  setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        
        // Remove active class from all buttons and panes
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Show corresponding pane
        const targetPane = document.getElementById(`${tabId}-tab`);
        if (targetPane) {
          targetPane.classList.add('active');
        }
      });
    });
  },

  setupModal() {
    const modal = document.getElementById('otpModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    
    if (modal && modalCloseBtn) {
      // Close modal when close button is clicked
      modalCloseBtn.onclick = () => {
        modal.style.display = 'none';
      };
      
      // Close modal when clicking outside of modal content
      modal.onclick = (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      };
      
      // Close modal with Escape key
      document.onkeydown = (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
          modal.style.display = 'none';
        }
      };
    }
  }
};

// Initialize all functionality when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  headerNav.init();
  languageSwitcher.init();
  scrollToTop.init();
  testPage.init();
});