//import Highcharts from "highcharts";

let chart;

export function initializeChart() {
  chart = Highcharts.chart("container", {
    chart: {
      type: "pie",
    },
    title: {
      text: "Resume Strengths",
    },
    series: [
      {
        name: "Score",
        data: [
          { name: "Technical Skills", y: 0 },
          { name: "Leadership", y: 0 },
          { name: "Relevance", y: 0 },
        ],
      },
    ],
  });
}

export function updateChart(scores) {
  chart.series[0].setData([
    { name: "Technical Skills", y: scores["Technical Skills"] || 0 },
    { name: "Leadership", y: scores["Leadership"] || 0 },
    { name: "Relevance", y: scores["Relevance"] || 0 },
  ]);
}
