import React, { useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
import { HashLink } from "react-router-hash-link";

function Home() {
  return (
    <div className="container mt-4">
      {/* Contents Section */}
      

      {/* Header 1: Fundamental Analysis */}
      <section id="fundamental-analysis" className="mb-5">
        <h1 className="display-6 mb-4">Fundamental Analysis: Real understanding True Value</h1>
        
        <div className="border p-3 mb-4 bg-light rounded">
        <h2>Contents</h2>
        <ul className="list-unstyled">
          <li>
            <HashLink
              smooth
              to="#fundamental-analysis"
              className="text-primary"
            >
              Fundamental Analysis
            </HashLink>
          </li>
          <li>
            <HashLink smooth to="#technical-analysis" className="text-primary">
              Technical Analysis
            </HashLink>
          </li>
          <li>
            <HashLink smooth to="#market-forces" className="text-primary">
              Market Forces
            </HashLink>
          </li>
        </ul>
      </div>

        <p>
          Fundamental analysis focuses on evaluating a company's **intrinsic
          value** by analyzing its financial statements, growth potential, and
          economic environment.
        </p>

        <h4>Key Components:</h4>
        <ul>
          <li>
            <strong>Price-to-Earnings Ratio (P/E):</strong> Measures how much
            investors are willing to pay per dollar of earnings.
          </li>
          <li>
            <strong>Book Value vs. Market Value:</strong> Compares the actual
            asset value with what the market believes the company is worth.
          </li>
          <li>
            <strong>Dividend Yield:</strong> Indicates the return on investment
            for dividend-paying stocks.
          </li>
          <li>
            <strong>Earnings Per Share (EPS):</strong> A critical metric for
            profitability.
          </li>
        </ul>
      </section>

      {/* Image Section */}
      <div className="text-center">
        <img
          src={`${import.meta.env.BASE_URL}image.png`}
          alt="Market Trends"
          className="img-fluid rounded shadow"
        />
      </div>

      {/* Header 2: Technical Analysis */}
      <section id="technical-analysis" className="mt-5 mb-5">
        <h2>Technical Analysis: Patterns & Price Movements</h2>
        <p>
          Unlike fundamental analysis, **technical analysis** examines
          historical price movements, trends, and chart patterns to predict
          future stock behavior.
        </p>

        <h4>Popular Indicators:</h4>
        <ul>
          <li>
            <strong>Moving Averages:</strong> Helps smooth out price
            fluctuations over time.
          </li>
          <li>
            <strong>RSI (Relative Strength Index):</strong> Measures stock
            momentum to detect overbought or oversold conditions.
          </li>
          <li>
            <strong>Candlestick Patterns:</strong> Used to predict price
            reversals based on historical trends.
          </li>
          <li>
            <strong>Bollinger Bands:</strong> Shows volatility by expanding and
            contracting with price changes.
          </li>
        </ul>
      </section>

      {/* Header 3: Market Forces */}
      <section id="market-forces" className="mb-5">
        <h2>Market Forces & Stock Price Movements</h2>
        <p>
          Stock prices are influenced by **supply and demand**, economic
          indicators, and investor sentiment.
        </p>

        <h4>Key Factors Affecting Stock Prices:</h4>
        <ul>
          <li>
            <strong>Interest Rates:</strong> Higher rates reduce stock
            valuations, while lower rates boost investment appeal.
          </li>
          <li>
            <strong>Economic Growth:</strong> Positive GDP growth tends to drive
            stock prices higher.
          </li>
          <li>
            <strong>Market Sentiment:</strong> Fear or optimism among investors
            impacts trends.
          </li>
          <li>
            <strong>Industry Trends:</strong> Sectors like tech and healthcare
            may experience rapid shifts based on innovation.
          </li>
        </ul>
      </section>
    </div>
  );
}

export default Home;
