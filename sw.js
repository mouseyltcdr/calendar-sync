const CACHE_NAME =
  'calendar-sync-v8';

const ASSETS = [

  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/supabase.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];


/*
|--------------------------------------------------------------------------
| INSTALL
|--------------------------------------------------------------------------
*/

self.addEventListener(

  'install',

  event => {

    event.waitUntil(

      caches.open(CACHE_NAME)

        .then(cache => {

          return cache.addAll(
            ASSETS
          );
        })
    );

    self.skipWaiting();
  }
);


/*
|--------------------------------------------------------------------------
| ACTIVATE
|--------------------------------------------------------------------------
*/

self.addEventListener(

  'activate',

  event => {

    event.waitUntil(

      caches.keys()

        .then(keys => {

          return Promise.all(

            keys.map(key => {

              if (

                key !== CACHE_NAME

              ) {

                return caches.delete(
                  key
                );
              }
            })
          );
        })
    );

    self.clients.claim();
  }
);


/*
|--------------------------------------------------------------------------
| FETCH
|--------------------------------------------------------------------------
*/

self.addEventListener(

  'fetch',

  event => {

    event.respondWith(

      caches.match(
        event.request
      )

      .then(response => {

        return (

          response ||

          fetch(event.request)

            .catch(() => {

              return caches.match(
                './index.html'
              );
            })
        );
      })
    );
  }
);