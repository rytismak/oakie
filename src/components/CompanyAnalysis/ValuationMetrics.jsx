import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { OverlayTrigger, Popover, Badge } from "react-bootstrap";

// Accepts years as an array of year objects, each with PerformanceMetrics
function ValuationMetrics({ years }) {
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

  const colorClass = (color) =>
    `badge align-items-center p-2 px-3 text-${color}-emphasis bg-${color}-subtle border border-${color}-subtle rounded-pill`;

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
      return num.toFixed(2);
    }
    return val;
  };

  return (
    <div className="mb-4">
      <h2 className="mb-4 pt-4">Valuation Metrics</h2>
      <table className="table">
        <thead>
          <tr>
            <th className="fw-bold">Metric</th>
            {yearLabels.map((year) => (
              <th key={year} className="text-center fw-bold">
                {year}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((m, i) => {
            const popover = (
              <Popover id={`popover-${i}`} placement="top">
                <Popover.Header as="h3">{m.name}</Popover.Header>
                <Popover.Body>{/* Optionally add description here */}</Popover.Body>
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
                {m.values.map((entry, idx) => (
                  <td key={entry.year + "-" + idx} className="text-center">
                    <Badge
                      pill
                      className={colorClass(getColor(entry.label))}
                      style={{ minWidth: "60px" }}
                    >
                      {formatValue(entry.value, m.name)}
                    </Badge>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-4">
        <span>Legend: </span>
        <Badge
          pill
          className={colorClass("success")}
          style={{
            marginLeft: "8px",
            minWidth: "60px",
            textAlign: "center",
          }}
        >
          Good
        </Badge>{" "}
        <Badge
          pill
          className={colorClass("secondary")}
          style={{ minWidth: "60px", textAlign: "center" }}
        >
          Neutral
        </Badge>{" "}
        <Badge
          pill
          className={colorClass("danger")}
          style={{ minWidth: "60px", textAlign: "center" }}
        >
          Bad
        </Badge>
      </div>
    </div>
  );
}

export default ValuationMetrics;
