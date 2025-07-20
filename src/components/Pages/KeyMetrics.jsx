import React, { useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";

function KeyMetrics() {
  return (
    <div className="container mt-4">
      <section id="key-metrics" className="mb-5">
        <h1 className="display-6 mb-4">Our Focus on Fundamental Value</h1>
        <p>
          The world of financial analysis offers a vast array of metrics and ratios.
          Broadly, these can be categorized into <strong>relative</strong> and{" "}
          <strong>absolute</strong> measures.
        </p>
        <p>
          <strong>Relative metrics</strong>, like the Price-to-Earnings (P/E) ratio,
          compare one company against another or an industry benchmark. While they can
          quickly show if Company A appears cheaper than Company B, they often miss a
          critical point: both companies might be fundamentally <em>overvalued</em>.
          Relative metrics are easy to calculate but can provide an incomplete picture.
        </p>
        <p>
          We believe a deeper dive is necessary. While more involved to calculate,
          <strong>absolute metrics</strong> offer a clearer, more fundamental understanding
          of a company's true worth and financial health. These are the metrics we
          prioritize at Oakie, designed to cut through the noise and reveal a business's
          intrinsic value.
        </p>
        <h2>Key Absolute Measures</h2>
        <ul>
          <li>
            <strong>Intrinsic Value:</strong> This is our estimation of a business's true,
            underlying worth, independent of its current market price. We primarily derive
            this from its expected future free cash flows (FCF), discounted to their
            present value. To ensure a comprehensive perspective, we also consider the
            <strong>EV/EBITDA multiple</strong>, which provides another valuable data point
            for business valuation. We then integrate insights from both approaches to
            arrive at a well-rounded estimate. If Oakie's calculated intrinsic value is
            higher than the current market price, it suggests the business might be{" "}
            <strong>undervalued</strong>, potentially indicating an investment opportunity.
          </li>
          <li>
            <strong>Free Cash Flow Yield (FCF Yield):</strong> This ratio shows you how
            much free cash flow a company generates for each dollar invested in its stock.
            A higher FCF yield generally indicates a stronger cash-generating business
            relative to its price, making it a desirable trait.
          </li>
          <li>
            <strong>Return on Invested Capital (ROIC):</strong> ROIC reveals how
            effectively a company is using all the capital invested in its business (both
            debt and equity) to generate profits. Essentially, it's the percentage return
            the company earns on the money put into it – a key indicator of management's
            efficiency.
          </li>
          <li>
            <strong>Reinvestment Rate:</strong> This metric measures the percentage of a
            company's net operating profit after tax (NOPAT) that it reinvests back into
            the business for growth. This often includes capital expenditures and working
            capital, showing a company's commitment to future expansion.
          </li>
          <li>
            <strong>Debt to Equity Ratio (D/E Ratio):</strong> This ratio compares a
            company's total debt used to finance assets against the value of its
            shareholders' equity. It's a measure of financial leverage; generally, a
            lower D/E ratio suggests a more conservative and less risky financial
            structure.
          </li>
          <li>
            <strong>Interest Coverage Ratio:</strong> This ratio assesses a company's
            ability to cover its interest expenses on outstanding debt with its earnings
            before interest and taxes (EBIT). A healthy ratio indicates that the company
            can comfortably meet its interest obligations.
          </li>
          <li>
            <strong>Operating Margin Stability:</strong> This isn't a single ratio, but an
            important assessment of how consistent a company's operating profit margin
            (operating income as a percentage of revenue) is over time. We look for
            businesses that demonstrate consistent, and ideally increasing, operating
            margins, indicating reliable core profitability.
          </li>
          <li>
            <strong>Enterprise Value to Operating Cash Flows Ratio (EV/OCF):</strong>
            This valuation multiple compares a company's total value to all investors
            (Enterprise Value) against the cash generated from its core business
            operations. Generally, a lower EV/OCF ratio can imply that a company is
            potentially undervalued relative to its cash generation.
          </li>
          <li>
            <strong>Economic Value Added to Invested Capital Ratio (EVA/IC):</strong>
            Economic Value Added (EVA) represents the profit a company earns <em>above</em>
            the cost of its capital. The EVA/IC ratio measures how efficiently a company
            generates this "true" economic profit from its invested capital, highlighting
            value creation.
          </li>
        </ul>
        <h2>How We Produce the Metrics: Our Commitment to Reliability</h2>
        <p>
          Accurate and consistent data is paramount for meaningful analysis. When
          calculating the metrics outlined above, we address two primary complexities
          head-on: <strong>unavailable data</strong> and the necessity of{" "}
          <strong>assumptions</strong>. Our goal is always to provide you with insights
          based on a robust and conservative approach.
        </p>
        <h3>Addressing Unavailable Data</h3>
        <p>
          Sometimes, specific data points required for a metric may not be explicitly
          available for a company. When this occurs, we're faced with a choice: either
          skip the metric entirely or make a reasonable, conservative estimate. We choose
          the latter. Rather than omitting crucial insights, we make a conservative
          assumption that the missing data point is zero. This ensures the metric can
          still be calculated and provides a complete picture, even if it leads to a more
          cautious valuation.
        </p>
        <h3>Our Conservative Assumptions for Intrinsic Value</h3>
        <p>
          For intrinsic value calculations, where future projections are involved, we aim
          for a deliberately <strong>conservative approach</strong> in three key ways to
          help you identify truly undervalued opportunities:
        </p>
        <ul>
          <li>
            <strong>Volatile or Negative Free Cash Flow:</strong> If a company's historical
            Free Cash Flow (FCF) is highly volatile or consistently negative, directly
            projecting it can be misleading. In such cases, we analyze the historical
            growth rates of <strong>operating income, revenue, and EBITDA</strong>. We then
            select the lowest positive growth rate among these three as a proxy for the
            company's FCF growth. If all three growth rates are negative, we conservatively
            use a <strong>zero percent growth rate</strong>.
          </li>
          <li>
            <strong>Long-Term Growth:</strong> For long-term projections, we apply a long-term
            FCF growth rate of <strong>2% in perpetuity</strong>. We believe this a realistic
            yet conservative assumption, acknowledging that businesses typically experience
            some sustainable long-term growth, yet this growth is less than the broader
            economic growth rate of the U.S. economy. (If it was higher, the business would
            effectively overtake the entire economy, which is not realistic)
          </li>
          <li>
            <strong>Industry-Specific Cost of Capital:</strong> We use the <strong>industry's
            weighted average cost of capital (WACC)</strong> for discounting future cash flows.
            This ensures that our valuation considers the typical risk and financing costs
            associated with companies operating within that specific sector.
          </li>
        </ul>
        <hr />
        <p className="text-muted">
          <em>
            This is a preview version for testing purposes. Your insights are invaluable as
            we continue to refine Oakie.
          </em>
        </p>
      </section>
    </div>
  );
}

export default KeyMetrics;
