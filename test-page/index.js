// TODO: revisit performance
fetch('./data/2e4.csv')
    .then(response => response.text())
    .then(text => d3.csvParse(text))
    .then(data => {
        data.forEach(d => {
            //if (d.event === 'ICU') {
            //    d.duration = Math.ceil(Math.random() * 5);
            //    d.endy = d.stdy + d.duration - 1;
            //}
        });
        const fdg = forceDirectedGraph(
            data,
            '#container',
            {
                eventLabel: 'HFrEF events',
                timeRelative: 'since baseline',
                drawStaticSeparately: true,
                shapeBy: {
                    type: 'categorical',
                    label: 'Arm',
                    variable: 'arm'
                },
                minRadius: 2,
                fill: true,
                eventChangeCount: [
                    'Hospitalization',
                    'ICU',
                ],
                //playPause: 'pause',
                delay: false,
                speed: 'fast',
                enforceFocusVicinity: true,
            }
        );
    });
