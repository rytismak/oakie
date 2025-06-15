import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import { FaSortUp, FaSortDown } from "react-icons/fa"; // Sorting icons

// Realistic company data
const companies = [
  { id: 1, name: "Apple Inc.", ticker: "AAPL", marketCap: 2800000, industry: "Tech", currentPrice: 175.34, intrinsicValue: 190 },
  { id: 2, name: "Microsoft Corporation", ticker: "MSFT", marketCap: 2600000, industry: "Tech", currentPrice: 320.45, intrinsicValue: 340 },
  { id: 3, name: "Amazon.com Inc.", ticker: "AMZN", marketCap: 1700000, industry: "Retail", currentPrice: 135.67, intrinsicValue: 150 },
  { id: 4, name: "Tesla Inc.", ticker: "TSLA", marketCap: 900000, industry: "Automotive", currentPrice: 245.89, intrinsicValue: 260 },
  { id: 5, name: "Alphabet Inc.", ticker: "GOOGL", marketCap: 1800000, industry: "Tech", currentPrice: 127.85, intrinsicValue: 140 },
  { id: 6, name: "Meta Platforms Inc.", ticker: "META", marketCap: 850000, industry: "Tech", currentPrice: 195.34, intrinsicValue: 210 },
  { id: 7, name: "NVIDIA Corporation", ticker: "NVDA", marketCap: 1400000, industry: "Tech", currentPrice: 410.29, intrinsicValue: 450 },
  { id: 8, name: "Johnson & Johnson", ticker: "JNJ", marketCap: 480000, industry: "Healthcare", currentPrice: 155.68, intrinsicValue: 165 },
  { id: 9, name: "JPMorgan Chase & Co.", ticker: "JPM", marketCap: 550000, industry: "Finance", currentPrice: 146.23, intrinsicValue: 160 },
  { id: 10, name: "Visa Inc.", ticker: "V", marketCap: 520000, industry: "Finance", currentPrice: 232.40, intrinsicValue: 250 },
  { id: 11, name: "Procter & Gamble Co.", ticker: "PG", marketCap: 390000, industry: "Consumer Goods", currentPrice: 146.78, intrinsicValue: 155 },
  { id: 12, name: "The Coca-Cola Company", ticker: "KO", marketCap: 260000, industry: "Consumer Goods", currentPrice: 58.34, intrinsicValue: 65 },
  { id: 13, name: "McDonald's Corporation", ticker: "MCD", marketCap: 250000, industry: "Retail", currentPrice: 285.56, intrinsicValue: 300 },
  { id: 14, name: "Pfizer Inc.", ticker: "PFE", marketCap: 220000, industry: "Healthcare", currentPrice: 47.23, intrinsicValue: 55 },
  { id: 15, name: "Exxon Mobil Corporation", ticker: "XOM", marketCap: 400000, industry: "Energy", currentPrice: 110.78, intrinsicValue: 120 },
  { id: 16, name: "Intel Corporation", ticker: "INTC", marketCap: 170000, industry: "Tech", currentPrice: 36.45, intrinsicValue: 42 },
  { id: 17, name: "Netflix Inc.", ticker: "NFLX", marketCap: 250000, industry: "Media", currentPrice: 410.78, intrinsicValue: 450 },
  { id: 18, name: "Berkshire Hathaway Inc.", ticker: "BRK.A", marketCap: 800000, industry: "Finance", currentPrice: 550000, intrinsicValue: 580000 },
  { id: 19, name: "Toyota Motor Corporation", ticker: "TM", marketCap: 320000, industry: "Automotive", currentPrice: 165.30, intrinsicValue: 175 },
  { id: 20, name: "Samsung Electronics", ticker: "SSNLF", marketCap: 450000, industry: "Tech", currentPrice: 75.48, intrinsicValue: 85 }
];

// Generate 100 more dummy companies
for (let i = 21; i <= 120; i++) {
  companies.push({
    id: i,
    name: `Company ${i}`,
    ticker: `CMP${i}`,
    marketCap: Math.floor(Math.random() * 1000000) + 5000,
    industry: ["Tech", "Finance", "Healthcare", "Retail", "Energy"][Math.floor(Math.random() * 5)],
    currentPrice: (Math.random() * 500).toFixed(2),
    intrinsicValue: (Math.random() * 600).toFixed(2),
  });
}

// Table Component
const CompanyTable = () => {
  const [data, setData] = useState(companies);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Sorting Function
  const handleSort = (key) => {
    let direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    const sortedData = [...data].sort((a, b) => {
      return direction === "asc" ? (a[key] > b[key] ? 1 : -1) : (a[key] < b[key] ? 1 : -1);
    });
    setSortConfig({ key, direction });
    setData(sortedData);
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center">Company Stock Table</h2>
      <table className="table table-striped table-hover table-bordered">
        <thead className="table-dark">
          <tr>
            {["name", "ticker", "marketCap", "industry", "currentPrice", "intrinsicValue"].map((key) => (
              <th key={key} onClick={() => handleSort(key)} style={{ cursor: "pointer" }}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
                {sortConfig.key === key &&
                  (sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((company) => (
            <tr key={company.id} style={{ cursor: "pointer" }} className="table-hover">
              <td><Link to={`/company-details/${company.id}`}>{company.name}</Link></td>
              <td>{company.ticker}</td>
              <td>{company.marketCap.toLocaleString()}</td>
              <td>{company.industry}</td>
              <td>{company.currentPrice}</td>
              <td>{company.intrinsicValue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompanyTable;
