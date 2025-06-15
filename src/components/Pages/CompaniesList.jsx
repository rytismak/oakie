import React, { useState } from "react";
import SearchFilter from "../CompaniesListComponents/SearchFilter";
import CompanyTable from "../CompaniesListComponents/CompanyTable";
import CompaniesTable from "../CompaniesListComponents/CompaniesTable";
import "bootstrap/dist/css/bootstrap.min.css";

function CompaniesList() {
  return (
    <div>
      <CompaniesTable />
    </div>
  );
}

export default CompaniesList;
