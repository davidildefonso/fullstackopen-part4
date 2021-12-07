const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);

const Blog = require('../models/blog');



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

test('a blog can be deleted', async () => {
	const blogsAtStart = await helper.blogsInDb();
	const blogToDelete = blogsAtStart[0];
	await api
		.delete(`/api/blogs/${blogToDelete.id}`)
		.expect(204);

	const blogsAtEnd = await helper.blogsInDb();

	expect(blogsAtEnd).toHaveLength(
		helper.initialBlogs.length - 1
	);

	const titles = blogsAtEnd.map(r => r.title);

	expect(titles).not.toContain(blogToDelete.title);
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





afterAll(() => {
	mongoose.connection.close();
});
