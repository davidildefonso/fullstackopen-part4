const dummy = () => 1;

const totalLikes = blogs => 
	blogs.length === 0 ? 0 :  blogs.reduce( (sum, item) => sum + item.likes ,0)  ;


const favoriteBlog = blogs => {
	if(blogs.length === 0) return null;
	let maxLikes = { likes: -1 };
	return blogs.reduce((mostLikedBlog,  blog ) => 
		blog.likes > mostLikedBlog.likes 
			? mostLikedBlog = blog 
			: mostLikedBlog   ,
	maxLikes );
};


const mostLikes = blogs => {
	if(blogs.length === 0) return null;
	return blogs.reduce((authors,  blog ) =>  {
		if(!authors.find(author => author.author === blog.author)){
			return authors.concat({author: blog.author, likes : blog.likes});
		}
		return authors.map(author => author.author === blog.author
			? {...author, likes: author.likes + blog.likes }
			: author );
	}, [] ).reduce((mostBlogsAuthor, author) => 
		author.likes > mostBlogsAuthor.likes
			? mostBlogsAuthor = author
			: mostBlogsAuthor
	, {author: null, likes: -1} );
};

const mostBlogs = blogs => {
	if(blogs.length === 0) return null;
	return blogs.reduce((authors,  blog ) =>  {
		if(!authors.find(author => author.author === blog.author)){
			return authors.concat({author: blog.author, blogs : 1});
		}
		return authors.map(author => author.author === blog.author
			? {...author, blogs: author.blogs + 1 }
			: author );
	}, [] ).reduce((mostBlogsAuthor, author) => 
		author.blogs > mostBlogsAuthor.blogs
			? mostBlogsAuthor = author
			: mostBlogsAuthor
	, {author: null, blogs: -1} );
};

module.exports = { dummy, totalLikes, favoriteBlog , mostBlogs, mostLikes};