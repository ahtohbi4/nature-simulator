import Planet from './classes/Planet';

const earth = new Planet({
  container: document.querySelector('.planet'),
  notificationsContainer: document.querySelector('.notification-manager'),

  name: 'Pandorra',
  width: 500,
  height: 300,
});

earth.start();
