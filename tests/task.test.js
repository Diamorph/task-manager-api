const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const { userOne, userTwo, taskOne, setupDatabase, taskTwo} = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'From my test'
        })
        .expect(201)
    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toEqual(false);
});

test('Should not create task with invalid description/completed', async () => {
    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: ''
        })
        .expect(400)

    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'Test Description',
            completed: 'test'
        })
        .expect(400)
});

test('Should get all tasks for user one', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    expect(response.body.length).toBe(2);
});

test('Should delete user task', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const task = await Task.findById(taskOne._id);
    expect(task).toBeNull();
});

test('Should not delete task if unauthenticated', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .send()
        .expect(401)
});

test('Should not delete other users tasks', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)

    const task = await Task.findById(taskOne._id);
    expect(task).not.toBeNull();
});

test('Should not update task with invalid description/completed', async () => {
    await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: ''
        })
        .expect(400)

    await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            completed: 'test'
        })
        .expect(400)
});

test('Should not update other users task', async () => {
    await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            description: 'New description'
        })
        .expect(404)

    const task = await Task.findById(taskOne._id);
    expect(task.description).toBe(taskOne.description);
});

test('Should fetch user task by id', async () => {
    const response = await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const task = await Task.findById(taskOne._id);
    expect(response.body.description).toBe(task.description);
});

test('Should not fetch user task by id if unauthenticated', async () => {
    await request(app)
        .get(`/tasks/${taskOne._id}`)
        .send()
        .expect(401)
});

test('Should not fetch other users task by id', async () => {
    await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
});

test('Should fetch only completed tasks', async () => {
    const response = await request(app)
        .get(`/tasks?completed=true`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body[0].completed).toBeTruthy();
    expect(response.body.length).toBe(1);
});

test('Should fetch only incomplete tasks', async () => {
    const response = await request(app)
        .get(`/tasks?completed=false`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body[0].completed).toBeFalsy();
    expect(response.body.length).toBe(1);
});

test('Should sort tasks by description asc', async () => {
    const response = await request(app)
        .get(`/tasks?sortBy=description:asc`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body[0].description).toBe(taskOne.description);
    expect(response.body[1].description).toBe(taskTwo.description);
});

test('Should sort tasks by description desc', async () => {
    const response = await request(app)
        .get(`/tasks?sortBy=description:desc`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body[0].description).toBe(taskTwo.description);
    expect(response.body[1].description).toBe(taskOne.description);
});

test('Should sort tasks by completed asc', async () => {
    const response = await request(app)
        .get(`/tasks?sortBy=completed:asc`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body[0].description).toBe(taskOne.description);
    expect(response.body[1].description).toBe(taskTwo.description);
});

test('Should sort tasks by completed desc', async () => {
    const response = await request(app)
        .get(`/tasks?sortBy=completed:desc`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body[0].description).toBe(taskTwo.description);
    expect(response.body[1].description).toBe(taskOne.description);
});

test('Should sort tasks by createdAt asc', async () => {
    const response = await request(app)
        .get(`/tasks?sortBy=createdAt:asc`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body[0].description).toBe(taskOne.description);
    expect(response.body[1].description).toBe(taskTwo.description);
});

test('Should sort tasks by createdAt desc', async () => {
    const response = await request(app)
        .get(`/tasks?sortBy=createdAt:desc`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body[0].description).toBe(taskTwo.description);
    expect(response.body[1].description).toBe(taskOne.description);
});

test('Should fetch page of tasks', async () => {
    const response = await request(app)
        .get(`/tasks?limit=10&skip=0`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toBe(2);
});


test('Should fetch page of tasks with too big skip', async () => {
    const response = await request(app)
        .get(`/tasks?limit=10&skip=10`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toBe(0);
});
