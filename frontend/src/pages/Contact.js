import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactForm from '../components/ContactForm';

const Contact = () => {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(Header, null),
    React.createElement(
      'div',
      { className: 'container' },
      React.createElement(ContactForm, null),
      React.createElement(
        'section',
        { className: 'map-section' },
        React.createElement(
          'center',
          null,
          React.createElement('h2', null, 'THIS MAP IS A PLACEHOLDER ONLY')
        ),
        React.createElement('img', {
          src: '/images/OIP (8).webp',
          alt: 'Hot Wheels Map',
          style: { height: '180px' }
        })
      ),
      React.createElement(
        'section',
        { className: 'resources' },
        React.createElement(
          'table',
          { border: '1', width: '100%' },
          React.createElement(
            'tr',
            null,
            React.createElement('th', null, 'Resource Name'),
            React.createElement('th', null, 'Description')
          ),
          React.createElement(
            'tr',
            null,
            React.createElement('td', null, 'Hot Wheels Official Website'),
            React.createElement('td', null, 'Visit for the latest car releases and updates.')
          ),
          React.createElement(
            'tr',
            null,
            React.createElement('td', null, 'Hot Wheels Collector\'s Guide'),
            React.createElement('td', null, 'A guide for collectors, including rarity and value of cars.')
          ),
          React.createElement(
            'tr',
            null,
            React.createElement('td', null, 'eBay Hot Wheels Auctions'),
            React.createElement('td', null, 'Find rare Hot Wheels on eBay for buying and selling.')
          )
        )
      )
    ),
    React.createElement(Footer, null)
  );
};

export default Contact;