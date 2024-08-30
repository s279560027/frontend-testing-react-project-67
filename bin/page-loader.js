#!/usr/bin/env node

import { program } from "commander";
import pageLoader from "../src/index.js";

program
  .name("page-loader")
  .version("1.0.0", "-v, --version", "output the version number")
  .description("Load the page from url")
  .helpOption("-h, --help", "output usage information")
  .option("-o, --output [pathToFile]", "output path to file", process.cwd())
  .arguments("<url>")
  .action((url, option) => {
    pageLoader(url, option.output)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.error(err.toString());
        process.exit(1);
      });
  });
program.parse(process.argv);
