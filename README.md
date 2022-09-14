# Excalibur Monorepo

The strucutre is as follows:

The 'live' and 'devnet' branch will need a review for every push

main branch -> our internal state
'live' branch -> excal.tv
'devnet' branch -> devnet.excal.tv

Until the filestructure is set - we are not going to add code in.add

## Conventions

File Naming Convention:

- React Components (.tsx) -> PascalCase.tsx
- TS Files (.ts) -> kebab-case.ts
- all others -> tbd

General Rules:

- All functions should have JSDoc, ESDoc, and TSDoc comments - use `/**` to [trigger](https://marketplace.visualstudio.com/items?itemName=NicholasHsiang.vscode-javascript-comment)
- Outside of react components we use `function foo(){}` inside we use `const someFunction = () => {}`
- Use verbose naming conventions - descriptive names are the best for functions / vars
- Always use `const` instead of `let` unless you have to
- Component specific interfaces can be used at the top of the same file outside of the component
- Always use an interface, type or enum
- If a component is used more than once it goes in `common/components`

## Applications

1. The Excalibur Site
2. The Excalibur Wallet Extention

## NPM Packages

1. Excalibur Wallet - The core wallet functionality
2. Excalibur Wallet UI - the React UI components
3. DRM - the Solana Contract underlying the app
4. Payroll - the Solana Contract that allows us to get paid

## Setup Fontawesome
If you are having an issue with font awesome compiling run these:
`npm config set "@fortawesome:registry" https://npm.fontawesome.com/`
`npm config set "//npm.fontawesome.com/:_authToken" 7435492A-9009-4A66-B4D6-86A0ECC88A8F`

## ENV Vars
.env, .env.development, and .env.production files should be included in your repository as they define defaults. .env*.local should be added to .gitignore, as those files are intended to be ignored. .env.local is where secrets can be stored.

## Startup

1. `git branch` should be in devnet, if not run `git checkout devnet`
2. `git pull`
3. `yarn install`
4. `yarn build`
5. `cd apps/site`
6. `yarn dev`

## Cooldown

1. Build Monorepo
   1. Go to root folder
   2. `yarn build`
   3. If it does not build, fix or wait for others to help
2. Close all tabs - this forces you to save all changes
3. Commit Changes ( Can also use source control in VScode )
    `git add .`
    `git commit -m "some note"`
    `git pull`
    `git push`

## Figma Files

[Milestone 1](https://www.figma.com/file/omK78Mc0wVNX9REvt57FY3/%F0%9F%91%81-Excalibur---Podcast-App---Milestone-1---Preview?node-id=0%3A1)

[Milestone 2](https://www.figma.com/file/prlcVs5JaW6oXAINeDYaGC/%F0%9F%91%81-Excalibur---Podcast-App---Milestone-2---Preview?node-id=103%3A21695)

## Helpful Reading

[Internal Packages](https://turborepo.com/posts/you-might-not-need-typescript-project-references)

[Nextjs Structure](https://blog.dennisokeeffe.com/blog/2021-12-06-nextjs-enterprise-project-structure)

[Example Turborepo](https://stackblitz.com/edit/github-apsffz?file=README.md)
