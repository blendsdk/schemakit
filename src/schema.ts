#!/usr/bin/env node
import chalk from "chalk";
import * as yargs from "yargs";

// tslint:disable-next-line:no-unused-expression
yargs.commandDir("commands")
    .usage(chalk.green("\nPostgreSQL Generator"))
    .demandCommand()
    .help()
    .argv;
