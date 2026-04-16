import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RegistrationForm from '../components/RegistrationForm';

const Register = () => {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(Header, null),
    React.createElement(
      'section',
      { style: { textAlign: 'center', margin: '20px 1' } },
      React.createElement('img', {
        src: '/images/hw.png',
        alt: 'Hot Wheels collection display',
        width: '150',
        height: '50'
      }),
      React.createElement('h3', null, 'Sign up to receive updates, tips, and learning resources about Hot Wheels collecting.')
    ),
    React.createElement(RegistrationForm, null),
    React.createElement(Footer, null)
  );
};

export default Register;