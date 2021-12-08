const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.post('/', async (request, response) => {	

	const body = request.body;	

	if(!body.username || !body.password) return response.status(400).json({error: 'must enter username and password'});
	if(body.password.length < 3) return response.status(400).json({error: 'password must have 3 characters minimum'});

	const saltRounds = 10;	
	const passwordHash = await bcrypt.hash(body.password, saltRounds);

	const user = new User({
		username: body.username,
		name: body.name,
		passwordHash
	});

	const savedUser = await user.save();

	response.json(savedUser);


} );

usersRouter.get('/', async (request, response) => {
	const users = await User.find({}).populate('blogs', { content: 1, date: 1 });
	response.json(users);
});


module.exports = usersRouter;

