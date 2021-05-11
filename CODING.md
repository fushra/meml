# Coding Instructions
Get the source: `git clone https://github.com/fushra/meml.git` \
Get **DEV** source: `git clone https://github.com/fushra/meml.git -b dev` 

If you are compiling a MEML compiler build, please use the source. If you are building new features into the MEMLC project, please use the **DEV** source. 

Forks would be preferred over contributing straight to the source repository!

## Compiling Builds
> Any Linux and BSD distro would work fine for builds, but we recommend the following: `FreeBSD, Debian/Derivative, Fedora, OpenSUSE, OpenBSD, NetBSD, Arch/Derivative, Gentoo/Derivative, Slackware`

**WARNING**: Build scripts *DO NOT* function properly on Windows 10. If you need to, spin up a virtual machine. 

Tools required to build: Git, NodeJS, NPM. 

Instructions (With Testing ***RECOMMENDED***):
1. Clone the repository
1. Run `npm install .`
1. Run `npm run-script build`
1. Create a new directory outside of MEML's
1. Create two files, "visual.html" and "index.meml"
1. In the `visual.html` file, manually script the expected design/functionality
1. In the `index.meml` file, write the source code you wish to test
1. Run `npm install fushra/meml#dev`
1. Run `npx memlc --file index.meml`
1. Next Steps
    - If build was successful, make a PR with the main branch
    - If build failed, debug and create an issue.
        - If issue is un-fixable, comment out code.

Instructions (No Tests ***NOT RECOMMENDED!!***)
1. Clone the repository
1. Run `npm install .`
1. Run `npm run-script build`