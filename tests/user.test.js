const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOneId, userOne, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should signup a new user', async () => {
    const newUser = {
        name: 'Vlad',
        email: 'diamorph@example.com',
        password: 'MytestPass213'
    }
    const response = await request(app).post('/users')
        .send(newUser)
        .expect(201);

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user.id);
    expect(user).not.toBeNull();

    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: newUser.name,
            email: newUser.email,
        },
        token: user.tokens[0].token
    });
    expect(user.password).not.toBe('MytestPass213');
});

test('Should not signup user with invalid name', async () => {
    await request(app).post('/users')
        .send({
            name: '',
            email: 'test@gmail.com',
            pasword: 'MytestPass2'
        })
        .expect(400);
});

test('Should not signup user with invalid password', async () => {
    await request(app).post('/users')
        .send({
            name: 'Test name',
            email: 'test@gmail.com',
            pasword: 'MyTestPassword423'
        })
        .expect(400);

    await request(app).post('/users')
        .send({
            name: 'Test name',
            email: 'test@gmail.com',
            pasword: 'pass1'
        })
        .expect(400);
});

test('Should not signup user with invalid email', async () => {
    await request(app).post('/users')
        .send({
            name: 'Test name',
            email: 'test@mail',
            pasword: 'MytestPass2'
        })
        .expect(400);
});

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200);

    const user = await User.findById(response.body.user.id);
    expect(response.body.token).toEqual(user.tokens[1].token);
});

test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: 'someEmail@example.com',
        password: 'Newpass123'
    }).expect(400);
});

test('Should get profile for user', async () => {
    await request(app).get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
});

test('Should not get profile for unauthenticated user', async () => {
    await request(app).get('/users/me')
        .send()
        .expect(401);
});

test('Should delete account for user', async () => {
   const response = await request(app).delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
   const user = await User.findById(response.body.id);
   expect(user).toBeNull();
});

test('Should not delete account for unauthenticated user', async () => {
    await request(app).delete('/users/me')
        .send()
        .expect(401)
});

test('Should upload avatar image', async () => {
    await request(app).post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should not delete avatar if unauthenticated', async () => {
    await request(app).delete('/users/me/avatar')
        .expect(401)
});

test('Should update valid user fields', async () => {
    const name = 'Anton';
    const response = await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({name})
        .expect(200);

    const user = await User.findById(userOneId);
    expect(response.body.name).toBe(name)
    expect(user.name).toBe(response.body.name);
});

test('Should not update user if unauthenticated', async () => {
    await request(app).patch('/users/me')
        .send({
            location: 'Charlotte'
        })
        .expect(401);
});

test('Should not update user with invalid name', async () => {
    await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({name: ''})
        .expect(400);
});

test('Should not update user with invalid email', async () => {
    await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({email: 'test@gmail'})
        .expect(400);
});

test('Should not update user with invalid password', async () => {
    await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({password: 'MytestPassworD'})
        .expect(400);

    await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({password: 'test12'})
        .expect(400);
});
