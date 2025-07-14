import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
  Area,
} from "recharts";

// Accepts dailyStockPrice: [{date, price}], intrinsicValueEstimates: [{startDate, endDate, DCFValue, ExitMultipleValue}]
export default function PriceChart({
  intrinsicValueEstimates = [],
  dailyStockPrice = [],
}) {
  const PERIODS = [
    { label: "5Y", years: 5 },
    { label: "4Y", years: 4 },
    { label: "3Y", years: 3 },
    { label: "2Y", years: 2 },
    { label: "1Y", years: 1 },
    { label: "YTD", years: "YTD" },
  ];
  const [selectedPeriod, setSelectedPeriod] = useState("1Y");

  if (!dailyStockPrice.length) return null;

  // --- Filter data by selected period ---
  const now = new Date();
  let periodStartDate;
  if (selectedPeriod === "YTD") {
    periodStartDate = new Date(now.getFullYear(), 0, 1); // Jan 1st this year
  } else {
    const years = PERIODS.find((p) => p.label === selectedPeriod)?.years || 1;
    periodStartDate = new Date(now);
    periodStartDate.setFullYear(now.getFullYear() - years);
  }

  // Filter dailyStockPrice
  const filteredDailyStockPrice = dailyStockPrice.filter((item) => {
    const d = new Date(item.date);
    return d >= periodStartDate && d <= now;
  });

  // Filter intrinsicValueEstimates
  const filteredIntrinsicValueEstimates = intrinsicValueEstimates.filter(
    (q) => {
      const end = new Date(q.endDate);
      const start = new Date(q.startDate);
      return end >= periodStartDate && start <= now;
    }
  );

  // Extend each price entry with matching DCF/ExitMultiple band
  const filledData = filteredDailyStockPrice.map((item) => {
    const intrinsic = filteredIntrinsicValueEstimates.find((q) => {
      const date = new Date(item.date);
      return date >= new Date(q.startDate) && date <= new Date(q.endDate);
    });
    return {
      ...item,
      DCFValue: intrinsic ? intrinsic.DCFValue : null,
      ExitMultipleValue: intrinsic ? intrinsic.ExitMultipleValue : null,
    };
  });

  if (!filledData.length)
    return <div className="mb-4 mt-4">No data for selected period.</div>;

  const chartStart = filledData[0].date.split("T")[0];
  const chartEnd = filledData[filledData.length - 1].date.split("T")[0];

  const allValues = filledData.reduce((acc, item) => {
    acc.push(item.price);
    if (item.DCFValue != null) acc.push(item.DCFValue);
    if (item.ExitMultipleValue != null) acc.push(item.ExitMultipleValue);
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
      const dcf = payload[0].payload.DCFValue;
      const exit = payload[0].payload.ExitMultipleValue;
      // Convert date to human readable format with weekday
      const dateObj = new Date(label);
      const dateStr = dateObj.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      if (dcf && exit) {
        const avg = (dcf + exit) / 2;
        const diff = avg / price - 1;
        return (
          <div className="p-2 bg-light border">
            <div>Date: {dateStr}</div>
            <div>Price: ${price.toFixed(2)}</div>
            <div>DCF: ${dcf.toFixed(2)}</div>
            <div>Exit Multiple: ${exit.toFixed(2)}</div>
            <div>Difference: {diff.toFixed(2)}%</div>
          </div>
        );
      }
      return (
        <div className="p-2 bg-light border">
          <div>Date: {dateStr}</div>
          <div>Price: ${price.toFixed(2)}</div>
        </div>
      );
    }
    return null;
  };

  // Calculate price change percentage
  const firstPrice = filledData[0]?.price;
  const lastPrice = filledData[filledData.length - 1]?.price;
  let priceDiffLabel = null;
  if (firstPrice != null && lastPrice != null && firstPrice !== 0) {
    const percent = ((lastPrice - firstPrice) / firstPrice) * 100;
    const isUp = percent >= 0;
    priceDiffLabel = (
      <span
        style={{
          color: isUp ? "#388e3c" : "#d32f2f",
          fontWeight: 700,
          marginLeft: 18,
          paddingBottom: 7,
          fontSize: 15,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        {percent.toFixed(2)}% {isUp ? "▲" : "▼"}
      </span>
    );
  }

  return (
    <div className="mb-4 mt-4">
      {/* Header and period selection in one line */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <h2
          className="mb-0 mt-4"
          style={{ paddingBottom: 7, fontSize: 24, fontWeight: 700 }}
        >
          Stock price vs Evaluation
        </h2>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
          {priceDiffLabel}
          <div style={{ display: "flex", gap: 12 }}>
            {PERIODS.map((p) => (
              <span
                key={p.label}
                onClick={() => setSelectedPeriod(p.label)}
                style={{
                  cursor: "pointer",
                  color: selectedPeriod === p.label ? "#1976d2" : "#444",
                  fontWeight: selectedPeriod === p.label ? 700 : 400,
                  border: "none",
                  background: "none",
                  padding: "0 0 4px 0",
                  borderBottom:
                    selectedPeriod === p.label
                      ? "3px solid #1976d2"
                      : "3px solid transparent",
                  fontSize: 15,
                  transition: "color 0.2s, border-bottom 0.2s",
                  textDecoration: "none",
                  marginLeft: 0,
                  marginRight: 0,
                  outline: "none",
                  minWidth: 32,
                  textAlign: "center",
                  display: "inline-block",
                }}
                tabIndex={0}
                role="button"
                onKeyPress={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    setSelectedPeriod(p.label);
                }}
              >
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <ResponsiveContainer width="99%" height={240}>
        <LineChart
          data={filledData}
          margin={{ top: 5, right: 1, left: 1, bottom: 5 }}
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8884d8" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>
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

          {/* --- DCF/Exit Multiple value zones --- */}
          {filteredIntrinsicValueEstimates
            .map((q) => {
              // Find the closest available dates in filledData for x1 and x2
              const getClosestDate = (target) => {
                return filledData.reduce((prev, curr) => {
                  return Math.abs(new Date(curr.date) - new Date(target)) <
                    Math.abs(new Date(prev.date) - new Date(target))
                    ? curr
                    : prev;
                }).date;
              };
              const clampedStart = getClosestDate(q.startDate);
              const clampedEnd = getClosestDate(q.endDate);
              return {
                ...q,
                clampedStart,
                clampedEnd,
              };
            })
            .filter(
              (q) =>
                new Date(q.clampedStart) <= new Date(q.clampedEnd) &&
                !isNaN(q.DCFValue) &&
                !isNaN(q.ExitMultipleValue)
            )
            .map((q, i) => {
              return (
                <ReferenceArea
                  key={i}
                  x1={q.clampedStart}
                  x2={q.clampedEnd}
                  y1={Math.min(q.DCFValue, q.ExitMultipleValue)}
                  y2={Math.max(q.DCFValue, q.ExitMultipleValue)}
                  fill="#ffff00"
                  fillOpacity={0.2}
                />
              );
            })}

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
