import React from "react";
import "./Pagination.css";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="pagination">
      {/* Previous Button */}
      {currentPage > 1 && (
        <button
          className="page-button"
          onClick={() => onPageChange(currentPage - 1)}
        >
          {"<"}
        </button>
      )}

      {/* Page Numbers */}
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index + 1}
          className={`page-button ${currentPage === index + 1 ? "active" : ""}`}
          onClick={() => onPageChange(index + 1)}
        >
          {index + 1}
        </button>
      ))}

      {/* Next Button */}
      {currentPage < totalPages && (
        <button
          className="page-button"
          onClick={() => onPageChange(currentPage + 1)}
        >
          {">"}
        </button>
      )}
    </div>
  );
};

export default Pagination;
