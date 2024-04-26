const chart = Highcharts.chart('container', {
  chart: {
    type: 'columnitem'
    // inverted: true
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
    categories: ['LAB', 'CON', 'LDM', 'GRN', 'SDP', 'RFM'],
    offset: 2
  },
  yAxis: {
    visible: false
  },
  legend: {
    enabled: false
  },
  plotOptions: {
    columnitem: {
      dataLabels: {
        enabled: true,
        format: '+{point.y}'
      },
      borderWidth: 1,
      maxValue: 200,
      colorByPoint: true
    }
  },
  series: [
    {
      name: 'Seat share',
      data: [49, 50, 16, 4, 2, 1]
    }
  ]
});
/*
setTimeout(() => {
  chart.series[0].update({
    data: [70, 50, 60, 6, 2, 4]
  });
}, 3000);
*/

let d = 49;
setInterval(() => {
  if (d >= 200) return;
  d += 1;

  chart.series[0].update({
    data: [d, 50, 60, 6, 2, 4]
  });
}, 500);
