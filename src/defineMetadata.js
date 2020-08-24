import id from './defineMetadata/id';
import event from './defineMetadata/event';
import orbit from './defineMetadata/orbit';
import coordinates from './defineMetadata/coordinates';

export default function defineMetadata() {
    // Define sets.
    const metadata = {};

    // Add additional metadata to ID set.
    metadata.id = id.call(this);

    // Settings dependent on the ID set.
    this.settings.minRadius = this.settings.minRadius || 3000 / metadata.id.length;
    this.settings.maxRadius =
        this.settings.maxRadius || this.settings.minRadius + this.settings.colors().length;
    this.settings.reset = this.settings.reset || d3.max(metadata.id, (id) => id.duration);

    // Add additional metadata to event set.
    metadata.event = event.call(this);

    // Update settings that depend on event set.
    this.settings.width = this.settings.width || metadata.event.length;
    this.settings.eventCentral = this.settings.eventCentral || metadata.event[0].value;
    this.settings.eventFinal =
        this.settings.eventFinal || metadata.event[metadata.event.length - 1].value;
    this.settings.nFoci =
        this.settings.nFoci || metadata.event.length - !!this.settings.eventCentral; // number of event types minus one
    this.settings.eventChangeCount =
        this.settings.eventChangeCount || metadata.event.slice(1).map((event) => event.value);
    this.settings.eventSequence = metadata.event
        .filter((event, i) => (this.settings.excludeLast ? i !== metadata.event.length - 1 : false))
        .filter((event, i) => (this.settings.excludeFirst ? i !== 0 : false))
        .map((event) => event.value);
    this.settings.R = this.settings.width / metadata.event.length / 2;

    // Define orbits.
    metadata.orbit = orbit.call(this, metadata.event);

    // Determine the dimensions of the canvas, the position of the foci, and the size of the orbits.
    coordinates.call(this, metadata);

    return metadata;
}
