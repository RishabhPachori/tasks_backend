module.exports = (app) => {
    const taskController = require('../controllers/task.controller');
    const router = require('express').Router();

    app.use('/api/tasks', router);

    router.post('/create', taskController.createTask);

    router.get('/', taskController.getAllTasks);
  
    router.get('/metrics', taskController.getTaskMetrics);

    router.get('/:id', taskController.getTask);

    router.put('/update/:id', taskController.editTask);

    router.delete('/delete/:id', taskController.deleteTask);
};
