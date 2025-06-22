import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

// --- 1. Generate daily prices for past 365 days ---
function generateDailyPrices(start, days) {
  let data = [];
  let price = start;
  for (let i = 0; i < days; i++) {
    price = Math.max(50, price + (Math.random() - 0.5) * 5);
    let date = new Date();
    date.setDate(date.getDate() - (days - i)); // counting backwards
    data.push({ date: date.toISOString().split("T")[0], price });
  }
  return data;
}

const priceData = generateDailyPrices(100, 365);

//data for the cards
const lastStckPrice=0;
const lastIntrinsicMin=0;
const lastIntrinsicMax=0;
const lastPercent=0;

// --- 2. Prepare 4 quarterly intrinsics ---
function generateQuarterlyValues(data) {
  const totalLength = data.length;
  const quarterLength = Math.floor(totalLength / 4);
  
  // console.log('Total data length:', totalLength, 'Quarter length:', quarterLength);
  
  const quarters = [];
  for (let i = 0; i < 4; i++) {
    const startIdx = i * quarterLength;
    let endIdx;
    
    if (i === 3) {
      // Last quarter goes to the very end
      endIdx = totalLength - 1;
    } else {
      endIdx = startIdx + quarterLength ;
    }
    
    const base = data[startIdx].price;
    
    quarters.push({
      idx: startIdx,
      startIdx: startIdx,
      endIdx: endIdx,
      startDate: data[startIdx].date,
      endDate: data[endIdx].date,
      date: data[startIdx].date,
      intrinsicMin: base * 0.9,
      intrinsicMax: base * 1.1,
    });
  }
  
  return quarters;
}

const quarterlyValues = generateQuarterlyValues(priceData);

// --- 3. Combine into unified data ---
function fillIntrinsics(priceData, quarters) {
  return priceData.map((item, i) => {
    let quarter = quarters.find((q) => i >= q.startIdx && i <= q.endIdx); // Fix: include endIdx
    return {
      ...item,
      intrinsicMin: quarter ? quarter.intrinsicMin : null,
      intrinsicMax: quarter ? quarter.intrinsicMax : null,
    };
  });
}

const filledData = fillIntrinsics(priceData, quarterlyValues);

// Determine minimum and maximum across price and intrinsics
const allValues = filledData.reduce((acc, item) => {
  acc.push(item.price);
  if (item.intrinsicMin !== null) acc.push(item.intrinsicMin);
  if (item.intrinsicMax !== null) acc.push(item.intrinsicMax);
  return acc;
}, []);

const minY = Math.min(...allValues);
const maxY = Math.max(...allValues);

const paddedMin = minY * 0.9;
const paddedMax = maxY * 1.1;

export default function PriceChart() {
  // Debug: Log the first quarter data
  // console.log('First quarter:', quarterlyValues[0]);
  // console.log('First few data points:', filledData.slice(0, 5));
  // console.log('Quarter indices:', quarterlyValues.map(q => ({ start: q.startIdx, end: q.endIdx })));
  const firstOfMonthDates = filledData
    .filter((item) => new Date(item.date).getUTCDate() === 1)
    .map((item) => item.date);

  // Define number of ticks you want (say 6 including min and max).
  const numberOfTicks = 4;

  const yTicks = Array.from(
    { length: numberOfTicks },
    (_, i) => paddedMin + (i * (paddedMax - paddedMin)) / (numberOfTicks - 1)
  );

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
      <ResponsiveContainer width="99%" height={200}>
        <LineChart 
          data={filledData}
          margin={{ top: 5, right: 1, left: 1, bottom: 5}}
        >
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
            domain={['dataMin', 'dataMax']}
          />

          <YAxis
            dataKey="price"
            tick={{ fontSize: 10 }}
            ticks={yTicks}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
            domain={[paddedMin, paddedMax]}
          />

          <Tooltip content={<CustomTooltip />} />
          
          {/* Yellow areas for each quarter ` */}
          {quarterlyValues.map((q, i) => (
            <ReferenceArea
              key={`area-${i}`}
              x1={q.startDate}
              x2={q.endDate}
              y1={q.intrinsicMin}
              y2={q.intrinsicMax}
              fill="#ffff00"
              fillOpacity={0.2}
            />
            
          ))}


          {/* Stock price */}
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