import path from "path";
import axios from "axios";
import fs from "fs";
import * as cheerio from "cheerio";

const replaceSymbols = (source) =>
  source.replace(/^.+?:\/\//gim, "").replace(/[^a-z0-9]/gi, "-");

const replaceResource = (source) => {
  const name = source.replace(/^(.+)\.(.+?)(\?.*?)?$/gim, "$1");
  const ext = source.replace(/^(.+)\.(.+?)(\?.*?)?$/gim, "$2");
  return [name, ext].map(replaceSymbols).join(".");
};

const getResources = (html, baseURL) => {
  const $ = cheerio.load(html);
  return ["img", "link", "script"].reduce((acc, tag) => {
    console.log(typeof [...$(tag)].length);
    return [
      ...acc,
      ...[...$(tag)].reduce((links, el) => {
        const sourceLink = $(el).attr("src") || $(el).attr("href");
        if (!sourceLink) {
          return links;
        }
        try {
          const url = new URL(sourceLink, baseURL);
          return url.origin !== baseURL ? links : [...links, sourceLink];
        } catch (e) {
          return links;
        }
      }, []),
    ];
  }, []);
};

const downloadResource = async (source, outputPath, outputDir) => {
  const { data } = await axios.get(source, { responseType: "arraybuffer" });
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  fs.writeFileSync(outputPath, data, {
    encoding: "binary",
  });
  return outputPath;
};

const pageLoader = async (url, outputDir = process.cwd()) => {
  const baseURL = new URL(url).origin;
  const targetName = replaceSymbols(url);
  const htmlFileName = targetName + ".html";
  const outputPath = path.join(outputDir, htmlFileName);
  const { data } = await axios.get(url);

  const resourses = getResources(data, baseURL);
  const filesPath = path.join(outputDir, `${targetName}__files`);

  const filesMap = resourses.map((resourceLocation) => {
    const downloadUrl = new URL(resourceLocation, baseURL).toString();
    const destName = replaceResource(downloadUrl);
    const outputPath = path.join(filesPath, destName);
    downloadResource(downloadUrl, outputPath, filesPath);
    return [resourceLocation, destName];
  }, []);
  const replacedHtml = filesMap.reduce(
    (acc, [source, dest]) => acc.replace(source, dest),
    data
  );

  fs.writeFileSync(outputPath, replacedHtml, {
    encoding: "utf-8",
  });

  return outputPath;
};

export default pageLoader;
