import { supabase } from './supabase.js';

/*
|--------------------------------------------------------------------------
| ELEMENTS
|--------------------------------------------------------------------------
*/

const calendar =
  document.getElementById('calendar');

const monthLabel =
  document.getElementById('month-label');

const newEventBtn =
  document.getElementById('new-event-btn');

const eventModal =
  document.getElementById('event-modal');

const modalTitle =
  document.getElementById('modal-title');

const deleteEventBtn =
  document.getElementById('delete-event-btn');  

const closeModalBtn =
  document.getElementById('close-modal-btn');

const eventForm =
  document.getElementById('event-form');

const signInBtn =
  document.getElementById('sign-in-btn');

const signOutBtn =
  document.getElementById('sign-out-btn');

const prevBtn =
  document.getElementById('prev-btn');

const nextBtn =
  document.getElementById('next-btn');

const monthViewBtn =
  document.getElementById('month-view-btn');

const weekViewBtn =
  document.getElementById('week-view-btn');

const dayViewBtn =
  document.getElementById('day-view-btn');

const offlineBanner =
  document.getElementById('offline-banner');

const searchInput =
  document.getElementById('event-search');

const loadingOverlay =
  document.getElementById('loading-overlay');


/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

let searchQuery = '';
let filteredEvents = [];

let currentDate =
  new Date();

let events = [];

let selectedEvent = null;

let currentView = 'month';


/*
|--------------------------------------------------------------------------
| FILTERED EVENTS
|--------------------------------------------------------------------------
*/

function getVisibleEvents() {

  if (!searchQuery.trim()) {

    return events;
  }

  const query =
    searchQuery.toLowerCase();

  return events.filter(event => {

    return (

      event.title
        ?.toLowerCase()
        .includes(query)

      ||

      event.event_date
        ?.includes(query)

      ||

      event.event_time
        ?.includes(query)
    );
  });
}

function updateViewButtons() {

  document
    .querySelectorAll('.view-btn')

    .forEach(button => {

      button.classList.remove(
        'active-view'
      );
    });

  if (
    currentView === 'month'
  ) {

    monthViewBtn.classList.add(
      'active-view'
    );
  }

  if (
    currentView === 'week'
  ) {

    weekViewBtn.classList.add(
      'active-view'
    );
  }

  if (
    currentView === 'day'
  ) {

    dayViewBtn.classList.add(
      'active-view'
    );
  }
}



/*
|--------------------------------------------------------------------------
| SEARCH
|--------------------------------------------------------------------------
*/

if (searchInput) {

  searchInput.addEventListener(

    'input',

    event => {

      searchQuery =
        event.target.value;

      renderCalendar();
    }
  );
}

/*
|--------------------------------------------------------------------------
| FILTERED EVENTS
|--------------------------------------------------------------------------
*/

function getVisibleEvents() {

  if (!searchQuery.trim()) {

    return events;
  }

  const query =
    searchQuery.toLowerCase();

  return events.filter(event => {

    return (

      event.title
        ?.toLowerCase()
        .includes(query)

      ||

      event.event_date
        ?.includes(query)

      ||

      event.event_time
        ?.includes(query)
    );
  });
}


function hasVisibleEvents() {

  return getVisibleEvents().length > 0;
}

/*
|--------------------------------------------------------------------------
| LOADING
|--------------------------------------------------------------------------
*/

function showLoading() {

  if (!loadingOverlay) return;

  loadingOverlay.classList.remove(
    'hidden'
  );
}

function hideLoading() {

  if (!loadingOverlay) return;

  loadingOverlay.classList.add(
    'hidden'
  );
}


/*
|--------------------------------------------------------------------------
| AUTH UI
|--------------------------------------------------------------------------
*/

function updateAuthUI(session) {

  if (session) {

    signInBtn.classList.add(
      'hidden'
    );

    signOutBtn.classList.remove(
      'hidden'
    );

  } else {

    signInBtn.classList.remove(
      'hidden'
    );

    signOutBtn.classList.add(
      'hidden'
    );
  }
}


/*
|--------------------------------------------------------------------------
| LOAD EVENTS
|--------------------------------------------------------------------------
*/

async function loadEvents() {

  try {

    const {

      data: { user }

    } = await supabase.auth.getUser();

    if (!user) {

      events = [];

      return;
    }

    const {

      data,
      error

    } = await supabase

      .from('events')

      .select('*')

      .eq(
        'user_id',
        user.id
      )

      .order(
        'event_date',
        {
          ascending: true
        }
      );

    if (error) {

      console.error(
        'Failed to load events',
        error
      );

      return;
    }

    events = data || [];

  } catch (error) {

    console.error(
      'loadEvents error',
      error
    );
  }
}


