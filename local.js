const dotenv = require( 'dotenv' )
dotenv.config( { path: '../.env' } )
console.log( 'client_id:'		, process.env.CLIENT_ID		)
console.log( 'client_secret:'	, process.env.CLIENT_SECRET	)










const { Client, auth }  = require( 'twitter-api-sdk' )
const { v4: uuidv4 }    = require( 'uuid' );

const app = require( 'express' )()

app.use(
	require( 'express-session' ) (
		{	secret: 'your-secret-key'
		,	resave: false
		,	saveUninitialized: true
		,	cookie: { secure: true }
		}
	)
)

const
send403 = ( s, why ) => (
	s.status( 403 ).send( 'FORBIDDEN' )
,	console.error(403, why)
)

app.get(
	'/'
,	( q, s ) => s.send(
	`	<body>
		<a href="/twitter?page=/alert">alert</a>
		<br>
		<a href="/twitter?page=/api">use API</a>
		<br>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		</body>
	`
	)
)

////////
const
USER = new auth.OAuth2User(
	{   client_id       : process.env.CLIENT_ID
	,   client_secret   : process.env.CLIENT_SECRET
	,   callback        : process.env.HOST + '/XCB'
	,   scopes          : [ 'tweet.read', 'users.read' ]
	}   
)   

app.get(
	'/twitter'
,	( q, s ) => {
		const
		{ page } = q.query
		if ( !page ) return send403( s, '/login page' )

		const	state = uuidv4()
		q.session.state = state
		const	codeVerifier = uuidv4()
		q.session.codeVerifier = codeVerifier

console.log( '/twitter', state, codeVerifier )

		s.redirect(
			USER.generateAuthURL(
				{   state
				,   code_challenge_method   : 's256'
				}   
			)   
		)   
	}   
)

app.get(
	'/XCB'
,	async ( q, s ) => {
		const { state, code } = q.query
		if ( !state || !code ) return send403( s, '/XCB state or code' )
console.log( '/XCB', state )
console.log( 'session.state', q.session.state )
console.log( 'session.codeVerifier', q.session.codeVerifier )

//		if ( state !== q.session.state ) return send403( s, 'State mismatch: ' + state + ':' + q.session.state )

		USER.requestAccessToken( code ).then(
			() => new Client( USER ).users.findMyUser().then(
				(_) => s.send(_)
			).catch(
				er => s.status( 500 ).send( er )
			)
		).catch(
			er => (
				console.error( er )
			,   s.status( 500 ).send( 'Failed to get token' )
			)   
		)   
	}
)













const HOME	= process.env[ 'HOME' ]
const fs	= require( 'fs' )

require( 'https' ).createServer(
	{	key	: fs.readFileSync( HOME + '/cert/localhost+2-key.pem'	)
	,	cert: fs.readFileSync( HOME + '/cert/localhost+2.pem'		)
	}
,	app
).listen(
	8080
,	() => console.log( 'Go to https://localhost:8080' )
)

