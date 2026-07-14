# create-ai-native-project — interactive scaffold demo
# Scaffolds a single-project NestJS + Postgres app for Claude Code, with CI + Docker.
# Regenerate:  vhs demo/wizard.tape   (run from the repo root)
Output demo/wizard.gif

Set Shell "bash"
Set FontSize 15
Set Width 1200
Set Height 760
Set Padding 20
Set Theme "Catppuccin Mocha"
Set TypingSpeed 45ms
Set Framerate 24

# Silent setup: clean prompt, put the demo wrapper on PATH, work in a temp dir.
Hide
Type `export PS1='\[\e[38;5;153m\]❯ \[\e[0m\]'; unset PROMPT_COMMAND`
Enter
Type "export PATH=$PWD/demo:$PATH; cd $(mktemp -d); clear"
Enter
Sleep 500ms
Show

Type "create-ai-native-project --boot demo-app"
Sleep 400ms
Enter
Sleep 1800ms

# Project name? (pre-filled "demo-app") — accept
Enter
Sleep 900ms

# Project brief?
Type "Support-desk ticketing API"
Sleep 500ms
Enter
Sleep 1s

# Agentic coding tool(s) — Claude Code is pre-selected; accept
Enter
Sleep 2500ms

# Project type: monorepo / single — pick "single"
Down
Sleep 500ms
Enter
Sleep 1s

# Tech stack(s) — scroll through the list and pick NestJS (node-nest)
Down@110ms 11
Sleep 500ms
Space
Sleep 700ms
Enter
Sleep 900ms

# Database(s) — pick Postgres
Down@140ms 3
Sleep 400ms
Space
Sleep 700ms
Enter
Sleep 900ms

# Vector store(s) — skip
Enter
Sleep 450ms
# ORM(s) — skip
Enter
Sleep 450ms
# Storage — skip
Enter
Sleep 450ms
# Auth — skip
Enter
Sleep 450ms
# Infrastructure-as-code — skip
Enter
Sleep 450ms
# Security standard(s) — skip
Enter
Sleep 450ms
# Skills — skip (core skills auto-install)
Enter
Sleep 450ms
# Agents — skip (core agents auto-install)
Enter
Sleep 800ms

# Docs folder? — no
Type "n"
Sleep 700ms
# Add CI configuration? — yes
Type "y"
Sleep 800ms
# CI provider — GitHub Actions (first)
Enter
Sleep 800ms
# Use Docker (docker-compose.yml)? — yes
Type "y"
Sleep 800ms
# Generate the instructions file? — yes (default)
Enter
Sleep 3500ms

# Install dependencies now? — no
Type "n"
Sleep 1500ms

# Show what was generated
Type "cd demo-app && ls -a"
Sleep 400ms
Enter
Sleep 2500ms

Type "find .claude CLAUDE.md docker-compose.yml .github .ai-native-project.json -maxdepth 3 | sort"
Sleep 400ms
Enter
Sleep 4s
