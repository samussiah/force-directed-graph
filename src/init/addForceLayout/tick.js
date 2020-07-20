import collide from './tick/collide';

// TODO: figure out what k does
export default function tick(e) {
    // k controls the speed at which the nodes reach the appropriate focus
    const k = 0.04 * e.alpha;

    if (this.ticks !== undefined) this.ticks++;

    // Push nodes toward their designated focus.
    this.data.nested.forEach((d, i) => {
        // Find the datum of the destination focus.
        const currentEvent = this.metadata.event.find(
            (event) => event.value === d.currentEvent.event
        );

        // Take the point's current coordinates and add to it the difference between the coordinates of the
        // destination focus and the coordinates of the point, multiplied by some tiny fraction.
        d.x += (currentEvent.x - d.x) * k;
        d.y += (currentEvent.y - d.y) * k;
    });

    // Update the coordinates, radius, fill, and stroke of the each node.
    this.circles
        .each(collide.call(this, 0.2))
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);
}
