import React, { useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
import { HashLink } from "react-router-hash-link";

function Home() {
  return (
    <div className="container mt-4">
      <section id="oakie-intro" className="mb-5">
        <h1 className="display-6 mb-4">Streamline Your Investment Research with Oakie</h1>
        <p>
          Navigating the world of stock investing can feel like drowning in data.
          Traditional financial tools and stock screeners often bombard you with
          so much information that finding a truly promising investment feels
          impossible. We've been there – staring at endless spreadsheets and
          combing through financial statements, wondering:
        </p>
        <ul>
          <li>
            Is a company with $100 million in operating income a hidden gem, or a
            ticking time bomb?
          </li>
          <li>How much debt is too much debt?</li>
          <li>What do declining operating margins really tell you?</li>
          <li>
            And with all the hype, are you missing out if you're not just buying
            the "Magnificent 7"?
          </li>
        </ul>
        <p>
          These are vital questions, but finding the answers shouldn't require a
          finance degree or countless hours of research. We believe that
          identifying fundamentally strong businesses should be straightforward,
          even for new and aspiring investors.
        </p>
        <p>That's why we created <strong>Oakie</strong>.</p>
        <p>
          Oakie is more than just a stock screener; it's your intuitive guide to
          smarter investing. We cut through the noise, distilling essential
          financial metrics into clear, actionable insights. Oakie helps you:
        </p>
        <ul>
          <li>
            <strong>
              Quickly identify potentially interesting companies
            </strong>{" "}
            by focusing on the metrics that truly matter.
          </li>
          <li>
            <strong>
              Contextualize financial data
            </strong>{" "}
            by comparing companies against their industry peers.
          </li>
          <li>
            <strong>
              Simplify complex valuation
            </strong>{" "}
            so you can understand what makes a good business.
          </li>
        </ul>
        <p>
          We're building Oakie to empower you to find solid investment
          opportunities with confidence.
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
          </em>
        </p>
        <p className="text-muted">
          <em>
            All data, analyses, and metrics, including intrinsic value and other valuation models, 
            are estimations and should not be considered a guarantee of a company's future performance 
            or its true market worth. The information is provided "as is" and without warranties of any kind, 
            either express or implied.
          </em>
        </p>
        <p className="text-muted">
          <em>
            All investment decisions carry a risk of loss. 
            Past performance is not indicative of future results. 
            You should perform your own due diligence and research before making any investment decisions.
          </em>
        </p>
      </section>
    </div>
  );
}

export default Home;
