import React, { useState } from 'react';

const quizData = [
  {
    question: "Which year was the first Hot Wheels car released?",
    options: ["1965", "1970", "1960", "1968"],
    answer: 3
  },
  {
    question: "What is the fastest Hot Wheels car in your collection?",
    options: ["Twin Mill", "Formula 1", "Bone Shaker", "Deora II"],
    answer: 1
  },
  {
    question: "Which Hot Wheels series features real-life supercars?",
    options: ["Redline Club", "HW Exotics", "Track Stars", "City Racers"],
    answer: 1
  },
  {
    question: "What was your first Hot Wheels car?",
    options: ["K.I.T.T", "Twin Mill", "Mustang", "DeLorean"],
    answer: 0
  }
];

const Quiz = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [optionStyles, setOptionStyles] = useState([]);

  const selectOption = (index) => {
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;

    const q = quizData[currentQ];
    const isCorrect = selectedOption === q.answer;

    const newStyles = q.options.map((_, idx) => {
      if (idx === q.answer) return 'correct';
      if (idx === selectedOption && !isCorrect) return 'incorrect';
      return '';
    });
    setOptionStyles(newStyles);

    if (isCorrect) {
      setScore(score + 1);
      setFeedback('Correct!');
    } else {
      setFeedback(`Wrong! Correct answer: ${q.options[q.answer]}`);
    }

    setTimeout(() => {
      if (currentQ + 1 < quizData.length) {
        setCurrentQ(currentQ + 1);
        setSelectedOption(null);
        setOptionStyles([]);
        setFeedback('');
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  if (showResult) {
    return React.createElement(
      'section',
      { className: 'quiz-container' },
      React.createElement('h2', null, 'Test Your Hot Wheels Knowledge!'),
      React.createElement(
        'div',
        null,
        React.createElement('h3', null, 'Quiz Complete!'),
        React.createElement('p', null, `Your final score is ${score} out of ${quizData.length}.`)
      )
    );
  }

  const q = quizData[currentQ];

  return React.createElement(
    'section',
    { className: 'quiz-container' },
    React.createElement('h2', null, 'Test Your Hot Wheels Knowledge!'),
    React.createElement('div', { id: 'quizQuestion' }, q.question),
    React.createElement(
      'div',
      { className: 'options' },
      q.options.map((opt, i) => 
        React.createElement(
          'div',
          {
            key: i,
            className: `option ${selectedOption === i ? 'selected' : ''} ${optionStyles[i] || ''}`,
            onClick: () => selectOption(i)
          },
          opt
        )
      )
    ),
    React.createElement(
      'button',
      {
        id: 'quizSubmit',
        onClick: handleSubmit,
        disabled: selectedOption === null
      },
      'Submit Answer'
    ),
    feedback && React.createElement('div', { id: 'quizResult' }, feedback)
  );
};

export default Quiz;