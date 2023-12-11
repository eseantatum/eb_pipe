import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';

const BASE_API_URL = process.env.REACT_APP_BASE_API_URL;

function LabelChart() {
  const [labelData, setLabelData] = useState([]);

  useEffect(() => {
    // Fetch the JSON data
    fetch(BASE_API_URL+'/labels')
      .then(response => response.json())
      .then(data => setLabelData(data.results))
      .catch(error => console.error('Error fetching label data:', error));
  }, []);

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Count of each Label Present in DB</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={labelData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" label={{ value: 'Label', position: 'bottom' }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="rgba(54, 162, 235, 0.5)">
            {labelData.map((entry, index) => (
              <Label
                key={index}
                content={({ x, y, width, value }) => (
                  <text x={x + width / 2} y={y + 10} fill="#333" textAnchor="middle">
                    {value}
                  </text>
                )}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LabelChart;
