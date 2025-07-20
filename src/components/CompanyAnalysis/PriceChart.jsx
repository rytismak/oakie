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
  AreaChart,
  ComposedChart,
  Legend,
} from "recharts";
import { ButtonGroup, Button } from "react-bootstrap";

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

  // Check if any stock price is >= 1000 to adjust left margin
  const hasHighPrice = filledData.some((item) => item.price >= 1000);
  const leftMargin = hasHighPrice ? 10 : 5;

  // Generate month or year ticks based on selected period
  const generateTicks = () => {
    const startDate = new Date(filledData[0].date);
    const endDate = new Date(filledData[filledData.length - 1].date);
    const ticks = [];

    // For periods > 1Y, generate yearly ticks
    if (selectedPeriod !== "1Y" && selectedPeriod !== "YTD") {
      // Start from the beginning of the first year in the data range
      let currentYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();

      while (currentYear <= endYear) {
        // Find the closest date in our data to January 1st of this year
        const yearStart = new Date(currentYear, 0, 1);
        
        // Find the closest data point that is actually in this year
        const yearDataPoints = filledData.filter(point => {
          const pointDate = new Date(point.date);
          return pointDate.getFullYear() === currentYear;
        });

        if (yearDataPoints.length > 0) {
          // Find the earliest date in this year
          const earliestInYear = yearDataPoints.reduce((earliest, current) => {
            return new Date(current.date) < new Date(earliest.date) ? current : earliest;
          });
          
          ticks.push(earliestInYear.date);
        }

        currentYear++;
      }
    } else {
      // For 1Y and YTD, generate monthly ticks
      // Start from the beginning of the first month
      const currentDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        1
      );

      while (currentDate <= endDate) {
        // Find the closest date in our data to the first of this month
        const monthStart = new Date(currentDate);
        const closestDataPoint = filledData.reduce((closest, current) => {
          const currentDistance = Math.abs(new Date(current.date) - monthStart);
          const closestDistance = Math.abs(new Date(closest.date) - monthStart);
          return currentDistance < closestDistance ? current : closest;
        });

        ticks.push(closestDataPoint.date);

        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    return ticks;
  };

  const tickDates = generateTicks();

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
        const diff = (avg / price - 1) * 100; // Percentage difference
        const isPositive = diff >= 0;
        return (
          <div
            className="shadow-sm"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.98)",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              padding: "12px 14px",
              fontSize: "13px",
              lineHeight: "1.4",
              color: "#333",
              backdropFilter: "blur(4px)",
            }}
          >
            <div
              style={{
                fontWeight: "400",
                color: "#333",
                marginBottom: "6px",
                fontSize: "1.2em",
              }}
            >
              {dateStr}
            </div>
            <div
              style={{
                marginBottom: "2px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "#666",
                  minWidth: "45px",
                  display: "inline-block",
                  fontWeight: "400",
                }}
              >
                Price:
              </span>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#1976d2",
                  marginRight: "4px",
                }}
              ></div>
              <span style={{ fontWeight: "700" }}>
                $
                {price.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div
              style={{
                marginBottom: "2px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "#666",
                  minWidth: "45px",
                  display: "inline-block",
                  fontWeight: "400",
                }}
              >
                DCF:
              </span>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#ff9800",
                  marginRight: "4px",
                }}
              ></div>
              <span style={{ fontWeight: "700" }}>
                $
                {dcf.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div
              style={{
                marginBottom: "6px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "#666",
                  minWidth: "45px",
                  display: "inline-block",
                  fontWeight: "400",
                }}
              >
                Exit:
              </span>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#9c27b0",
                  marginRight: "4px",
                }}
              ></div>
              <span style={{ fontWeight: "700" }}>
                $
                {exit.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div
              style={{
                borderTop: "1px solid #f0f0f0",
                paddingTop: "6px",
                fontSize: "12px",
                fontWeight: "400",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "#666",
                  minWidth: "45px",
                  display: "inline-block",
                }}
              >
                Diff:
              </span>
              <span
                className={isPositive ? 'text-success' : 'text-danger'}
                style={{
                  fontWeight: "700",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                {/* {" "} */}
                {/* {isPositive ? "▲" : "▼"}{" "}  */}
                {diff.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                %
              </span>
            </div>
          </div>
        );
      }
      return (
        <div
          className="shadow-sm"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            padding: "12px 14px",
            fontSize: "13px",
            lineHeight: "1.4",
            color: "#333",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              fontWeight: "400",
              color: "#333",
              marginBottom: "6px",
              fontSize: "1.2em",
            }}
          >
            {dateStr}
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#1976d2",
                marginRight: "6px",
              }}
            ></div>
            <span
              style={{
                color: "#666",
                minWidth: "45px",
                display: "inline-block",
                fontWeight: "400",
              }}
            >
              Price:
            </span>
            <span style={{ fontWeight: "700" }}>
              $
              {price.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
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
          paddingLeft: 6,
          paddingBottom: 7,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        {Math.abs(percent).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
        % {isUp ? "▲" : "▼"}
      </span>
    );
  }

  // Custom legend renderer
  const CustomLegend = (props) => {
    const { payload } = props;
    return (
      <div
        className="d-flex justify-content-start gap-3 mt-2"
        style={{ fontSize: "0.8em" }}
      >
        <div className="d-flex align-items-center gap-1">
          <div
            style={{
              width: "16px",
              height: "1px",
              background: "linear-gradient(to right, #1976d2, #42a5f5)",
              borderRadius: "2px",
            }}
          ></div>
          <span style={{ color: "#666", fontWeight: "400" }}>Stock Price</span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <svg width="16" height="3" style={{ overflow: "visible" }}>
            <line
              x1="0"
              y1="1.5"
              x2="16"
              y2="1.5"
              stroke="#ff9800"
              strokeWidth="1" // Match the reduced stroke width
              strokeDasharray="3 2"
            />
          </svg>
          <span style={{ color: "#666", fontWeight: "400" }}>DCF Value</span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <svg width="16" height="3" style={{ overflow: "visible" }}>
            <line
              x1="0"
              y1="1.5"
              x2="16"
              y2="1.5"
              stroke="#9c27b0"
              strokeWidth="1" // Match the reduced stroke width
              strokeDasharray="2 1.5"
            />
          </svg>
          <span style={{ color: "#666", fontWeight: "400" }}>
            Exit Multiple
          </span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <div
            style={{
              width: "16px",
              height: "8px",
              backgroundColor: "#4caf50",
              opacity: 0.2,
              borderRadius: "2px",
            }}
          ></div>
          <span style={{ color: "#666", fontWeight: "400" }}>
            Intrinsic Range
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-2 mt-4">
      {/* Responsive header: header on top, price diff and period selector left aligned */}
      <div className="mb-2">
        <div className="d-flex flex-row align-items-end gap-2 mt-2 justify-content-start">
          <div className="d-flex gap-1 flex-wrap" style={{ fontSize: "1em" }}>
            {PERIODS.map((p) => (
              <span
                key={p.label}
                onClick={() => setSelectedPeriod(p.label)}
                style={{
                  cursor: "pointer",
                  color: selectedPeriod === p.label ? "#1976d2" : "#444",
                  fontWeight: 700,
                  border: "none",
                  background: "none",
                  padding: "0 0 2px 0",
                  borderBottom:
                    selectedPeriod === p.label
                      ? "3px solid #1976d2"
                      : "3px solid transparent",
                  fontSize: "inherit",
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
          <span style={{ fontSize: "0.8em" }}>{priceDiffLabel}</span>
        </div>
      </div>

      <ResponsiveContainer width="99%" height={190}>
        <ComposedChart
          data={filledData}
          margin={{ top: 0, right: 0, left: leftMargin, bottom: 25 }}
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1976d2" stopOpacity={0.8} />
              <stop offset="50%" stopColor="#1976d2" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#1976d2" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1976d2" stopOpacity={1} />
              <stop offset="50%" stopColor="#42a5f5" stopOpacity={1} />
              <stop offset="100%" stopColor="#1976d2" stopOpacity={1} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e0e0e0"
            strokeOpacity={0.5}
          />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => {
              const dateObj = new Date(date);
              
              // For periods > 1Y (2Y, 3Y, 4Y, 5Y), show years
              if (selectedPeriod !== "1Y" && selectedPeriod !== "YTD") {
                return dateObj.getFullYear();
              }
              
              // For 1Y and YTD periods, show month names
              return dateObj.toLocaleString("en", { month: "short" });
            }}
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            ticks={tickDates}
            domain={["dataMin", "dataMax"]}
            axisLine={{ stroke: "#e0e0e0" }}
            tickLine={{ stroke: "#e0e0e0" }}
          />
          <YAxis
            dataKey="price"
            tick={{ fontSize: 10, textAnchor: "end" }}
            ticks={yTicks}
            tickFormatter={(value) =>
              `$${value.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            }
            domain={[paddedMin, paddedMax]}
            width={40}
            axisLine={{ stroke: "#e0e0e0" }}
            tickLine={{ stroke: "#e0e0e0" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />

          <Area
            type="monotone"
            dataKey="price"
            stroke="url(#lineGradient)"
            strokeWidth={1}
            fill="url(#priceGradient)"
            fillOpacity={1}
            isAnimationActive={true}
            animationDuration={1500}
            animationEasing="ease-in-out"
            dot={false}
            activeDot={{
              r: 4,
              fill: "#1976d2",
              stroke: "#ffffff",
              strokeWidth: 1,
              style: { filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))" },
            }}
          />

          {/* Filled areas between DCF and Exit Multiple values */}
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
                  fill="#4caf50"
                  fillOpacity={0.2}
                />
              );
            })}

          {/* DCF and Exit Multiple lines on top of the areas */}
          <Line
            type="monotone"
            dataKey="DCFValue"
            stroke="#ff9800"
            strokeWidth={1} // Reduced stroke width
            strokeDasharray="5 5"
            dot={false}
            connectNulls={false}
            name="DCF Value"
          />
          <Line
            type="monotone"
            dataKey="ExitMultipleValue"
            stroke="#9c27b0"
            strokeWidth={1} // Reduced stroke width
            strokeDasharray="3 3"
            dot={false}
            connectNulls={false}
            name="Exit Multiple"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
