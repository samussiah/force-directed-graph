import resetAnimation from './animation';
import startInterval from '../../startInterval';

export default function timeout(countdown) {
    const timeout = window.setTimeout(() => {
        resetAnimation.call(this);
        this.containers.timer.text(`${this.settings.timepoint} ${this.settings.timeUnit}`);
        this.containers.slider.attr('value', this.settings.timepoint);
        window.clearInterval(countdown);
        window.clearTimeout(timeout);
        this.containers.countdown.classed('fdg-hidden', true);
        this.interval = startInterval.call(this);
    }, this.settings.resetDelay);

    return timeout;
}
