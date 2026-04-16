import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return React.createElement(
    'header',
    null,
    React.createElement(
      'h1',
      null,
      React.createElement('img', {
        src: '/images/Hot-Wheels-Emblem.png',
        alt: 'Hot Wheels Logo',
        style: { height: '50px' }
      }),
      ' My Passion for Collecting Hot Wheels'
    ),
    React.createElement(
      'nav',
      null,
      React.createElement(
        'ul',
        null,
        React.createElement(
          'li',
          null,
          React.createElement(
            Link,
            { to: "/home", className: isActive('/home') },
            'Home'
          )
        ),
        React.createElement(
          'li',
          null,
          React.createElement(
            Link,
            { to: "/about", className: isActive('/about') },
            'About'
          )
        ),
        React.createElement(
          'li',
          null,
          React.createElement(
            Link,
            { to: "/contact", className: isActive('/contact') },
            'Contact'
          )
        ),
        React.createElement(
          'li',
          null,
          React.createElement(
            Link,
            { to: "/register", className: isActive('/register') },
            'Register'
          )
        ),
        React.createElement(
          'li',
          null,
          React.createElement(
            'button',
            { id: 'darkModeToggle', onClick: toggleDarkMode },
            isDarkMode ? 'Light Mode' : 'Dark Mode'
          )
        )
      )
    )
  );
};

export default Header;