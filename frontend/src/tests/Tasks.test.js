import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { BrowserRouter as Router } from 'react-router-dom';
import Tasks from '../components/Tasks';
import useFetch from '../hooks/useFetch';
import authReducer from '../redux/reducers/authReducer';

// Mock necessary modules
jest.mock('../hooks/useFetch', () => jest.fn());
jest.mock('../components/utils/Loader', () => () => <div>Loader</div>);
jest.mock('../components/Task', () => ({ task, handleDelete }) => (
  <div>
    <span>{task.title}</span>
    <button onClick={() => handleDelete(task.id)}>Delete</button>
  </div>
));

// Utility function to render component with providers
const renderWithProviders = (ui, { initialState, store = createStore(authReducer, initialState) } = {}) => {
  return render(
    <Provider store={store}>
      <Router>
        {ui}
      </Router>
    </Provider>
  );
};

describe('Tasks Component', () => {
  test('does not fetch tasks if user is not logged in', () => {
    const mockFetchData = jest.fn();
    useFetch.mockReturnValue([mockFetchData, { loading: false }]);

    renderWithProviders(<Tasks />, { initialState: { authReducer: { isLoggedIn: false, token: 'test-token' } } });

    expect(mockFetchData).not.toHaveBeenCalled();
  });
});
