import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import './App.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function App() {
  const [pdfText, setPdfText] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const guidedReadingRef = useRef(null);
  const [scrollIntervalId, setScrollIntervalId] = useState(null);

  useEffect(() => {
    // Fetch the PDF text content here if needed
    // You can update this logic based on your requirements
  }, []);

  useEffect(() => {
    if (guidedReadingRef.current) {
      const interval = setInterval(() => {
        setCurrentPage((prevPage) => {
          const nextPage = prevPage + 1;
          if (nextPage > numPages) {
            clearInterval(interval);
          }
          return nextPage;
        });
      }, 3000); // Adjust the scrolling speed as needed

      setScrollIntervalId(interval);
    }

    return () => {
      clearInterval(scrollIntervalId);
    };
  }, [numPages]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const fileUrl = URL.createObjectURL(file);

    const loadingTask = pdfjs.getDocument(fileUrl);

    loadingTask.promise.then((doc) => {
      let text = '';
      const numPages = doc.numPages;

      const getPageText = (pageNum) => {
        return doc.getPage(pageNum).then((page) => {
          return page.getTextContent().then((content) => {
            const pageText = content.items
              .map((item) => item.str)
              .join(' ')
              .trim();
            return pageText;
          });
        });
      };

      const promises = [];
      for (let i = 1; i <= numPages; i++) {
        promises.push(getPageText(i));
      }

      Promise.all(promises).then((texts) => {
        text = texts.join(' ');
        setPdfText(text);
        setNumPages(numPages);
        setCurrentPage(1);
      });
    });
  };

  const renderGuidedReading = () => {
    if (!pdfText) {
      return null;
    }

    const guidedText = pdfText.split('. ');

    return (
      <div className="guided-reading-container">
        <div ref={guidedReadingRef} className="guided-reading-window">
          {guidedText.map((sentence, index) => {
            const isActive = index + 1 === currentPage;

            return (
              <p key={index} className={`guided-reading-sentence ${isActive ? 'active' : ''}`}>
                {sentence}
              </p>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
      {numPages && (
        <div className="pdf-container">
          <Document file={pdfText}>
            <Page pageNumber={currentPage} />
          </Document>
          {renderGuidedReading()}
        </div>
      )}
    </div>
  );
}

export default App;
