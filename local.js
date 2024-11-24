const dotenv = require( 'dotenv' )
dotenv.config( { path: '../.env' } )
console.log( 'client_id:'		, process.env.CLIENT_ID		)
console.log( 'client_secret:'	, process.env.CLIENT_SECRET	)



const express = require('express');
const { Client, auth } = require('twitter-api-sdk');
const { v4: uuidv4 } = require('uuid');

const app = express();

const contextDict = {};
const Register = (_) => {
    const key = uuidv4();
    contextDict[key] = _;
    setTimeout(
        () => {
            delete contextDict[key];
            console.log(`Session expired and removed: ${key}`);
        },
        10 * 60 * 1000
    );

    return key;
};

const send403 = (s, why) => {
    s.status(403).send('FORBIDDEN');
    console.error(403, why);
};

app.get(
	'/'
,	(q, s) => s.send(
	`	<a href="/twitter?page=/alert">alert</a>
		<a href="/twitter?page=/X">to X</a>
		<a href="/twitter?page=/api">use API</a>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
	`
	)
);

app.get('/twitter', (q, s) => {
    const { page } = q.query;
    if (!page) return send403(s, '/twitter page');

    const authClient = new auth.OAuth2User({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        callback: 'https://localhost:8080/XCB',
        scopes: ['tweet.read', 'users.read'],
    });

    s.redirect(
        authClient.generateAuthURL({
            state: Register({ page, authClient }),
            code_challenge_method: 's256',
        })
    );
});

app.get(
	'/XCB'
,	( q, s ) => {
		const { state, code } = q.query;
		if (!state || !code) return send403(s, '/XCB state or code');

		const session = contextDict[state];
		if (!session) return send403(s, '/XCB session key:' + state);

		const { page, authClient } = session;

		switch ( page ) {
		case 'alert':
			alert( 'X にログインしました' )
			break
		case 'X':
			location.href = 'https://www.x.com'
			break
		case 'api':
			authClient.requestAccessToken( code ).then(
				() => s.redirect(`${page}?state=${state}`)
			).catch(
				er => (
					console.error( er )
				,	s.status(500).send( 'Failed to get token' )
				)
			)
			break
		}
	}
)

app.get(
	'/api'
,	(q, s) => {
		const { state } = q.query;
		if (!state) return send403(s, '/api state');

		const session = contextDict[state];
		if (!session) return send403(s, '/api authClient');

		const { authClient } = session;

		new Client(authClient)
			.users.findMyUser()
			.then((_) => s.send(_))
			.catch((er) => s.status(500).send(er));
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

