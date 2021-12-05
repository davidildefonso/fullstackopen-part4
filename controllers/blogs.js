const blogsRouter = require('express').Router();
const Blog = require('../models/blog');



blogsRouter.get('/', async (request, response) => {			
	const blogs = await Blog.find({});
	response.json(blogs);	
});

blogsRouter.get('/:id', async  (request, response) => {
 

	const blog = await Blog.findById(request.params.id);
	response.json(blog);


});


blogsRouter.delete('/:id', async (request, response) => {

	const blog = await Blog.findById(request.params.id);
	if(!blog){
		return response.status(400).json({ 
			error: 'blog not found' 
		});
	}	
	Blog.findByIdAndRemove(request.params.id , function (err) {
		if (err) return console.log(err);
		response.status(204).end();
	});


});




blogsRouter.post('/', async (request, response) => {


	const blog = new Blog(request.body);

	const savedBlog = await blog.save();
	response.status(201).json(savedBlog);

});



blogsRouter.put('/:id', async  (request, response) => {



	const blog = await Blog.findById(request.params.id);

	if(!blog){
		return response.status(400).json({ 
			error: 'blog not found' 
		});
	}				


	Blog.findByIdAndUpdate(
		request.params.id,
		request.body,
		{new: true},
		function (err, note) {
			if (err) return console.log(err);
			response.json(note);
		});

});


module.exports = blogsRouter;