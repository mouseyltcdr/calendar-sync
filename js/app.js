
const calendar = document.getElementById('calendar');
const monthLabel = document.getElementById('month-label');

const newEventBtn = document.getElementById('new-event-btn');
const eventModal = document.getElementById('event-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const eventForm = document.getElementById('event-form');

const signInBtn = document.getElementById('sign-in-btn');
const signOutBtn = document.getElementById('sign-out-btn');

const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

const loadingOverlay = document.getElementById('loading-overlay');

let currentDate = new Date();

function showLoading() {
  loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
  loadingOverlay.classList.add('hidden');
}

function getEvents() {
  return JSON.parse(localStorage.getItem('calendar-events') || '[]');
}

function saveEvents(events) {
  localStorage.setItem(
    'calendar-events',
    JSON.stringify(events)
  );
}

function renderCalendar() {

  calendar.innerHTML = '';

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthLabel.textContent =
    currentDate.toLocaleString('default', {
      month: 'long',
      year: 'numeric'
    });

  const firstDay =
    new Date(year, month, 1).getDay();

  const daysInMonth =
    new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('div');
    calendar.appendChild(blank);
  }

  const events = getEvents();

  for (let day = 1; day <= daysInMonth; day++) {

    const cell = document.createElement('div');
    cell.className = 'calendar-cell';

    const label = document.createElement('div');
    label.className = 'calendar-day';
    label.textContent = day;

    cell.appendChild(label);

    const dateString =
      new Date(year, month, day)
        .toISOString()
        .split('T')[0];

    const dayEvents = events.filter(
      event => event.date === dateString
    );

    dayEvents.forEach(event => {

      const item = document.createElement('div');

      item.className = 'event-item';

      item.textContent =
        `${event.time} - ${event.title}`;

      cell.appendChild(item);
    });

    calendar.appendChild(cell);
  }
}

newEventBtn.addEventListener('click', () => {
  eventModal.showModal();
});

closeModalBtn.addEventListener('click', () => {
  eventModal.close();
});

eventForm.addEventListener('submit', event => {

  event.preventDefault();

  const title =
    document.getElementById('event-title').value;

  const date =
    document.getElementById('event-date').value;

  const time =
    document.getElementById('event-time').value;

  const events = getEvents();

  events.push({
    id: crypto.randomUUID(),
    title,
    date,
    time
  });

  saveEvents(events);

  renderCalendar();

  eventForm.reset();

  eventModal.close();
});

signInBtn.addEventListener('click', () => {

  localStorage.setItem('signed-in', 'true');

  signInBtn.classList.add('hidden');

  signOutBtn.classList.remove('hidden');

  alert('Signed in successfully');
});

signOutBtn.addEventListener('click', () => {

  localStorage.removeItem('signed-in');

  signOutBtn.classList.add('hidden');

  signInBtn.classList.remove('hidden');

  alert('Signed out');
});

prevBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

window.addEventListener('load', async () => {

  showLoading();

  try {

    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.register('./sw.js');
    }

    const signedIn =
      localStorage.getItem('signed-in');

    if (signedIn) {
      signInBtn.classList.add('hidden');
      signOutBtn.classList.remove('hidden');
    }

    renderCalendar();

  } finally {

    setTimeout(() => {
      hideLoading();
    }, 500);
  }
});
