import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { OverlayTrigger, Popover, Badge } from "react-bootstrap";

function ValuationMetrics({ evaluationMetrics }) {
  // --- 5. Valuation Metrics Section ---
   const metricArray = evaluationMetrics || [];
  // console.log(metricArray);


  // color logic
  const getColor = (value) => {
    const parsed = parseFloat(value);
    if (value == "bad") return "danger";
    if (value == "good") return "success";
    return "secondary";
  };

  // color classes
  const colorClass = (color) => {
    return `badge align-items-center p-2 px-3 text-${color}-emphasis bg-${color}-subtle border border-${color}-subtle rounded-pill`;
  };

  return (
    <div className="mb-4">
      <h2 className="mb-4 pt-4">Valuation Metrics</h2>
      <table className="table">
        <thead>
          <tr>
            <th className="fw-bold">Metric</th>
            <th className="text-center fw-bold ">2022</th>
            <th className="text-center fw-bold ">2023</th>
            <th className="text-center fw-bold ">2024</th>
          </tr>
        </thead>
        <tbody>
          {metricArray.map((m, i) => {
            const popover = (
              <Popover id={`popover-${i}`} placement="top">
                <Popover.Header as="h3">{m.name}</Popover.Header>
                <Popover.Body>{m.description}</Popover.Body>
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
                {["2022", "2023", "2024"].map((year) => {
                  const entry = m.values.find(
                    (v) => v.year === parseInt(year)
                  );
                  if (!entry) return <td key={year} className="text-center">–</td>;
                  const badgeColor = getColor(entry.label);
                  return (
                    <td key={year} className="text-center">
                      <Badge
                        pill
                        className={colorClass(badgeColor)}
                        style={{ minWidth: "60px" }}
                      >
                        {entry.value}
                      </Badge>
                    </td>
                  );
                })}
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
          style={{ marginLeft:"8px", minWidth: "60px", textAlign: "center" }}
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