/*
|--------------------------------------------------------------------------
| RENDER CALENDAR
|--------------------------------------------------------------------------
*/

function renderCalendar() {

  updateViewButtons();
  
  const weekdayRow =
    document.querySelector(
      '.weekday-row'
    );

  calendar.classList.remove(
    'calendar-grid',
    'week-view-layout',
    'day-view-layout'
  );

  /*
  |--------------------------------------------------------------------------
  | SHOW/HIDE WEEKDAY HEADER
  |--------------------------------------------------------------------------
  */

  if (
    weekdayRow
  ) {

    if (
      currentView === 'month'
    ) {

      weekdayRow.classList.remove(
        'hidden'
      );

    } else {

      weekdayRow.classList.add(
        'hidden'
      );
    }
  }

  if (!hasVisibleEvents()) {

    calendar.innerHTML = `

      <div class="empty-state">

        <h3>No matching events</h3>

        <p>Try another search.</p>

      </div>
    `;

    return;
  }
  
  
  
  
  /*
  |--------------------------------------------------------------------------
  | RENDER CURRENT VIEW
  |--------------------------------------------------------------------------
  */

  if (
    currentView === 'month'
  ) {

    calendar.classList.add(
      'calendar-grid'
    );

    renderMonthView();

  } else if (
    currentView === 'week'
  ) {

    calendar.classList.add(
      'week-view-layout'
    );

    renderWeekView();

  } else if (
    currentView === 'day'
  ) {

    calendar.classList.add(
      'day-view-layout'
    );

    renderDayView();
  }

}


function renderMonthView() {

  if (!calendar) {

    console.error(
      '#calendar not found'
    );

    return;
  }

  if (!monthLabel) {

    console.error(
      '#month-label not found'
    );

    return;
  }

  calendar.innerHTML = '';

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth();

  monthLabel.textContent =
    currentDate.toLocaleString(
      'default',
      {
        month: 'long',
        year: 'numeric'
      }
    );

  const firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  /*
  |--------------------------------------------------------------------------
  | BLANK CELLS
  |--------------------------------------------------------------------------
  */

  for (

    let i = 0;

    i < firstDay;

    i++

  ) {

    const blank =
      document.createElement(
        'div'
      );

    blank.className =
      'calendar-blank';

    calendar.appendChild(
      blank
    );
  }

  /*
  |--------------------------------------------------------------------------
  | DAYS
  |--------------------------------------------------------------------------
  */

  for (

    let day = 1;

    day <= daysInMonth;

    day++

  ) {

    const cell =
      document.createElement(
        'div'
      );

    cell.className =
      'calendar-cell';

    const paddedMonth =
      String(month + 1)
        .padStart(2, '0');

    const paddedDay =
      String(day)
        .padStart(2, '0');

    const dateString =
      `${year}-${paddedMonth}-${paddedDay}`;
    
      const now =
        new Date();

      const today =
        `${now.getFullYear()}-${
          String(
            now.getMonth() + 1
          ).padStart(2, '0')
        }-${
          String(
            now.getDate()
          ).padStart(2, '0')
        }`;

      if (dateString === today) {

        cell.classList.add(
          'today'
        );
      }

    const label =
      document.createElement(
        'div'
      );

    label.className =
      'calendar-day';

    label.textContent =
      day;

    cell.appendChild(
      label
    );


    const visibleEvents = getVisibleEvents();

    const dayEvents =

      visibleEvents

        .filter(

          event =>

            event.event_date ===
            dateString
        )

        .sort(

          (a, b) => {

            return (
              (a.event_time || '')
                .localeCompare(
                  b.event_time || ''
                )
            );
          }
        );

    dayEvents.forEach(

      event => {

        const item =
          document.createElement(
            'div'
          );

        item.className =
          'event-item';

        item.textContent =
          [
            event.event_time,
            event.title
          ]

          .filter(Boolean)

          .join(' - ');

        item.addEventListener(

          'click',

          () => {

            selectedEvent = event;

            document.getElementById(
              'event-title'
            ).value = event.title || '';

            document.getElementById(
              'event-date'
            ).value = event.event_date || '';

            document.getElementById(
              'event-time'
            ).value = event.event_time || '';

            deleteEventBtn.classList.remove(
              'hidden'
            );

            modalTitle.textContent = 'Edit Event';
            
            eventModal.showModal();
          }
        );

        cell.appendChild(
          item
        );
      }
    );

    calendar.appendChild(
      cell
    );
  }
}


