console.log( 'client_id:'		, process.env.CLIENT_ID		)
console.log( 'client_secret:'	, process.env.CLIENT_SECRET	)

const express			= require( 'express' )
const { Client, auth }	= require( 'twitter-api-sdk' )
const { v4: uuidv4 }	= require(　'uuid'　);

const
app = express()

const
contextDict = {
}
const
Register = _ => {
	//	ログを出す
	const
	key = uuidv4()
	contextDict[ key ] = _
	setTimeout(
		() => (
			//	この時点でセッションが残っている人は多分離脱してる
			//	ログを出す
			delete contextDict[ key ]
		,	console.log( `Session expired and removed: ${key}` )
		)
	,	10 * 60 * 1000
	)

	return key
}

const
send403 = ( s, why ) => (
	s.status( 403 ).send( 'FORBIDDEN' )
,	console.error( 403, why )
)

app.get(
	'/'
,	( q, s ) => s.send( '<a href='/'>login</a>' )
)

app.get(
	'/twitter'
,	( q, s ) => {

		const
		{ page } = q.query
		if ( !page ) return send403( s, '/login page' )

		const
		authClient = new auth.OAuth2User(
			{	client_id		: process.env.CLIENT_ID
			,	client_secret	: process.env.CLIENT_SECRET
			,	callback		: 'https://localhost:8080/XCB'
			,	scopes			: [ 'tweet.read', 'users.read' ]
			}
		)

		s.redirect(
			authClient.generateAuthURL(
				{	state					: Register( { page, authClient } )
				,	code_challenge_method	: 's256'
				}
			)
		)
	}
)

app.get(
	'/XCB'
,	( q, s ) => {

		const
		{ state, code } = q.query
		if ( !state || !code ) return send403( s, '/XCB state or code' )

		const
		session = contextDict[ state ]
		if ( !session ) return send403( s, '/XCB session' )
		
		const
		{ page, authClient } = session

		authClient.requestAccessToken( code ).then(
			() => s.redirect( `${page}?state=${state}` )
		).catch(
			er => (
				console.error( er )
			,	s.status( 500 ).send( 'Failed to get token' )
			)
		)
	}
)

app.get(
	'/me'
,	( q, s ) => {

		const
		{ state } = q.query
		if ( !state ) return send403( s, '/me state' )

		const
		session = contextDict[ state ]
		if ( !session ) return send403( s, '/me authClient' )

		const
		{ authClient } = session

		new Client( authClient ).users.findMyUser().then(
			_ => s.send( _ )
		).catch(
			er => s.status( 500 ).send( er )
		)
	}
)

module.exports = {
	handler: app
};