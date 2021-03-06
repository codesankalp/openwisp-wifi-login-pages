import React from "react";
import axios from "axios";
import {Cookies} from "react-cookie";
import {shallow, mount} from "enzyme";
import authenticate from "./authenticate";
import isInternalLink from "./check-internal-links";
import customMerge from "./custom-merge";
import getParameterByName from "./get-parameter-by-name";
import renderAdditionalInfo from "./render-additional-info";
import shouldLinkBeShown from "./should-link-be-shown";
import tick from "./tick";
import validateToken from "./validate-token";
import PasswordToggleIcon from "./password-toggle";

jest.mock("axios");

describe("renderAdditionalInfo tests", () => {
  let textObj = {en: "sample test"};
  const language = "en";
  const termsAndConditions = {title: {en: "title1"}};
  const privacyPolicy = {title: {en: "title2"}};
  const orgSlug = "default";
  const component = "test";
  it("should return expected output", () => {
    let output = renderAdditionalInfo(
      textObj,
      language,
      termsAndConditions,
      privacyPolicy,
      orgSlug,
      component,
    );
    expect(output[0]).toEqual("sample test");
    textObj = {en: "sample {terms_and_conditions} test"};
    output = renderAdditionalInfo(
      textObj,
      language,
      termsAndConditions,
      privacyPolicy,
      orgSlug,
      component,
    );
    expect(output[1].props.children).toBe("title1");
    textObj = {en: "sample {privacy_policy} test"};
    output = renderAdditionalInfo(
      textObj,
      language,
      termsAndConditions,
      privacyPolicy,
      orgSlug,
      component,
    );
    expect(output[1].props.children).toBe("title2");
    textObj = {en: "sample {privacy_policy} test {terms_and_conditions}"};
    output = renderAdditionalInfo(
      textObj,
      language,
      termsAndConditions,
      privacyPolicy,
      orgSlug,
      component,
    );
    expect(output[1].props.children).toBe("title2");
    expect(output[3].props.children).toBe("title1");

    textObj = {en: "{terms_and_conditions} sample {privacy_policy} test"};
    output = renderAdditionalInfo(
      textObj,
      language,
      termsAndConditions,
      privacyPolicy,
      orgSlug,
      component,
    );
    expect(output[1].props.children).toBe("title1");
    expect(output[3].props.children).toBe("title2");
  });
});
describe("customMerge tests", () => {
  const arr1 = ["test1", "test2"];
  const arr2 = ["test3", "test4"];
  it("should return expected output", () => {
    expect(customMerge(arr1, arr2)).toEqual(arr2);
  });
});
describe("authenticate tests", () => {
  const cookies = {
    get: jest
      .fn()
      .mockImplementationOnce(() => true)
      .mockImplementationOnce(() => false),
  };
  const orgSlug = "test-org";
  it("should perform authentication", () => {
    expect(authenticate(cookies, orgSlug)).toEqual(true);
    expect(authenticate(cookies, orgSlug)).toEqual(false);
  });
});
describe("isInternalLink tests", () => {
  it("should detect internal links", () => {
    expect(isInternalLink("/default/login")).toEqual(true);
    expect(isInternalLink("https://google.com")).toEqual(false);
  });
});
describe("getParameterByName tests", () => {
  it("should get parameter values", () => {
    expect(getParameterByName("username")).toBe(null);
    expect(
      getParameterByName("username", "/default/login?username=vivek"),
    ).toBe("vivek");
  });
});
describe("shouldLinkBeShown tests", () => {
  const createArgs = (link, isAuthenticated, userData) => {
    return {link, isAuthenticated, userData};
  };

  it("test link.authenticated is undefined", () => {
    const {link, isAuthenticated, userData} = createArgs({}, false, {});
    expect(shouldLinkBeShown(link, isAuthenticated, userData)).toBe(true);
  });
  it("test link.authenticated is different from isAuthenticated", () => {
    const {link, isAuthenticated, userData} = createArgs(
      {authenticated: false},
      true,
      {},
    );
    expect(shouldLinkBeShown(link, isAuthenticated, userData)).toBe(false);
  });
  it("test link.authenticated is similar to isAuthenticated", () => {
    const {link, isAuthenticated, userData} = createArgs(
      {authenticated: true},
      true,
      {},
    );
    expect(shouldLinkBeShown(link, isAuthenticated, userData)).toBe(true);
  });
  it("should return false if user is unverified but authenticated and link.verified is true", () => {
    const {link, isAuthenticated, userData} = createArgs(
      {authenticated: true, verified: true},
      true,
      {is_verified: false},
    );
    expect(shouldLinkBeShown(link, isAuthenticated, userData)).toBe(false);
  });
  it("should return false if user is authenticated and link.method is not equal to userData.method", () => {
    const {link, isAuthenticated, userData} = createArgs(
      {authenticated: true, method: "payment"},
      true,
      {method: "mobile_phone"},
    );
    expect(shouldLinkBeShown(link, isAuthenticated, userData)).toBe(false);
  });
  it("should return true if userData.method and link.method is same", () => {
    const {link, isAuthenticated, userData} = createArgs(
      {authenticated: true, method: "payment"},
      true,
      {method: "payment"},
    );
    expect(shouldLinkBeShown(link, isAuthenticated, userData)).toBe(true);
  });
});
describe("tick tests", () => {
  it("test tick", async () => {
    jest.spyOn(process, "nextTick");
    await tick();
    expect(process.nextTick).toHaveBeenCalled();
  });
});
describe("Validate Token tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  const getArgs = () => {
    return {
      orgSlug: "default",
      cookies: new Cookies(),
      setUserData: jest.fn(),
      userData: {is_active: true, is_verified: true},
      logout: jest.fn(),
    };
  };
  it("should return false if token is not in the cookie", async () => {
    const {orgSlug, cookies, setUserData, userData, logout} = getArgs();
    const result = await validateToken(cookies, orgSlug, setUserData, userData);
    expect(axios.mock.calls.length).toBe(0);
    expect(result).toBe(false);
    expect(setUserData.mock.calls.length).toBe(0);
    expect(logout.mock.calls.length).toBe(0);
  });
  it("should return true for success validation", async () => {
    axios.mockImplementationOnce(() => {
      return Promise.resolve({
        status: 200,
        statusText: "OK",
        data: {
          response_code: "AUTH_TOKEN_VALIDATION_SUCCESSFUL",
          radius_user_token: "o6AQLY0aQjD3yuihRKLknTn8krcQwuy2Av6MCsFB",
          username: "tester@tester.com",
          is_active: true,
          is_verified: true,
          phone_number: "+393660011222",
        },
      });
    });
    const {orgSlug, cookies, setUserData, userData, logout} = getArgs();
    cookies.set(`${orgSlug}_auth_token`, "token");
    const result = await validateToken(cookies, orgSlug, setUserData, userData);
    expect(axios).toHaveBeenCalled();
    expect(setUserData.mock.calls.length).toBe(1);
    expect(result).toBe(true);
    expect(logout.mock.calls.length).toBe(0);
  });
  it("should return true without calling api if radius token is present", async () => {
    const {orgSlug, cookies, setUserData, userData, logout} = getArgs();
    userData.radius_user_token = "token";
    const result = await validateToken(cookies, orgSlug, setUserData, userData);
    expect(axios.mock.calls.length).toBe(0);
    expect(result).toBe(true);
    expect(setUserData.mock.calls.length).toBe(0);
    expect(logout.mock.calls.length).toBe(0);
  });
  it("should return false when internal server error", async () => {
    jest.spyOn(global.console, "log").mockImplementation();
    axios.mockImplementationOnce(() => {
      return Promise.resolve({
        status: 500,
        statusText: "INTERNAL_SERVER_ERROR",
        data: {
          response_code: "INTERNAL_SERVER_ERROR",
        },
      });
    });
    const {orgSlug, cookies, setUserData, userData, logout} = getArgs();
    const result = await validateToken(
      cookies,
      orgSlug,
      setUserData,
      userData,
      logout,
    );
    expect(axios.mock.calls.length).toBe(1);
    expect(result).toBe(false);
    expect(setUserData.mock.calls.length).toBe(1);
  });
});
describe("password-toggle tests", () => {
  const Component = React.forwardRef((props, ref) => (
    <>
      <input type="password" ref={ref} />
      <PasswordToggleIcon inputRef={ref} orgSlug="default" language="en" />
    </>
  ));
  const mountComponent = (ref) => {
    return mount(<Component ref={ref} />);
  };
  it("should show and hide password", () => {
    const passwordRef = React.createRef();
    const component = mountComponent(passwordRef);
    const toggleDiv = component.find("div");
    expect(passwordRef.current.getAttribute("type")).toEqual("password");
    expect(toggleDiv.instance().children[0].getAttribute("class")).toEqual(
      "eye",
    );
    toggleDiv.simulate("click");
    expect(passwordRef.current.getAttribute("type")).toEqual("text");
    expect(toggleDiv.instance().children[0].getAttribute("class")).toEqual(
      "eye-slash",
    );
  });
  it("should call handleClick", () => {
    const wrapper = shallow(
      <PasswordToggleIcon
        inputRef={React.createRef()}
        orgSlug="default"
        language="en"
      />,
    );
    const setAttributeMock = jest.fn();
    const getAttributeMock = jest.fn();
    const inputRef = {
      current: {
        getAttribute: getAttributeMock,
        setAttribute: setAttributeMock,
      },
    };
    wrapper.instance().handleClick(inputRef);
    expect(getAttributeMock).toHaveBeenCalledWith("type");
    expect(setAttributeMock).toHaveBeenCalled();
    expect(setAttributeMock).toHaveBeenCalledWith("type", "password");
  });
});
