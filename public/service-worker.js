self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const title = data.title || "Breaking News Update";
  const body = data.body || "Tap to read the latest inside the app.";
  self.registration.showNotification(title, {
    body,
    icon: "/jujo.jpg",
  });
});
