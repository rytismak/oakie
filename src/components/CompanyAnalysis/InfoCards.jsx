import React from "react";
import { Card, Row, Col } from "react-bootstrap";

const InfoCards = ({
  currentStockPrice,
  evaluationMin,
  evaluationMax,
  differencePercent,
}) => {
  // Determine styling for Difference card
  const isPositive = differencePercent >= 0;
  const borderColor = !isPositive ? "success" : "danger";
  const textColor = !isPositive ? "text-success" : "text-danger";
  const valuation = !isPositive ? "undervalued" : "overvalued";

  const cardStyle = {
    borderLeft: `5px solid var(--bs-${borderColor})`,
  };

  return (
    <Row className="g-2">
      <Col xs={12} md={4}>
        <Card>
          <Card.Body>
            <Card.Title className="h6 text-muted">Price</Card.Title>
            <Card.Text className="h5">
              <strong>${currentStockPrice}</strong>
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>

      <Col xs={12} md={4}>
        <Card>
          <Card.Body>
            <Card.Title className="h6 text-muted">Evaluation</Card.Title>
            <Card.Text className="h5"><strong>
              ${evaluationMin} - ${evaluationMax}</strong>
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>

      <Col xs={12} md={4}>
        <Card style={cardStyle}>
          <Card.Body>
            <Card.Title className="h6 text-muted">Difference</Card.Title>
            <Card.Text className={`h5 ${textColor}`}><strong>{differencePercent}% ({valuation})</strong></Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default InfoCards;
