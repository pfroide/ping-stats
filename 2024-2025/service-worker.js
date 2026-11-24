/* Simple PWA service worker (cache-first for assets, network-first for navigation) */
    // Bump cache version when the generated site structure changes.
    const CACHE_VERSION = "20261124175942";
    const CACHE_NAME = "ping-stats-" + CACHE_VERSION;
    // Saison en cours par défaut : non vide uniquement pour le site Cumul (racine).
    const SEASON_REDIRECT = "";

    // data/ est exclu du CORE : toujours récupéré depuis le réseau (network-only)
    const CORE = [
      "./",
      "./index.html",
      "./site_data.json",
      "./manifest.webmanifest",
      "./service-worker.js",
      "./assets/graphs_bundle.js",
      "./assets/equipe_bundle.js",
      "./assets/icons/icon-192.png",
      "./assets/icons/icon-512.png",
      "./assets/icons/icon-maskable-192.png",
      "./assets/icons/icon-maskable-512.png",
      "./assets/icons/icon-180.png"
    ];

    self.addEventListener("install", (event) => {
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then((cache) => cache.addAll(CORE))
          .then(() => self.skipWaiting())
      );
    });

    self.addEventListener("activate", (event) => {
      event.waitUntil(
        caches.keys()
          .then((keys) => Promise.all(
            keys.filter((k) => k.startsWith("ping-stats-") && k !== CACHE_NAME).map((k) => caches.delete(k))
          ))
          .then(() => self.clients.claim())
      );
    });

    self.addEventListener("fetch", (event) => {
      const req = event.request;
      if (req.method !== "GET") return;

      const url = new URL(req.url);
      if (url.origin !== self.location.origin) return;

      // Navigations: network-first, fallback cache index.html
      if (req.mode === "navigate") {
        // Racine du site sans ?cumul=1 → saison en cours (évite de charger le Cumul)
        if (SEASON_REDIRECT) {
          const scopePath = new URL("./", self.location.href).pathname;
          const isRoot = (url.pathname === scopePath || url.pathname === scopePath + "index.html");
          if (isRoot && !url.searchParams.has("cumul")) {
            event.respondWith(Response.redirect(new URL(SEASON_REDIRECT, self.location.href).href, 302));
            return;
          }
        }
        // Le cache "./index.html" ne sert de secours hors-ligne qu'à la page
        // de ce site : on n'y range pas les pages des sous-dossiers de saison.
        const scopePath2 = new URL("./", self.location.href).pathname;
        const isOwnIndex = (url.pathname === scopePath2 || url.pathname === scopePath2 + "index.html");
        if (!isOwnIndex) { return; }
        event.respondWith(
          fetch(req)
            .then((res) => {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put("./index.html", copy));
              return res;
            })
            .catch(() => caches.match("./index.html"))
        );
        return;
      }

      // Assets: stale-while-revalidate
      // Fichiers data/ : network-only — jamais mis en cache
      // Les données sont régénérées à chaque build, le cache les rendrait obsolètes
      if (url.pathname.includes('/data/')) {
        event.respondWith(
          fetch(req).catch(() => new Response('{}', {headers:{'Content-Type':'application/json'}}))
        );
        return;
      }

      // Assets statiques : stale-while-revalidate
      event.respondWith(
        caches.match(req).then((cached) => {
          const fetchPromise = fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy));
            return res;
          }).catch(() => null);

          if (cached) {
            event.waitUntil(fetchPromise);
            return cached;
          }
          return fetchPromise.then((res) => res || cached);
        })
      );
    });
    