import React, { PureComponent } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush, ReferenceLine
} from 'recharts';

export default function(props) {
  const {data, xKey, yKeys, brush, axis } = props
  const colors = [
    '#8884d8', '#82ca9d'
  ]
  return (
    <LineChart
      width={1000}
      height={400}
      data={data}
      margin={{
        top: 5, right: 30, left: 20, bottom: 5,
      }}
      syncId="anyId"
    >
      <Legend verticalAlign="top"/>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xKey} tick={{fill: 'white', strokeWidth: 1}} />
      <YAxis domain={['auto', 'auto']}/>
      <Tooltip />
      {
        yKeys && yKeys[0] === 'pctDiff' && (
          <ReferenceLine y={0} stroke="red" />
        )
      }
      {yKeys.map((yKey, index) => {
        return (<Line type="monotone" dataKey={ yKey } stroke={colors[index]} />)
      })}
      {brush && (<Brush />)}
    </LineChart>
  );
}


