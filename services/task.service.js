const db = require('../models');
const Task = db.task;

exports.createTask = async (taskData) => await Task.create(taskData);

exports.getAllTasks = async (condition = {}) => await Task.findAll(condition);

exports.getAllTasksWithCount = async (condition = {}, limit, offset) => await Task.findAndCountAll(condition,limit, offset);

exports.getTask = async (id) =>
    await Task.findOne({
        where: { id },
    });

exports.editTask = async (id, taskData) =>
    await Task.update(taskData, {
        where: { id },
    });

exports.deleteTask = async (id) =>
    await Task.destroy({
        where: { id },
    });
