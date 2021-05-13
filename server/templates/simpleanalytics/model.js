const request = require("request-promise");

const builder = require("./builder");

const template = (website, apiKey, dashboardOrder) => ({
  Connection: {
    name: "SimpleAnalyticsAPI",
    type: "api",
    host: "https://simpleanalytics.com",
    options: [{
      "Api-Key": apiKey || "none",
    }]
  },
  Charts: [{
    tid: 1,
    name: "30-day Stats",
    chartSize: 1,
    currentEndDate: false,
    dashboardOrder: dashboardOrder + 1,
    displayLegend: false,
    draft: false,
    includeZeros: true,
    mode: "kpi",
    public: false,
    subType: "AddTimeseries",
    timeInterval: "day",
    type: "line",
    Datasets: [{
      legend: "Pageviews",
      datasetColor: "rgba(23, 190, 207, 1)",
      fill: false,
      fillColor: "rgba(0,0,0,0)",
      dateField: "root.histogram[].date",
      xAxis: "root.histogram[].date",
      yAxis: "root.histogram[].pageviews",
      yAxisOperation: "none",
      DataRequest: {
        route: `/${website}.json?version=5&fields=histogram`,
      }
    }, {
      legend: "Visitors",
      datasetColor: "#D62728",
      fill: false,
      fillColor: "rgba(0,0,0,0)",
      dateField: "root.histogram[].date",
      xAxis: "root.histogram[].date",
      yAxis: "root.histogram[].visitors",
      yAxisOperation: "none",
      DataRequest: {
        route: `/${website}.json?version=5&fields=histogram`,
      }
    }]
  }, {
    tid: 2,
    name: "Site Stats",
    chartSize: 2,
    currentEndDate: false,
    dashboardOrder: dashboardOrder + 2,
    displayLegend: false,
    draft: false,
    includeZeros: true,
    mode: "chart",
    public: false,
    subType: "lcTimeseries",
    timeInterval: "day",
    type: "line",
    Datasets: [{
      legend: "Pageviews",
      datasetColor: "#17BECF",
      fill: false,
      fillColor: "rgba(0,0,0,0)",
      dateField: "root.histogram[].date",
      xAxis: "root.histogram[].date",
      yAxis: "root.histogram[].pageviews",
      yAxisOperation: "none",
      DataRequest: {
        route: `/${website}.json?version=5&fields=histogram`,
      }
    }, {
      legend: "Visitors",
      datasetColor: "#D62728",
      fill: false,
      fillColor: "rgba(0,0,0,0)",
      dateField: "root.histogram[].date",
      xAxis: "root.histogram[].date",
      yAxis: "root.histogram[].visitors",
      yAxisOperation: "none",
      DataRequest: {
        route: `/${website}.json?version=5&fields=histogram`,
      }
    }]
  }, {
    tid: 3,
    name: "Devices",
    chartSize: 1,
    dashboardOrder: dashboardOrder + 3,
    draft: false,
    includeZeros: true,
    mode: "chart",
    public: false,
    subType: "timeseries",
    timeInterval: "day",
    type: "doughnut",
    displayLegend: true,
    Datasets: [{
      legend: "Devices",
      datasetColor: "rgba(207, 236, 249, 0)",
      fillColor: ["rgba(208, 2, 27, 0.34)", "rgba(126, 211, 33, 0.4)", "rgba(74, 144, 226, 0.61)"],
      multiFill: true,
      xAxis: "root.device_types[].value",
      yAxis: "root.device_types[].visitors",
      yAxisOperation: "none",
      DataRequest: {
        route: `/${website}.json?version=5&fields=device_types`,
      },
    }]
  }, {
    tid: 5,
    name: "Referrers Data",
    chartSize: 2,
    dashboardOrder: dashboardOrder + 4,
    draft: false,
    includeZeros: true,
    mode: "chart",
    public: false,
    subType: "timeseries",
    type: "table",
    timeInterval: "day",
    Datasets: [{
      legend: "Referrers",
      datasetColor: "#2CA02C",
      fill: false,
      fillColor: "rgba(0,0,0,0)",
      xAxis: "root.referrers[].value",
      yAxis: "root.referrers[].pageviews",
      yAxisOperation: "none",
      DataRequest: {
        route: `/${website}.json?version=5&fields=referrers`,
      },
    }, {
      legend: "UTM Sources",
      datasetColor: "#17BECF",
      fill: false,
      fillColor: "rgba(0,0,0,0)",
      xAxis: "root.utm_sources[].value",
      yAxis: "root.utm_sources[].pageviews",
      yAxisOperation: "none",
      DataRequest: {
        route: `/${website}.json?version=5&fields=utm_sources`,
      },
    }]
  }, {
    tid: 6,
    name: "Browsers & Countries",
    chartSize: 2,
    dashboardOrder: dashboardOrder + 5,
    draft: false,
    includeZeros: true,
    mode: "chart",
    public: false,
    subType: "timeseries",
    type: "table",
    timeInterval: "day",
    Datasets: [{
      legend: "Browsers",
      datasetColor: "#2CA02C",
      fill: false,
      fillColor: "rgba(0,0,0,0)",
      xAxis: "root.browser_names[].value",
      yAxis: "root.browser_names[].pageviews",
      yAxisOperation: "none",
      DataRequest: {
        route: `/${website}.json?version=5&fields=browser_names`,
      },
    }, {
      legend: "Countries",
      datasetColor: "#17BECF",
      fill: false,
      fillColor: "rgba(0,0,0,0)",
      xAxis: "root.countries[].value",
      yAxis: "root.countries[].pageviews",
      yAxisOperation: "none",
      DataRequest: {
        route: `/${website}.json?version=5&fields=countries`,
      },
    }]
  }],
});

module.exports.template = template;

module.exports.build = (projectId, { website, apiKey, charts }, dashboardOrder) => {
  if (!website) return Promise.reject("Missing required 'website' argument");

  const checkWebsiteOpt = {
    url: `https://simpleanalytics.com/${website}.json?version=5&fields=histogram`,
    method: "GET",
    headers: {
      accept: "application/json",
    },
    json: true,
  };

  if (apiKey) {
    checkWebsiteOpt.headers = {
      "Api-Key": apiKey,
    };
  }

  return request(checkWebsiteOpt)
    .then((data) => {
      if (!data.histogram) return Promise.reject(new Error(403));
      return builder(projectId, website, apiKey, dashboardOrder, template, charts);
    })
    .catch((err) => {
      if (err && err.message) {
        return Promise.reject(err.message);
      }
      return Promise.reject(err);
    });
};
