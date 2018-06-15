import Notification from './Notification';

const QUEUE_MAX_LENGTH = 10;

export default class NotificationsManager {
  constructor(params, options) {
    const { container } = params;

    this.container = container;
    this.queue = [];

    const { environment } = options;
    this.environment = environment;
  }

  get day() {
    const { environment: { day } = {} } = this;

    return day;
  }

  push(notificationParams) {
    this.queue = this.queue.slice(0, QUEUE_MAX_LENGTH - 1)
    this.queue.unshift(new Notification(Object.assign(
      notificationParams,
      { day: this.day }
    )));

    this.render();
  }

  render() {
    this.container.innerHTML = this.queue
      .map((notification) => notification.render())
      .join('');
  }
}
