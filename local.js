const dotenv = require( 'dotenv' )
dotenv.config( { path: '../.env' } )
console.log( 'client_id:'		, process.env.CLIENT_ID		)
console.log( 'client_secret:'	, process.env.CLIENT_SECRET	)










const { Client, auth }  = require( 'twitter-api-sdk' )
const { v4: uuidv4 }    = require( 'uuid' );
const jwt				= require( 'jsonwebtoken' );

const app = require( 'express' )()

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
crypto = require("crypto");

const
generate_SHA256_base64url_challenge = _ => crypto.createHash( 'sha256' ).update( _ ).digest( 'base64url' )

const 
verifyCodeChallenge = ( verifier, challenge ) => generate_SHA256_base64url_challenge( verifier ) === challenge

const
code_verifier = uuidv4()

const
USER = new auth.OAuth2User(
	{   client_id       : process.env.CLIENT_ID
	,   client_secret   : process.env.CLIENT_SECRET
	,   callback        : process.env.HOST + '/XCB'
	,   scopes          : [ 'tweet.read', 'users.read' ]
	,	code_verifier
	}   
)   

app.get(
	'/twitter'
,	( q, s ) => {
		const
		{ page } = q.query
		if ( !page ) return send403( s, '/login page' )
		s.redirect(
			USER.generateAuthURL(
				{   state					: uuidv4()
				,   code_challenge_method   : 's256'
				,	code_verifier
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

