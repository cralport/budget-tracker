const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const DATA_CACHE_NAME = 'data_cache_name';
const CACHE_NAME = APP_PREFIX + VERSION

const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/index.js',
    '/js/idb.js',
    '/manifest.json',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png'
];

self.addEventListener('fetch', function (evt) {
    if (evt.request.url.includes('/api/')) {
        evt.respondWith(
            caches
                .open(DATA_CACHE_NAME)
                .then(cache => {
                    return fetch(evt.request)
                        .then(response => {
                            // If the response was good, clone it and store it in the cache.
                            if (response.status === 200) {
                                cache.put(evt.request.url, response.clone());
                            }

                            return response;
                        })
                        .catch(err => {
                            // Network request failed, try to get it from the cache.
                            return cache.match(evt.request);
                        });
                })
                .catch(err => console.log(err))
        );

        return;
    }
    console.log('fetch request : ' + evt.request.url)
    evt.respondWith(
        caches.match(evt.request).then(function (request) {
            if (request) {
                console.log('responding with cache : ' + evt.request.url)
                return request
            } else {
                console.log('file is not cached, fetching : ' + evt.request.url)
                return fetch(evt.request)
            }
        })
    )
});


self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('intalling cache:' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
});


self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            let cacheKeepList = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            cacheKeepList.push(CACHE_NAME);

            return Promise.all(keyList.map(function (key, i) {
                if (cacheKeepList.indexOf(key) === -1) {
                    console.log('deleteing cache : ' + keyList[i]);
                    return caches.delete(keyList[i]);
                }
            })
            );
        })
    );
});