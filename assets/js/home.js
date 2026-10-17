'use strict';

const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const lightbox = document.querySelector('.lightbox');
const themeStylesheet = document.querySelector('#theme-stylesheet');
const themeToggle = document.querySelector('#theme-toggle');
const themeToggleLabel = themeToggle.querySelector('.theme-toggle-label');
const themeToggleIcon = themeToggle.querySelector('.theme-toggle-icon');
const themeColor = document.querySelector('meta[name="theme-color"]');

document.querySelectorAll('.standings-tabs').forEach(tabList => {
  const tabs = Array.from(tabList.querySelectorAll('.standings-tab'));
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateStandingsTab(tabs, tab));
    tab.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextTab = tabs[(index + direction + tabs.length) % tabs.length];
      activateStandingsTab(tabs, nextTab);
      nextTab.focus();
    });
  });
});

function activateStandingsTab(tabs, selectedTab) {
  tabs.forEach(tab => {
    const selected = tab === selectedTab;
    tab.classList.toggle('active', selected);
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
  });
}

function setTheme(theme) {
  const isLight = theme === 'light';
  themeStylesheet.href = isLight ? '../assets/css/light-theme.css' : '../assets/css/dark-theme.css';
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute('aria-pressed', String(isLight));
  themeToggleLabel.textContent = isLight ? 'Dark mode' : 'Light mode';
  themeToggleIcon.textContent = isLight ? '☾' : '☼';
  themeColor.content = isLight ? '#f4f1ec' : '#101010';
  localStorage.setItem('athletics-theme', theme);
}

setTheme(localStorage.getItem('athletics-theme') === 'light' ? 'light' : 'dark');

themeToggle.addEventListener('click', () => {
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  siteNav.classList.remove('open');
  document.body.classList.remove('menu-open');
}

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  siteNav.classList.toggle('open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 820) closeMenu();
});

siteNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const image = item.querySelector('img');
    lightbox.querySelector('img').src = image.src;
    lightbox.querySelector('img').alt = image.alt;
    lightbox.querySelector('p').textContent = item.querySelector('span').textContent;
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    lightbox.querySelector('.lightbox-close').focus();
  });
});

const eventCards = Array.from(document.querySelectorAll('.event-card'));
const eventDetailsPanel = document.querySelector('#event-details-panel');
const eventRecordGroups = eventDetailsPanel.querySelector('.event-record-groups');
const eventRecordsEmpty = eventDetailsPanel.querySelector('.event-records-empty');
const eventRecordStatus = eventDetailsPanel.querySelector('.event-record-status');
const eventDisciplineMap = {
  sprints: ['100m', '200m', '400m'],
  distance: ['800m', '1500m', '5000m'],
  hurdles: ['110m H', '400m H', '100m H'],
  relays: ['4×100m Relay', '4×400m Relay', '4×400m Mixed Relay'],
  jumps: ['Long Jump', 'Triple Jump', 'High Jump', 'Pole Vault'],
  throws: ['Shot Put', 'Discus', 'Javelin', 'Hammer'],
};
const eventRecordData = window.ATHLETICS_RECORD_DATA;

async function loadSupabaseRecords() {
  const config = window.ATHLETICS_SUPABASE_CONFIG;
  if (!config?.url || !config?.anonKey) return;
  if (!window.supabase?.createClient) {
    console.error('The Supabase client did not load; saved athletics records could not be fetched.');
    eventRecordStatus.textContent = 'Some newer records could not be loaded. Showing records already on this page.';
    eventRecordStatus.dataset.state = 'error';
    eventRecordStatus.hidden = false;
    return;
  }

  const client = window.supabase.createClient(config.url, config.anonKey);
  const { data, error } = await client
    .from('athletics_records')
    .select('team, record_type, event, athlete, record_label, college, performance')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Unable to load athletics records from Supabase.', error);
    eventRecordStatus.textContent = 'Some newer records could not be loaded. Showing records already on this page.';
    eventRecordStatus.dataset.state = 'error';
    eventRecordStatus.hidden = false;
    return;
  }

  Object.values(eventRecordData).forEach(team => {
    team.interIit = [];
    team.institute = [];
  });
  data.forEach(record => {
    if (record.record_type !== 'inter_iit' && record.record_type !== 'institute') return;
    const category = record.record_type === 'inter_iit' ? 'interIit' : 'institute';
    eventRecordData[record.team][category].push({
      event: record.event,
      athlete: record.athlete,
      ...(record.record_type === 'inter_iit'
        ? { year: record.record_label }
        : { competition: record.record_label }),
      college: record.college,
      performance: record.performance,
    });
  });

  const openCard = eventCards.find(card => card.getAttribute('aria-expanded') === 'true');
  if (openCard) renderEventRecords(openCard);
}

