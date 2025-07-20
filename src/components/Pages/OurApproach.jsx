// import React, { useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
import { HashLink } from "react-router-hash-link";

function OurApproach() {
  return (
    <div className="container mt-4">
      <section id="our-approach" className="mb-5">
        <h1 className="display-6 mb-4">Clarity Through Foundational Analysis</h1>
        <p>
          At Oakie, our mission is to simplify informed investing. We guide you
          toward companies with strong fundamentals, grounded in a proven
          investment philosophy and reliable data.
        </p>
        <h2>Our Core Investment Philosophy:</h2>
        <p>
          We subscribe to{" "}
          <strong>value investing</strong>, a time-tested approach focused on
          identifying quality businesses trading below their true worth. To
          uncover this "intrinsic value," we utilize a robust valuation process.
          We primarily employ{" "}
          <strong>Discounted Cash Flow (DCF)</strong> analysis – a powerful method
          that estimates a company's current value based on its projected future
          earnings power. To ensure a comprehensive perspective, we also consider
          the <strong>EV/EBITDA multiple</strong>, which provides another valuable
          data point for business valuation. We then integrate insights from both
          approaches to arrive at a well-rounded estimate of intrinsic value.
        </p>
        <p>
          Beyond intrinsic value, we provide a holistic view by analyzing a range
          of essential metrics. These indicators offer insights into a company's:
        </p>
        <ul>
          <li>
            <strong>Financial Health:</strong> Its stability and ability to meet
            obligations.
          </li>
          <li>
            <strong>Efficiency:</strong> How well it manages its operations.
          </li>
          <li>
            <strong>Risk Profile:</strong> Potential vulnerabilities and
            strengths.
          </li>
          <li>
            <strong>Growth Potential:</strong> Opportunities for future
            expansion.
          </li>
          <li>
            <strong>Valuation:</strong> Whether the current share price reflects
            its true worth.
          </li>
        </ul>
        <p>
          Crucially, we don't just present raw numbers. We contextualize these
          metrics by comparing them against{" "}
          <strong>industry-specific thresholds</strong>, helping you understand
          what “good” performance looks like within a company's sector.
        </p>
        <h2>The Oakie Data Difference: Trustworthy & Transparent</h2>
        <p>
          We understand that accurate and reliable financial data is the bedrock
          of sound investment decisions. It's astonishing how challenging and
          costly it can be for individual investors to access high-quality,
          dependable data – even when it's publicly available.
        </p>
        <p>
          That's why we've committed to building our own robust database,
          primarily sourced directly from the{" "}
          <strong>U.S. Securities and Exchange Commission (SEC)</strong>. Publicly
          traded companies in the U.S. are legally required to submit
          comprehensive financial reports to the SEC. This makes the SEC the{" "}
          <strong>gold standard for data accuracy and reliability</strong>. While
          we may integrate data from other reputable vendors to enrich our
          insights, our unwavering commitment is to prioritize the SEC as our
          primary data source. This ensures you're always working with the most
          credible information.
        </p>
        <hr />
        <p className="text-muted">
          <em>
            This is a preview version for testing purposes. We invite you to
            explore the data and share your valuable feedback!
          </em>
        </p>
      </section>
    </div>
  );
}

export default OurApproach;
