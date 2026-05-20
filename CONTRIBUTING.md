# Contribution Guidelines
Hi! I'm happy you want to contribute to FolderHarbor, but please read the following before doing so! <3
## Docs
We don't have much documentation yet, I'm hoping to change this soon though! For now, just use any information from the code itself, as well as https://fh.novatea.dev. \
You can also make a post in the repo's Discussions, I (Nova) am happy to explain any part of FolderHarbor, and I can also provide Insomnia screenshots of server API routes.
## Rules
There are a few rules for contributions!
- FolderHarbor is currently a **0% AI** project. Contributed code/assets must not be created/modified with artificial intelligence.
  - Discussing with AI in the process of making your contribution is not a violation of this, and AI review of human work is also okay as long as all of the work is still human.
- All contributions must follow our [Code of Conduct](https://github.com/aelithron/folderharbor/blob/main/CODE_OF_CONDUCT.md).
- By making a contribution, you release your changes under the [MIT License](https://github.com/aelithron/folderharbor/blob/main/LICENSE).
- Submit all contributions in good faith, with the intention to make the project better, and attempt to follow all of the guidelines to the best of your ability.
## Commits
It's strongly suggested to format your commits in the following way:
```
<part>: <short description>
<bullet point description>
```
- Provide the name of the part changed as the first word. Currently, these are `server`, `cli`, `web`, and `landing`, as well as `ci/cd` and `project` (project is for things like the main README and this file).
- Add a short description of your changes! Something like "added GET `/example`, POST `/example` routes".
- If a significant number of changes were made, add a bullet-point list of what you changed.

You should make seperate commits for each changed component. For example, if you're adding a new feature both the web panel and server, you should have two commits: `server: add GET /info route` and `web: add /info calls`
