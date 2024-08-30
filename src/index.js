import path from "path";
import axios from "axios";
import fs from "fs";

const pageLoader = async (url, outputDir = process.cwd()) => {
  const htmlFileName =
    url.replace(/^.+?:\/\/(.+)$/, "$1").replace(/[^a-z]/gi, "-") + ".html";
  const outputPath = path.join(outputDir, htmlFileName);
  const { data } = await axios.get(url);
  fs.writeFileSync(outputPath, data, {
    encoding: "utf-8",
  });

  return outputPath;
};

export default pageLoader;
