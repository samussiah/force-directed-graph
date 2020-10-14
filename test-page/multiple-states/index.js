//fetch('../data/data_1000.csv')
fetch('../data/data_2000_fixed.csv')
    .then(response => response.text())
    .then(text => d3.csvParse(text))
    .then(data => {
        // TODO: color and/or size by number of events
        const fdg = forceDirectedGraph(
            data,
            '#container',
            {
                eventChangeCountAesthetic: 'size',
                colorBy: {
                    type: 'categorical',
                    variable: 'category',
                    label: 'Categories',
                },
            }
        );
    });
