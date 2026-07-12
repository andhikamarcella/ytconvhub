(() => {
  'use strict';

  const THEME_KEY = 'ytconv_hub_theme';
  const themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
  const root = document.documentElement;

  const services = [
    {
      id: 'converter', number: '01', name: 'Converter', category: 'start',
      url: 'https://ytconv.onrender.com/',
      description: 'Unduh audio atau video dari layanan yang didukung.',
      meta: 'MP3 · MP4 · proses utama',
      keywords: 'download unduh mp3 mp4 youtube video audio converter mulai',
      icon: '<path d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14"/>'
    },
    {
      id: 'guide', number: '02', name: 'Guide', category: 'learn',
      url: 'https://ytconvguide.vercel.app/',
      description: 'Tutorial langkah demi langkah untuk Windows, Linux, Android, dan macOS.',
      meta: 'Pemula · instalasi · perangkat',
      keywords: 'panduan tutorial windows linux ubuntu android termux macos install ytdlp ffmpeg deno',
      icon: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Zm0 0v16M8 7h8M8 11h7"/>'
    },
    {
      id: 'docs', number: '03', name: 'Docs', category: 'learn',
      url: 'https://ytconvdocs.vercel.app/',
      description: 'Penjelasan fitur, format, cookies, dan cara kerja YTConv.',
      meta: 'Referensi · fitur · teknis',
      keywords: 'docs dokumentasi fitur format cookies api teknis referensi cara kerja',
      icon: '<path d="M7 3h7l4 4v14H7V3Zm7 0v5h5M10 12h5M10 16h5"/>'
    },
    {
      id: 'status', number: '04', name: 'Status', category: 'monitor',
      url: 'https://ytconvstatus.vercel.app/',
      description: 'Cek apakah Converter, Guide, Docs, Tools, atau Help sedang bermasalah.',
      meta: 'Kondisi layanan · respons · insiden',
      keywords: 'status down offline gangguan server uptime lambat error layanan',
      icon: '<path d="M4 18V9m5 9V5m5 13v-7m5 7V3"/>'
    },
    {
      id: 'tools', number: '05', name: 'Tools', category: 'start',
      url: 'https://ytconvtools.vercel.app/',
      description: 'Bersihkan URL, ambil ID video, cek thumbnail, dan buat command yt-dlp.',
      meta: 'Link · command · thumbnail',
      keywords: 'tools alat command generator ytdlp clean link url thumbnail id video bitrate ukuran',
      icon: '<path d="m14.7 6.3 3-3a4.2 4.2 0 0 1-5.5 5.5L6 15l-3 6 6-3 6.2-6.2a4.2 4.2 0 0 1-.5-5.5Z"/>'
    },
    {
      id: 'help', number: '06', name: 'Help Center', category: 'support',
      url: 'https://ytconvhelp.vercel.app/',
      description: 'Cari solusi berdasarkan pesan error atau tempel log yang muncul.',
      meta: '403 · 429 · cookies · FFmpeg',
      keywords: 'help bantuan error gagal 403 429 forbidden cookies ffmpeg video unavailable tidak ada suara log',
      icon: '<path d="M9.5 9a2.7 2.7 0 1 1 4.4 2.1c-1.2 1-1.9 1.4-1.9 2.9M12 18h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"/>'
    },
    {
      id: 'pulse', number: '07', name: 'Pulse', category: 'monitor',
      url: 'https://ytconvpulse.vercel.app/',
      description: 'Lihat update terbaru dan kompatibilitas platform dalam satu papan.',
      meta: 'Updates · compatibility · platform',
      keywords: 'pulse update updates compatibility kompatibilitas platform youtube tiktok instagram release ytdlp',
      icon: '<path d="M3 12h4l2.2-6 4.2 12 2.1-6H21"/>'
    }
  ];

  const searchAliases = [
    { title: 'Solusi error 403', description: 'Buka artikel bantuan untuk HTTP 403.', url: 'https://ytconvhelp.vercel.app/', keywords: '403 forbidden cookies error gagal' },
    { title: 'Solusi limit 429', description: 'Cari penyebab terlalu banyak permintaan.', url: 'https://ytconvhelp.vercel.app/', keywords: '429 rate limit terlalu banyak permintaan' },
    { title: 'Panduan Android', description: 'Pasang Termux dan simpan ke folder Download.', url: 'https://ytconvguide.vercel.app/', keywords: 'android termux hp internal download' },
    { title: 'Panduan Windows', description: 'Pasang yt-dlp, FFmpeg, dan Deno.', url: 'https://ytconvguide.vercel.app/', keywords: 'windows cmd powershell install' },
    { title: 'Cara memakai cookies', description: 'Lihat cara ekspor cookies dengan aman.', url: 'https://ytconvdocs.vercel.app/', keywords: 'cookies cookie editor login extension netscape' },
    { title: 'Buat command yt-dlp', description: 'Generator command sesuai perangkat.', url: 'https://ytconvtools.vercel.app/', keywords: 'command generator ytdlp mp3 mp4' }
  ];

  let activeFilter = 'all';
  let selectedSearchIndex = -1;
  let currentResults = [];

  const serviceList = document.getElementById('service-list');
  const emptyState = document.getElementById('empty-state');
  const searchInput = document.getElementById('hub-search');
  const searchResults = document.getElementById('search-results');
  const searchWrap = document.getElementById('search-wrap');

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function readStoredTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch { return null; }
  }

  function writeStoredTheme(value) {
    try { localStorage.setItem(THEME_KEY, value); } catch {}
  }

  function applyTheme(choice) {
    const resolved = choice === 'auto' ? (themeMedia.matches ? 'dark' : 'light') : choice;
    root.dataset.theme = choice;
    root.dataset.resolvedTheme = resolved;
    document.querySelectorAll('[data-theme-choice]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === choice));
    });
  }

  function setupTheme() {
    const stored = readStoredTheme();
    const initial = ['light', 'dark', 'auto'].includes(stored) ? stored : 'auto';
    applyTheme(initial);

    document.querySelectorAll('[data-theme-choice]').forEach((button) => {
      button.addEventListener('click', () => {
        const choice = button.dataset.themeChoice;
        writeStoredTheme(choice);
        applyTheme(choice);
      });
    });

    themeMedia.addEventListener?.('change', () => {
      if ((readStoredTheme() || 'auto') === 'auto') applyTheme('auto');
    });
  }

  function serviceCard(service) {
    return `
      <a class="service-card" href="${service.url}" data-service-id="${service.id}" data-category="${service.category}">
        <span class="service-number">${service.number}</span>
        <span class="service-title">
          <span class="service-icon" aria-hidden="true"><svg viewBox="0 0 24 24">${service.icon}</svg></span>
          <strong>${escapeHtml(service.name)}</strong>
        </span>
        <span class="service-description">${escapeHtml(service.description)}<small>${escapeHtml(service.meta)}</small></span>
        <span class="service-open"><span>Buka</span><span aria-hidden="true">↗</span></span>
      </a>`;
  }

  function renderServices() {
    const query = searchInput.value.trim().toLowerCase();
    const visible = services.filter((service) => {
      const filterMatch = activeFilter === 'all' || service.category === activeFilter;
      const queryMatch = !query || `${service.name} ${service.description} ${service.meta} ${service.keywords}`.toLowerCase().includes(query);
      return filterMatch && queryMatch;
    });
    serviceList.innerHTML = visible.map(serviceCard).join('');
    emptyState.hidden = visible.length > 0;
  }

  function buildSearchResults(query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    const serviceMatches = services
      .filter((service) => `${service.name} ${service.description} ${service.meta} ${service.keywords}`.toLowerCase().includes(normalized))
      .map((service) => ({
        code: service.number,
        title: service.name,
        description: service.description,
        url: service.url
      }));

    const aliasMatches = searchAliases
      .filter((item) => `${item.title} ${item.description} ${item.keywords}`.toLowerCase().includes(normalized))
      .map((item, index) => ({ code: `S${index + 1}`, ...item }));

    const unique = [...aliasMatches, ...serviceMatches].filter((item, index, array) =>
      array.findIndex((candidate) => candidate.title === item.title && candidate.url === item.url) === index
    );
    return unique.slice(0, 8);
  }

  function drawSearchResults() {
    const query = searchInput.value;
    currentResults = buildSearchResults(query);
    selectedSearchIndex = -1;

    if (!query.trim()) {
      searchResults.hidden = true;
      searchInput.setAttribute('aria-expanded', 'false');
      return;
    }

    if (!currentResults.length) {
      searchResults.innerHTML = '<div class="search-empty">Belum ketemu. Coba kata yang lebih singkat, misalnya “403”, “Android”, atau “cookies”.</div>';
    } else {
      searchResults.innerHTML = currentResults.map((item, index) => `
        <a class="search-result" role="option" aria-selected="false" data-result-index="${index}" href="${item.url}">
          <span class="result-code">${escapeHtml(item.code)}</span>
          <span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.description)}</small></span>
          <span aria-hidden="true">↗</span>
        </a>`).join('');
    }

    searchResults.hidden = false;
    searchInput.setAttribute('aria-expanded', 'true');
  }

  function selectSearchResult(nextIndex) {
    const items = [...searchResults.querySelectorAll('.search-result')];
    if (!items.length) return;
    selectedSearchIndex = (nextIndex + items.length) % items.length;
    items.forEach((item, index) => {
      const selected = index === selectedSearchIndex;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-selected', String(selected));
      if (selected) item.scrollIntoView({ block: 'nearest' });
    });
  }

  function setupSearch() {
    searchInput.addEventListener('input', () => {
      renderServices();
      drawSearchResults();
    });

    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        selectSearchResult(selectedSearchIndex + 1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        selectSearchResult(selectedSearchIndex - 1);
      } else if (event.key === 'Enter' && currentResults.length) {
        event.preventDefault();
        const target = currentResults[selectedSearchIndex >= 0 ? selectedSearchIndex : 0];
        window.location.href = target.url;
      } else if (event.key === 'Escape') {
        searchResults.hidden = true;
        searchInput.setAttribute('aria-expanded', 'false');
        searchInput.blur();
      }
    });

    document.querySelectorAll('[data-query]').forEach((button) => {
      button.addEventListener('click', () => {
        searchInput.value = button.dataset.query;
        searchInput.focus();
        renderServices();
        drawSearchResults();
      });
    });

    document.addEventListener('keydown', (event) => {
      const target = event.target;
      const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
      if (event.key === '/' && !typing) {
        event.preventDefault();
        searchInput.focus();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInput.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (!searchWrap.contains(event.target)) {
        searchResults.hidden = true;
        searchInput.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function setupFilters() {
    document.querySelectorAll('[data-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        activeFilter = button.dataset.filter;
        document.querySelectorAll('[data-filter]').forEach((item) => {
          const active = item === button;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        renderServices();
      });
    });
  }

  function loadAnalytics() {
    const script = document.createElement('script');
    script.defer = true;
    script.src = '/_vercel/insights/script.js';
    document.head.appendChild(script);
  }

  setupTheme();
  setupSearch();
  setupFilters();
  renderServices();
  loadAnalytics();
})();
