import React from "react";

import { Card, Row, Col, OverlayTrigger, Popover, Table } from "react-bootstrap";

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
      diffCardStyle = { borderLeft: "5px solid var(--bs-danger)" };
      diffTextClass = "text-danger";
    } else if (diff > 0) {
      diffCardStyle = { borderLeft: "5px solid var(--bs-success)" };
      diffTextClass = "text-success";
    }
  }

  const evalPopover = (
    <Popover id="popover-eval" placement="top">
      <Popover.Header as="h3">Details</Popover.Header>
      <Popover.Body>
        <div>
          DCF Value: <strong>${formatNum(dcfValue)}</strong>
        </div>
        <div>
          Exit Multiple Value: <strong>${formatNum(exitMultipleValue)}</strong>
        </div>
      </Popover.Body>
    </Popover>
  );

  const diffPopover = (
    <Popover id="popover-diff" placement="top">
      <Popover.Header as="h3">Difference Calculation</Popover.Header>
      <Popover.Body>
        <div>
          The difference is calculated as:
          <br />
          <strong>
            (Average of DCF Value and Exit Multiple Value) ÷ Current Stock Price
            − 1
          </strong>
        </div>
        <div className="mt-2" style={{ fontSize: "0.95em", color: "#555" }}>
          This shows how much higher or lower the average intrinsic value is
          compared to the current price, as a percentage.
        </div>
      </Popover.Body>
    </Popover>
  );

  return (
    <Table className="mt-3">
      <thead>
        <tr>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Stock Price</td>
          <td>
            <strong>
                {stockPrice != null ? `$${formatNum(stockPrice)}` : "—"}
              </strong>
            </td>
          </tr>
          <tr style={evalText !== "—" ? {} : {}}>
            <td>
              <OverlayTrigger
                trigger={["hover", "focus"]}
                placement="top"
                overlay={evalPopover}
              >
                <span
                  style={{
                    borderBottom: "1px dashed grey",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  Intrinsic value range
                </span>
              </OverlayTrigger>
            </td>
            <td>
              <strong>{evalText}</strong>
            </td>
          </tr>
          <tr>
            <td>
              <OverlayTrigger
                trigger={["hover", "focus"]}
                placement="top"
                overlay={diffPopover}
              >
                <span
                  style={{
                    borderBottom: "1px dashed grey",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  Difference
                </span>
              </OverlayTrigger>
            </td>
            <td className={`${diffTextClass}`}>
              <strong>{diffText}</strong>
            </td>
          </tr>
        </tbody>
      </Table>
  );
};

export default InfoCards;
