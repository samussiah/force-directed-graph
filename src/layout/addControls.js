import speed from './addControls/speed';
import playPause from './addControls/playPause';
import step from './addControls/step';
import reset from './addControls/reset';
import colorSizeToggle from './addControls/colorSizeToggle';

export default function addControls() {
    this.controls = {
        container: this.container.append('div').classed('fdg-controls', true),
    };
    this.controls.speed = speed.call(this);
    this.controls.playPause = playPause.call(this);
    this.controls.step = step.call(this);
    this.controls.reset = reset.call(this);
    this.controls.colorSizeToggle = colorSizeToggle.call(this);
}
