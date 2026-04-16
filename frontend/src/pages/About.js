import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Quiz from '../components/Quiz';

const About = () => {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(Header, null),
    React.createElement(
      'section',
      null,
      React.createElement('h2', null, 'What I Love About Hot Wheels'),
      React.createElement('p', null, 'Collecting Hot Wheels brings joy to my life, especially discovering rare and unique cars. The craftsmanship and nostalgia make it a fun and memorable hobby.')
    ),
    React.createElement(
      'section',
      null,
      React.createElement('h2', null, 'My Hot Wheels Journey'),
      React.createElement(
        'ol',
        null,
        React.createElement('li', null, 'First Hot Wheel: K.I.T.T'),
        React.createElement('li', null, 'Started collecting: December 27, 2025'),
        React.createElement('li', null, 'Finding nice cars to add to my collection'),
        React.createElement('li', null, 'Currently, I have 50 pieces in my room')
      ),
      React.createElement(
        'center',
        null,
        React.createElement('h2', null, 'My Favorite Hot Wheels: "Formula 1" – One of the hardest to find!'),
        React.createElement('img', {
          src: '/images/f1.webp',
          alt: 'Hot Wheels collection display',
          width: '200'
        })
      )
    ),
    React.createElement(Quiz, null),
    React.createElement(
      'blockquote',
      null,
      React.createElement(
        'h3',
        null,
        React.createElement(
          'strong',
          null,
          React.createElement(
            'center',
            null,
            '"Collecting Hot Wheels is not just about the cars, it\'s about the memories and connections you make along the way."'
          )
        )
      )
    ),
    React.createElement(Footer, null)
  );
};

export default About;