const listHelper = require('../utils/list_helper');

const data = [
	{
		_id: '5a422a851b54a676234d17f7',
		title: 'React patterns',
		author: 'Michael Chan',
		url: 'https://reactpatterns.com/',
		likes: 7,
		__v: 0
	},
	{
		_id: '5a422aa71b54a676234d17f8',
		title: 'Go To Statement Considered Harmful',
		author: 'Edsger W. Dijkstra',
		url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
		likes: 5,
		__v: 0
	},
	{
		_id: '5a422b3a1b54a676234d17f9',
		title: 'Canonical string reduction',
		author: 'Edsger W. Dijkstra',
		url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
		likes: 12,
		__v: 0
	},
	{
		_id: '5a422b891b54a676234d17fa',
		title: 'First class tests',
		author: 'Robert C. Martin',
		url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
		likes: 10,
		__v: 0
	},
	{
		_id: '5a422ba71b54a676234d17fb',
		title: 'TDD harms architecture',
		author: 'Robert C. Martin',
		url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
		likes: 0,
		__v: 0
	},
	{
		_id: '5a422bc61b54a676234d17fc',
		title: 'Type wars',
		author: 'Robert C. Martin',
		url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
		likes: 2,
		__v: 0
	}  
];

test('dummy returns one', () => {
	const blogs = [];
	const result = listHelper.dummy(blogs);
	expect(result).toBe(1);
});



describe('total likes', () => {
	test('when list has only one blog equals the likes of that', () => {
		const blogs = [].concat(data[0]);
		expect(listHelper.totalLikes(blogs)).toBe(data[0].likes);
	});

	test('of a bigger list  is calculated right', () => {
		const blogs = data; 
		expect(listHelper.totalLikes(blogs)).toBe(36);
	});

	test('of empty list is zero', () => {
		expect(listHelper.totalLikes([])).toBe(0);
	});
});


describe('favorite blog', () => {
	test('when list has only one blog equals the same blog', () => {
		const blogs =  [].concat(data[0]);
		expect(listHelper.favoriteBlog(blogs)).toEqual(data[0]);
	});

	test('of a bigger list  show the blog with the max number of likes', () => {
		const blogs = data; 
		expect(listHelper.favoriteBlog(blogs)).toEqual(data[2]);
	});

	test('of empty list is null', () => {
		expect(listHelper.favoriteBlog([])).toBe(null);
	});
});


describe('most  likes', () => {
	test('when list has only one blog it returns the author name and the number of likes', () => {
		const blogs =  [].concat(data[1]);
		expect(listHelper.mostLikes(blogs)).toEqual({
			author: 'Edsger W. Dijkstra',
			likes: 5
		});
	});

	test('of a bigger list  show the author name  with the max number of likes, and the total number of likes ', () => {
		const blogs = data; 
		expect(listHelper.mostLikes(blogs)).toEqual({
			author: 'Edsger W. Dijkstra',
			likes: 17
		});
	});

	test('of empty list is null', () => {
		expect(listHelper.mostLikes([])).toBe(null);
	});
});

