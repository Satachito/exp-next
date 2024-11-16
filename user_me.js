const
dotenv = require( 'dotenv' )
dotenv.config( { path: '../.env' } )
console.log( 'client_id:'		, process.env.CLIENT_ID		)
console.log( 'client_secret:'	, process.env.CLIENT_SECRET	)

const express		= require( 'express');
const crypto		= require( 'crypto');
const querystring	= require( 'querystring');
const fetch			= require( 'node-fetch');

const app = express();

//	PKCE
const	STATE			= 'NOTHING HERE'

let		code_verifier	= ''

const	client_id		= process.env.CLIENT_ID
const	client_secret	= process.env.CLIENT_SECRET
const	redirect_uri	= 'https://localhost:8080/XCB'

app.get(
	'/login'
,	( q, s ) => {

		code_verifier	= crypto.randomBytes( 12 ).toString( 'base64url' )

		const
		code_challenge	= crypto.createHash( 'sha256' ).update( code_verifier ).digest( 'base64url' )

		s.redirect(
			'https://twitter.com/i/oauth2/authorize?'
		+	querystring.stringify(
				{	response_type			: 'code'
				,	client_id
				,	redirect_uri
				,	scope					: 'tweet.read'
				,	state					: STATE
				,	code_challenge	
				,	code_challenge_method	: 'S256'
				}
			)
		)
	}
)

const
Basic = () => Buffer.from( `${client_id}:${client_secret}` ).toString( 'base64' )

let		access_token = ''

app.get(
	'/XCB'
,	( q, s ) => q.query.state === STATE
	?	fetch(
			'https://api.twitter.com/2/oauth2/token?' + querystring.stringify(
				{	grant_type		: 'authorization_code'
				,	code			: q.query.code
				,	redirect_uri
				,	client_id
				,	code_verifier
				}
			)
		,	{	method	: 'POST'
			,	headers: {
					'Content-Type'	: 'application/x-www-form-urlencoded'
				,	'Authorization'	: 'Basic ' + Basic()
				}
			}
		).then(
			_ => _.json()
		).then(
			_ => (
				access_token = _.access_token
			,	console.log( `Access Token: ${access_token}` )
			,	s.redirect( '/tweets' )
			)
		)
	:	s.status( 500 ).send( STATE )	//	直接来るの防止
)

app.get(
	'/tweets'
,	( q, s ) => fetch(
		'https://api.twitter.com/2/user/me'
	,	{ headers: { 'Authorization': 'OAuth ' + access_token } }
	).then(
		_ => _.text()
	).then(
		console.log
	).catch(
		er => console.error( er )
	)
)
		
const HOME = process.env[ "HOME" ]
const fs = require('fs');

require( 'https' ).createServer(
	{	key	: fs.readFileSync( HOME + '/cert/localhost+2-key.pem'	)
	,	cert: fs.readFileSync( HOME + '/cert/localhost+2.pem'		)
	}
,	app
).listen(
	8080
,	() => console.log( 'https://localhost:8080/login' )
)


