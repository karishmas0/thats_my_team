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
const eventDisciplineMap = {
  sprints: ['100m', '200m', '400m'],
  distance: ['800m', '1500m', '5000m'],
  hurdles: ['110m H', '400m H', '100m H'],
  relays: ['4×100m Relay', '4×400m Relay', '4×400m Mixed Relay'],
  jumps: ['Long Jump', 'Triple Jump', 'High Jump', 'Pole Vault'],
  throws: ['Shot Put', 'Discus', 'Javelin', 'Hammer'],
};
const eventRecordData = {
  boys: {
    interIit: [
      { event: '100m', athlete: 'Shivam Singh', year: '2019', college: 'IIT Kharagpur', performance: '10.8s' },
      { event: '100m', athlete: 'Pawan Dahiya', year: '2017', college: 'IIT Bombay', performance: '10.8s' },
      { event: '100m', athlete: 'Dileep Pudi', year: '2016', college: 'IIT Delhi', performance: '10.8s' },
      { event: '200m', athlete: 'Pawan Dahiya', year: '2017', college: 'IIT Bombay', performance: '22.0s' },
      { event: '400m', athlete: 'Pawan Dahiya', year: '2017', college: 'IIT Bombay', performance: '49.1s' },
      { event: '800m', athlete: 'Dileep Pudi', year: '2017', college: 'IIT Delhi', performance: '1:56.4s' },
      { event: '1500m', athlete: 'C George', year: '1980', college: 'IIT Madras', performance: '4:04.3s' },
      { event: '5000m', athlete: 'Narendra Kumar Khichar', year: '2019', college: 'IIT Kharagpur', performance: '16:06.2s' },
      { event: '110m H', athlete: 'Narendra Kumar', year: '1972', college: 'IIT Madras', performance: '15.6s' },
      { event: '400m H', athlete: 'Narendra Kumar', year: '1972', college: 'IIT Madras', performance: '56.0s' },
      { event: 'Long Jump', athlete: 'Saurabhdeep Singh Deopuri', year: '2018', college: 'IIT Delhi', performance: '6.75m' },
      { event: 'Triple Jump', athlete: 'Shubham Yadav', year: '2019', college: 'IIT Delhi', performance: '14.16m' },
      { event: 'High Jump', athlete: 'CK Soorya', year: '2024', college: 'IIT Guwahati', performance: '1.95m' },
      { event: 'Pole Vault', athlete: 'Gaurav Yadav', year: '2025', college: 'IIT Madras', performance: '4.00m' },
      { event: 'Shot Put', athlete: 'Dalit Singh', year: '1973', college: 'IIT Delhi', performance: '13.33m' },
      { event: 'Discus', athlete: 'Ankit Lakhlan', year: '2022', college: 'IIT Roorkee', performance: '40.97m' },
      { event: 'Javelin', athlete: 'Amgoth Ganesh', year: '2025', college: 'IIT Roorkee', performance: '57.07m' },
      { event: 'Hammer', athlete: 'Aman Pal', year: '2017', college: 'IIT Roorkee', performance: '45.3m' },
      { event: '4×100m Relay', athlete: 'Gnaneshwar Munoth · Md Zaid · Indrajeet Kumar · Rohan N', year: '2025', college: 'IIT Kharagpur', performance: '43.17s' },
      { event: '4×400m Relay', athlete: 'Ainsley Fernandes · Shlok Rathi · Raj Singh Yadav · Amit Kumar', year: '2025', college: 'IIT Bombay', performance: '3:24.60s' },
    ],
    institute: [
      { event: '100m', athlete: 'Deepak Jorwal (Y14)', competition: "Inter IIT'17", college: 'IIT Madras', performance: '11.0s' },
      { event: '200m', athlete: 'Neeli Ajay Chandra (Y16)', competition: "Inter IIT'19", college: 'IIT Kharagpur', performance: '22.3s' },
      { event: '400m', athlete: 'Neeli Ajay Chandra (Y16)', competition: "Inter IIT'19", college: 'IIT Kharagpur', performance: '49.6s' },
      { event: '800m', athlete: 'Jaswinder Singh (Y15)', competition: "Inter IIT'17", college: 'IIT Madras', performance: '1:56.9s' },
      { event: '1500m', athlete: 'Jaswinder Singh (Y15)', competition: "Udghosh'17", college: 'IIT Kanpur', performance: '4:16.00s' },
      { event: '5000m', athlete: 'Dhananjay De (Y19)', competition: "Inter IIT'24", college: 'IIT Indore', performance: '16:09.43s' },
      { event: '110m H', athlete: 'Yuvraj Singh Khare (Y21)', competition: "Udghosh'25", college: 'IIT Kanpur', performance: '15.69s' },
      { event: '400m H', athlete: 'Akshat Verma', competition: "Spardha'15", college: 'IIT BHU', performance: '57.0s' },
      { event: 'Long Jump', athlete: 'M Surya Prakash', competition: "Udghosh'14", college: 'IIT Kanpur', performance: '6.43m' },
      { event: 'Triple Jump', athlete: 'Akshat Verma', competition: "Udghosh'15", college: 'IIT Kanpur', performance: '13.51m' },
      { event: 'High Jump', athlete: 'Lokesh Yadav (Y14)', competition: "Inter IIT'18", college: 'IIT Guwahati', performance: '1.84m' },
      { event: 'Pole Vault', athlete: 'Sagar Yadav (Y14)', competition: "Inter IIT'17", college: 'IIT Madras', performance: '3.70m' },
      { event: 'Shot Put', athlete: 'Shubham Yadav (Y12)', competition: "Sportech'16", college: 'IIT Delhi', performance: '12.3m' },
      { event: 'Discus', athlete: 'Balamurugan Ganesan', competition: "Inter IIT'18", college: 'IIT Guwahati', performance: '36.5m' },
      { event: 'Javelin', athlete: 'Shivam Kumar', competition: "Inter IIT'14", college: 'IIT Bombay', performance: '55.54m' },
      { event: 'Hammer', athlete: 'Shubham Yadav (Y12)', competition: "Sportech'16", college: 'IIT Delhi', performance: '42m' },
      { event: '4×100m Relay', athlete: 'Neeli Ajay Chandra (Y16) · Mohit · Deepak Jorwal (Y14) · Pranav', competition: "Inter IIT'17", college: 'IIT Madras', performance: '43.75s' },
      { event: '4×400m Relay', athlete: 'Sachin Nehra (Y18) · Abhijeet (Y17) · Bhaskar Lamba (Y18) · Neeli Ajay Chandra (Y16)', competition: "Inter IIT'19", college: 'IIT Kharagpur', performance: '3:24.8s' },
    ],
  },
  girls: {
    interIit: [
      { event: '100m', athlete: 'Sanjana Reddy', year: '2025', college: 'IIT Kharagpur', performance: '13.12s' },
      { event: '200m', athlete: 'Sanjana Reddy', year: '2025', college: 'IIT Kharagpur', performance: '27.49s' },
      { event: '400m', athlete: 'Sanjana Reddy', year: '2025', college: 'IIT Kharagpur', performance: '1:01.75s' },
      { event: '800m', athlete: 'Lavanya', year: '2024', college: 'IIT Roorkee', performance: '2:26.11s' },
      { event: '1500m', athlete: 'Lavanya', year: '2024', college: 'IIT Roorkee', performance: '5:20.32s' },
      { event: '100m H', athlete: 'Saga Biju Lona', year: '2025', college: 'IIT Madras', performance: '18.50s' },
      { event: 'Long Jump', athlete: 'Karishma Singh', year: '2025', college: 'IIT Kanpur', performance: '4.99m' },
      { event: 'High Jump', athlete: 'Karunya Bhaskar', year: '2017', college: 'IIT Bombay', performance: '1.41m' },
      { event: 'Shot Put', athlete: 'Anjali Kumari', year: '2023', college: 'IIT Delhi', performance: '10.23m' },
      { event: 'Discus', athlete: 'Anjali Kumari', year: '2023', college: 'IIT Delhi', performance: '35.26m' },
      { event: 'Javelin', athlete: 'Tanuja Painkra', year: '2024', college: 'IIT Guwahati', performance: '28.51m' },
      { event: '4×100m Relay', athlete: 'Biri Yachu · Jangili Poojitha · Paligiri Meghana · Sanjana Reddy', year: '2025', college: 'IIT Kharagpur', performance: '54.35s' },
      { event: '4×400m Relay', athlete: 'Biri Yachu · Paligiri Meghana · Jangili Poojitha · Sanjana Reddy', year: '2025', college: 'IIT Kharagpur', performance: '4:21.78s' },
      { event: '4×400m Mixed Relay', athlete: 'Indrajeet Kumar · Poojitha Jangili · Gnaneshwar Munoth · Sanjana Reddy', year: '2025', college: 'IIT Kharagpur', performance: '3:49.44s' },
    ],
    institute: [
      { event: '100m', athlete: 'Karishma Singh (Y24)', competition: "Sportech'26", college: 'IIT Delhi', performance: '13.66s' },
      { event: '200m', athlete: 'Mutyala Devi (Y12)', competition: "Inter IIT'13", college: 'IIT Guwahati', performance: '28.1s' },
      { event: '400m', athlete: 'Mutyala Devi (Y12)', competition: "Inter IIT'13", college: 'IIT Guwahati', performance: '1:07.2s' },
      { event: '800m', athlete: 'Asha Burdak (Y15)', competition: "Inter IIT'17", college: 'IIT Madras', performance: '2:42.0s' },
      { event: '1500m', athlete: 'Meghna Jakhar (Y18)', competition: "Inter IIT'19", college: 'IIT Kharagpur', performance: '5:31.7s' },
      { event: '100m H', athlete: 'Karishma Singh (Y24)', competition: "Sportech'26", college: 'IIT Delhi', performance: '18.42s' },
      { event: 'Long Jump', athlete: 'Karishma Singh (Y24)', competition: "Inter IIT'25", college: 'IIT Hyderabad', performance: '4.99m' },
      { event: 'High Jump', athlete: 'Mounika (Y25)', competition: "Sportech'26", college: 'IIT Delhi', performance: '1.41m' },
      { event: 'Shot Put', athlete: 'Kavita Yadav', competition: "Inter IIT'17", college: 'IIT Madras', performance: '9.02m' },
      { event: 'Discus', athlete: 'Arpita Verma (Y25)', competition: "Udghosh'26", college: 'IIT Kanpur', performance: '26.9m' },
      { event: 'Javelin', athlete: 'Arpita Verma (Y25)', competition: "Udghosh'26", college: 'IIT Kanpur', performance: '27.51m' },
      { event: 'Hammer', athlete: 'Meenakshi Meena (Y25)', competition: "Udghosh'26", college: 'IIT Kanpur', performance: '25.57m' },
      { event: '4×100m Relay', athlete: 'Aradhana Ananya (Y25) · Priyanshi Meena (Y24) · Karishma Singh (Y24)', competition: "Inter IIT'25", college: 'IIT Hyderabad', performance: '55.28s' },
      { event: '4×400m Relay', athlete: 'Priyanshi Meena (Y24) · P Movika (Y23) · Samiera R Nair (Y23) · Karishma Singh (Y24)', competition: "Inter IIT'25", college: 'IIT Hyderabad', performance: '4:34.22s' },
      { event: '4×400m Mixed Relay', athlete: 'Anuj Kumar Gupta (Y23) · Priyanshi Meena (Y24) · Anukalp Raj (Y22) · Karishma Singh (Y23)', competition: "Inter IIT'25", college: 'IIT Hyderabad', performance: '4:04.62s' },
    ],
  },
};

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

eventCards.forEach(card => {
  card.addEventListener('click', () => {
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
  });
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
