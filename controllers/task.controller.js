const taskService = require('../services/task.service');
const status = require('http-status');
const Sequelize = require('sequelize');

const getPagination = (page, size) => {
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;

    return { limit, offset };
};

const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: tasks } = data;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, tasks, totalPages, currentPage };
};

/** Create task with title, description, status */
exports.createTask = async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        return res.status(status.BAD_REQUEST).send({
            success: false,
            message: 'Title and description is required.',
        });
    }

    const taskData = {
        title,
        description,
        status: 'open'
    };

    try {
        await taskService.createTask(taskData);
        return res.status(status.CREATED).send({
            success: true,
            message: 'Task was created.',
        });
    } catch (e) {
        console.log(`ERROR: ${e.message}`);
        return res.status(status.INTERNAL_SERVER_ERROR).send({
            success: false,
            message: 'Error occurred while creating task.',
        });
    }
};

/** Get all tasks */
exports.getAllTasks = async (req, res) => {
    try {
        const { page, size } = req.query;
        const { limit, offset } = getPagination(page, size);
        const tasks = await taskService.getAllTasksWithCount({}, limit, offset);
        const finalTasksResponse = getPagingData(tasks, page, limit);
        return res.status(status.OK).send({ success: true, data: finalTasksResponse, message: 'Successfully get all tasks.' });
    } catch (e) {
        console.log(`ERROR: ${e.message}`);
        return res.status(status.INTERNAL_SERVER_ERROR).send({
            success: false,
            message: 'Error occurred while fetching tasks.'
        });
    }
};

/** Get single task */
exports.getTask = async (req, res) => {
    const { id } = req.params;

    try {
        const task = await taskService.getTask(id);
        if (task) {
            return res.status(status.OK).send({ success: true, data: task, message: 'Successfully get task details.' });
        }
        return res.status(status.NOT_FOUND).send({
            success: false,
            message: 'Task not found.',
        });
    } catch (e) {
        console.log(`ERROR: ${e.message}`);
        return res.status(status.INTERNAL_SERVER_ERROR).send({
            success: false,
            message: 'Error occurred while fetching task.',
        });
    }
};

/** Update task details */
exports.editTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, status } = req.body;

    if (!title || !description || !status) {
        return res.status(status.BAD_REQUEST).send({
            success: false,
            message: 'Parameters in request body are missing.',
        });
    }

    const isStatusCorrect = [ 'open', 'inProgress', 'completed' ].includes(status);

    if (!isStatusCorrect) {
        return res.status(status.BAD_REQUEST).send({
            success: false,
            message: 'Status is invalid.It should be open or inProgress or invalid',
        });
    }

    const taskData = { title, description, status };

    try {
        const updatedTaskCount = await taskService.editTask(id, taskData);

        if (updatedTaskCount[0]) {
            return res.status(status.OK).send({
                success: true,
                message: 'Task was updated.',
            });
        }
        return res.status(status.NOT_FOUND).send({
            success: false,
            message: 'Task not found.',
        });
    } catch (e) {
        console.log(`ERROR: ${e.message}`);
        return res.status(status.INTERNAL_SERVER_ERROR).send({
            success: false,
            message: 'Error occurred while updating task.',
        });
    }
};

/** Delete task */
exports.deleteTask = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedTaskCount = await taskService.deleteTask(id);
        if (deletedTaskCount) {
            return res.status(status.OK).send({
                success: true,
                message: 'Task was deleted.',
            });
        }
        return res.status(status.NOT_FOUND).send({
            success: false,
            message: 'Task not found.',
        });
    } catch (e) {
        console.log(`ERROR: ${e.message}`);
        return res.status(status.INTERNAL_SERVER_ERROR).send({
            success: false,
            message: 'Error occurred while deleting task.'
        });
    }
};

/** Get tasks metrics data */
exports.getTaskMetrics = async (req, res) => {

    try {
        const year = req.query.year || new Date().getFullYear();

        if (!year || isNaN(year)) {
            return res.status(status.BAD_REQUEST).json({ success: false, message: 'Invalid year' });
        }

        // Define an array to store the task metrics data
        const taskMetricsData = [];

        // Function to get metrics for a specific month
        const getMetricsForMonth = async (year, month) => {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 1);

            const metrics = await taskService.getAllTasks({
                attributes: [
                    [ Sequelize.fn('COUNT', Sequelize.col('status')), 'count' ],
                    'status',
                ],
                where: {
                    createdAt: {
                        [Sequelize.Op.gte]: startDate,
                        [Sequelize.Op.lt]: endDate,
                    },
                },
                group: [ 'status' ],
                raw: true,
            });

            return metrics;
        };

        // Calculate metrics for each month
        for (let month = 1; month <= 12; month++) {
            const monthlyMetrics = await getMetricsForMonth(year, month);

            // Create a metrics object for the month
            const monthMetrics = {
                date: `${new Date(year, month - 1).toLocaleString('en-US', {
                    month: 'long',
                    year: 'numeric',
                })}`,
                metrics: {
                    open_tasks: 0,
                    inProgress_tasks: 0,
                    completed_tasks: 0,
                },
            };

            // Populate the metrics object with the counts
            for (const metric of monthlyMetrics) {
                const { status, count } = metric;
                monthMetrics.metrics[status.toLowerCase() + '_tasks'] = count;
            }

            // Add the month's metrics to the taskMetricsData
            taskMetricsData.push(monthMetrics);
        }

        const isTaskMetricsDataExists = taskMetricsData.length > 0;
        if (isTaskMetricsDataExists) {
            return res.status(status.OK).send({ success: true, data: taskMetricsData, message: 'Successfully get tasks metrics.' });
        }

        return res.status(status.NOT_FOUND).send({ success: false, data: [], message: 'Tasks not found.' });
    } catch (e) {
        console.log(`ERROR: ${e.message}`);
        return res.status(status.INTERNAL_SERVER_ERROR).send({
            success: false,
            message: 'Error occurred while fetching task metrics.'
        });
    }
};
