export var EcgChartOptions = {
  chart: {
    type: 'spline',
    animation: null,
    marginRight: 10,
    events: {
      load: null,
    },
  },

  time: {
    useUTC: false,
  },

  title: {
    text: 'Live random data',
  },

  xAxis: {
    type: 'datetime',
    tickPixelInterval: 150,
  },

  yAxis: {
    title: {
      text: 'Value',
    },
    plotLines: [
      {
        value: 0,
        width: 1,
        color: '#808080',
      },
    ],
  },

  tooltip: {
    headerFormat: '<b>{series.name}</b><br/>',
    pointFormat: '{point.x:%Y-%m-%d %H:%M:%S}<br/>{point.y:.2f}',
  },

  legend: {
    enabled: false,
  },

  exporting: {
    enabled: false,
  },

  series: [
    {
      name: 'Random data',
      data: (function () {
        // generate an array of random data
        var data = [],
          time = new Date().getTime(),
          i;

        for (i = -19; i <= 0; i += 1) {
          data.push({
            x: time + i * 1000,
            y: Math.random(),
          });
        }
        return data;
      })(),
    },
  ],
};
