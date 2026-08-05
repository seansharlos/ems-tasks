// שירות רקע (Service Worker) — אחראי להציג את הפוש עם כפתורי כן/לא, וללחוץ עליהם.
// שלב מאוחר יותר בהדרכה: אחרי שתפרסו את הפונקציות ב-Firebase, תקבלו כתובת ל-respondDailyPrompt.
// הדביקו אותה כאן במקום המחרוזת PASTE_RESPOND_FUNCTION_URL_HERE.
const RESPOND_URL = 'https://us-central1-my-task-app-edd73.cloudfunctions.net/respondDailyPrompt';

self.addEventListener('push', function (event) {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch (e) { payload = {}; }
  const data = payload.data || payload || {};
  const date = data.date || '';

  event.waitUntil(
    self.registration.showNotification('סדר עדיפויות יומי', {
      body: 'לשלוח היום את רשימת המשימות למייל?',
      dir: 'rtl',
      lang: 'he',
      tag: 'daily-prompt-' + date,
      requireInteraction: true,
      data: { date: date },
      actions: [
        { action: 'yes', title: 'כן, שלח' },
        { action: 'no', title: 'לא היום' }
      ]
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const date = (event.notification.data && event.notification.data.date) || '';
  let answer = null;
  if (event.action === 'yes') answer = 'yes';
  if (event.action === 'no') answer = 'no';
  if (!answer || !date) return;

  event.waitUntil(
    fetch(RESPOND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: date, answer: answer })
    }).catch(function (e) {
      console.error('שליחת התשובה נכשלה', e);
    })
  );
});
