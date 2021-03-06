const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

const User = require('../models/user');
const middleware = require('../utils/middleware');
const jwt = require('jsonwebtoken');


blogsRouter.get('/', async (request, response) => {			
	const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
	response.json(blogs);	
});

blogsRouter.get('/:id', async  (request, response) => {
 

	const blog = await Blog.findById(request.params.id);
	response.json(blog);


});


blogsRouter.delete('/:id',  async (request, response) => {

	const decodedToken = jwt.verify(request.token, process.env.SECRET);

	if (!request.token || !decodedToken.id) {
		return response.status(401).json({ error: 'token missing or invalid' });
	}


	const blog = await Blog.findById(request.params.id);
	if(!blog){
		return response.status(400).json({ 
			error: 'blog not found' 
		});
	}	

	if(blog.user.toString() !== decodedToken.id){
		return response.status(401).json({ 
			error: 'unauthorized user , only the creator can delete this blog' 
		});
	}	
	Blog.findByIdAndRemove(request.params.id , function (err) {
		if (err) return console.log(err);
		response.status(204).end();
	});


});




blogsRouter.post('/', middleware.userExtractor ,  async (request, response) => {
	const body = request.body;
	if(!body.title && !body.url) return response.status(400).end();

	if(!body.likes) body.likes = 0;

	if (!request.user ) {
		return response.status(401).json({ error: 'user not authenticated' });
	}
	const user =  request.user;

	const blog = new Blog( { ...body , user: user._id} );

	const savedBlog = await blog.save();

	User.findByIdAndUpdate(
		user._id,
		{ $set: { blogs: user.blogs.concat(savedBlog._id)}},
		(err, updatedBlog) => {		
			console.log(err, updatedBlog);					
		}
	);	

	
	const populatedBlog = await Blog.findById(savedBlog._id).populate('user', { name: 1});
	
	response.status(201).json(populatedBlog);

});



blogsRouter.put('/:id', async  (request, response) => {



	const blog = await Blog.findById(request.params.id);

	if(!blog){
		return response.status(400).json({ 
			error: 'blog not found' 
		});
	}				

	try {
		const blog = await Blog.findByIdAndUpdate(
			request.params.id,
			request.body,
			{new: true}
		).populate('user', { name: 1, username : 1});
		response.json(blog);

	} catch (error) {
		console.log(error);
	}
	

});


blogsRouter.post('/:id/comments',   async (request, response) => {
	const body = request.body;
	if(!body.content ) return response.status(400).end();

	try {

		const blog = await Blog.findById(request.params.id);
	
		if(!blog){
			return response.status(400).json({ 
				error: 'blog not found' 
			});
		}				

		
		const commentedBlog =  await Blog.findByIdAndUpdate(
			request.params.id,
			{comments: blog.comments.concat(body.content)},
			{new: true}
		).populate('user', { name: 1, username : 1});
	
		response.status(201).json(commentedBlog);

	} catch (error) {
		console.log(error);
		return response.status(400).json({ 
			error: 'An error ocurred' 
		});
	}


});



module.exports = blogsRouter;