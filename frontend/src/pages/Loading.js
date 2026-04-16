import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Loading = () => {
  const [dots, setDots] = useState('...');
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    const timeout = setTimeout(() => {
      navigate('/home');
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return React.createElement(
    'div',
    { className: 'loader-container' },
    React.createElement(
      'div',
      { className: 'logo' },
      React.createElement('img', {
        src: '/images/Hot-Wheels-Emblem.png',
        alt: 'Hot Wheels Logo'
      })
    ),
    React.createElement(
      'div',
      { className: 'welcome-text' },
      'Welcome to My Hot Wheels Page'
    ),
    React.createElement(
      'div',
      { className: 'loading-text' },
      'Loading',
      React.createElement('span', { id: 'dots' }, dots)
    )
  );
};

export default Loading;