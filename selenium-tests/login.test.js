import {Builder, By, until} from "selenium-webdriver";
import {getDriver, getElementByXPath, sleep, urls} from "./utils";

const firefox = require("selenium-webdriver/firefox");

describe("Selenium tests for <Login />", () => {
  let driver;
  beforeAll(async () => {
    driver = await getDriver(Builder, new firefox.Options().headless());
  });

  afterAll(async () => driver.quit());

  it("should render login page and submit login form", async () => {
    await driver.get(urls.login);
    const username = await getElementByXPath(
      driver,
      "//INPUT[@id='username']",
      until,
      By,
    );
    const password = await getElementByXPath(
      driver,
      "//INPUT[@id='password']",
      until,
      By,
    );
    username.sendKeys("openwisp@openwisp.org");
    password.sendKeys("test_password");
    const submitBtn = await getElementByXPath(
      driver,
      "//INPUT[@type='submit']",
      until,
      By,
    );
    await sleep(1000);
    submitBtn.click();
    const toastDiv = await getElementByXPath(
      driver,
      "//DIV[@role='alert']",
      until,
      By,
    );
    await sleep(1000);
    expect([
      "Unable to log in with provided credentials.",
      "Login successful",
    ]).toContain(await toastDiv.getText());
  });
});
