import drawCircle from './tick/circle';
import drawSquare from './tick/square';
import drawTriangle from './tick/triangle';
import drawDiamond from './tick/diamond';
import drawStar from './tick/star';
import drawTriangleDown from './tick/triangleDown';

export default function tick(data) {
    this.containers.canvas.context.clearRect(0, 0, this.settings.width, this.settings.height);
    this.containers.canvas.context.save();

    data.nested
        .sort((a, b) => a.value.stateChanges - b.value.stateChanges) // draw bubbles with more state changes last
        .forEach((d, i) => {
            this.containers.canvas.context.beginPath();

            switch (d.value.shape) {
                case 'circle':
                    drawCircle.call(this, d);
                    break;
                case 'square':
                    drawSquare.call(this, d);
                    break;
                case 'triangle':
                    drawTriangle.call(this, d);
                    break;
                case 'diamond':
                    drawDiamond.call(this, d);
                    break;
                case 'star':
                    drawStar.call(this, d);
                    break;
                case 'triangleDown':
                    drawTriangleDown.call(this, d);
                    break;
                default:
                    drawCircle.call(this, d);
            }
        });

    this.containers.canvas.context.restore();
}