loadSupabaseRecords().catch(error => {
  console.error('Unable to initialize Supabase athletics records.', error);
  eventRecordStatus.textContent = 'Some newer records could not be loaded. Showing records already on this page.';
  eventRecordStatus.dataset.state = 'error';
  eventRecordStatus.hidden = false;
});

function renderRecordRows(target, records, eventNames, recordType) {
  target.replaceChildren();
  const matchingRecords = records.filter(record => eventNames.includes(record.event));
  if (matchingRecords.length === 0) {
    const row = document.createElement('tr');
    const message = document.createElement('td');
    message.colSpan = 5;
    message.textContent = 'No record listed for this event.';
    row.append(message);
    target.append(row);
    return;
  }

  matchingRecords.forEach(record => {
    const row = document.createElement('tr');
    const eventCell = document.createElement('th');
    eventCell.scope = 'row';
    eventCell.textContent = record.event;
    row.append(eventCell);
    [record.athlete, recordType === 'interIit' ? record.year : record.competition, record.college, record.performance]
      .forEach(value => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      });
    target.append(row);
  });
}

function renderEventRecords(card) {
  eventCards.forEach(eventCard => {
    eventCard.setAttribute('aria-expanded', String(eventCard === card));
  });
  eventDetailsPanel.querySelector('#event-details-title').textContent = card.querySelector('h3').textContent;
  const eventNames = eventDisciplineMap[card.dataset.event];
  const renderTeamRecords = team => {
    renderRecordRows(eventDetailsPanel.querySelector(`#${team}-inter-iit-records`), eventRecordData[team].interIit, eventNames, 'interIit');
    renderRecordRows(eventDetailsPanel.querySelector(`#${team}-institute-records`), eventRecordData[team].institute, eventNames, 'institute');
  };
  renderTeamRecords('boys');
  renderTeamRecords('girls');
  eventRecordsEmpty.hidden = true;
  eventRecordGroups.hidden = false;
  eventDetailsPanel.hidden = false;

  eventDetailsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  document.querySelector('.event-details-close').focus({ preventScroll: true });
}

eventCards.forEach(card => {
  card.addEventListener('click', () => renderEventRecords(card));
});

document.querySelector('.event-details-close').addEventListener('click', () => {
  eventDetailsPanel.hidden = true;
  eventCards.forEach(card => card.setAttribute('aria-expanded', 'false'));
});

function closeLightbox() {
  lightbox.hidden = true;
  document.body.classList.remove('lightbox-open');
}

lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', event => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeMenu();
    if (!lightbox.hidden) closeLightbox();
  }
});

document.querySelector('#year').textContent = new Date().getFullYear();

document.querySelectorAll('.medal-season, .achievement-season').forEach(season => {
  renderMedalDetails(season, season.dataset);
});

document.querySelectorAll('.season-history').forEach(history => {
  const seasons = Array.from(history.querySelectorAll('.achievement-season, .medal-season'));
  const showMore = history.querySelector('.show-more-seasons');
  if (!showMore || seasons.length < 2) {
    if (showMore) showMore.hidden = true;
    return;
  }

  seasons.slice(0, -1).forEach(season => {
    season.hidden = true;
  });
  showMore.textContent = `Show ${seasons.length - 1} older years`;

  showMore.addEventListener('click', () => {
    const expanded = showMore.getAttribute('aria-expanded') === 'true';
    seasons.slice(0, -1).forEach(season => {
      season.hidden = expanded;
    });
    showMore.setAttribute('aria-expanded', String(!expanded));
    showMore.textContent = expanded ? `Show ${seasons.length - 1} older years` : 'Show fewer years';
  });
});

function renderMedalDetails(container, season) {
  const medalTypes = [
    ['gold', 'Gold medals'],
    ['silver', 'Silver medals'],
    ['bronze', 'Bronze medals'],
    ['fourth', '4th-place finishes'],
    ['records', 'Records set'],
  ];
  const details = document.createElement('div');
  details.className = 'achievement-details';
  details.setAttribute('aria-label', `${season.year} medal and record totals`);

  medalTypes.forEach(([key, label]) => {
    const value = season[key];
    const item = document.createElement('div');
    item.className = 'achievement-detail';
    const name = document.createElement('span');
    name.textContent = label;
    const total = document.createElement('strong');
    total.textContent = value === undefined || value === ''
      ? 'Not available yet'
      : key === 'records' && value === '0'
        ? 'None'
        : value;
    item.append(name, total);
    details.append(item);
  });

  container.append(details);
}

if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('js-ready');
}
