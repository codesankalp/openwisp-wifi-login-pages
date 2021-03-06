/* eslint-disable camelcase */
/* eslint jsx-a11y/label-has-associated-control: 0 */
import "./index.css";

import PropTypes from "prop-types";
import React, {Suspense} from "react";
import {Cookies} from "react-cookie";
import {Helmet} from "react-helmet";
import {Redirect, Route, Switch} from "react-router-dom";

import getAssetPath from "../../utils/get-asset-path";
import Header from "../header";
import Footer from "../footer";
import LoadingContext from "../../utils/loading-context";
import Loader from "../../utils/loader";
import Logout from "../logout";
import Login from "../login";
import needsVerify from "../../utils/needs-verify";
import getText from "../../utils/get-text";

const Registration = React.lazy(() => import("../registration"));
const PasswordChange = React.lazy(() => import("../password-change"));
const MobilePhoneChange = React.lazy(() => import("../mobile-phone-change"));
const PasswordReset = React.lazy(() => import("../password-reset"));
const PasswordConfirm = React.lazy(() => import("../password-confirm"));
const Status = React.lazy(() => import("../status"));
const MobilePhoneVerification = React.lazy(() =>
  import("../mobile-phone-verification"),
);
const PaymentStatus = React.lazy(() => import("../payment-status"));
const ConnectedDoesNotExist = React.lazy(() => import("../404"));
const DoesNotExist = React.lazy(() => import("../404/404"));

