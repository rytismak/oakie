import React, { useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
import { HashLink } from "react-router-hash-link";

function Home() {
  return (
    <div className="container mt-4">
      <section id="oakie-intro" className="mb-5">
        <h2 className="display-6 mb-4">Stock Screener Built for Value Investors</h2>
        <p className="lead mt-3 mb-4">
          Tired of complex spreadsheets and endless data? 
          Oakie cuts through the noise to help you discover strong businesses trading below their true worth.
        </p>
        <p>
          Navigating stock market data can be overwhelming. 
          You don't need a finance degree to find a solid business. You just need a guide. 
          That's why we created <strong>Oakie</strong>.
        </p>
        <p>Oakie isn't just a screener; it’s your intuitive guide to smarter investing. 
          We translate essential financial metrics into clear, color-coded insights.</p>
        <ul>
          <li>
            <strong>Intuitive Color-Coding:</strong> 
            We don't just show numbers; we tell you if they're "good" or "bad" compared to the industry.
          </li>
          <li>
            <strong>Objective Intrinsic Value:</strong> 
            We do the complex valuation for you and show you a fair value range, so you can stop guessing.
          </li>
          <li>
            <strong>Focus on Fundamentals:</strong> 
            We highlight the metrics that truly matter, so you can ignore the noise and find solid opportunities.
          </li>
        </ul>
        <p>
          Curious about how it all works? <strong>Learn More About Our Approach.</strong>
        </p>
        <hr />
        <p className="text-muted">
          <em>
            This is a preview version for testing purposes. We'd love your
            feedback as we refine Oakie to be the best tool for aspiring
            investors!
          </em>
        </p>
        <p className="text-muted">
          <em>
            The content and tools provided on this website are for informational and educational purposes only. 
            Nothing on this website should be interpreted as financial advice, investment recommendations, 
            or an endorsement to buy or sell any security. 
            All data, analyses, and metrics, including intrinsic value and other valuation models, 
            are estimations and should not be considered a guarantee of a company's future performance 
            or its true market worth. The information is provided "as is" and without warranties of any kind, 
            either express or implied. All investment decisions carry a risk of loss. 
            Past performance is not indicative of future results. 
            You should perform your own due diligence and research before making any investment decisions.
          </em>
        </p>
      </section>
    </div>
  );
}

export default Home;
