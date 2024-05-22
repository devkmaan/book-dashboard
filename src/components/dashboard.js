import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaEdit } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSortUp,
  faSortDown,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import "./Dashboard.css";

const Dashboard = () => {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("title");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [editIndex, setEditIndex] = useState(-1);
  const [editedData, setEditedData] = useState({});
  const [sortedBooks, setSortedBooks] = useState([]);

  const handleSortAndFilter = useCallback(() => {
    let sortedBooks = [...books];

    sortedBooks = sortedBooks.filter((book) =>
      book.author_name.toLowerCase().includes(search.toLowerCase())
    );

    sortedBooks = sortedBooks.sort((a, b) => {
      const compareValueA = a[orderBy] || ""; // Handle cases where data is missing
      const compareValueB = b[orderBy] || ""; // Handle cases where data is missing
      const comparison =
        order === "asc"
          ? compareValueA.localeCompare(compareValueB)
          : compareValueB.localeCompare(compareValueA);
      return comparison;
    });

    setSortedBooks(sortedBooks);
  }, [books, order, orderBy, search]);

  useEffect(() => {
    handleSortAndFilter();
  }, [books, order, orderBy, search, handleSortAndFilter]);

  useEffect(() => {
    fetchBooks();
  }, [page, rowsPerPage]);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(
        "https://openlibrary.org/subjects/science.json?limit=200"
      );
      const works = response.data.works;

      const booksWithDetails = await Promise.all(
        works.map(async (book) => {
          try {
            const bookDetails = await axios.get(
              `https://openlibrary.org${book.key}.json`
            );
            const authorDetails = await Promise.all(
              book.authors.map(async (author) => {
                try {
                  const authorData = await axios.get(
                    `https://openlibrary.org${author.key}.json`
                  );
                  return authorData.data;
                } catch (error) {
                  console.error(
                    `Error fetching author data for ${author.name}:`,
                    error
                  );
                  return {};
                }
              })
            );

            const firstPublishYear =
              bookDetails.data.first_publish_year || "N/A";

            return {
              ...book,
              first_publish_year: firstPublishYear,
              subject: bookDetails.data.subjects
                ? bookDetails.data.subjects.join(", ")
                : "N/A",
              ratings_average: bookDetails.data.ratings_average || "N/A",
              author_name: authorDetails
                .map((author) => author.name)
                .join(", "),
              author_birth_date: authorDetails
                .map((author) => author.birth_date || "N/A")
                .join(", "),
              author_top_work: authorDetails
                .map((author) => author.top_work || "N/A")
                .join(", "),
            };
          } catch (error) {
            console.error(
              `Error fetching book details for ${book.title}:`,
              error
            );
            return {};
          }
        })
      );
      setBooks(booksWithDetails);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleToggleExpand = (index) => {
    setExpanded((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditedData({ ...sortedBooks[index] });
  };

  const handleDownloadCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      sortedBooks.map((book) => Object.values(book).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "books.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleSave = () => {
    const updatedSortedBooks = [...sortedBooks];
    updatedSortedBooks[editIndex] = editedData;
    setSortedBooks(updatedSortedBooks);
    setEditIndex(-1);
  };

  const handleInputChange = (e, field) => {
    setEditedData((prevState) => ({
      ...prevState,
      [field]: e.target.value,
    }));
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-300 p-8">
      <div className="flex flex-col w-full max-w-7xl bg-white shadow-md rounded-lg overflow-hidden">
        <div className="mb-4 p-4">
          <input
            type="text"
            placeholder="Search by Author Name"
            value={search}
            onChange={handleSearchChange}
            className="p-2 w-full border border-gray-500 rounded-md focus:outline-none focus:ring focus:ring-blue-400 hover: outline-none hover:ring hover:ring-gray-300"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="max-w-full table-auto text-center">
            <thead>
              <tr>
                {[
                  "Title",
                  "Author Name",
                  "Ratings Average",
                  "First Publish Year",
                  "Subject",
                  "Author Birth Date",
                  "Author Top Work",
                  "Edit Row Data",
                ].map((header, index) => {
                  const key = header.replace(/\s+/g, "_").toLowerCase();
                  return (
                    <th key={index} className="p-2 text-center ">
                      <button
                        onClick={() => handleRequestSort(key)}
                        className="sort-button align-middles"
                      >
                        {header}
                        {orderBy === key ? (
                          order === "asc" ? (
                            <FontAwesomeIcon icon={faSortUp} />
                          ) : (
                            <FontAwesomeIcon icon={faSortDown} />
                          )
                        ) : (
                          <FontAwesomeIcon icon={faSort} />
                        )}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sortedBooks
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((book, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                  >
                    <td className="p-4 text-center hover:underline">
                      {editIndex === index ? (
                        <input
                          type="text"
                          value={editedData.title}
                          onChange={(e) => handleInputChange(e, "title")}
                          style={{ width: "100%" }}
                        />
                      ) : (
                        book.title
                      )}
                    </td>
                    <td className="p-4 text-center hover:underline">
                      {editIndex === index ? (
                        <input
                          type="text"
                          value={editedData.author_name}
                          onChange={(e) => handleInputChange(e, "author_name")}
                          style={{ width: "100%" }}
                        />
                      ) : (
                        book.author_name
                      )}
                    </td>
                    <td className="p-4 text-center hover:underline">
                      {editIndex === index ? (
                        <input
                          type="text"
                          value={editedData.ratings_average}
                          onChange={(e) =>
                            handleInputChange(e, "ratings_average")
                          }
                          style={{ width: "100%" }}
                        />
                      ) : (
                        book.ratings_average
                      )}
                    </td>
                    <td className="p-4 text-center hover:underline">
                      {editIndex === index ? (
                        <input
                          type="text"
                          value={editedData.first_publish_year}
                          onChange={(e) =>
                            handleInputChange(e, "first_publish_year")
                          }
                          style={{ width: "100%" }}
                        />
                      ) : (
                        book.first_publish_year
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {expanded[index] || book.subject.length <= 100
                        ? book.subject
                        : `${book.subject.slice(0, 100)}...`}
                      {book.subject.length > 100 && (
                        <button
                          onClick={() => handleToggleExpand(index)}
                          className="text-blue-500 ml-2 hover:text-blue-700"
                        >
                          {expanded[index] ? "Read Less" : "Read More"}
                        </button>
                      )}
                    </td>
                    <td className="p-4 text-center hover:underline">
                      {editIndex === index ? (
                        <input
                          type="text"
                          value={editedData.author_birth_date}
                          onChange={(e) =>
                            handleInputChange(e, "author_birth_date")
                          }
                          style={{ width: "100%" }}
                        />
                      ) : (
                        book.author_birth_date
                      )}
                    </td>
                    <td className="p-4 text-center hover:underline">
                      {editIndex === index ? (
                        <input
                          type="text"
                          value={editedData.author_top_work}
                          onChange={(e) =>
                            handleInputChange(e, "author_top_work")
                          }
                          style={{ width: "100%" }}
                        />
                      ) : (
                        book.author_top_work
                      )}
                    </td>
                    <td className="p-4 text-center align-middle">
                      {editIndex === index ? (
                        <button
                          onClick={handleSave}
                          className="px-1 py-1 border border-gray-300 rounded-md hover:border-gray-700"
                        >
                          Save
                        </button>
                      ) : (
                        <FaEdit
                          onClick={() => handleEdit(index)}
                          style={{ cursor: "pointer" }}
                        />
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between mt-4 p-4 items-center">
          <div className="flex items-center">
            <span className="mr-2">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
              className="px-2 py-1 border border-gray-300 rounded-md hover:border-gray-700"
            >
              {[10, 25, 50, 100].map((rows) => (
                <option key={rows} value={rows}>
                  {rows}
                </option>
              ))}
            </select>
          </div>
          <div>
            Page {page + 1} of {Math.ceil(sortedBooks.length / rowsPerPage)}
          </div>
          <div className="flex items-center">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              className="px-4 py-2 mr-2 bg-blue-500 text-white rounded-md  hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(sortedBooks.length / rowsPerPage) - 1}
              className="px-4 py-2  bg-blue-500 text-white rounded-md  hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
            >
              Next
            </button>
            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2 bg-green-500 text-white rounded-md ml-4 hover:bg-green-700"
            >
              Download CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
