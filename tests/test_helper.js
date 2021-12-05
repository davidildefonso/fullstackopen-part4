const Blog = require('../models/blog');



const initialBlogs = [
	{
		title: 'title 1',
		author: 'author 1',
		url: 'url1',
		likes: 3
	},
	{
		title: 'title 2',
		author: 'author 2',
		url: 'url 2',
		likes: 5
	},
	{
		title: 'title 3',
		author: 'author 3',
		url: 'url 3',
		likes: 93
	},
	{
		title: 'title 4',
		author: 'author 4',
		url: 'url 4',
		likes: 51
	}
];

const nonExistingId = async () => {
	const blog = new Blog({ title: 'asd', author: 'ad', url: 'asd', likes: 2 });
	await blog.save();
	await blog.remove();

	return blog._id.toString();
};

const blogsInDb = async () => {
	const blogs = await Blog.find({});
	return blogs.map(blog => blog.toJSON());
};

module.exports = {
	initialBlogs, nonExistingId, blogsInDb
};