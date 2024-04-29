const chart = Highcharts.chart('container', {
  chart: {
    type: 'columnitem'
    //  inverted: true
  },
  title: {
    text: 'UK General Election 2024/2025',
    align: 'center'
  },
  colors: ['#b31f37', '#356cb5', '#db772f', '#8ec63f', '#d89d27', '#d89d27'],
  subtitle: {
    text: 'Change in Share of Seats from 2019',
    align: 'center'
  },
  xAxis: {
    categories: ['LAB', 'CON', 'LDM', 'GRN', 'SDP', 'RFM']
    //   offset: 2
  },
  yAxis: {
    visible: false,
    max: 200
  },
  legend: {
    enabled: false
  },
  plotOptions: {
    columnitem: {
      colorByPoint: true,
      minColumns: 5,
      maxColumns: 5
    }
  },
  series: [
    {
      name: 'Seat share',
      data: [49, 50, -16, 4, 2, 1],
      groupPadding: 0,
      borderWidth: 1,
      animation: {
        duration: 0
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '1em',
          fontWeight: 'normal'
        }
      }
      //   pointPadding: 0
    }
  ]
});

let d = 49;
//let f = -16;
setInterval(() => {
  if (d >= 200) return;

  d += 1;
  //  f -= 1;

  chart.series[0].update({
    data: [d, 50, -16, 4, 2, 4]
  });
}, 1000);
