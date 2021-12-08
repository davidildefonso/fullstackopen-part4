const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);

const Blog = require('../models/blog');
const bcrypt = require('bcrypt');
const User = require('../models/user');


beforeEach(async () => {
	await Blog.deleteMany({});

	for (let blog of helper.initialBlogs) {
		let blogObject = new Blog(blog);
		await blogObject.save();
	}

	// const blogObjects = helper.initialBlogs.map(blog => new Blog(blog));
	// const promiseArray = blogObjects.map(blog => blog.save());	
	// await Promise.all(promiseArray);
});

test('blog unique identifier is called id instead of _id', async () => {
	const blogsAtStart = await helper.blogsInDb();
	const blogToView = blogsAtStart[0];
	expect(blogToView.id).toBeDefined();
});




test('all blogs are returned', async () => {
	const response = await api.get('/api/blogs');
	expect(response.body).toHaveLength(helper.initialBlogs.length);
});

test('a specific blog is within the returned notes', async () => {
	const response = await api.get('/api/blogs');

	const urls = response.body.map(r => r.url);
	expect(urls).toContain(
		'url 4'
	);
});


test('a valid blog can be added', async () => {
	const newBlog = {
		title: 'new title',
		author: 'new author',
		url: 'new url ',
		likes: 20
	};

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(201)
		.expect('Content-Type', /application\/json/);

	const blogsAtEnd = await helper.blogsInDb();
	expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

	const titles = blogsAtEnd.map(r => r.title);

	expect(titles).toContain(
		'new title'
	);
});


test('a valid blog can be added with default likes value 0 if missing in the body', async () => {
	const newBlog = {
		title: 'new title',
		author: 'new author',
		url: 'new url '
	};

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(201)
		.expect('Content-Type', /application\/json/);

	const blogsAtEnd = await helper.blogsInDb();
	expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

	const likes = blogsAtEnd.map(r => r.likes);

	expect(likes).toContain(0);
});

test('a  blog is not added if title and url is empty, response status code must be 400', async () => {
	const newBlog = {
		author: 'new author',
		likes: 5
	};

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(400);

	const blogsAtEnd = await helper.blogsInDb();
	expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length );
});



test('a specific blog can be viewed', async () => {
	const blogsAtStart = await helper.blogsInDb();

	const blogToView = blogsAtStart[0];

	const resultBlog = await api
		.get(`/api/blogs/${blogToView.id}`)
		.expect(200)
		.expect('Content-Type', /application\/json/);

	const processedBlogToView = JSON.parse(JSON.stringify(blogToView));

	expect(resultBlog.body).toEqual(processedBlogToView);
});

describe('when a user has created a blog', () => {

	let token;

	beforeEach(async () => {
		await Blog.deleteMany({});
		await User.deleteMany({});
		let passwordHash = await bcrypt.hash('sekret', 10);
		let user = new User({ username: 'testUser', name:'test user', passwordHash });
		await user.save();

		passwordHash = await bcrypt.hash('other', 10);
		user = new User({ username: 'otherUser', name:'other user', passwordHash });
		await user.save();

		const loginResponse = await api
			.post('/api/login')
			.send({username: 'testUser', password: 'sekret'})
			.expect(200)
			.expect('Content-Type', /application\/json/);


		expect(loginResponse.body.token).toBeDefined();
		token = loginResponse.body.token;

		await api
			.post('/api/blogs')
			.set('Authorization', `bearer ${token}`)
			.send({
				title: 'test title',
				author: 'testUser',
				url: 'www.testUSer.com',
				likes: 0

			})
			.expect(201)
			.expect('Content-Type', /application\/json/);

	});

	test('the blog can be deleted only by the user who created it', async () => {
		const blogsAtStart = await helper.blogsInDb();
		const blogToDelete = blogsAtStart[0];
		
		await api
			.delete(`/api/blogs/${blogToDelete.id}`)
			.set('Authorization', `bearer ${token}`)
			.expect(204);

		const blogsAtEnd = await helper.blogsInDb();

		expect(blogsAtEnd).toHaveLength(0);

		const titles = blogsAtEnd.map(r => r.title);

		expect(titles).not.toContain(blogToDelete.title);
	});

	test('the blog is not deleted  by a user other than its creator', async () => {

		const loginResponse = await api
			.post('/api/login')
			.send({username: 'otherUser', password: 'other'})
			.expect(200)
			.expect('Content-Type', /application\/json/);

		expect(loginResponse.body.token).toBeDefined();
		token = loginResponse.body.token;

		const blogsAtStart = await helper.blogsInDb();
		const blogToDelete = blogsAtStart[0];
		

		await api
			.delete(`/api/blogs/${blogToDelete.id}`)
			.set('Authorization', token)
			.expect(401);

		const blogsAtEnd = await helper.blogsInDb();

		expect(blogsAtEnd).toHaveLength(
			1
		);

		const titles = blogsAtEnd.map(r => r.title);
		expect(titles).toContain(blogToDelete.title);
	});

	test('the blog is not deleted  if request is sent without authorization token', async () => {

		const blogsAtStart = await helper.blogsInDb();
		const blogToDelete = blogsAtStart[0];
		
		await api
			.delete(`/api/blogs/${blogToDelete.id}`)
			.expect(401);

		const blogsAtEnd = await helper.blogsInDb();
		expect(blogsAtEnd).toHaveLength(
			1
		);
	});

});

