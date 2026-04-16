import React from 'react';

const ContactForm = () => {
  return React.createElement(
    'section',
    { className: 'contact-form' },
    React.createElement(
      'form',
      null,
      React.createElement('label', null, 'Name'),
      React.createElement('input', { type: 'text', placeholder: 'Your Name' }),
      React.createElement('label', null, 'Email'),
      React.createElement('input', { type: 'email', placeholder: 'example@email.com' }),
      React.createElement('label', null, 'Message'),
      React.createElement('textarea', { rows: '4' }),
      React.createElement('button', { type: 'submit' }, 'Send')
    )
  );
};

export default ContactForm;