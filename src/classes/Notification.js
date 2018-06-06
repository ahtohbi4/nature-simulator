export default class Notification {
  constructor(params) {
    const {
      author = 'System',
      day,
      message,
    } = params;

    this.author = author;
    this.day = day;

    if (typeof message !== 'string') {
      throw new TypeError(`Notification: Parameter "message" should be a string but ${typeof message} is defined.`);
    }

    this.message = message;
  }

  render() {
    return `
      <div class="notification">
        <div class="notification__author">${this.author}</div>
        <div class="notification__date">Day ${this.day}</div>
        <div class="notification__message">- ${this.message}</div>
      </div>
    `;
  }
}