function renderWeekView() {

  calendar.innerHTML = '';

  const start =
    new Date(currentDate);

  start.setDate(
    currentDate.getDate() -
    currentDate.getDay()
  );

  const end =
    new Date(start);

  end.setDate(
    start.getDate() + 6
  );

  monthLabel.textContent =
    `${start.toLocaleDateString(
      'default',
      {
        month: 'short',
        day: 'numeric'
      }
    )} - ${end.toLocaleDateString(
      'default',
      {
        month: 'short',
        day: 'numeric'
      }
    )}`;

  const weekGrid =
    document.createElement(
      'div'
    );

  weekGrid.className =
    'week-grid';

  for (

    let i = 0;

    i < 7;

    i++

  ) {

    const dayDate =
      new Date(start);

    dayDate.setDate(
      start.getDate() + i
    );

    const year =
      dayDate.getFullYear();

    const month =
      String(
        dayDate.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        dayDate.getDate()
      ).padStart(2, '0');

    const dateString =
      `${year}-${month}-${day}`;

    const column =
      document.createElement(
        'div'
      );

    column.className =
      'week-column';

    const header =
      document.createElement(
        'div'
      );

    header.className =
      'week-header';

    header.textContent =
      dayDate.toLocaleDateString(
        'default',
        {
          weekday: 'short',
          day: 'numeric'
        }
      );

    column.appendChild(
      header
    );

    
    const visibleEvents = getVisibleEvents();
    
    const dayEvents =

      visibleEvents

        .filter(

          event =>

            event.event_date ===
            dateString
        )

        .sort(

          (a, b) => {

            return (
              (a.event_time || '')
                .localeCompare(
                  b.event_time || ''
                )
            );
          }
        );

    dayEvents.forEach(

      event => {

        const item =
          document.createElement(
            'div'
          );

        item.className =
          'event-item';

        item.textContent =
          [
            event.event_time,
            event.title
          ]

          .filter(Boolean)

          .join(' - ');

        column.appendChild(
          item
        );
      }
    );

    weekGrid.appendChild(
      column
    );
  }

  calendar.appendChild(
    weekGrid
  );
}

function renderDayView() {

  calendar.innerHTML = '';

  const year =
    currentDate.getFullYear();

  const month =
    String(
      currentDate.getMonth() + 1
    ).padStart(2, '0');

  const day =
    String(
      currentDate.getDate()
    ).padStart(2, '0');

  const dateString =
    `${year}-${month}-${day}`;

  monthLabel.textContent =
    currentDate.toLocaleDateString(
      'default',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }
    );

  const dayContainer =
    document.createElement(
      'div'
    );

  dayContainer.className =
    'day-view';

  for (

    let hour = 0;

    hour < 24;

    hour++

  ) {

    const row =
      document.createElement(
        'div'
      );

    row.className =
      'hour-row';

    const label =
      document.createElement(
        'div'
      );

    label.className =
      'hour-label';

    label.textContent =
      `${hour}:00`;

    const eventsContainer =
      document.createElement(
        'div'
      );

    eventsContainer.className =
      'hour-events';

    const visibleEvents = getVisibleEvents();
    
    const hourEvents =

      visibleEvents

        .filter(

          event => {

            return (

              event.event_date ===
              dateString &&

              event.event_time &&

              parseInt(
                event.event_time
              ) === hour
            );
          }
        )

        .sort(

          (a, b) => {

            return (
              (a.event_time || '')
                .localeCompare(
                  b.event_time || ''
                )
            );
          }
        );

    hourEvents.forEach(

      event => {

        const item =
          document.createElement(
            'div'
          );

        item.className =
          'event-item';

        item.textContent =
          [
            event.event_time,
            event.title
          ]

          .filter(Boolean)

          .join(' - ');

        eventsContainer.appendChild(
          item
        );
      }
    );

    row.appendChild(
      label
    );

    row.appendChild(
      eventsContainer
    );

    dayContainer.appendChild(
      row
    );
  }

  calendar.appendChild(
    dayContainer
  );
}


/*
|--------------------------------------------------------------------------
| CREATE EVENT
|--------------------------------------------------------------------------
*/

