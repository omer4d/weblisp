#node --es_staging --harmony-proxies ./tests/tokenizer.js
#node --es_staging --harmony-proxies ./tests/parser.js
#node --es_staging --harmony-proxies ./tests/compiler.js

node --harmony ./node_modules/.bin/tape tests/*.js | faucet