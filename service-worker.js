if (!Cache.prototype.add) {
  Cache.prototype.add = function add(request) {
    return this.addAll([request]);
  };
}

if (!Cache.prototype.addAll) {
  Cache.prototype.addAll = function addAll(requests) {
    var cache = this;

    // Since DOMExceptions are not constructable:
    function NetworkError(message) {
      this.name = 'NetworkError';
      this.code = 19;
      this.message = message;
    }
    NetworkError.prototype = Object.create(Error.prototype);

    return Promise.resolve().then(function() {
      if (arguments.length < 1) throw new TypeError();
      
      // Simulate sequence<(Request or USVString)> binding:
      var sequence = [];

      requests = requests.map(function(request) {
        if (request instanceof Request) {
          return request;
        }
        else {
          return String(request); // may throw TypeError
        }
      });

      return Promise.all(
        requests.map(function(request) {
          if (typeof request === 'string') {
            request = new Request(request);
          }

          var scheme = new URL(request.url).protocol;

          if (scheme !== 'http:' && scheme !== 'https:') {
            throw new NetworkError("Invalid scheme");
          }

          return fetch(request.clone());
        })
      );
    }).then(function(responses) {
      // TODO: check that requests don't overwrite one another
      // (don't think this is possible to polyfill due to opaque responses)
      return Promise.all(
        responses.map(function(response, i) {
          return cache.put(requests[i], response);
        })
      );
    }).then(function() {
      return undefined;
    });
  };
}

if (!CacheStorage.prototype.match) {
  // This is probably vulnerable to race conditions (removing caches etc)
  CacheStorage.prototype.match = function match(request, opts) {
    var caches = this;

    return this.keys().then(function(cacheNames) {
      var match;

      return cacheNames.reduce(function(chain, cacheName) {
        return chain.then(function() {
          return match || caches.open(cacheName).then(function(cache) {
            return cache.match(request, opts);
          }).then(function(response) {
            match = response;
            return match;
          });
        });
      }, Promise.resolve());
    });
  };
}


const cacheName = 'library-app'

const urlsToCache = [
  '/',
  '/chapter00/',
  '/chapter01/',
  '/chapter02/',
  '/chapter03/',
  '/chapter04/',
  '/chapter05/',
  '/chapter06/',
  '/chapter07/',
  '/chapter08/',
  '/chapter09/',
  '/chapter10/',
  '/chapter11/',
  '/chapter12/',
  '/chapter13/',
  '/assets/css/styles.css',
  '/assets/css/posts.css',
  '/assets/fonts/oflgoudystm.woff2',
  '/assets/fonts/oflgoudystm-italic.woff2',
  '/assets/fonts/abel-regular.woff2',
  '/assets/images/cover.png',
  '/assets/images/cover@2x.png',
  '/assets/images/1/estrada.jpg',
  '/assets/images/1/estrada@2x.jpg',
  '/assets/images/1/feinler.jpg',
  '/assets/images/1/hafkin.jpg',
  '/assets/images/1/holz.jpg',
  '/assets/images/1/holz@2x.jpg',
  '/assets/images/1/hu.jpg',
  '/assets/images/1/hu@2x.jpg',
  '/assets/images/1/internet-exchange.jpeg',
  '/assets/images/1/internet-exchange@2x.jpeg',
  '/assets/images/1/internet-infra.jpg',
  '/assets/images/1/internet-infra@2x.jpg',
  '/assets/images/1/kanchanasut.jpg',
  '/assets/images/1/kanchanasut@2x.jpg',
  '/assets/images/1/lamarr.jpg',
  '/assets/images/1/lamarr@2x.jpg',
  '/assets/images/1/löwinder.jpg',
  '/assets/images/1/löwinder@2x.jpg',
  '/assets/images/1/perlman.jpg',
  '/assets/images/1/perlman@2x.jpg',
  '/assets/images/1/reynolds.jpg',
  '/assets/images/1/reynolds@2x.jpg',
  '/assets/images/1/strazisar.jpg',
  '/assets/images/1/strazisar@2x.jpg',
  '/assets/images/1/submarine-cables.jpeg',
  '/assets/images/1/submarine-cables@2x.jpeg',
  '/assets/images/1/tx2.jpeg',
  '/assets/images/1/tx2@2x.jpeg',
  '/assets/images/1/utility-pole.jpeg',
  '/assets/images/1/utility-pole@2x.jpeg',
  '/assets/favicons/favicon.ico',
  '/assets/favicons/manifest.json'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
    .then(cache => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache)
    })
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', event => {
  console.log(event.request.url)
  event.respondWith(
    caches.match(event.request)
    .then(response => {
      if (response) {
        return response
      }
      return fetch(event.request)
    })
  )
})
