import NotificationManager from './classes/NotificationManager';
import Planet from './classes/Planet';

const notifications = new NotificationManager({
  container: document.querySelector('.notification-manager'),
});

const earth = new Planet({
  container: document.querySelector('.planet'),
  name: 'Pandorra',
  width: 500,
  height: 300,

  notifications,
});

earth.start();
