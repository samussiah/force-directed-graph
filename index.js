(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.forceDirectedGraph = factory());
}(this, (function () { 'use strict';

    function colors() {
      var colors = ['#a50026', //'#d73027',
      '#f46d43', //'#fdae61',
      '#fee08b', //'#ffffbf',
      '#d9ef8b', //'#a6d96a',
      '#66bd63', //'#1a9850',
      '#006837'].reverse();
      return colors;
    }

    function colorScale() {
      var colors$1 = colors();
      var colorScale = d3.scale.linear().domain(d3.range(colors$1.length)).range(colors$1);
      return colorScale;
    }

    function color(n) {
      return colorScale()(Math.min(n, colorScale().domain().length));
    }

    var settings = {
      playPause: 'play',
      speed: 'slow',
      speeds: {
        slow: 1000,
        medium: 200,
        fast: 50
      },
      centerEventType: 'Home',
      centerCoordinates: {
        x: 380,
        y: 365
      },
      timepoint: 0,
      timeUnit: 'days since randomization',
      reset: null,
      timeFrame: null,
      width: 780,
      height: 800,
      padding: 1,
      minRadius: 3,
      maxRadius: 3,
      colors: colors,
      colorScale: colorScale,
      color: color,
      eventTypes: null,
      // data-driven by default
      annotations: [{
        start_minute: 1,
        stop_minute: 75,
        note: 'Heart disease is the leading cause of death for men, women, and people of most racial and ethnic groups in the United States.'
      }, {
        start_minute: 90,
        stop_minute: 165,
        note: 'One person dies every 37 seconds in the United States from cardiovascular disease.'
      }, {
        start_minute: 180,
        stop_minute: 255,
        note: 'About 647,000 Americans die from heart disease each year—that’s 1 in every 4 deaths.'
      }, {
        start_minute: 270,
        stop_minute: 345,
        note: 'Heart disease costs the United States about $219 billion each year from 2014 to 2015.'
      }, {
        start_minute: 360,
        stop_minute: 435,
        note: 'This includes the cost of health care services, medicines, and lost productivity due to death.'
      }, {
        start_minute: 450,
        stop_minute: 525,
        note: 'Coronary heart disease is the most common type of heart disease, killing 365,914 people in 2017.'
      }, {
        start_minute: 540,
        stop_minute: 615,
        note: 'About 18.2 million adults age 20 and older have CAD (about 6.7%).'
      }, {
        start_minute: 630,
        stop_minute: 705,
        note: 'About 2 in 10 deaths from CAD happen in adults less than 65 years old.'
      }, {
        start_minute: 720,
        stop_minute: 795,
        note: 'In the United States, someone has a heart attack every 40 seconds.'
      }, {
        start_minute: 810,
        stop_minute: 885,
        note: 'Every year, about 805,000 Americans have a heart attack.'
      }, {
        start_minute: 900,
        stop_minute: 975,
        note: '75% experience their first heart attack'
      }, {
        start_minute: 990,
        stop_minute: 1065,
        note: '25% have already had a heart attack.'
      }, {
        start_minute: 1080,
        stop_minute: 1155,
        note: 'About 1 in 5 heart attacks is silent—the damage is done, but the person is not aware of it.'
      }]
    };

    function speed() {
      var _this = this;

      var fdg = this;
      var container = this.controls.append('div').classed('fdg-control fdg-control--speed', true);
      var inputs = container.selectAll('div').data(Object.keys(this.settings.speeds).map(function (key) {
        return {
          label: key,
          value: _this.settings.speeds[key]
        };
      })).enter().append('div').attr('class', function (d) {
        return "togglebutton ".concat(d.label, " ").concat(d.label === _this.settings.speed ? 'current' : '');
      }).text(function (d) {
        return d.label;
      });
      inputs.on('click', function (d) {
        inputs.classed('current', function (di) {
          return di.label === d.label;
        });
        fdg.settings.speed = d.label;
      });
      return {
        container: container,
        inputs: inputs
      };
    }

    function updateData() {
      var _this = this;

      this.data.nested.forEach(function (d) {
        var currEvent = d.currentEvent.event;
        var curr_moves = d.moves; // Time to go to next activity

        if (d.next_move_time === _this.settings.timepoint) {
          if (d.moves === d.sched.length - 1) {
            curr_moves = 0;
          } else {
            curr_moves += 1;
          } // Update individual to next event.


          d.currentEvent = d.sched[curr_moves];
          var nextEvent = d.currentEvent.event;
          var eventIndividual = d.eventTypes.find(function (eventType) {
            return eventType.label === nextEvent;
          });
          eventIndividual.count += 1; // Update population count at previous and next events.

          _this.eventTypes.find(function (eventType) {
            return eventType.label === currEvent;
          }).count -= 1;

          var eventPopulation = _this.eventTypes.find(function (eventType) {
            return eventType.label === nextEvent;
          });

          eventPopulation.count += 1; // Add to new activity count

          var stateChanges = d3.sum(d.eventTypes.filter(function (eventType) {
            return eventType.label !== _this.settings.centerEventType;
          }), function (eventType) {
            return eventType.count;
          });
          d.moves = curr_moves; //d.x = eventPopulation.x;
          //d.y = eventPopulation.y;

          d.r = _this.settings.minRadius; // + stateChanges;

          d.color = _this.settings.color(stateChanges);
          d.next_move_time += d.sched[d.moves].duration;
        }
      });
    }

    //import addTimer from '../addTimer';
    function reset() {
      var _this = this;

      this.settings.timepoint = 0; // Update the event object of the population.

      this.eventTypes.forEach(function (eventType) {
        eventType.count = 0;
      });
      this.data.nested.forEach(function (d) {
        // Initial event for the given individual.
        d.currentEvent = d.sched[0]; // Define an event object for the individual.

        d.eventTypes.forEach(function (eventType) {
          eventType.count = 0;
          eventType.duration = 0;
        });
        d.eventTypes.find(function (eventType) {
          return eventType.label === d.currentEvent.event;
        }).count += 1;

        var eventType = _this.eventTypes.find(function (eventType) {
          return eventType.label === d.currentEvent.event;
        });

        eventType.count += 1;
        var stateChanges = d3.sum(d.eventTypes.filter(function (eventType) {
          return eventType.label !== _this.settings.centerEventType;
        }), function (eventType) {
          return eventType.count;
        });
        d.x = eventType.x + Math.random();
        d.y = eventType.y + Math.random();
        d.r = _this.settings.minRadius; // + stateChanges;

        d.color = _this.settings.color(stateChanges);
        d.moves = 0;
        d.next_move_time = d.currentEvent.duration;
      }); //if (this.settings.playPause === 'play')
      //    this.timeout = setTimeout(addTimer.bind(this), this.settings.speeds[this.settings.speed]);
    }

    // Output readable percent based on count.
    // TODO: remove hard-coded denominator
    function readablePercent(n) {
      var pct = 100 * n / 1000;

      if (pct < 1 && pct > 0) {
        pct = '<1%';
      } else {
        pct = Math.round(pct) + '%';
      }

      return "".concat(n, " (").concat(pct, ")");
    }

    // Minutes to time of day. Data is minutes from 4am.
    function minutesToTime(m) {
      var minutes = m % 1440; //var minutes = (m + 4 * 60) % 1440;

      return "".concat(minutes, " ").concat(this.settings.timeUnit); //return hh + ":" + mm + ampm
    }

    /**
     * Order of operations:
     *
     * 1. Update data for each individual.
     * 2. Resume force simulation.
     * 3. Increment timepoint.
     * 4. Update timer text, percentage annotations, and information annotation.
     * 5. Recursively call addTimer().
     */

    function addTimer() {
      // Increment the timepoint.
      this.settings.timepoint += 1; // Resume the force simulation.

      this.force.resume();

      if (this.settings.timepoint > this.settings.reset) {
        reset.call(this); //clearTimeout(this.timeout);
        //setTimeout(() => reset.call(this), 1000);
      } else {
        // Update the node data.
        updateData.call(this); // Update percentages

        this.fociLabels.selectAll('tspan.actpct').text(function (d) {
          return readablePercent(d.count);
        }); // Update time

        var true_minute = this.settings.timepoint % 1440;
        this.timer.text(minutesToTime.call(this, true_minute)); // Update notes

        if (true_minute === this.settings.annotations[this.notes_index].start_minute) {
          this.annotations.style('top', '0px').transition().duration(600).style('top', '20px').style('color', '#000000').text(this.settings.annotations[this.notes_index].note);
        } // Make note disappear at the end.
        else if (true_minute === this.settings.annotations[this.notes_index].stop_minute) {
            this.annotations.transition().duration(1000).style('top', '300px').style('color', '#ffffff');
            this.notes_index += 1;

            if (this.notes_index === this.settings.annotations.length) {
              this.notes_index = 0;
            }
          }
      }

      this.timeout = setTimeout(addTimer.bind(this), this.settings.speeds[this.settings.speed]);
    }

    function collide(alpha) {
      var fdg = this; // Resolve collisions between nodes.

      var quadtree = d3.geom.quadtree(this.data.nested);
      return function (d) {
        var r = d.r + fdg.settings.maxRadius + fdg.settings.padding;
        var nx1 = d.x - r;
        var nx2 = d.x + r;
        var ny1 = d.y - r;
        var ny2 = d.y + r;
        quadtree.visit(function (quad, x1, y1, x2, y2) {
          if (quad.point && quad.point !== d) {
            var x = d.x - quad.point.x;
            var y = d.y - quad.point.y;
            var l = Math.sqrt(x * x + y * y);

            var _r = d.r + quad.point.r + (d.currentEvent.event !== quad.point.currentEvent.event) * fdg.settings.padding;

            if (l < _r) {
              l = (l - _r) / l * alpha;
              d.x -= x *= l;
              d.y -= y *= l;
              quad.point.x += x;
              quad.point.y += y;
            }
          }

          return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
      };
    }

    function playPause() {
      var _this = this;

      var fdg = this;
      var container = this.controls.append('div').classed('fdg-control fdg-control--play-pause', true);
      var playPause = [{
        action: 'play',
        label: 'Play',
        html: '&#x25B6;'
      }, {
        action: 'pause',
        label: 'Pause',
        html: '&#x23F8;'
      }];
      var inputs = container.append('button').classed("togglebutton fdg-input", true).attr('title', "".concat(playPause.find(function (value) {
        return value.action !== _this.settings.playPause;
      }).label, " animation")).html(playPause.find(function (value) {
        return value.action !== _this.settings.playPause;
      }).html);
      inputs.on('click', function () {
        fdg.settings.playPause = playPause.find(function (value) {
          return value.action !== fdg.settings.playPause;
        }).action; // toggle playPause setting

        d3.select(this).attr('title', "".concat(playPause.find(function (value) {
          return value.action !== fdg.settings.playPause;
        }).label, " animation")).html(playPause.find(function (value) {
          return value.action !== fdg.settings.playPause;
        }).html);

        if (fdg.settings.playPause === 'play') {
          fdg.timeout = setTimeout(addTimer.bind(fdg), fdg.settings.speeds[fdg.settings.speed]);
        } else if (fdg.settings.playPause === 'pause') {
          clearTimeout(fdg.timeout);
          fdg.force.resume();
        }
      });
      return {
        container: container,
        inputs: inputs
      };
    }

    function addControls() {
      this.controls = this.container.append('div').classed('fdg-controls', true);
      speed.call(this);
      playPause.call(this);
    }

    function color$1() {
      var _this = this;

      this.colorLegend = this.legends.append('div').classed('fdg-legend fdg-legend__color', true);
      var legendDimensions = [200, 100];
      this.colorLegend.append('div').html('Number of <span class = "fdg-measure">hospitalization</span> events');
      var colorLegendSvg = this.colorLegend.append('svg').attr('width', legendDimensions[0]).attr('height', legendDimensions[1]).append('g');
      colorLegendSvg.selectAll('rect.legend-mark').data(this.settings.colors()).enter().append('rect').classed('legend-mark', true).attr('x', function (d, i) {
        return i * (legendDimensions[0] / _this.settings.colors().length);
      }).attr('y', 0).attr('width', legendDimensions[0] / this.settings.colors().length).attr('height', legendDimensions[1] / 2).attr('fill', function (d) {
        return d;
      }).attr('fill-opacity', 0.5).attr('stroke', function (d) {
        return d;
      }).attr('stroke-opacity', 1);
      colorLegendSvg.append('text').attr('x', legendDimensions[0] / this.settings.colors().length / 2).attr('y', legendDimensions[1] / 2 + 16).attr('text-anchor', 'middle').text('0');
      colorLegendSvg.append('text').attr('x', legendDimensions[0] - legendDimensions[0] / this.settings.colors().length / 2).attr('y', legendDimensions[1] / 2 + 16).attr('text-anchor', 'middle').text("".concat(this.settings.colors().length, "+"));
    }

    function size() {
      var _this = this;

      this.sizeLegend = this.legends.append('div').classed('fdg-legend fdg-legend__size', true);
      var legendDimensions = [200, 100];
      this.sizeLegend.append('div').html('Number of <span class = "fdg-measure">hospitalization</span> events');
      var sizeLegendSvg = this.sizeLegend.append('svg').attr('width', legendDimensions[0]).attr('height', legendDimensions[1]).append('g');
      sizeLegendSvg.selectAll('circle.legend-mark').data(this.settings.colors()).enter().append('circle').classed('legend-mark', true).attr('cx', function (d, i) {
        return i * (legendDimensions[0] / _this.settings.colors().length) + legendDimensions[0] / _this.settings.colors().length / 2;
      }).attr('cy', legendDimensions[0] / this.settings.colors().length / 2).attr('r', function (d, i) {
        return i + _this.settings.minRadius;
      }).attr('fill', '#aaa').attr('fill-opacity', 0.5).attr('stroke', '#aaa').attr('stroke-opacity', 1);
      sizeLegendSvg.append('text').attr('x', legendDimensions[0] / this.settings.colors().length / 2).attr('y', legendDimensions[1] / 2 + 16).attr('text-anchor', 'middle').text('0');
      sizeLegendSvg.append('text').attr('x', legendDimensions[0] - legendDimensions[0] / this.settings.colors().length / 2).attr('y', legendDimensions[1] / 2 + 16).attr('text-anchor', 'middle').text("".concat(this.settings.colors().length, "+"));
    }

    function addLegends() {
      this.legends = this.canvas.append('div').classed('fdg-legends', true);
      color$1.call(this);
      size.call(this);
    }

    function layout() {
      this.container = d3.select(this.element).append('div').classed('force-directed-graph', true).datum(this);
      addControls.call(this);
      this.timer = this.container.append('div').classed('fdg-timer', true).text("".concat(this.settings.timepoint, " ").concat(this.settings.timeUnit));
      this.annotations = this.container.append('div').classed('fdg-annotations', true);
      this.canvas = this.container.append('div').classed('fdg-canvas', true);
      this.svg = this.canvas.append('svg').classed('fdg-svg', true).attr('width', this.settings.width).attr('height', this.settings.height);
      addLegends.call(this);
    }

    function defineEventTypes() {
      var eventTypes = Array.from(new Set(this.data.map(function (d) {
        return d.event_order + ':|:' + d.event;
      }))).map(function (eventType) {
        var split = eventType.split(':|:');
        return {
          order: parseInt(split[0]),
          label: split[1],
          count: 0
        };
      }).sort(function (a, b) {
        return a.order - b.order ? a.order - b.order : a.label < b.label ? -1 : 1;
      }); // Define coordinates of foci.
      // TODO: make the coordinates a little less hard-coded, particularly the + 380 and + 365 bits

      var theta = 2 * Math.PI / (eventTypes.length - 1);
      var centerX = this.settings.centerCoordinates.x;
      var centerY = this.settings.centerCoordinates.y;
      eventTypes.forEach(function (eventType, i) {
        eventType.x = i === 0 ? centerX : (i * 100 + 50) * Math.cos(i * theta) + centerX;
        eventType.y = i === 0 ? centerY : (i * 100 + 50) * Math.sin(i * theta) + centerY;
      });
      return eventTypes;
    }

    function nestData() {
      var _this = this;

      var nestedData = d3.nest().key(function (d) {
        return d.id;
      }).rollup(function (d) {
        // Initial event for the given individual.
        var currentEvent = d[0]; // Define an event object for the individual.

        var eventTypes = _this.eventTypes.map(function (eventType) {
          return {
            label: eventType.label,
            order: eventType.order,
            count: 0,
            duration: 0,
            totalDuration: d3.sum(d.filter(function (di) {
              return di.event === eventType.label;
            }), function (di) {
              return di.duration;
            })
          };
        });

        eventTypes.find(function (eventType) {
          return eventType.label === currentEvent.event;
        }).count += 1; // Update the event object of the population.

        var eventType = _this.eventTypes.find(function (eventType) {
          return eventType.label === currentEvent.event;
        });

        eventType.count += 1;
        var stateChanges = d3.sum(eventTypes.filter(function (eventType) {
          return eventType.label !== _this.settings.centerEventType;
        }), function (eventType) {
          return eventType.count;
        });
        return {
          currentEvent: currentEvent,
          eventTypes: eventTypes,
          duration: d3.sum(d, function (di) {
            return di.duration;
          }),
          x: eventType.x + Math.random(),
          y: eventType.y + Math.random(),
          r: _this.settings.minRadius,
          // + stateChanges,
          color: _this.settings.color(stateChanges),
          moves: 0,
          next_move_time: currentEvent.duration,
          sched: d
        };
      }).entries(this.data).map(function (d) {
        return Object.assign(d, d.values);
      });
      return nestedData;
    }

    function dataManipulation() {
      this.data.forEach(function (d) {
        d.duration = parseFloat(d.duration);
      }); // TODO: sort ID alphanumerically - don't assume it's going to be numeric

      this.data.sort(function (a, b) {
        var id_diff = a.id - b.id;
        var seq_diff = a.seq - b.seq;
        return id_diff || seq_diff;
      });
      this.eventTypes = defineEventTypes.call(this);
      this.data.nested = nestData.call(this); // TODO: move to settings.js

      this.settings.reset = this.settings.reset || d3.max(this.data.nested, function (d) {
        return d.duration;
      });
    }

    function addOrbits() {
      // Draw concentric circles.
      var orbits = this.svg.selectAll('circle.orbit').data(this.eventTypes.slice(1).map(function (d, i) {
        return {
          cx: 380,
          cy: 365,
          r: (i + 1) * 100 + 50
        };
      })).enter().append('circle').classed('orbit', true).attr('cx', function (d) {
        return d.cx;
      }).attr('cy', function (d) {
        return d.cy;
      }).attr('r', function (d) {
        return d.r;
      }).attr('fill', 'none').attr('stroke', '#aaa').attr('stroke-width', '.5'); // Annotate concentric circles.
      //this.svg
      //    .selectAll('text.orbit')
      //    .data(
      //        this.settings.eventTypes.slice(1).map((d, i) => {
      //            return { cx: 380, cy: 365, r: (i + 1) * 100 + 50 };
      //        })
      //    )
      //    .enter()
      //    .append('text')
      //    .classed('orbit', true)
      //    .attr('x', d => d.cx)
      //    .attr('y', d => d.cy - d.r)
      //    .text('asdf')
    }

    function tick(e) {
      var _this = this;

      var k = 0.02 * e.alpha; // Push nodes toward their designated focus.

      this.data.nested.forEach(function (d, i) {
        // Find the datum of the destination focus.
        var currentEvent = _this.eventTypes.find(function (eventType) {
          return eventType.label === d.currentEvent.event;
        }); // Take the point's current coordinates and add to it the difference between the coordinates of the
        // destination focus and the coordinates of the point, multiplied by some tiny fraction.


        d.x += (currentEvent.x - d.x) * k;
        d.y += (currentEvent.y - d.y) * k;
      });
      this.circles.each(collide.call(this, 0.5)).attr('cx', function (d) {
        return d.x;
      }).attr('cy', function (d) {
        return d.y;
      }).attr('r', function (d) {
        return d.r;
      }).style('fill', function (d) {
        return d.color;
      }).style('stroke', function (d) {
        return d.color;
      });
    }

    function addForceLayout() {
      var force = d3.layout.force().nodes(this.data.nested) // default: []
      // .links([]) default: []
      .size([this.settings.width, this.settings.height]) //.linkStrength(0.1) // default: 0.1
      .friction(0.9) // default: 0.9
      //.linkDistance(20) // default: 20
      .charge(-.25) // default: -30
      .gravity(0) // default: 0.1
      //.theta(0.8) // default: 0.8
      //.alpha(0.1) // default: 0.1
      .on('tick', tick.bind(this)).start();
      return force;
    }

    function addCircles() {
      var circles = this.svg.selectAll('circle.fdg-bubble').data(this.data.nested).enter().append('circle').classed('fdg-bubble', true).attr('r', function (d) {
        return d.r;
      }).style('fill', function (d) {
        return d.color;
      }).style('fill-opacity', 0.5).style('stroke', function (d) {
        return d.color;
      }).style('stroke-opacity', 1);
      return circles;
    }

    function addFociLabels() {
      var _this = this;

      var text = this.svg.selectAll('text.actlabel').data(this.eventTypes).enter().append('text').attr('class', 'actlabel').attr('x', function (d) {
        return d.x;
      }).attr('y', function (d) {
        return d.y + (d.order ? 35 : 0);
      });
      var label = text.append('tspan').attr('x', function (d) {
        return d.x;
      }).attr('text-anchor', 'middle').text(function (d) {
        return d.label;
      });
      var pct = text.append('tspan').classed('actpct', true).attr('x', function (d) {
        return d.x;
      }).attr('text-anchor', 'middle').attr('dy', '1.3em').text(function (d) {
        return d3.format('%')(d.count / _this.data.nested.length);
      });
      return text;
    }

    function init() {
      this.force = addForceLayout.call(this);
      this.circles = addCircles.call(this);
      this.fociLabels = addFociLabels.call(this);
      this.notes_index = 0;
      if (this.settings.playPause === 'play') this.timeout = setTimeout(addTimer.bind(this), this.settings.speeds[this.settings.speed]);
    }

    function forceDirectedGraph(data) {
      var element = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'body';
      var settings$1 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var fdg = {
        data: data,
        element: element,
        settings: Object.assign(settings, settings$1)
      };
      layout.call(fdg);
      dataManipulation.call(fdg);
      addOrbits.call(fdg);
      init.call(fdg);
      return fdg;
    }

    return forceDirectedGraph;

})));
