import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <p className="text-center mt-4">Copyright ⓒ {year}</p>
    </footer>
  );
}

export default Footer;
