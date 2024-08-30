import { afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import nock from "nock";
import fs from "fs";
import os from "os";
import path from "path";
import pageLoader from "../src";

const pageUrl = "https://ya.ru";
const pageName = "test.html";

const fixturesPath = path.join("__fixtures__", "expected.html");

describe("test page loader", () => {
  const dirName = path.join(os.tmpdir(), "page-loader-");
  let tmpDirPath;
  beforeEach(async () => {
    nock.disableNetConnect();
    tmpDirPath = fs.mkdtempSync(dirName);
  });
  test("test load page", async () => {
    const expectHtml = fs.readFileSync(fixturesPath, "utf-8");
    nock(pageUrl).get(`/${pageName}`).reply(200, expectHtml);
    const loadedPath = await pageLoader(`${pageUrl}/${pageName}`, tmpDirPath);
    const loadedhtml = fs.readFileSync(loadedPath, "utf-8");
    expect(loadedhtml).toBe(expectHtml);
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });
});
