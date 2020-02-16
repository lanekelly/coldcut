Welcome to coldcut, the installer for AI text adventure games on Windows.

Currently supported games:
- AIDungeon
- thadunge2
- CloverEdition
- Storybro
- ZenDungeon

== How to play ==

Either double-click on coldcut.exe or execute it from Command Prompt, Powershell, etc.

You will be guided via interactive installer.

== Windows prompts ==

Windows is naturally suspicious of running random .exe's you download from the internet. When
clicking on the .exe, it will probably block you from running it. You'll need to choose to run
it anyway.

When downloading the AI model for each game, Windows Firewall will prompt you about Node.js
using a network connection. You will need to allow it to continue in order for the model
to download to your computer.

== Running on GPU ==

AIDungeon will run on your PC without any further software. However, it will be slow. The game
was designed to run on a powerful GPU, and additional software is required to get that working.

You should only install this software if you have an Nvidia GPU with at least 12 GB or more VRAM.
If you install it on an inadequate GPU, AIDungeon will begin crashing on startup.

Here are the libraries you can install to run AIDungeon on your GPU, assuming it's powerful enough.

CUDA Toolkit 10.0
https://developer.nvidia.com/cuda-10.0-download-archive?target_os=Windows&target_arch=x86_64&target_version=10&target_type=exenetwork

cuDNN (need to sign up for a free account to download)
https://developer.nvidia.com/rdp/cudnn-download

Guide to install cuDNN
https://docs.nvidia.com/deeplearning/sdk/cudnn-install/index.html#installwindows

== Contact ==

If you have any issues with Coldcut, please create an Issue on the project's GitHub:

GitHub:
https://github.com/lanekelly/coldcut/issues

If you'd like to contact the developer directly, reach me at:

Twitter:
https://twitter.com/_lanekelly

AIDungeon Discord:
@partialparcel
https://discord.gg/Dg8Vcz6

Reddit:
https://www.reddit.com/user/partialparcel/