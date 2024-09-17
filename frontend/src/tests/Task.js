// Task.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';  // for the 'toBeInTheDocument' matcher
import Task from './Task';
import { MemoryRouter } from 'react-router-dom';

// Mock Tooltip component since it's not the focus of the test
jest.mock('./utils/Tooltip', () => ({ text, position, children }) => (
    <div data-testid="tooltip">
        {children}
    </div>
));

describe('Task Component', () => {
    const task = {
        _id: '1',
        title: 'Test Task',
        description: 'This is a test task description.',
        completed: true
    };
    const handleDelete = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders task with title and description', () => {
        render(
            <MemoryRouter>
                <Task task={task} handleDelete={handleDelete} index={0} />
            </MemoryRouter>
        );

        expect(screen.getByText('Test Task')).toBeInTheDocument();
        expect(screen.getByText('This is a test task description.')).toBeInTheDocument();
    });

    test('shows completed status correctly', () => {
        render(
            <MemoryRouter>
                <Task task={task} handleDelete={handleDelete} index={0} />
            </MemoryRouter>
        );

        expect(screen.getByText('Completed')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /edit/i })).toHaveAttribute('href', '/tasks/1');
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /delete/i })).toBeVisible();
    });

    test('handles delete click', () => {
        render(
            <MemoryRouter>
                <Task task={task} handleDelete={handleDelete} index={0} />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: /delete/i }));
        expect(handleDelete).toHaveBeenCalledWith('1');
    });

    test('shows pending status correctly', () => {
        const pendingTask = { ...task, completed: false };
        render(
            <MemoryRouter>
                <Task task={pendingTask} handleDelete={handleDelete} index={0} />
            </MemoryRouter>
        );

        expect(screen.getByText('Pending')).toBeInTheDocument();
    });
});