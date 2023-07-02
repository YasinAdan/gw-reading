import React, { useState } from 'react';
import { pdfjs } from 'react-pdf';
import './App.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function App() {
  const [file, setFile] = useState(null);
  const [pdfText, setPdfText] = useState('');

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    const fileReader = new FileReader();

    fileReader.onload = async () => {
      const typedArray = new Uint8Array(fileReader.result);
      const pdf = await pdfjs.getDocument(typedArray).promise;
      const numPages = pdf.numPages;
      let text = '';

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join('');
        text += pageText + ' ';
      }

      setFile(selectedFile);
      setPdfText(text);
    };

    fileReader.readAsArrayBuffer(selectedFile);
  };

  const highlightHalfWord = (word) => {
    const halfIndex = Math.ceil(word.length / 2);
    const firstHalf = word.substr(0, halfIndex);
    const secondHalf = word.substr(halfIndex);
    return (
      <span>
        <b>{firstHalf}</b>
        {secondHalf}
      </span>
    );
  };

  const isChapterStart = (word) => {
    // You can customize this logic to determine if a word is the start of a new chapter
    return word.startsWith('CHAPTER');
  };

  const isQuote = (word) => {
    // You can customize this logic to determine if a word is a quote
    return word.startsWith('"') || word.endsWith('"');
  };


  const splitIntoWords = (text) => {
    const words = text.split(/\b/);
    return words.filter((word) => word.trim() !== '');
  };

  return (
    <div className="main">
      <input type="file" onChange={handleFileUpload} />
      {pdfText && (
        <div className="highlighted-text">
          {splitIntoWords(pdfText).map((word, index) => {
            if (word === '') {
              return <br key={index} />;
            } else if (isChapterStart(word) || isQuote(word)) {
              return (
                <React.Fragment key={index}>
                  <br />
                  <span className="text">{highlightHalfWord(word)} </span>
                </React.Fragment>
              );
            } else {
              return (
                <span key={index} className="text">
                  {highlightHalfWord(word)}{' '}
                </span>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}

export default App;
