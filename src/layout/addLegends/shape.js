import circle from './shape/circle';
import square from './shape/square';
import triangle from './shape/triangle';
import diamond from './shape/diamond';

export default function shape() {
    const main = this;
    const shapes = {
        circle,
        square,
        triangle,
        diamond,
    };
    const container = this.legends.container
        .append('div')
        .classed('fdg-legend fdg-legend--shape', true);
    container
        .append('div')
        .classed('fdg-sidebar__label fdg-legend__label', true)
        .text(this.settings.shapeBy.label);
    const legendItems = container
        .append('svg')
        .attr('width', 200)
        .attr('height', 20 * this.scales.shape.domain().length)
        .selectAll('g')
        .data(this.scales.shape.domain())
        .join('g');
    const radius = 7;
    const spacing = 20;
    legendItems.each(function (value, i) {
        shapes[main.scales.shape(value)].call(main, d3.select(this), i, spacing, radius);
    });
    legendItems
        .append('text')
        .attr('font-size', '1rem')
        .attr('x', 35)
        .attr('y', (d, i) => i * 20 + 12)
        .attr('alignment-baseline', 'middle')
        .text((d) => `${d} (n=${this.metadata.id.filter((di) => di.shapeStratum === d).length})`);
}
