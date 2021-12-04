const blogsRouter = require('express').Router();
const Blog = require('../models/blog');



blogsRouter.get('/', (request, response, next) => {	
		
	Blog.find({}).then(blogs => {
		response.json(blogs);
		
	}).catch(error => next(error) );
});

blogsRouter.get('/:id', (request, response, next) => {
 

	Blog.findById(request.params.id).then(note => {
		response.json(note);
	}).catch(error => next(error) );


});


blogsRouter.delete('/:id', (request, response, next) => {

	Blog.findById(request.params.id)
		.then(blog => {
			if(!blog){
				return response.status(400).json({ 
					error: 'blog not found' 
				});
			}				

			Blog.findByIdAndRemove(request.params.id , function (err) {
				if (err) return console.log(err);
				response.status(204).end();
			});

		}).catch(error => next(error) );





});




blogsRouter.post('/', (request, response, next) => {


	const blog = new Blog(request.body);

	blog.save().then(savedBlog => {
		response.status(201).json(savedBlog);
	}).catch(error => next(error) );

});



blogsRouter.put('/:id', (request, response, next) => {



	Blog.findById(request.params.id)
		.then(note => {
			if(!note){
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

		}).catch(error => next(error) );
			

});


module.exports = blogsRouter;