#node --es_staging --harmony-proxies ./tests/tokenizer.js | faucet
#node --es_staging --harmony-proxies ./tests/parser.js | faucet
#node --es_staging --harmony-proxies ./tests/compiler.js | faucet

node --harmony --harmony_proxies ./node_modules/.bin/tape tests/tests.js | faucet