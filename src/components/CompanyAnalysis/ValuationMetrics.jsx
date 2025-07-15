import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { OverlayTrigger, Popover, Badge } from "react-bootstrap";

// Accepts years as an array of year objects, each with PerformanceMetrics
// Now also accepts sector as a prop
function ValuationMetrics({ years, sector }) {
  const [metricDefinitions, setMetricDefinitions] = useState({});

  useEffect(() => {
    const dataURL = `${
      import.meta.env.BASE_URL
    }vocab/financial_metrics_definitions.json`;

    fetch(dataURL)
      .then((res) => res.json())
      .then((data) => setMetricDefinitions(data))
      .catch(() => setMetricDefinitions({}));
  }, []);

  if (!years || years.length === 0)
    return <div>No valuation metrics available.</div>;

  // Get all metric names from the first year
  const metricNames = Object.keys(years[0].PerformanceMetrics || {});
  const yearLabels = years.map((y) => y.Year);

  // Build a metrics array for display: [{ name, values: [{year, value, label}] }]
  const metrics = metricNames.map((metric) => ({
    name: metric,
    values: years.map((y) => ({
      year: y.Year,
      value: y.PerformanceMetrics[metric]?.Value ?? "",
      label: y.PerformanceMetrics[metric]?.Evaluation ?? "",
    })),
  }));

  // color logic
  const getColor = (label) => {
    if (label === "Weak") return "danger";
    if (label === "Strong") return "success";
    return "secondary";
  };
  // Helper to format numbers to 2 decimals if possible, and add % for certain metrics
  const percentMetrics = [
    "FCF yield",
    "ROIC",
    "ReinvRate",
    "OMS",
    "EVA/InvCap",
  ];
  const formatValue = (val, metricName) => {
    if (val === null || val === undefined || val === "") return "";
    const num = Number(val);
    if (!isNaN(num)) {
      if (percentMetrics.includes(metricName)) {
        return (num * 100).toFixed(2) + "%";
      }
      if (metricName === "NOPAT") {
        // Format as $XM or $XB with best-practice formatting
        if (Math.abs(num) >= 1e9) {
          return `$${(num / 1e9).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}B`;
        } else if (Math.abs(num) >= 1e6) {
          return `$${(num / 1e6).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}M`;
        } else {
          return `$${num.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;
        }
      }
      return num.toFixed(2);
    }
    return val;
  };

  // Helper for value popover text
  const getValuePopoverText = (label, metricName, sectorName) => {
    if (!label) return null;
    if (label === "Weak")
      return `This ${metricName} is considered weak for ${sectorName}`;
    if (label === "Strong")
      return `This ${metricName} is considered strong for ${sectorName}`;
    if (label === "Moderate")
      return `This ${metricName} is considered Moderate for ${sectorName}`;
    return null;
  };

  return (
    <div className="pe-4">
      <table className="table">
        <thead>
          <tr>
            <th className="fw-bold">Evaluation Metrics</th>
            {yearLabels.map((year) => (
              <th key={year} className="text-end fw-bold">
                {year}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((m, i) => {
            // Try to match metric name exactly, or fallback to case-insensitive match
            let def = metricDefinitions[m.name];

            if (!def && metricDefinitions) {
              // Try to find a key that matches ignoring case and whitespace
              const foundKey = Object.keys(metricDefinitions).find(
                (k) =>
                  k.replace(/\s+/g, "").toLowerCase() ===
                  m.name.replace(/\s+/g, "").toLowerCase()
              );
              if (foundKey) def = metricDefinitions[foundKey];
            }
            
            const popover = (
              <Popover id={`popover-${i}`} placement="top">
                <Popover.Header as="h3">{m.name}</Popover.Header>
                <Popover.Body>
                  {def ? (
                    <>
                      <div>
                        <strong>Definition:</strong> {def.definition}
                      </div>
                      <div className="mt-2">
                        <strong>Importance:</strong> {def.importance}
                      </div>
                    </>
                  ) : (
                    <span>No description available.</span>
                  )}
                </Popover.Body>
              </Popover>
            );
            return (
              <tr key={i}>
                <td>
                  <OverlayTrigger
                    trigger={["hover", "focus"]}
                    placement="top"
                    overlay={popover}
                  >
                    <span
                      style={{
                        borderBottom: "1px dashed grey",
                        textDecoration: "none",
                        paddingBottom: "3px",
                        cursor: "pointer",
                      }}
                    >
                      {m.name}
                    </span>
                  </OverlayTrigger>
                </td>
                {m.values.map((entry, idx) => {
                  const valuePopoverText = getValuePopoverText(entry.label, m.name, sector);
                  const valuePopover = valuePopoverText ? (
                    <Popover id={`value-popover-${i}-${idx}`} placement="top">
                      <Popover.Body>{valuePopoverText}</Popover.Body>
                    </Popover>
                  ) : null;
                  return (
                    <td key={entry.year + "-" + idx} className={"text-end"}>
                      {valuePopover ? (
                        <OverlayTrigger
                          trigger={["hover", "focus"]}
                          placement="top"
                          overlay={valuePopover}
                        >
                          <span
                            className={
                              "text-end fw-bold text-" + getColor(entry.label)
                            }
                            style={{
                              borderBottom: "1px dashed grey",
                              textDecoration: "none",
                              paddingBottom: "3px",
                              cursor: "pointer",
                            }}
                          >
                            {formatValue(entry.value, m.name)}
                          </span>
                        </OverlayTrigger>
                      ) : (
                        <span
                          className={
                            "text-end fw-bold text-" + getColor(entry.label)
                          }
                          style={{
                            borderBottom: "1px dashed grey",
                            textDecoration: "none",
                            paddingBottom: "3px",
                            cursor: "pointer",
                          }}
                        >
                          {formatValue(entry.value, m.name)}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ValuationMetrics;