export default class OrganizationWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
    const {match, setOrganization, cookies} = props;
    const organizationSlug = match.params.organization;
    if (organizationSlug) setOrganization(organizationSlug, cookies);
  }

  componentDidUpdate(prevProps) {
    const {setOrganization, match, cookies} = this.props;
    if (prevProps.match.params.organization !== match.params.organization) {
      if (match.params.organization)
        setOrganization(match.params.organization, cookies);
    }
  }

  setLoading = (value) => {
    this.setState({loading: value});
  };

  render() {
    const {organization, match, cookies, language} = this.props;
    const {loading} = this.state;
    const {title, favicon, isAuthenticated, userData, settings, pageTitle} =
      organization.configuration;
    const {is_active} = userData;
    const orgSlug = organization.configuration.slug;
    const orgName = organization.configuration.name;
    const cssPath = organization.configuration.css_path;
    const userAutoLogin = localStorage.getItem("userAutoLogin") === "true";
    const needsVerifyPhone = needsVerify("mobile_phone", userData, settings);

    if (organization.exists === true) {
      const {setLoading} = this;
      return (
        <>
          <LoadingContext.Provider
            value={{setLoading, getLoading: () => loading}}
          >
            <div className={`app-container ${loading ? "no-scroll" : ""}`}>
              <Route
                path={match.path}
                render={({location}) => <Header location={location} />}
              />
              <Switch>
                <Route
                  path={`${match.path}`}
                  exact
                  render={() => {
                    return <Redirect to={`/${orgSlug}/login`} />;
                  }}
                />
                <Route
                  path={`${match.path}/registration`}
                  render={(props) => {
                    if (isAuthenticated && !needsVerifyPhone) {
                      return <Redirect to={`/${orgSlug}/status`} />;
                    }
                    if (isAuthenticated && needsVerifyPhone) {
                      return (
                        <Redirect
                          to={`/${orgSlug}/mobile-phone-verification`}
                        />
                      );
                    }
                    return (
                      <Suspense fallback={<Loader full={false} />}>
                        <Registration {...props} />
                      </Suspense>
                    );
                  }}
                />
                <Route
                  path={`${match.path}/mobile-phone-verification`}
                  render={(props) => {
                    if (
                      isAuthenticated &&
                      needsVerifyPhone === false &&
                      is_active
                    ) {
                      return <Redirect to={`/${orgSlug}/status`} />;
                    }
                    if (!isAuthenticated) {
                      return <Redirect to={`/${orgSlug}/login`} />;
                    }
                    return (
                      <Suspense fallback={<Loader full={false} />}>
                        <MobilePhoneVerification {...props} cookies={cookies} />
                      </Suspense>
                    );
                  }}
                />
                <Route
                  path={`${match.path}/password/reset/confirm/:uid/:token`}
                  render={(props) => {
                    if (isAuthenticated)
                      return <Redirect to={`/${orgSlug}/status`} />;
                    return (
                      <Suspense fallback={<Loader full={false} />}>
                        <PasswordConfirm {...props} />
                      </Suspense>
                    );
                  }}
                />
                <Route
                  path={`${match.path}/password/reset`}
                  exact
                  render={() => {
                    if (isAuthenticated)
                      return <Redirect to={`/${orgSlug}/status`} />;
                    return (
                      <Suspense fallback={<Loader full={false} />}>
                        <PasswordReset />
                      </Suspense>
                    );
                  }}
                />
                <Route
                  path={`${match.path}/login`}
                  render={(props) => {
                    if (isAuthenticated && is_active)
                      return <Redirect to={`/${orgSlug}/status`} />;
                    return <Login {...props} />;
                  }}
                />
                <Route
                  path={`${match.path}/status`}
                  render={(props) => {
                    if (isAuthenticated && needsVerifyPhone)
                      return (
                        <Redirect
                          to={`/${orgSlug}/mobile-phone-verification`}
                        />
                      );
                    if (isAuthenticated) {
                      return (
                        <Suspense fallback={<Loader full={false} />}>
                          <Status {...props} cookies={cookies} />
                        </Suspense>
                      );
                    }
                    if (userAutoLogin)
                      return <Redirect to={`/${orgSlug}/logout`} />;
                    return <Redirect to={`/${orgSlug}/login`} />;
                  }}
                />
                <Route
                  path={`${match.path}/logout`}
                  render={(props) => {
                    if (isAuthenticated)
                      return <Redirect to={`/${orgSlug}/status`} />;
                    if (userAutoLogin) return <Logout {...props} />;
                    return <Redirect to={`/${orgSlug}/login`} />;
                  }}
                />
                <Route
                  path={`${match.path}/change-password`}
                  render={() => {
                    if (isAuthenticated)
                      return (
                        <Suspense fallback={<Loader full={false} />}>
                          <PasswordChange cookies={cookies} />
                        </Suspense>
                      );
                    return <Redirect to={`/${orgSlug}/login`} />;
                  }}
                />
                <Route
                  path={`${match.path}/change-phone-number`}
                  render={() => {
                    if (isAuthenticated)
                      return (
                        <Suspense fallback={<Loader full={false} />}>
                          <MobilePhoneChange cookies={cookies} />
                        </Suspense>
                      );
                    return <Redirect to={`/${orgSlug}/login`} />;
                  }}
                />
                <Route
                  path={`${match.path}/payment/:result`}
                  render={(props) => {
                    const {result} = props.match.params;
                    return (
                      <Suspense fallback={<Loader full={false} />}>
                        <PaymentStatus cookies={cookies} result={result} />
                      </Suspense>
                    );
                  }}
                />
                <Route
                  render={() => {
                    return (
                      <Suspense fallback={<Loader full={false} />}>
                        <ConnectedDoesNotExist />
                      </Suspense>
                    );
                  }}
                />
              </Switch>
              <Route path={match.path} render={() => <Footer />} />
            </div>
            <Helmet>
              <title>
                {pageTitle === undefined
                  ? `${getText(title, language)} - ${orgName}`
                  : pageTitle}
              </title>
            </Helmet>
            {cssPath && orgSlug ? (
              <Helmet>
                <link rel="stylesheet" href={getAssetPath(orgSlug, cssPath)} />
              </Helmet>
            ) : null}
            {favicon && orgSlug ? (
              <Helmet>
                <link
                  rel="shortcut icon"
                  type="image/x-icon"
                  href={getAssetPath(orgSlug, favicon)}
                />
              </Helmet>
            ) : null}
            {loading && (
              <div className="loader-container">
                <div className="loader" />
              </div>
            )}
          </LoadingContext.Provider>
        </>
      );
    }
    if (organization.exists === false) {
      return (
        <>
          <div className="org-wrapper-not-found">
            <Suspense fallback={<Loader full={false} />}>
              <DoesNotExist />
            </Suspense>
          </div>
          <Helmet>
            <title>Page not found</title>
          </Helmet>
        </>
      );
    }
    return (
      <div className="loader-container">
        <div className="loader" />
      </div>
    );
  }
}

OrganizationWrapper.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      organization: PropTypes.string.isRequired,
    }),
    path: PropTypes.string,
  }).isRequired,
  setOrganization: PropTypes.func.isRequired,
  organization: PropTypes.shape({
    configuration: PropTypes.shape({
      title: PropTypes.object,
      pageTitle: PropTypes.string,
      css_path: PropTypes.string,
      slug: PropTypes.string,
      name: PropTypes.string,
      favicon: PropTypes.string,
      isAuthenticated: PropTypes.bool,
      needsVerifyPhone: PropTypes.bool,
      userData: PropTypes.object,
      settings: PropTypes.shape({
        mobile_phone_verification: PropTypes.bool,
      }),
    }),
    exists: PropTypes.bool,
  }).isRequired,
  cookies: PropTypes.instanceOf(Cookies).isRequired,
  language: PropTypes.string.isRequired,
};
