import { Chart, registerables } from "chart.js";
import _ from "lodash";

Chart.register(...registerables);

var currentChart: any;

const CHART_COLORS = {
  red: "rgb(255, 99, 132)",
  orange: "rgb(255, 159, 64)",
  yellow: "rgb(255, 205, 86)",
  green: "rgb(75, 192, 192)",
  blue: "rgb(54, 162, 235)",
  purple: "rgb(153, 102, 255)",
  grey: "rgb(201, 203, 207)",
};

export function getDoughnut(element: any, kols: string[], datas: number[]) {
  let tempDatas = _.cloneDeep(datas);
  //mutiply datas 1000 times
  for (let i = 0; i < datas.length; ++i) {
    tempDatas[i] = tempDatas[i] * 1000;
  }
  for (let i = 0; i < kols.length; ++i) {
    kols[i] = kols[i] + ": " + tempDatas[i] + "元";
  }

  let data: any = {
    labels: kols,
    datasets: [
      {
        label: "分成比例表",
        data: tempDatas,
        backgroundColor: _.shuffle(Object.values(CHART_COLORS)),
        hoverOffset: 4,
      },
    ],
  };

  console.log(data);

  let config: any = {
    type: "bar",
    data: data,
  };

  currentChart = new Chart(element, config);
}

export function destroyChart() {
  if (currentChart) currentChart.destroy();
}
