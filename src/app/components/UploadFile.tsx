"use client";

import axios from "axios";
import { useState } from "react";

const UploadFile = () => {
  const [chatHistory, setChatHistory] = useState<{ fileName: string; summary: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: any) => {
    const file = e?.target?.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const data = res.data;

      if (data.summary) {
        setChatHistory((prev) => [...prev, { fileName: file.name, summary: data.summary }]);
      }
    } catch (err) {
      console.error("Client error uploading file:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-center mt-10">
        <label htmlFor="file-upload" className="border-1 rounded-md px-4 py-2 cursor-pointer hover:bg-gray-800">
          Upload PDF for Summary
        </label>
        <input
          id="file-upload"
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
      </div>

      {chatHistory.length ? (
        <div className="relative overflow-x-auto w-[80%] flex jusitify-center m-auto mt-5">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  File name
                </th>
                <th scope="col" className="px-6 py-3">
                  Summary
                </th>
              </tr>
            </thead>
            <tbody>
              {chatHistory.map((item, index) => {
                return (
                  <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {item.fileName}
                    </th>
                    <td className="px-6 py-4">{item.summary}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <div className="text-center font-bold mt-10">Upload file to see the history</div>
      )}
      {loading && (
        <div
          className="flex m-auto mt-5 h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
          role="status"
        ></div>
      )}
    </div>
  );
};

export default UploadFile;
