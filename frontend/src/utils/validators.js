export const validateRegisterForm = ({ name, email, password }) => {
  const errors = {};

  if (!name || !name.trim()) {
    errors.name = 'Name is required';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!email || !email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
};

export const validateLoginForm = ({ email, password }) => {
  const errors = {};

  if (!email || !email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return errors;
};

export const validateTaskForm = ({ title }) => {
  const errors = {};

  if (!title || !title.trim()) {
    errors.title = 'Title is required';
  } else if (title.trim().length > 120) {
    errors.title = 'Title cannot exceed 120 characters';
  }

  return errors;
};

export const getApiErrorMessage = (error) => {
  if (error?.response?.data?.errors?.length) {
    return error.response.data.errors.map((e) => e.message).join(', ');
  }
  return error?.response?.data?.message || 'Something went wrong. Please try again.';
};
