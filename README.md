# coldcut

Requires Node v12

yarn global add typescript
yarn global add pkg

pkg dist/index.js --targets node12 --output build/coldcut

On macOS, assuming Python 3.7 is installed via Homebrew:

export PATH="/usr/local/opt/python/libexec/bin:$PATH" && ./coldcut