#!/usr/bin/env node
var install = require('../lib/install.js').install;
const listInstalledPackages = require('../lib/index.js').listInstalledPackages;
const info = require('../lib/index').info;
const deletePackage = require('../lib/index').deletePackage;
const initPackage = require('../lib/init').initPackage;

const { cyan, dim, bright } = require ('ansicolor')
const asTable = require('as-table').configure({
    title: x => bright(x),
    delimiter: dim(cyan(" | ")),
    dash: bright(cyan("-"))
})

require('yargs')
    .command({
        command: 'install <package>',
        aliases: ['i'],
        desc: 'Install an Argo package',
        handler: (argv) => {
            install(argv.package, argv.registry, argv.namespace, argv.save).then(_ => {
                console.log(`Successfully installed package ${argv.package}`)
            }).catch(error => {
                console.error(error)
            });
        }
    })
    .option('save', {
        alias: 's',
        type: 'boolean',
        description: 'Save the package',
        default: true
    })
    .example('$0 install <package>@version -n argo -r https://marketplace.atlan.com', 'Installs the package from the specified registry in the procided namespace')
    .alias('n', 'namespace')
    .nargs('n', 1)
    .describe('n', 'Namespace to install the package')
    .default('n', 'argo')
    .alias('r', 'registry')
    .nargs('r', 1)
    .describe('r', 'Specify the Argo Package Registry')
    .default('r', 'https://marketplace.atlan.com')
    .command({
        command: 'list',
        aliases: ['l'],
        desc: 'List all installed packages',
        handler: (argv) => {
            listInstalledPackages(argv.namespace).then(argoPackages => {
                if (argoPackages.length === 0) {
                    console.log("No Argo packages installed");
                    return
                }

                let packageInfos = [];
                argoPackages.forEach(argoPackage => {
                    packageInfos.push(argoPackage.info);
                })
                console.log(asTable(packageInfos));
            }).catch(error => {
                console.error(error)
            });
        }
    })
    .command({
        command: 'delete <package>',
        aliases: ['d', 'del'],
        desc: 'Delete an Argo package',
        handler: (argv) => {
            deletePackage(argv.namespace, argv.package).then(_ => {
                console.log(`Successfully deleted package ${argv.package}`)
            }).catch(error => {
                console.error(error)
            });
        }
    })
    .command({
        command: 'init',
        desc: 'Init an Argo package in the current directory',
        handler: (argv) => {
            initPackage(argv.force).then(_ => {
                console.log(`Successfully initialised package`)
            }).catch(error => {
                console.error(error)
            });
        }
    })
    .option('force', {
        alias: 'f',
        type: 'boolean',
        description: 'Force run the command',
        default: false
    })
    .demandCommand()
    .help()
    .argv