import forceSimulationWorker from 'web-worker:./addStaticForceSimulation/forceSimulationWorker';
import radial from './addStaticForceSimulation/radial';
import circular from './addStaticForceSimulation/circular';

export default function addStaticForceSimulation() {
    const main = this;

    const noStateChange = this.data.nested
        .filter((d) => d.value.noStateChange)
        .map((d) => {
            return {
                key: d.key,
                category: d.value.category,
            };
        });

    const worker = new forceSimulationWorker();

    worker.postMessage({
        nodes: noStateChange,
        x: this.settings.orbitRadius / 2,
        y: this.settings.height / 2,
        strength: this.settings.chargeStrength,
        radius: this.settings.minRadius,
    });

    const ended = function(data) {
        const nodes = data.nodes;
        const g = main.containers.svgBackground.insert('g', ':first-child');
        const circles = g
            .selectAll('circle')
            .data(nodes)
            .enter()
            .append('circle')
            .attr('cx', (d) => d.x)
            .attr('cy', (d) => d.y)
            .attr('r', main.settings.minRadius)
            .attr('fill', main.settings.color(0))
            .attr('fill-opacity', 0.25);
    };

    worker.onmessage = function(event) {
        switch (event.data.type) {
            case 'end':  return  ended(event.data);
        }
    };

    //if (this.settings.drawStaticSeparately) {
    //    const noStateChange = this.data.nested
    //        .filter((d) => d.value.noStateChange)
    //        .map((d) => {
    //            return {
    //                key: d.key,
    //                category: d.value.category,
    //            };
    //        });

    //    let staticForceSimulation;

    //    var meter = this.containers.main.append('div').node();
    //    console.log(forceSimulationWorker);
    //    var worker = new forceSimulationWorker();
    //    console.log(worker);
    //    worker.postMessage({
    //        nodes: noStateChange,
    //    });
    //    worker.onmessage = function(event) {
    //        console.log(event);
    //    };
        //worker.postMessage({
        //    nodes: noStateChange,
        //});
        //var ticked = function(data) {
        //    var progress = data.progress;
        //    meter.style.width = 100 * progress + '%';
        //};
        //var ended = function(data) {
        //    var nodes = data.nodes;
        //    meter.style.display = 'none';
        //    const g = main.containers.svgBackground.insert('g', ':first-child');
        //    const circles = g
        //        .selectAll('circle')
        //        .data(nodes)
        //        .enter()
        //        .append('circle')
        //        .attr('cx', (d) => d.x)
        //        .attr('cy', (d) => d.y)
        //        .attr('r', main.settings.minRadius)
        //        .attr('fill', color)
        //        .attr('fill-opacity', 0.25);
        //};

        //worker.onmessage = function(event) {
        //    switch (event.data.type) {
        //        case 'tick': return ticked(event.data);
        //        case 'end':  return  ended(event.data);
        //    }
        //};
        //if (this.settings.colorBy.type === 'categorical') {
        //    staticForceSimulation = this.metadata.event[0].foci.map((focus) => {
        //        const data = noStateChange.filter((d) => d.category === focus.key);
        //        const forceSimulation =
        //            this.settings.staticLayout === 'radial'
        //                ? radial.call(this, data, focus.x, focus.y, this.colorScale(focus.key))
        //                : circular.call(this, data, focus.x, focus.y, this.colorScale(focus.key));
        //        return forceSimulation;
        //    });
        //} else {
        //    staticForceSimulation =
        //        this.settings.staticLayout === 'radial'
        //            ? [
        //                  radial.call(
        //                      this,
        //                      noStateChange,
        //                      this.settings.orbitRadius / 2,
        //                      this.settings.height / 2,
        //                      this.settings.color(0)
        //                  ),
        //              ]
        //            : [
        //                  circular.call(
        //                      this,
        //                      noStateChange,
        //                      this.settings.orbitRadius / 2,
        //                      this.settings.height / 2,
        //                      this.settings.color(0)
        //                  ),
        //              ];
        //}

    //    return staticForceSimulation;
    //}
}
