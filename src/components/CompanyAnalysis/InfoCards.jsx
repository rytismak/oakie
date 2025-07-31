import React from "react";

import {
  Card,
  Row,
  Col,
  OverlayTrigger,
  Popover,
  Table,
} from "react-bootstrap";

const InfoCards = ({ stockPrice, dcfValue, exitMultipleValue }) => {
  // Helper to format numbers to 2 decimals and add commas for readability
  const formatNum = (val) =>
    val != null && !isNaN(val)
      ? Number(val).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "—";

  // Prepare evaluation values
  let evalText = "—";
  if (
    dcfValue != null &&
    exitMultipleValue != null &&
    !isNaN(dcfValue) &&
    !isNaN(exitMultipleValue)
  ) {
    const min = Math.min(dcfValue, exitMultipleValue);
    const max = Math.max(dcfValue, exitMultipleValue);
    evalText = `$${formatNum(min)} - $${formatNum(max)}`;
  }

  // Calculate difference: (avg(DCF, Exit) / stockPrice) - 1
  let diffText = "—";
  let diffCardStyle = {};
  let diffTextClass = "";
  if (
    dcfValue != null &&
    exitMultipleValue != null &&
    stockPrice != null &&
    !isNaN(dcfValue) &&
    !isNaN(exitMultipleValue) &&
    !isNaN(stockPrice) &&
    stockPrice !== 0
  ) {
    const avg = (Number(dcfValue) + Number(exitMultipleValue)) / 2;
    const diff = avg / Number(stockPrice) - 1;
    // Format diff as percentage with commas and two decimals
    const diffPercent = diff * 100;
    diffText =
      diffPercent.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + "%";
    if (diff < 0) {
      diffTextClass = "text-danger";
    } else if (diff > 0) {
      diffTextClass = "text-success";
    }
  }

  const evalPopover = (
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
        maxWidth: "250px",
      }}
    >
      <div style={{ fontWeight: "600", color: "#1976d2", marginBottom: "6px" }}>
        Details
      </div>
      <div style={{ marginBottom: "4px" }}>
        <span
          style={{ color: "#666", display: "inline-block", minWidth: "50px" }}
        >
          DCF:
        </span>
        <span style={{ fontWeight: "600" }}>${formatNum(dcfValue)}</span>
      </div>
      <div>
        <span
          style={{ color: "#666", display: "inline-block", minWidth: "50px" }}
        >
          Exit:
        </span>
        <span style={{ fontWeight: "600" }}>
          ${formatNum(exitMultipleValue)}
        </span>
      </div>
    </div>
  );

  const diffPopover = (
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
        maxWidth: "280px",
      }}
    >
      <div style={{ fontWeight: "600", color: "#1976d2", marginBottom: "6px" }}>
        Difference Calculation
      </div>
      <div style={{ marginBottom: "8px" }}>
        Difference indicates how much higher or lower the estimated intrinsic
        value is compared to current stock price. A positive number means the
        estimated intrinsic value is higher than the current stock price (i.e.
        undervaluation), while a negative number means the current stock price
        is higher than estimated intrinsic value (i.e. overvaluation).
      </div>
    </div>
  );

  return (
    <Table className="mt-0 mb-3">
      <tbody>
        {/* Difference row at the top, styled as header */}
        <tr>
          <td colSpan={2} className="py-2 ">
            <div
              className={`${diffTextClass} display-6`}
              style={{ fontWeight: 500, lineHeight: 1.3 }}
            >
              {diffText}
            </div>
            <OverlayTrigger
              trigger={["hover", "focus"]}
              placement="top"
              overlay={diffPopover}
            >
              <span
                style={{
                  display: "inline-block",
                  borderBottom: "1px dashed grey",
                  textDecoration: "none",
                  cursor: "pointer",
                  color: "#333",
                  marginTop: "2px",
                }}
              >
                Difference
              </span>
            </OverlayTrigger>
          </td>
        </tr>
        {/* Stock Price row, styled like Difference */}
        <tr>
          <td colSpan={2} className="py-2">
            <div
              style={{ fontWeight: 500, fontSize: "1.0rem", lineHeight: 1.5 }}
            >
              {stockPrice != null ? `$${formatNum(stockPrice)}` : "—"}
            </div>
            <span
              style={{
                display: "inline-block",
                color: "#333",
                marginTop: "2px",
              }}
            >
              Stock Price
            </span>
          </td>
        </tr>
        {/* Intrinsic Value Range row, styled like Difference */}
        <tr>
          <td colSpan={2} className="py-2" style={{ paddingBottom: 0 }}>
            <div
              style={{ fontWeight: 500, fontSize: "1.0rem", lineHeight: 1.7 }}
            >
              {evalText}
            </div>
            <OverlayTrigger
              trigger={["hover", "focus"]}
              placement="top"
              overlay={evalPopover}
            >
              <span
                style={{
                  display: "inline-block",
                  borderBottom: "1px dashed grey",
                  textDecoration: "none",
                  cursor: "pointer",
                  color: "#333",
                  marginTop: "2px",
                }}
              >
                Intrinsic value range
              </span>
            </OverlayTrigger>
          </td>
        </tr>
      </tbody>
    </Table>
  );
};

export default InfoCards;
