// ScoreKid Service Worker
const CACHE_NAME = 'scorekid-v1.0.0';
const STATIC_CACHE_NAME = 'scorekid-static-v1.0.0';

// Archivos esenciales que siempre deben estar en caché
const STATIC_ASSETS = [
  '/',
  '/App.tsx',
  '/styles/globals.css',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

// Estrategia de red primero para contenido dinámico
const NETWORK_FIRST = [
  '/api/',
  '/auth/'
];

// Estrategia de caché primero para recursos estáticos
const CACHE_FIRST = [
  '/static/',
  '/images/',
  '/icons/',
  '.js',
  '.css',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.webp'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('ScoreKid SW: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache de archivos estáticos
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('ScoreKid SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Activar inmediatamente
      self.skipWaiting()
    ])
  );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('ScoreKid SW: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar cachés antiguos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
              console.log('ScoreKid SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Reclamar control de todos los clientes
      self.clients.claim()
    ])
  );
});

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;
  
  // Solo manejar peticiones GET
  if (method !== 'GET') return;
  
  // Ignorar peticiones de chrome-extension, about:, etc.
  if (!url.startsWith('http')) return;
  
  // Determinar estrategia basada en la URL
  const strategy = getStrategy(url);
  
  event.respondWith(handleRequest(request, strategy));
});

// Determinar la estrategia de caché para una URL
function getStrategy(url) {
  // Network first para APIs y autenticación
  if (NETWORK_FIRST.some(pattern => url.includes(pattern))) {
    return 'networkFirst';
  }
  
  // Cache first para recursos estáticos
  if (CACHE_FIRST.some(pattern => url.includes(pattern))) {
    return 'cacheFirst';
  }
  
  // Stale while revalidate para todo lo demás
  return 'staleWhileRevalidate';
}

// Manejar peticiones según la estrategia
async function handleRequest(request, strategy) {
  const url = request.url;
  
  try {
    switch (strategy) {
      case 'networkFirst':
        return await networkFirst(request);
      
      case 'cacheFirst':
        return await cacheFirst(request);
      
      case 'staleWhileRevalidate':
      default:
        return await staleWhileRevalidate(request);
    }
  } catch (error) {
    console.error('ScoreKid SW: Error handling request:', url, error);
    
    // Fallback para navegación
    if (request.mode === 'navigate') {
      const cache = await caches.open(STATIC_CACHE_NAME);
      const fallback = await cache.match('/');
      return fallback || new Response('App no disponible offline', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    }
    
    // Fallback genérico
    return new Response('Recurso no disponible', {
      status: 404,
      statusText: 'Not Found'
    });
  }
}

// Estrategia: Network First
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('ScoreKid SW: Network failed, trying cache:', request.url);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Estrategia: Cache First
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('ScoreKid SW: Failed to fetch:', request.url);
    throw error;
  }
}

// Estrategia: Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Fetch en background para actualizar caché
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch((error) => {
    console.log('ScoreKid SW: Background fetch failed:', request.url);
  });
  
  // Retornar cache inmediatamente si existe, sino esperar network
  if (cachedResponse) {
    return cachedResponse;
  }
  
  return fetchPromise;
}

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  const { data } = event;
  
  if (data && data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (data && data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION',
      version: CACHE_NAME
    });
  }
  
  if (data && data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      event.ports[0].postMessage({
        type: 'CACHE_CLEARED'
      });
    });
  }
});

// Manejar sincronización en background
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('ScoreKid SW: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Aquí puedes sincronizar datos guardados offline
  // Por ejemplo, subir partidos guardados localmente
  console.log('ScoreKid SW: Performing background sync...');
  
  try {
    // Verificar si hay datos pendientes de sincronizar
    const pendingData = await self.indexedDB && 
      await getIndexedDBData('pending-sync');
    
    if (pendingData && pendingData.length > 0) {
      // Intentar sincronizar datos pendientes
      console.log('ScoreKid SW: Syncing pending data:', pendingData);
      // Implementar lógica de sincronización aquí
    }
  } catch (error) {
    console.error('ScoreKid SW: Background sync failed:', error);
  }
}

// Helper para IndexedDB (básico)
async function getIndexedDBData(storeName) {
  return new Promise((resolve, reject) => {
    if (!self.indexedDB) {
      resolve([]);
      return;
    }
    
    const request = indexedDB.open('ScoreKidDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        resolve([]);
        return;
      }
      
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getAll = store.getAll();
      
      getAll.onsuccess = () => resolve(getAll.result);
      getAll.onerror = () => reject(getAll.error);
    };
    
    request.onerror = () => resolve([]);
  });
}