eventForm.addEventListener(

  'submit',

  async event => {

    event.preventDefault();

    try {

      const title =
        document
          .getElementById(
            'event-title'
          )
          .value
          .trim();

      const date =
        document
          .getElementById(
            'event-date'
          )
          .value;

      const time =
        document
          .getElementById(
            'event-time'
          )
          .value;

      if (!title || !date) {

        alert(
          'Please complete all required fields.'
        );

        return;
      }

      const {

        data: { user }

      } = await supabase.auth.getUser();

      if (!user) {

        alert(
          'Please sign in first.'
        );

        return;
      }

      let error;

      /*
      |--------------------------------------------------------------------------
      | UPDATE EVENT
      |--------------------------------------------------------------------------
      */

      if (selectedEvent) {

        const result =
          await supabase

            .from('events')

            .update({

              title,

              event_date: date,

              event_time: time

            })

            .eq(
              'id',
              selectedEvent.id
            );

        error = result.error;
      }

      /*
      |--------------------------------------------------------------------------
      | CREATE EVENT
      |--------------------------------------------------------------------------
      */

      else {


        const result =
          await supabase

            .from('events')

            .insert({

              user_id:
                user.id,

              title,

              event_date:
                date,

              event_time:
                time
            });

        error = result.error;
      }

      if (error) {

        console.error(error);

        alert(
          'Failed to save event.'
        );

        return;
      }

      await loadEvents();

      renderCalendar();

      eventForm.reset();

      selectedEvent = null;

      deleteEventBtn.classList.add(
        'hidden'
      );

      eventModal.close();

    } catch (error) {

      console.error(
        'Create event error',
        error
      );
    }
  }
);

