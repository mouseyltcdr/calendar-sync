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

const loadingOverlay =
  document.getElementById('loading-overlay');


/*
|--------------------------------------------------------------------------
| STATE
|--------------------------------------------------------------------------
*/

let currentDate =
  new Date();

let events = [];


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

    const dateString =
      new Date(
        year,
        month,
        day
      )

      .toISOString()

      .split('T')[0];

    const dayEvents =
      events.filter(

        event =>

          event.event_date ===
          dateString
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
          `${event.event_time || ''} ${event.title}`;

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

      const { error } =
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

      if (error) {

        console.error(error);

        alert(
          'Failed to create event.'
        );

        return;
      }

      await loadEvents();

      renderCalendar();

      eventForm.reset();

      eventModal.close();

    } catch (error) {

      console.error(
        'Create event error',
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

    eventModal.showModal();
  }
);

closeModalBtn.addEventListener(

  'click',

  () => {

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

    currentDate.setMonth(
      currentDate.getMonth() - 1
    );

    renderCalendar();
  }
);

nextBtn.addEventListener(

  'click',

  () => {

    currentDate.setMonth(
      currentDate.getMonth() + 1
    );

    renderCalendar();
  }
);


/*
|--------------------------------------------------------------------------
| REALTIME SYNC
|--------------------------------------------------------------------------
*/

supabase

  .channel('events-realtime')

  .on(

    'postgres_changes',

    {

      event: '*',

      schema: 'public',

      table: 'events'
    },

    async payload => {

      console.log(
        'Realtime update',
        payload
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