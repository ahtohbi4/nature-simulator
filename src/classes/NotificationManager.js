import Notification from './Notification';

const QUEUE_MAX_LENGTH = 10;

export default class NotificationManager {
  constructor(params) {
    const { container } = params;

    this.container = container;
    this.queue = [];
  }

  push(notificationParams) {
    this.queue = this.queue.slice(0, QUEUE_MAX_LENGTH - 1)
    this.queue.unshift(new Notification(notificationParams));

    this.render();
  }

  render() {
    this.container.innerHTML = this.queue
      .map((notification) => notification.render())
      .join('');
  }
}
