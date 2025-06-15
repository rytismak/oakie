import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { OverlayTrigger, Popover, Badge } from "react-bootstrap";

function ValuationMetrics() {
  // --- 5. Valuation Metrics Section --- 
  const metrics = [
    { name: "P/E Ratio", 2022: 15, 2023: 18, 2024: 20, tooltip: "Price to Earnings" , description: "The price of a company's stock divided by its earnings per share"},
    { name: "ROE", 2022: "10%", 2023: "12%", 2024: "15%", tooltip: "Return on Equity" , description: "How efficiently a company utilizes its equity"},
    { name: "Debt/Equity", 2022: 0.5, 2023: 0.7, 2024: 0.6, tooltip: "Leverage ratio" , description: "How much debt a company has relative to its equity"},
    { name: "Current Ratio", 2022: 2, 2023: 1.8, 2024: 1.9, tooltip: "Ability to pay short term obligations" , description: "Current Assets divided by Current Liabilities"},
    { name: "Margin", 2022: "20%", 2023: "23%", 2024: "25%", tooltip: "Net Profit Margin" , description: "How much net income is generated as a percentage of revenue"},
    { name: "Beta", 2022: 1.1, 2023: 1.2, 2024: 0.9, tooltip: "Risk against Market" , description: "Beta > 1 means more volatile than market"},
    { name: "PBV", 2022: 2, 2023: 2.5, 2024: 2.3, tooltip: "Price to Book" , description: "Compares market price to book value"},
    { name: "Dividend Yield", 2022: "2%", 2023: "2.5%", 2024: "2%", tooltip: "Yearly payout to investors" , description: "Indicates how much a company pay in dividends each year"},
  ];

  // color logic
  const getColor = (value) => {
    const parsed = parseFloat(value);
    if (parsed < 10) return "danger";
    if (parsed > 20) return "success";
    return "warning";
  };

  // color classes
  const colorClass = (color) => {
    return `badge align-items-center p-2 px-3 text-${color}-emphasis bg-${color}-subtle border border-${color}-subtle rounded-pill`;
  }

  return(
    <div className="mb-4">
      <h4>Valuation Metrics</h4>
      <table className="table">
        <thead>
          <tr>
            <th>Metric</th>
            <th className="text-center">2022</th>
            <th className="text-center">2023</th>
            <th className="text-center">2024</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m, i) => {
            const popover =(
              <Popover id={`popover-${i}`} placement="top">
                <Popover.Header as="h3">{m.name}</Popover.Header>
                <Popover.Body>
                   {m.description}
                </Popover.Body>
              </Popover>
            );

            return(
              <tr key={i}>
                <td>
                   <OverlayTrigger trigger={['hover', 'focus']} placement="top" overlay={popover}>
                      <span style={{borderBottom:'1px dashed grey', textDecoration:'none', paddingBottom:'3px', cursor:'pointer'}}>
                         {m.name}
                      </span>
                   </OverlayTrigger>
                </td>
                {["2022","2023","2024"].map((yrs)=>(
                   <td key={yrs} className="text-center">
                      <Badge pill className={colorClass(getColor(m[yrs]))} style={{minWidth:'60px', textAlign:'center'}}>{m[yrs]}</Badge>
                   </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div>
        <span>Legend: </span>
        <Badge pill className={colorClass("success")} style={{minWidth:'60px', textAlign:'center'}}>Good</Badge>{" "}
        <Badge pill className={colorClass("warning")} style={{minWidth:'60px', textAlign:'center'}}>Neutral</Badge>{" "}
        <Badge pill className={colorClass("danger")} style={{minWidth:'60px', textAlign:'center'}}>Bad</Badge>
      </div>
    </div>
  );
}

export default ValuationMetrics;
