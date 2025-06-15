import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const StockTable = () => {
  // Dummy data
  const data = [
    { id: 1, company: "TechCorp", price: "$120.50", rating: "A+" },
    { id: 2, company: "FinServe", price: "$98.20", rating: "B" },
    { id: 3, company: "HealthCo", price: "$75.80", rating: "A" },
    { id: 4, company: "EduMax", price: "$52.30", rating: "B+" },
    { id: 5, company: "AutoDrive", price: "$210.10", rating: "A+" },
    { id: 6, company: "GreenPower", price: "$130.00", rating: "A-" },
    { id: 7, company: "RetailPro", price: "$43.90", rating: "B-" },
    { id: 8, company: "FoodWave", price: "$56.75", rating: "A" },
    { id: 9, company: "SoftGen", price: "$95.40", rating: "B+" },
    { id: 10, company: "DataWorks", price: "$110.30", rating: "A+" },
  ];

  return (
    <div className="container mt-4">
      <h2 className="text-center">Stock Prices</h2>
      <table className="table table-striped table-bordered">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Company Name</th>
            <th>Stock Price</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.company}</td>
              <td>{item.price}</td>
              <td>{item.rating}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockTable;
