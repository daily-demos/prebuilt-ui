# Contributing

Thank you for looking into contributing to`daily-demos`! We want this repo to help people experiment with different Daily projects more quickly. We especially welcome any contributions that help us make existing demos easier to understand, improve demos' instructions and descriptions, and we're especially excited about any new demos that highlight unique ways to use the [Daily API](https://docs.daily.co/reference).

**Before contributing:**

- [Run daily-demos locally](#run-daily-demos-locally)
- [Read our code of conduct](#read-our-code-of-conduct)

**How to contribute:**

- [Open or claim an issue](#open-or-claim-an-issue)
- [Open a pull request](#open-a-pull-request)
- [Contribute a new demo project](#contribute-a-new-demo-project)

## Before contributing

### Run daily-demos locally

Each demo project is an independent standalone project. You can choose to run a single project, or the entire demo project site.

#### Running a single demo project

Using the `static-demos` project as an example:

```bash
# From daily-demos
nvm i
cd static-demos/
npm i

npm run start
# or
npm run dev # automatically restarts server on file changes
```

Then open your browser and go to `localhost:<port>`, using the port printed in the terminal after running the above.

#### Running the entire demo project site

```bash
# From daily-demos
nvm i
npm i

npm run start
# or
npm run dev # automatically restarts server on file changes
```

Then open your browser and go to `localhost:3000`.

#### Running the React demo Electron runner

The following runs the React demo app from within a simple Electron shell.

```bash
# From react-demo-electron-runner
nvm i
npm i

npm run start # points to demos.daily.co
# or
npm run dev # points to localhost:3000 (prerequisite: "Running the entire demo project site")
```

### Read our code of conduct

We use the [Contributor Covenant](https://www.contributor-covenant.org/) for our Code of Conduct. Before contributing, [please read it](CODE_OF_CONDUCT.md).

## How to contribute

### Open or claim an issue

#### Open an issue

Today we work off two main issue templates: _bug reports_ and _demo/feature requests_.

_Bug reports_

Before creating a new bug report, please do two things:

1. If you want to report a bug you experienced while on a Daily call, try out these [troubleshooting tips](https://help.daily.co/en/articles/2303117-top-troubleshooting-tips) to see if that takes care of the bug.
2. If you're still seeing the error, check to see if somebody else has [already filed the issue](https://github.com/daily-co/daily-demos/issues) before creating a new one.

If you've done those two things and need to create an issue, we'll ask you to tell us:

- What you expected to happen
- What actually happened
- Steps to reproduce the error
- Screenshots that illustrate where and what we should be looking for when we reproduce
- System information, like your device, OS, and browser
- Any additional context that you think could help us work through this

_Demo/feature requests_

We're always happy to hear about new ways you'd like to use Daily. If you'd like a demo that we don't have yet, we'll ask you to let us know:

- If the demo will help you solve a particular problem
- Alternative solutions you've considered
- Any additional context that might help us understand this ask

#### Claim an issue

All issues labeled `good-first-issue` are up for grabs. If you'd like to tackle an existing issue, feel free to assign yourself, and please leave a comment letting everyone know that you're on it.

### Open a pull request

- If it's been a minute or if you haven't yet cloned, forked, or branched a repository, GitHub has some [docs to help](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests).
- When creating commit messages and pull request titles, please follow the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) standard.

### Contribute a new demo project

If you've built a project on Daily that you want to share with other developers, we'd be more than happy to host a copy in this repository to help spread the word.

To add a new demo project:

1. Create a new folder for the demo directly under the root directory.

```bash
# From daily-demos
mkdir my-new-demo
```

2. Implement your project as a standalone site. Make sure it runs on a port not used by the other demo projects.

```bash
cd my-new-demo
npm init
# Etc, etc. Make a site.
```

3. When it's ready, hook your demo project up to the overall demo project site by: a) exposing your demo through the root-level index via proxying, b) making it run as part of the root-level npm scripts (`npm run dev`, `npm run start`, `npm install`, etc.), and c) adding an entry (or multiple entries) to the table of contents in `index.html`.

`index.js`:

```javascript
app.use(
  '/my-new-demo',
  createProxyMiddleware({
    target: 'http://localhost:1234', // Your demo's port number
  })
);
```

`package.json`:

```json
"scripts": {
    "start": "concurrently npm:index-start npm:other-demo-start npm:my-new-demo-start",
    "dev": "concurrently npm:index-dev npm:other-demo-dev npm:my-new-demo-dev",
    "postinstall": "npm other-demo-install && npm my-new-demo-install",
    "my-new-demo-start": "cd my-new-demo && npm run start",
    "my-new-demo-dev": "cd my-new-demo && npm run dev",
    "my-new-demo-install": "cd my-new-demo && npm i"
  },
```

`index.html`:

```html
<li><a href="./my-new-demo/">My New Demo</a></li>
```
