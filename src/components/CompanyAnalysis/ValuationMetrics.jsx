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
  // Helper to format numbers according to specific requirements
  const formatValue = (val, metricName) => {
    if (val === null || val === undefined || val === "") return "";
    const num = Number(val);
    if (!isNaN(num)) {
      switch (metricName) {
        case "FCF yield":
        case "ROIC":
        case "ReinvRate":
        case "OMS":
        case "EVA/InvCap":
          // Percent metrics with one decimal place
          return (num * 100).toFixed(1) + "%";
        
        case "NOPAT":
          // Number in millions with one decimal place
          return (num / 1e6).toFixed(1) + " M";
        
        case "D/E":
        case "ICR":
        case "EV/OCF":
          // Numbers with one decimal place
          return num.toFixed(1);
        
        default:
          // For any other metrics, format with 2 decimals as before
          return num.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
      }
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
    <div className="w-100">
      <table className="table">
        <thead>
          <tr>
            <th className="fw-bold">Financial Indicators</th>
            {yearLabels.map((year) => (
              <th key={year} className="text-end fw-bold">
                {year}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((m, i) => {
            // ...existing code...
            let def = metricDefinitions[m.name];
            if (!def && metricDefinitions) {
              // ...existing code...
              const foundKey = Object.keys(metricDefinitions).find(
                (k) =>
                  k.replace(/\s+/g, "").toLowerCase() ===
                  m.name.replace(/\s+/g, "").toLowerCase()
              );
              if (foundKey) def = metricDefinitions[foundKey];
            }
            const popover = (
              <div 
                className="shadow-sm"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  fontSize: '13px',
                  lineHeight: '1.4',
                  color: '#333',
                  backdropFilter: 'blur(4px)',
                  maxWidth: '320px'
                }}
              >
                <div style={{ fontWeight: '600', color: '#1976d2', marginBottom: '6px' }}>
                  {m.name}
                </div>
                {def ? (
                  <>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontWeight: '600', color: '#666' }}>Definition:</span>
                      <div style={{ marginTop: '2px' }}>{def.definition}</div>
                    </div>
                    <div>
                      <span style={{ fontWeight: '600', color: '#666' }}>Importance:</span>
                      <div style={{ marginTop: '2px' }}>{def.importance}</div>
                    </div>
                  </>
                ) : (
                  <span style={{ color: '#666' }}>No description available.</span>
                )}
              </div>
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
                  // ...existing code...
                  const valuePopoverText = getValuePopoverText(
                    entry.label,
                    m.name,
                    sector
                  );
                  const valuePopover = valuePopoverText ? (
                    <div 
                      className="shadow-sm"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        fontSize: '12px',
                        lineHeight: '1.4',
                        color: '#333',
                        backdropFilter: 'blur(4px)',
                        maxWidth: '250px'
                      }}
                    >
                      {valuePopoverText}
                    </div>
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
                              "text-end text-" + getColor(entry.label)
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
                            "text-end text-" + getColor(entry.label)
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
      {/* Legend below table */}
      <div className="mt-2 mb-4 ms-2">
        <span style={{ fontSize: "0.8em" }}>
          <span className="text-success">Green</span> - better than industry standard
          <br />
          <span className="text-secondary">Grey</span> - similar to industry standard
          <br />
          <span className="text-danger">Red</span> - below industry standard
        </span>
      </div>
    </div>
  );
}

export default ValuationMetrics;
