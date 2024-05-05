const express = require('express')
const path = require('path')
const logger = require('morgan')
var token = ''

//read routes modules
const routes = require('./routes/index.js')

const PORT = process.env.PORT || 3000 //allow environment variable to possible set PORT
const app = express()
app.locals.pretty = true //to generate pretty view-source code in browser

//track popularity according to spotify
var t1Rating = -1
var t2Rating = -1

function loginPage(res){
  res.render(__dirname + '/views/login.hbs',{
	title: 'LOGIN', 
	signup: 'SIGN UP', 
	login: 'LOGIN'})
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs'); //use hbs handlebars wrapper

//Middleware
app.use(express.static(__dirname + '/public')) //static server
app.use(logger('dev'));   

//GET request
app.get(['/', '/login'], (req, res) => {
  loginPage(res)
})
app.get('/users',(req,res)=>{
  let user = req.headers.cookie
  if(user !== undefined){
    routes.users(req,res)
  } else{
	loginPage(res)
  }
})
app.get('/game', async (req,res) => {
  let user = req.headers.cookie
  //check user logged in first
  if(user !== undefined){
	token = await routes.getToken()
	let s1 = await routes.getSong(token)
	let s2 = await routes.getSong(token)
	
	//initialize rating variables
	t1Rating = s1.popularity
	t2Rating = s2.popularity
	console.log('rating 1: '+t1Rating)
	console.log('rating 2: '+t2Rating)
	
	//render page
	res.render(__dirname + '/views/game.hbs',{
		title: 'GAME', 
		label: 'HIGHER OR LOWER?', 
		t1: `NAME: ${s1.name}`,
		t2: `NAME: ${s2.name}`,
		rating: `RATING: ${s1.popularity}`,
		img1: s1.album.images[0].url,
		img2: s2.album.images[0].url,
		link1: s1.external_urls.spotify,
		link2: s2.external_urls.spotify,
		scoreLabel: 'Current Score',
		scoreNum: '0',
		highscoreLabel: 'High Score',
		highscoreNum: '0'
	})
  } else{
	loginPage(res)
  }
})

//POST request routes
app.post('/login', routes.authenticate)
app.post('/newUser', routes.createUser)
app.post('/getHighScore', routes.getHighScore)
app.post('/newHighScore', routes.updateHighScore)
app.post('/newSong',async (req,res)=>{
	let song = await routes.getSong(token)
	//update ratings to current songs
	t1Rating = t2Rating
	t2Rating = song.popularity
	console.log('rating 1: '+t1Rating)
	console.log('rating 2: '+t2Rating)
	//return only needed values so only server knows song rating
	let returnOBJ = {
		name: song.name,
		url: song.album.images[0].url,
		external_url: song.external_urls.spotify
	}
	res.end(JSON.stringify(returnOBJ))
})
app.post('/higher',(req,res)=>{
	let value = {check: false}; //inform client if its higher or not
	if(t2Rating>=t1Rating){
		value.check = true;
		value.rating = t2Rating;
	} 
	res.end(JSON.stringify(value));
})
app.post('/lower',(req,res)=>{
	let value = {check: false}; //inform client if its lower or not
	if(t2Rating<=t1Rating){
		value.check = true;
		value.rating = t2Rating;
	} 
	res.end(JSON.stringify(value));
})

//start server
app.listen(PORT, err => {
  if(err) console.log(err)
  else {
		console.log(`Server listening on port: ${PORT} CNTL:-C to stop`)
		console.log(`To Test:`)
		console.log('user: ldnel password: secret')
		console.log('http://localhost:3000')
		console.log('http://localhost:3000/')
		console.log('http://localhost:3000/login')
		console.log('http://localhost:3000/game')
		console.log('user: louis password: secret2')
		console.log('http://localhost:3000/users')
	}
})
