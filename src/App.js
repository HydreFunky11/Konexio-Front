import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [phrase, setPhrase] = useState('');
  const [result, setResult] = useState(null);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        response = await axios.post('http://127.0.0.1:5000/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await axios.post('http://127.0.0.1:5000/predict', {
          phrase: phrase,
        });
      }

      setResult(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  const findAnnotatedSequences = (phrase, annotations) => {
    const words = phrase.split(' ');
    const annotatedSequence = [];

    for (let i = 0; i < words.length; i++) {
      let foundAnnotation = null;

      for (let annotation of annotations) {
        const annotationWords = annotation.mot.split(' ');

        if (words.slice(i, i + annotationWords.length).join(' ') === annotation.mot) {
          foundAnnotation = {
            annotation: annotation.annotation,
            words: annotationWords,
          };
          break;
        }
      }

      if (foundAnnotation) {
        annotatedSequence.push({
          words: foundAnnotation.words.join(' '),
          annotation: foundAnnotation.annotation,
        });
        i += foundAnnotation.words.length - 1;
      } else {
        annotatedSequence.push({ words: words[i], annotation: null });
      }
    }

    return annotatedSequence;
  };

  const renderAnnotatedPhrase = () => {
    if (!result) return null;

    const annotatedSequence = findAnnotatedSequences(phrase, result.annotations || []);

    const annotatedWords = annotatedSequence.map((item, index) => {
      if (item.annotation === "biais masculin") {
        return <strong key={index} className="biais-masculin">{item.words}</strong>;
      }
      if (item.annotation === "biais feminin") {
        return <strong key={index} className="biais-feminin">{item.words}</strong>;
      }
      return <span key={index}>{item.words}</span>;
    });

    return <p>{annotatedWords.reduce((prev, curr) => [prev, ' ', curr])}</p>;
  };

  return (
    <div className="app">
      <h1>Détecteur de biais de genre</h1>
      <div className="container">
        <form onSubmit={handleSubmit} className="form">
          <textarea 
            value={phrase} 
            onChange={(e) => setPhrase(e.target.value)} 
            onKeyPress={handleKeyPress}
            placeholder="Entrez une phrase" 
            className="textarea"
          />
          <input 
            type="file" 
            onChange={handleFileChange} 
            className="file-input"
          />
          <button type="submit" className="button">Envoyer</button>
        </form>
        {result && (
          <div className="result-section">
            <div className="annotation-container">
              <div className="annotation-column">
                <h3 className="annotation-title annotation-biais-masculin">Biais Masculin:</h3>
                <ul className="annotation-list annotation-biais-masculin">
                  {result.annotations && result.annotations.filter(item => item.annotation === "biais masculin").length > 0 ? (
                    result.annotations.filter(item => item.annotation === "biais masculin").map((item, index) => (
                      <li key={index}><strong>{item.mot}</strong></li>
                    ))
                  ) : (
                    <li>Aucun biais trouvé</li>
                  )}
                </ul>
              </div>
              <div className="annotation-column">
                <h3 className="annotation-title annotation-biais-feminin">Biais Féminin:</h3>
                <ul className="annotation-list annotation-biais-feminin">
                  {result.annotations && result.annotations.filter(item => item.annotation === "biais feminin").length > 0 ? (
                    result.annotations.filter(item => item.annotation === "biais feminin").map((item, index) => (
                      <li key={index}><strong>{item.mot}</strong></li>
                    ))
                  ) : (
                    <li>Aucun biais trouvé</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="annotated-phrase">
              <h3>Phrase Annotée:</h3>
              {renderAnnotatedPhrase()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
