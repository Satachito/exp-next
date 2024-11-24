Twitter API TEST

ブラウザのアドレスバーに正確なアドレスを表示する設定にしておく

Vercel の Sandbox でのテスト
	github にプッシュすると、Vercel はポーリングしてて、自動的にデプロイされる
		github アクションを使って deploy したら即時ににデプロイをトライしているが難航中
	環境変数は　Vercel に登録してある。
		 workflow の中で登録してくれるのをやってくれるらしいが未着手
	使用されるファイルは index.js
	URL:
		https://exp-twitter.vercel.app
	テスト前に、Twitter の develop portal でコールバックURLを https://exp-twitter.vercel.app/XCB にする
		https://developer.x.com/en/portal/projects/1855787792934256640/apps/29595694/settings
	ログ：
		https://vercel.com/sat-rimorjps-projects/exp-twitter/logs?slug=app-future&slug=en-US&slug=sat-rimorjps-projects&slug=exp-twitter&slug=logs&page=2&timeline=past30Minutes&startDate=1732472855816&endDate=1732474655816

ローカルのテスト
	使用されるファイルは local.js
	テスト前に、Twitter の develop portal でコールバックURLを https://localhost:8080/XCB にする
	コールバックまでにすごく時間がかかる現象がある。