deleteEventBtn.addEventListener(

  'click',

  async () => {

    if (!selectedEvent) return;

    const confirmDelete =
      confirm(
        'Delete this event?'
      );

    if (!confirmDelete) return;

    try {

      const { error } =
        await supabase

          .from('events')

          .delete()

          .eq(
            'id',
            selectedEvent.id
          );

      if (error) {

        console.error(error);

        alert(
          'Failed to delete event.'
        );

        return;
      }

      selectedEvent = null;

      eventForm.reset();

      deleteEventBtn.classList.add(
        'hidden'
      );

      eventModal.close();

      await loadEvents();

      renderCalendar();

    } catch (error) {

      console.error(
        'Delete event error',
        error
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| MODAL
|--------------------------------------------------------------------------
*/

newEventBtn.addEventListener(

  'click',

  () => {

    selectedEvent = null;

    eventForm.reset();

    deleteEventBtn.classList.add(
      'hidden'
    );

    modalTitle.textContent = 'Create Event';

    eventModal.showModal();
  }
);

closeModalBtn.addEventListener(

  'click',

  () => {

    selectedEvent = null;

    eventForm.reset();

    deleteEventBtn.classList.add(
      'hidden'
    );

    eventModal.close();
  }
);


/*
|--------------------------------------------------------------------------
| SIGN IN
|--------------------------------------------------------------------------
*/

signInBtn.addEventListener(

  'click',

  async () => {

    const email =
      prompt('Email');

    if (!email) return;

    const password =
      prompt('Password');

    if (!password) return;

    showLoading();

    try {

      /*
      |--------------------------------------------------------------------------
      | SIGN IN
      |--------------------------------------------------------------------------
      */

      const {

        data,
        error

      } = await supabase.auth.signInWithPassword({

        email,
        password
      });

      /*
      |--------------------------------------------------------------------------
      | SIGN IN FAILED
      |--------------------------------------------------------------------------
      */

      if (error) {

        console.error(
          'AUTH ERROR:',
          error.message,
          error
        );

        /*
        |--------------------------------------------------------------------------
        | INVALID LOGIN
        |--------------------------------------------------------------------------
        */

        if (

          error.message.includes(
            'Invalid login credentials'
          )

        ) {

          const signup =
            confirm(
              'Account not found.\nCreate account?'
            );

          if (!signup) {

            hideLoading();

            return;
          }

          /*
          |--------------------------------------------------------------------------
          | SIGN UP
          |--------------------------------------------------------------------------
          */

          const {

            error: signupError

          } = await supabase.auth.signUp({

            email,
            password
          });

          if (signupError) {

            console.error(
              signupError
            );

            alert(
              signupError.message
            );

            hideLoading();

            return;
          }

          alert(
            'Account created.\nCheck your email for confirmation.'
          );

          hideLoading();

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | OTHER AUTH ERROR
        |--------------------------------------------------------------------------
        */

        alert(
          error.message
        );

        hideLoading();

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | SIGN IN SUCCESS
      |--------------------------------------------------------------------------
      */

      signInBtn.classList.add(
        'hidden'
      );

      signOutBtn.classList.remove(
        'hidden'
      );

      await loadEvents();

      renderCalendar();

      alert(
        'Signed in successfully.'
      );

    } catch (error) {

      console.error(
        'Sign in error',
        error
      );

      alert(
        'Unexpected authentication error'
      );

    } finally {

      hideLoading();
    }
  }
);


/*
|--------------------------------------------------------------------------
| SIGN OUT
|--------------------------------------------------------------------------
*/

signOutBtn.addEventListener(

  'click',

  async () => {

    try {

      await supabase.auth.signOut();

      events = [];

      renderCalendar();

      updateAuthUI(null);

    } catch (error) {

      console.error(
        'Sign out error',
        error
      );
    }
  }
);


/*
|--------------------------------------------------------------------------
| NAVIGATION
|--------------------------------------------------------------------------
*/

prevBtn.addEventListener(

  'click',

  () => {

    if (currentView === 'month') {

      currentDate.setMonth(
        currentDate.getMonth() - 1
      );

    } else if (
      currentView === 'week'
    ) {

      currentDate.setDate(
        currentDate.getDate() - 7
      );

    } else {

      currentDate.setDate(
        currentDate.getDate() - 1
      );
    }

    renderCalendar();
  }
);

nextBtn.addEventListener(

  'click',

  () => {

    if (currentView === 'month') {

      currentDate.setMonth(
        currentDate.getMonth() + 1
      );

    } else if (
      currentView === 'week'
    ) {

      currentDate.setDate(
        currentDate.getDate() + 7
      );

    } else {

      currentDate.setDate(
        currentDate.getDate() + 1
      );
    }

    renderCalendar();
  }
);


if (monthViewBtn) {

  monthViewBtn.addEventListener(
    'click',
    () => {
      currentView = 'month';
      renderCalendar();
    }
  );
}

if (weekViewBtn) {
  
  weekViewBtn.addEventListener(
    'click',
    () => {
      currentView = 'week';
      renderCalendar();
    }
  );
}

if (dayViewBtn) {

  dayViewBtn.addEventListener(
    'click',
    () => {
      currentView = 'day';
      renderCalendar();
    }
  );
}


/*
|--------------------------------------------------------------------------
| SEARCH
|--------------------------------------------------------------------------
*/

if (searchInput) {

  let searchTimeout;

  searchInput.addEventListener(

    'input',

    event => {

      clearTimeout(
        searchTimeout
      );

      searchTimeout = setTimeout(

        () => {

          searchQuery =
            event.target.value;

          renderCalendar();

        },

        200
      );
    }
  );
}


/*
|--------------------------------------------------------------------------
| REALTIME SYNC
|--------------------------------------------------------------------------
*/

supabase

  .channel('public:events')

  .on(

    'postgres_changes',

    {

      event: '*',

      schema: 'public',

      table: 'events'
    },

    async () => {

      console.log(
        'Realtime update'
      );

      await loadEvents();

      renderCalendar();
    }
  )

  .subscribe();


/*
|--------------------------------------------------------------------------
| AUTH STATE CHANGES
|--------------------------------------------------------------------------
*/

supabase.auth.onAuthStateChange(

  async (

    event,
    session

  ) => {

    console.log(
      'Auth changed:',
      event
    );

    updateAuthUI(
      session
    );

    await loadEvents();

    renderCalendar();
  }
);

/*
|--------------------------------------------------------------------------
| ONLINE / OFFLINE STATUS
|--------------------------------------------------------------------------
*/

function updateOnlineStatus() {

  if (navigator.onLine) {

    offlineBanner.classList.add(
      'hidden'
    );

  } else {

    offlineBanner.classList.remove(
      'hidden'
    );
  }
}

window.addEventListener(
  'online',
  updateOnlineStatus
);

window.addEventListener(
  'offline',
  updateOnlineStatus
);



/*
|--------------------------------------------------------------------------
| APP START
|--------------------------------------------------------------------------
*/

window.addEventListener(

  'load',

  async () => {

    showLoading();

    try {

      /*
      |--------------------------------------------------------------------------
      | SERVICE WORKER
      |--------------------------------------------------------------------------
      */

      if (

        'serviceWorker'
        in navigator

      ) {

        await navigator
          .serviceWorker
          .register('./sw.js');
      }

      /*
      |--------------------------------------------------------------------------
      | SESSION
      |--------------------------------------------------------------------------
      */

      const {

        data: { session }

      } = await supabase.auth.getSession();

      updateAuthUI(
        session
      );

      /*
      |--------------------------------------------------------------------------
      | EVENTS
      |--------------------------------------------------------------------------
      */

      await loadEvents();

      renderCalendar();

      updateOnlineStatus();

    } catch (error) {

      console.error(
        'Startup error',
        error
      );

    } finally {

      setTimeout(

        () => {

          hideLoading();
        },

        300
      );
    }
  }
);