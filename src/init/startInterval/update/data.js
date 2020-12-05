import getState from '../../../dataManipulation/nestData/getState';
import defineDatum from '../../../dataManipulation/nestData/defineDatum';

export default function data() {
    // Count the number of individuals at each focus at previous timepoint.
    this.metadata.event.forEach((event) => {
        event.prevCount = event.count;

        if (event.foci)
            event.foci.forEach((focus) => {
                focus.prevCount = focus.count;
            });
    });

    this.data.nested.forEach((d) => {
        // Update individual to next event.
        const currentState = getState.call(this, d.value.group);

        if (d.value.state !== currentState) {
            d.value.statePrevious = d.value.state;
            d.value.state = currentState;
        }

        // Determine destination - the focus representing the current state of the individual.
        const destination =
            this.settings.colorBy.type === 'categorical' && this.settings.colorBy.stratify
                ? this.metadata.event
                      .find((event) => event.value === d.value.state.event)
                      .foci.find((focus) => focus.key === d.value.category)
                : this.metadata.event.find((event) => event.value === d.value.state.event);
        d.value.coordinates = { x: destination.x, y: destination.y };

        const datum = defineDatum.call(this, d.value.group, d.value.state, d.value.colorScale);
        Object.assign(d.value, datum);
    });

    // Record change in number of IDs at each focus at current timepoint.
    this.metadata.event.forEach((event) => {
        event.data = this.data.nested.filter((d, i) => d.value.state.event === event.value);
        event.count = event.data.length;
        event.proportion = event.count / event.denominator;
        event.proportionFmt = d3.format('.1%')(event.proportion);
        event.cumulative = this.data.filter(
            (d) => d.event === event.value && d.start_timepoint <= this.settings.timepoint
        ).length;
        event.countFmt = d3.format(',d')(event.count);
        event.countProportionFmt = `${event.countFmt} (${event.proportionFmt})`;
        event.cumulativeFmt = d3.format(',d')(event.cumulative);
        event.cells = [event.label, event.countProportionFmt, event.cumulativeFmt];
        event.change = event.count - event.prevCount;

        if (event.foci)
            event.foci.forEach((focus) => {
                focus.data = event.data.filter((d, i) => d.value.category === focus.key);
                focus.count = focus.data.length;
                focus.proportion = focus.count / focus.denominator;
                focus.proportionFmt = d3.format('.1%')(focus.proportion);
                focus.cumulative = this.data.filter(
                    (d) =>
                        d.event === event.value &&
                        d.category === focus.key &&
                        d.start_timepoint <= this.settings.timepoint
                ).length;
                focus.countFmt = d3.format(',d')(focus.count);
                focus.countProportionFmt = `${focus.countFmt} (${focus.proportionFmt})`;
                focus.cumulativeFmt = d3.format(',d')(focus.cumulative);
                focus.cells = [focus.label, focus.countProportionFmt, focus.cumulativeFmt];
                focus.change = focus.count - focus.prevCount;
            });
    });
}
