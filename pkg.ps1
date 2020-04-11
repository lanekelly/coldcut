New-Item -ItemType Directory -Force -Path .\build | Out-Null
New-Item -ItemType Directory -Force -Path .\deploy | Out-Null
Remove-Item build\* -Recurse -Force
& "yarn"
& "tsc"
& "pkg" dist/index.js --targets node12 --output build/coldcut
Copy-Item .\README.txt .\build\
Remove-Item deploy\* -Recurse -Force
Compress-Archive -Path .\build\* -DestinationPath .\deploy\coldcut-win-x64.zip