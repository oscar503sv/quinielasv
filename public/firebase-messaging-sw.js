/* global importScripts, firebase, self, clients */
// Service worker de Firebase Cloud Messaging.
// Recibe los push cuando la app está en segundo plano / cerrada.
// La config de Firebase es PÚBLICA por diseño (viaja al navegador); un service
// worker no puede leer variables de entorno, por eso va embebida aquí.

importScripts(
  "https://www.gstatic.com/firebasejs/12.14.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyAp9fQ8DNKGph1puxhhunm-NY7E6rPfi6w",
  authDomain: "quinielasv-a4611.firebaseapp.com",
  projectId: "quinielasv-a4611",
  storageBucket: "quinielasv-a4611.firebasestorage.app",
  messagingSenderId: "198231832221",
  appId: "1:198231832221:web:adab0b2362174faa360674",
});

const messaging = firebase.messaging();

// Mensajes data-only: construimos la notificación nosotros (control total y
// sin riesgo de duplicado entre el navegador y onBackgroundMessage).
messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  self.registration.showNotification(data.title || "Quiniela 2026", {
    body: data.body || "",
    icon: "/android-chrome-192x192.png",
    badge: "/favicon-32x32.png",
    tag: data.tag || undefined,
    data: { link: data.link || "/dashboard" },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || "/dashboard";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const win of wins) {
        if (win.url.includes(link) && "focus" in win) return win.focus();
      }
      return clients.openWindow(link);
    }),
  );
});
