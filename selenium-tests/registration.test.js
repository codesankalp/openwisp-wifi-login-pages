import {Builder, By, until} from "selenium-webdriver";
import {getDriver, getElementByXPath, sleep, urls} from "./utils";

const firefox = require("selenium-webdriver/firefox");

describe("Selenium tests for <Register />", () => {
  let driver;
  beforeAll(async () => {
    driver = await getDriver(Builder, new firefox.Options().headless());
  });

  afterAll(async () => driver.quit());

  it("should render registration page and submit registration form", async () => {
    await driver.get(urls.registration);
    const username = await getElementByXPath(
      driver,
      "//INPUT[@id='email']",
      until,
      By,
    );
    username.sendKeys("openwisp@openwisp.org");
    const password = await getElementByXPath(
      driver,
      "//INPUT[@id='password']",
      until,
      By,
    );
    password.sendKeys("test_password");
    const confirmPassword = await getElementByXPath(
      driver,
      "//INPUT[@id='password-confirm']",
      until,
      By,
    );
    confirmPassword.sendKeys("test_password");
    const submitBtn = await getElementByXPath(
      driver,
      "//INPUT[@type='submit']",
      until,
      By,
    );
    submitBtn.click();
    const toastDiv = await getElementByXPath(
      driver,
      "//DIV[@role='alert']",
      until,
      By,
    );
    await sleep(1000);
    expect(["Registration success", "Registration error."]).toContain(
      await toastDiv.getText(),
    );
  });
});
