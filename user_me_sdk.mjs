import dotenv from 'dotenv'
dotenv.config( { path: '../.env' } )
console.log( 'client_id:'		, process.env.CLIENT_ID		)
console.log( 'client_secret:'	, process.env.CLIENT_SECRET	)

import express from 'express'
import { Client, auth } from 'twitter-api-sdk'

const
app = express()

const
authClient = new auth.OAuth2User(
	{	client_id		: process.env.CLIENT_ID
	,	client_secret	: process.env.CLIENT_SECRET
	,	callback		: 'https://localhost:8080/XCB'
	,	scopes			: [ 'tweet.read', 'users.read' ]
	}
)

const
client = new Client( authClient )

const
STATE = 'NOTHING HERE'

app.get(
	'/login'
,	( q, s ) => s.redirect(
		authClient.generateAuthURL(
			{	state: STATE
			,	code_challenge_method: 's256'
			}
		)
	)
)

app.get(
	'/XCB'
,	( q, s ) => q.query.state === STATE
	?	authClient.requestAccessToken( q.query.code ).then(
			_ => s.redirect( '/tweets' )
		)
	:	s.status( 500 ).send( STATE )	//	直接来るの防止
)

app.get(
	'/tweets'
,	( q, s ) => (
	console.log( q )
	,	client.users.findMyUser().then(
		_ => s.send( _ )
	).catch(
		er => s.status( 500 ).send( er )
	)
)
)

app.get(
	'/debug'
,	( q, s ) => { throw new Error( 'eh?' ) }
)


const HOME = process.env[ 'HOME' ]
import fs from 'fs'
import https from 'https'

https.createServer(
	{	key	: fs.readFileSync( HOME + '/cert/localhost+2-key.pem'	)
	,	cert: fs.readFileSync( HOME + '/cert/localhost+2.pem'		)
	}
,	app
).listen(
	8080
,	() => console.log( 'Go here to login: https://localhost:8080/login' )
)

