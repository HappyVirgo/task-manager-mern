// taskController.test.js
const request = require('supertest');
const express = require('express');
const app = express();
const Task = require('../models/Task');
const { validateObjectId } = require('../utils/validation');
const taskController = require('../controllers/taskController');

// Middleware for testing purposes
app.use(express.json());

// Mock middleware to simulate authenticated user
app.use((req, res, next) => {
  req.user = { id: 'user-id' };
  next();
});

// Routes for testing
app.get('/tasks', taskController.getTasks);
app.get('/tasks/:taskId', taskController.getTask);
app.post('/tasks', taskController.postTask);
app.put('/tasks/:taskId', taskController.putTask);
app.delete('/tasks/:taskId', taskController.deleteTask);

// Mock Task model and validation utility
jest.mock('../models/Task');
jest.mock('../utils/validation');

describe('Task Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /tasks', () => {
    it('should return 200 and tasks if tasks are found', async () => {
      const mockTasks = [{ _id: 'task-id', title: 'Test Task', description: 'Test Description' }];
      Task.find.mockResolvedValue(mockTasks);

      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.msg).toBe('Tasks found successfully..');
      expect(response.body.tasks).toEqual(mockTasks);
    });

    it('should return 500 if there is an internal server error', async () => {
      Task.find.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/tasks');

      expect(response.status).toBe(500);
      expect(response.body.status).toBe(false);
      expect(response.body.msg).toBe('Internal Server Error');
    });
  });

  describe('GET /tasks/:taskId', () => {
    it('should return 400 if taskId is not valid', async () => {
      validateObjectId.mockReturnValue(false);

      const response = await request(app).get('/tasks/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.msg).toBe('Task id not valid');
    });

    it('should return 200 and task if task is found', async () => {
      validateObjectId.mockReturnValue(true);
      const mockTask = { _id: 'task-id', title: 'Test Task', description: 'Test Description' };
      Task.findOne.mockResolvedValue(mockTask);

      const response = await request(app).get('/tasks/task-id');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.msg).toBe('Task found successfully..');
      expect(response.body.task).toEqual(mockTask);
    });

    it('should return 400 if no task is found', async () => {
      validateObjectId.mockReturnValue(true);
      Task.findOne.mockResolvedValue(null);

      const response = await request(app).get('/tasks/task-id');

      expect(response.status).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.msg).toBe('No task found..');
    });

    it('should return 500 if there is an internal server error', async () => {
      validateObjectId.mockReturnValue(true);
      Task.findOne.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/tasks/task-id');

      expect(response.status).toBe(500);
      expect(response.body.status).toBe(false);
      expect(response.body.msg).toBe('Internal Server Error');
    });
  });

  describe('POST /tasks', () => {
    it('should return 400 if title or description is missing', async () => {
      const response = await request(app).post('/tasks').send({ title: 'Test Task' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.msg).toBe('Title or description of task not found');
    });

    it('should return 200 and created task if task is created successfully', async () => {
      const newTask = { _id: 'task-id', title: 'Test Task', description: 'Test Description' };
      Task.create.mockResolvedValue(newTask);

      const response = await request(app).post('/tasks').send({ title: 'Test Task', description: 'Test Description' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.msg).toBe('Task created successfully..');
      expect(response.body.task).toEqual(newTask);
    });

    it('should return 500 if there is an internal server error', async () => {
      Task.create.mockRejectedValue(new Error('Database error'));

      const response = await request(app).post('/tasks').send({ title: 'Test Task', description: 'Test Description' });

      expect(response.status).toBe(500);
      expect(response.body.status).toBe(false);
      expect(response.body.msg).toBe('Internal Server Error');
    });
  });

  describe('PUT /tasks/:taskId', () => {
    it('should return 400 if taskId is not valid', async () => {
      validateObjectId.mockReturnValue(false);

      const response = await request(app).put('/tasks/invalid-id').send({ title: 'Updated Task', description: 'Updated Description' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.msg).toBe('Task id not valid');
    });

    it('should return 400 if title or description is missing', async () => {
      validateObjectId.mockReturnValue(true);

      const response = await request(app).put('/tasks/task-id').send({ title: 'Updated Task' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.msg).toBe('Title or description of task not found');
    });

    it('should return 403 if user is not authorized to update task', async () => {
      validateObjectId.mockReturnValue(true);
      Task.findById.mockResolvedValue({ user: 'another-user-id' });

      const response = await request(app).put('/tasks/task-id').send({ title: 'Updated Task', description: 'Updated Description' });

      expect(response.status).toBe(403);
      expect(response.body.status).toBe(false);
      expect(response.body.msg).toBe("You can't update task of another user");
    });

    it('should return 200 and updated task if task is updated successfully', async () => {
      validateObjectId.mockReturnValue(true);
      Task.findById.mockResolvedValue({ user: 'user-id' });
      const updatedTask = { _id: 'task-id', title: 'Updated Task', description: 'Updated Description', completed: true };
      Task.findByIdAndUpdate.mockResolvedValue(updatedTask);

      const response = await request(app).put('/tasks/task-id').send({ title: 'Updated Task', description: 'Updated Description', completed: true });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.msg).toBe('Task updated successfully..');
      expect(response.body.task).toEqual(updatedTask);
    });

    it('should return 500 if there is an internal server error', async () => {
      validateObjectId.mockReturnValue(true);
      Task.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

      const response = await request(app).put('/tasks/task-id').send({ title: 'Updated Task', description: 'Updated Description' });

      expect(response.status).toBe(500);
      expect(response.body.status).toBe(false);
      expect(response.body.msg).toBe('Internal Server Error');
    });
  });

  describe('DELETE /tasks/:taskId', () => {
    it('should return 400 if taskId is not valid', async () => {
      validateObjectId.mockReturnValue(false);

      const response = await request(app).delete('/tasks/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.msg).toBe('Task id not valid');
    });

    it('should return 400 if task with given id is not found', async () => {
      validateObjectId.mockReturnValue(true);
      Task.findById.mockResolvedValue(null);

      const response = await request(app).delete('/tasks/task-id');

      expect(response.status).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.msg).toBe('Task with given id not found');
    });

    it('should return 403 if user is not authorized to delete task', async () => {
      validateObjectId.mockReturnValue(true);
      Task.findById.mockResolvedValue({ user: 'another-user-id' });

      const response = await request(app).delete('/tasks/task-id');

      expect(response.status).toBe(403);
      expect(response.body.status).toBe(false);
      expect(response.body.msg).toBe("You can't delete task of another user");
    });

    it('should return 200 if task is deleted successfully', async () => {
      validateObjectId.mockReturnValue(true);
      Task.findById.mockResolvedValue({ user: 'user-id' });
      Task.findByIdAndDelete.mockResolvedValue({});

      const response = await request(app).delete('/tasks/task-id');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.msg).toBe('Task deleted successfully..');
    });

    it('should return 500 if there is an internal server error', async () => {
      validateObjectId.mockReturnValue(true);
      Task.findByIdAndDelete.mockRejectedValue(new Error('Database error'));

      const response = await request(app).delete('/tasks/task-id');

      expect(response.status).toBe(500);
      expect(response.body.status).toBe(false);
      expect(response.body.msg).toBe('Internal Server Error');
    });
  });
});
