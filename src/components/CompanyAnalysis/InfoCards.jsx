import React from "react";
import { Card, Row, Col, OverlayTrigger, Popover } from "react-bootstrap";

const InfoCards = ({ stockPrice, dcfValue, exitMultipleValue }) => {
  // Helper to format numbers to 2 decimals
  const formatNum = (val) =>
    val != null && !isNaN(val) ? Number(val).toFixed(2) : "—";

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
    const diff = (avg / Number(stockPrice)) - 1;
    diffText = (diff * 100).toFixed(2) + "%";
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
      <Popover.Header as="h3">Evaluation Details</Popover.Header>
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
          The difference is calculated as:<br />
          <strong>
            (Average of DCF Value and Exit Multiple Value) ÷ Current Stock Price − 1
          </strong>
        </div>
        <div className="mt-2" style={{ fontSize: '0.95em', color: '#555' }}>
          This shows how much higher or lower the average intrinsic value is compared to the current price, as a percentage.
        </div>
      </Popover.Body>
    </Popover>
  );

  return (
    <Row className="g-2">
      <Col xs={12} md={4}>
        <Card>
          <Card.Body>
            <Card.Title className="h6 text-muted">Stock Price</Card.Title>
            <Card.Text className="h5">
              <strong>
                {stockPrice != null ? `$${formatNum(stockPrice)}` : "—"}
              </strong>
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>

      <Col xs={12} md={4}>
        <Card>
          <Card.Body>
            <OverlayTrigger
              trigger={["hover", "focus"]}
              placement="top"
              overlay={evalPopover}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <span
                  className="h6 text-muted"
                  style={{
                    marginRight: 4,
                    borderBottom: "1px dashed grey",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  Intrinsic Evaluation
                </span>
              </span>
            </OverlayTrigger>
            <Card.Text className="h5">
              <strong>{evalText}</strong>
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>

      <Col xs={12} md={4}>
        <Card style={diffCardStyle}>
          <Card.Body>
            <OverlayTrigger
              trigger={["hover", "focus"]}
              placement="top"
              overlay={diffPopover}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <span
                  className="h6 text-muted"
                  style={{
                    marginRight: 4,
                    borderBottom: "1px dashed grey",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  Difference
                </span>
              </span>
            </OverlayTrigger>
            <Card.Text className={`h5 ${diffTextClass}`}>
              <strong>{diffText}</strong>
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default InfoCards;
