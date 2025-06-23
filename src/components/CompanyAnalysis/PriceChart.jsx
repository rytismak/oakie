import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";

export default function PriceChart({ intrinsicValueEstimates = [], dailyStockPrice = [] }) {
  if (!dailyStockPrice.length) return null;

  // Extend each price entry with matching intrinsic range
  const filledData = dailyStockPrice.map((item) => {
    const intrinsic = intrinsicValueEstimates.find((q) => {
      const date = new Date(item.date);
      return date >= new Date(q.startDate) && date <= new Date(q.endDate);
    });
    return {
      ...item,
      intrinsicMin: intrinsic ? intrinsic.min : null,
      intrinsicMax: intrinsic ? intrinsic.max : null,
    };
  });

  const chartStart = dailyStockPrice[0].date.split("T")[0];
  const chartEnd = dailyStockPrice[dailyStockPrice.length - 1].date.split("T")[0];

  const allValues = filledData.reduce((acc, item) => {
    acc.push(item.price);
    if (item.intrinsicMin != null) acc.push(item.intrinsicMin);
    if (item.intrinsicMax != null) acc.push(item.intrinsicMax);
    return acc;
  }, []);

  const minY = Math.min(...allValues);
  const maxY = Math.max(...allValues);
  const paddedMin = minY * 0.95;
  const paddedMax = maxY * 1.05;

  const numberOfTicks = 4;
  const yTicks = Array.from(
    { length: numberOfTicks },
    (_, i) => paddedMin + (i * (paddedMax - paddedMin)) / (numberOfTicks - 1)
  );

  const firstOfMonthDates = filledData
    .filter((item) => new Date(item.date).getUTCDate() === 1)
    .map((item) => item.date);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      const price = payload[0].value;
      const min = payload[0].payload.intrinsicMin;
      const max = payload[0].payload.intrinsicMax;

      if (min && max) {
        const percent = ((price - (min + max) / 2) / ((min + max) / 2)) * 100;
        return (
          <div className="p-2 bg-light border">
            <div>Date: {label}</div>
            <div>Price: ${price.toFixed(2)}</div>
            <div>
              Intrinsic (Min - Max): ${min.toFixed(2)} - ${max.toFixed(2)}
            </div>
            <div>Difference: {percent.toFixed(2)}%</div>
          </div>
        );
      }
      return (
        <div className="p-2 bg-light border">
          <div>Date: {label}</div>
          <div>Price: ${price.toFixed(2)}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mb-4 mt-4">
      <h2 className="mb-4 pt-4 mt-4">Stock price vs Intrinsics (Past 365 days)</h2>
      <ResponsiveContainer width="99%" height={240}>
        <LineChart data={filledData} margin={{ top: 5, right: 1, left: 1, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) =>
              new Date(date).toLocaleString("en", { month: "short" })
            }
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            ticks={firstOfMonthDates}
            domain={["dataMin", "dataMax"]}
          />
          <YAxis
            dataKey="price"
            tick={{ fontSize: 10 }}
            ticks={yTicks}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
            domain={[paddedMin, paddedMax]}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* --- Clamped intrinsic value zones --- */}
          {intrinsicValueEstimates
            .map((q) => {
              const clampedStart = new Date(
                Math.max(new Date(q.startDate), new Date(chartStart))
              )
                .toISOString()
                .split("T")[0];
              const clampedEnd = new Date(
                Math.min(new Date(q.endDate), new Date(chartEnd))
              )
                .toISOString()
                .split("T")[0];

              return {
                ...q,
                clampedStart,
                clampedEnd,
              };
            })
            .filter((q) => new Date(q.clampedStart) <= new Date(q.clampedEnd))
            .map((q, i) => (
              <ReferenceArea
                key={`q-${i}`}
                x1={q.clampedStart}
                x2={q.clampedEnd}
                y1={q.min}
                y2={q.max}
                fill="#ffff00"
                fillOpacity={0.2}
                stroke="#000"
                strokeOpacity={0.00}
              />
            ))}

          <Line
            stroke="#8884d8"
            dataKey="price"
            isAnimationActive={false}
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