test('a valid blog can be updated', async () => {
	const newBlog = {
		title: 'updated title',
		author: 'updated author',
		url: 'updated url ',
		likes: 25
	};

	const blogsAtStart = await helper.blogsInDb();
	const blogToUpdate = blogsAtStart[2];

	await api
		.put(`/api/blogs/${blogToUpdate.id}`)
		.send(newBlog)
		.expect(200)
		.expect('Content-Type', /application\/json/);

	const blogsAtEnd = await helper.blogsInDb();
	expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);

	const titles = blogsAtEnd.map(r => r.title);

	expect(titles).toContain(
		'updated title'
	);

	expect(titles).not.toContain('title 3');

	expect(blogsAtEnd[2].author).toBe('updated author');
});



describe('when there is initially one user in db', () => {
	beforeEach(async () => {
		await User.deleteMany({});

		const passwordHash = await bcrypt.hash('sekret', 10);
		const user = new User({ username: 'root', passwordHash });

		await user.save();
	});

	test('creation succeeds with a fresh username', async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			username: 'mluukkai',
			name: 'Matti Luukkainen',
			password: 'salainen',
		};

		await api
			.post('/api/users')
			.send(newUser)
			.expect(200)
			.expect('Content-Type', /application\/json/);

		const usersAtEnd = await helper.usersInDb();
		expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

		const usernames = usersAtEnd.map(u => u.username);
		expect(usernames).toContain(newUser.username);
	});

	test('creation fails with proper statuscode and message if username already taken', async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			username: 'root',
			name: 'Superuser',
			password: 'salainen',
		};

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/);

		expect(result.body.error).toContain('`username` to be unique');

		const usersAtEnd = await helper.usersInDb();
		expect(usersAtEnd).toHaveLength(usersAtStart.length);
	});

	test('creation fails with if username is empty', async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			username: '',
			name: 'Superuser',
			password: 'salainen',
		};

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/);

		expect(result.body.error).toContain('must enter username and password');

		const usersAtEnd = await helper.usersInDb();
		expect(usersAtEnd).toHaveLength(usersAtStart.length);
	});

	test('creation fails if password is empty', async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			username: 'mario',
			name: 'Superuser',
			password: '',
		};

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/);

		expect(result.body.error).toContain('must enter username and password');

		const usersAtEnd = await helper.usersInDb();
		expect(usersAtEnd).toHaveLength(usersAtStart.length);
	});

	test('creation fails if password length is less than 3 characters', async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			username: 'yoshi',
			name: 'Superuser',
			password: 'x',
		};

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/);

		expect(result.body.error).toContain('password must have 3 characters minimum');

		const usersAtEnd = await helper.usersInDb();
		expect(usersAtEnd).toHaveLength(usersAtStart.length);
	});
});

afterAll(() => {
	mongoose.connection.close();
});
