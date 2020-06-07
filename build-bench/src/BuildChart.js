import React from 'react';
import TimeChart from 'components/TimeChart.js';
import { FormControl } from 'react-bootstrap';
import Palette from 'components/Palette.js';

const chartData = [{
    title: ["Compilation CPU Time", "Lower is faster"],
    property: ["kernel", "user"],
    name: "Time",
    more: "slower",
    less: "faster",
    xaxis: "xstacks",
    yaxis: "ystacks"
}, {
    title: "Maximum Resident Set Size (kB)",
    property: "memories",
    name: "Memory",
    more: "more",
    less: "less",
    xaxis: "bar",
    yaxis: "linear"
}, {
    title: "Number of Filesystem Inputs",
    property: "inputs",
    name: "I/O Reads",
    more: "more",
    less: "less",
    xaxis: "bar",
    yaxis: "linear"
}];

class BuildChart extends React.Component {
    averageTime(times, property) {
        return times.map(t => parseFloat(t[property])).reduce((s, t) => (s + t)) / times.length;
    }
    median(values) {
        if (values.length === 0) return 0;

        values.sort((a, b) => a - b);
        var half = Math.floor(values.length / 2);

        if (values.length % 2)
            return values[half];

        return (values[half - 1] + values[half]) / 2.0;
    }
    computeData(result, property, index) {
        if (index === 0)
            return this.averageTime(result["times"], property);
        return this.median(result[property].map(v => parseFloat(v)));
    }
    cleanData(result, property) {
        return result.filter(r => typeof r[property] !== 'undefined' && r[property].length);
    }
    makeData(result, titles, index) {
        if (!result || result.length === 0)
            return [[], []];
        const property = index === 0 ? "times" : chartData[index].property;
        const names = this.cleanData(result, property).map((_, i) => titles[i])
        return [names,
            [].concat(chartData[index].property).map(p => this.cleanData(result, property).map(r => this.computeData(r, p, index)))];

    }
    lighten(colors, i) {
        if (i === 0)
            return colors;
        return colors.map(c => Palette.lighten(c, Math.pow(0.3, i)));
    }
    renderDisplayTypes() {
        return <FormControl as="select" className="pull-right" onChange={(e) => this.props.changeDisplay(parseInt(e.target.value))} defaultValue={chartData[this.props.index].name}>
            {chartData.map((d, i) => <option value={i} key={d.name}>{d.name}</option>)}
        </FormControl>;
    }
    render() {
        const [labels, data] = this.makeData(this.props.benchmarks, this.props.titles, this.props.index);
        const colors = labels.map((_, i) => Palette.pickColor(i, labels.length, this.props.palette));
        return (
            <TimeChart
                data={data}
                labels={labels}
                dataLabels={[].concat(chartData[this.props.index].property)}
                colors={[].concat(chartData[this.props.index].property).map((p, i) => this.lighten(colors, i))}
                id={this.props.id}
                onDescriptionChange={d => this.props.onDescriptionChange(d)}
                title={chartData[this.props.index].title}
                more={chartData[this.props.index].more}
                less={chartData[this.props.index].less}
                xaxis={chartData[this.props.index].xaxis}
                yaxis={chartData[this.props.index].yaxis}
                fill={true}
            >{this.renderDisplayTypes()}</TimeChart>
        );
    }
}

export default BuildChart;