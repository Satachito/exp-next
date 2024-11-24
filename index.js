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
	`	<body>
		<a href="/twitter?page=/alert">alert</a>
		<br>
		<a href="/twitter?page=/api">use API</a>
		<br>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		</body>
	`
	)
);

app.get('/twitter', (q, s) => {

	const { page } = q.query;
    if (!page) return send403(s, '/twitter page');
    
    const user = new auth.OAuth2User({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        callback: `${process.env.HOST}/XCB`,
        scopes: ['tweet.read', 'users.read'],
    });

    s.redirect(
        user.generateAuthURL({
            state: Register({ page, user }),
            code_challenge_method: 's256',
        })
    );
});



app.get(
	'/XCB'
,	( q, s ) => {
		const { state, code } = q.query;
		if (!state || !code) return send403(s, '/XCB state or code');

		console.log( 'state:', state )
		console.log( 'code', code )

		const session = contextDict[state];
		if (!session) return send403(s, '/XCB session for key: ' + state );

		const { page, authClient } = session;

		switch ( page ) {
		case 'alert':
			alert( 'X にログインしました' )
			break
		case 'api':
			authClient.requestAccessToken( code ).then(
				() => s.redirect(`${page}?state=${state}`)
			).catch(
				er => (
					console.error( er )
				,	s.status(500).send( 'Failed to get token for code:', code )
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

module.exports = app;

