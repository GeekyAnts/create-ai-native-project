# create-ai-native-project — CLI surface demo (version + help)
# Regenerate:  vhs demo/help.tape   (run from the repo root)
Output demo/help.gif

Set Shell "bash"
Set FontSize 20
Set Width 1200
Set Height 640
Set Padding 24
Set Theme "Catppuccin Mocha"
Set TypingSpeed 55ms

# Silent setup: clean prompt, put the demo wrapper on PATH, work in a temp dir.
Hide
Type `export PS1='\[\e[38;5;153m\]❯ \[\e[0m\]'; unset PROMPT_COMMAND`
Enter
Type "export PATH=$PWD/demo:$PATH; cd $(mktemp -d); clear"
Enter
Sleep 600ms
Show

Type "create-ai-native-project --version"
Sleep 500ms
Enter
Sleep 1500ms

Type "create-ai-native-project --help"
Sleep 500ms
Enter
Sleep 4s
