import React, { useState } from 'react';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    dob: '',
    level: '',
    terms: false
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === 'checkbox' ? checked : value
    });
  };

  const handleRadioChange = (e) => {
    setFormData({
      ...formData,
      level: e.target.value
    });
  };

  const isAtLeast18 = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.fullName === '') {
      newErrors.fullName = 'Full Name is required';
    }

    if (formData.username === '') {
      newErrors.username = 'Username is required';
    }

    if (formData.dob === '') {
      newErrors.dob = 'Date of Birth is required';
    } else if (!isAtLeast18(formData.dob)) {
      newErrors.dob = 'You must be at least 18 years old';
    }

    if (!formData.level) {
      newErrors.level = 'Select your interest level';
    }

    if (!formData.terms) {
      newErrors.terms = 'You must agree to the terms';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      alert("🎉 You are now successfully registered!");
      setFormData({
        fullName: '',
        username: '',
        password: '',
        dob: '',
        level: '',
        terms: false
      });
      setErrors({});
    } else {
      setErrors(newErrors);
    }
  };

  return React.createElement(
    'section',
    null,
    React.createElement(
      'form',
      { id: 'registrationForm', onSubmit: handleSubmit },
      React.createElement('label', null, 'Full Name'),
      React.createElement('input', {
        type: 'text',
        id: 'fullName',
        value: formData.fullName,
        onChange: handleChange
      }),
      errors.fullName && React.createElement('span', { className: 'error' }, errors.fullName),

      React.createElement('label', null, 'Username'),
      React.createElement('input', {
        type: 'text',
        id: 'username',
        value: formData.username,
        onChange: handleChange
      }),
      errors.username && React.createElement('span', { className: 'error' }, errors.username),

      React.createElement('label', null, 'Password'),
      React.createElement('input', {
        type: 'password',
        id: 'password',
        value: formData.password,
        onChange: handleChange
      }),

      React.createElement('label', null, 'Date of Birth'),
      React.createElement('input', {
        type: 'date',
        id: 'dob',
        value: formData.dob,
        onChange: handleChange
      }),
      errors.dob && React.createElement('span', { className: 'error' }, errors.dob),

      React.createElement('label', null, 'Interest Level'),
      React.createElement(
        'div',
        null,
        React.createElement(
          'label',
          null,
          React.createElement('input', {
            type: 'radio',
            name: 'level',
            value: 'Beginner',
            checked: formData.level === 'Beginner',
            onChange: handleRadioChange
          }),
          ' Beginner'
        ),
        React.createElement(
          'label',
          null,
          React.createElement('input', {
            type: 'radio',
            name: 'level',
            value: 'Intermediate',
            checked: formData.level === 'Intermediate',
            onChange: handleRadioChange
          }),
          ' Intermediate'
        ),
        React.createElement(
          'label',
          null,
          React.createElement('input', {
            type: 'radio',
            name: 'level',
            value: 'Expert',
            checked: formData.level === 'Expert',
            onChange: handleRadioChange
          }),
          ' Expert'
        )
      ),
      errors.level && React.createElement('span', { className: 'error' }, errors.level),

      React.createElement(
        'label',
        null,
        React.createElement('input', {
          type: 'checkbox',
          id: 'terms',
          checked: formData.terms,
          onChange: handleChange
        }),
        ' I agree to the terms of agreement'
      ),
      errors.terms && React.createElement('span', { className: 'error' }, errors.terms),

      React.createElement('button', { type: 'submit' }, 'Register')
    )
  );
};

export default RegistrationForm;