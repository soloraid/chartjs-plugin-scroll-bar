# Chart.js plugin scroll bar
This plugin for Chart.js that make scrollable charts in descriptors.
Requires **Chart.js v3.9.1 or higher**.

# Installation

### npm
```
npm install chartjs-plugin-scroll-bar
```

```javascript
import { Chart } from 'chartjs';
import ChartjsPluginScrollBar from 'chartjs-plugin-scroll-bar';

Chart.register(ChartjsPluginScrollBar);
```

## Options

| Name               |Type   |Default  |Description                                                                                                                                |
| :------------------|:------|:--------|:------------------------------------------------------------------------------------------------------------------------------------------|
| enable             |boolean|undefined|                                                                                                                                           |
| scrollType | 'Horizontal' \| 'Vertical' | undefined | depend on chart option indexAxis so x -> horizontal y-> vertical.                                                          |
| scrollSize    | number | undefined    |  step of descriptor changing on scroll.                                                                                                  |


## Usage

### Basic

specify plugin options with `scrollBar: {enable: true, scrollType: 'Horizontal', scrollSize: 2}`.

you must use indexAxis and min max of scales for working scrollbar.

scroll size should be the difference between min and max of descriptor scale + 1.

#### example
```javascript
new Chart(document.getElementById("my-chart"), {
  type: "bar",
  data: {
    labels: ["Foo", "Bar", "flare"],
    datasets: [
      { label: "bad", data: [5, 25], backgroundColor: "rgba(244, 143, 177, 0.6)" },
      { label: "better", data: [15, 10], backgroundColor: "rgba(255, 235, 59, 0.6)" },
      { label: "good", data: [10, 8], backgroundColor: "rgba(100, 181, 246, 0.6)" },
    ],
  },
  options: {
    indexAxis: "x",
    scales: {
        x: {
            min: 0,
            max: 1,
        }
    }
    plugins: {
      scrollBar: {enable: true, scrollType: 'Horizontal', scrollSize: 2},
    },
  },
});
```


## Supported chart types
- any chart indexAxis x or y.

## Contributing
Pull requests and issues are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/soloraid/chartjs-plugin-scroll-bar/issues).

1.  Fork it!
2.  Create your feature branch: `git checkout -b feature_name`
3.  Commit your changes: `git commit -am 'Add some feature'`
4.  Push to the branch: `git push origin feature_name`
5.  Submit a pull request!

### Development
- install: `npm install`
- publish plugin: `npm version (major|minor|patch) && npm run build:publish`