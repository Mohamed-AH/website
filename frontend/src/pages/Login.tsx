import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";

import { TextField, Button, Alert } from "@mui/material";
import { makeStyles } from "@mui/styles";

import theme from "../util/theme";

// Project resources
import { TwoColumnLayout } from "../components/Layouts";

import { Helmet } from "react-helmet";
import { loginEmail } from "../api/login";

//media
const CirclesFrame = "/images/circles.png";
const LoginImg = "/images/Login.jpg";

const Login = () => {
  const { t } = useTranslation();
  const classes = makeStyles(theme as any)();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validate = Yup.object({
    email: Yup.string().email(t("pleaseEnterAValid.emailAddress")),
  });

  const onSubmit = async (data: any) => {
    if (!submitted) {
      try {
        const continueUrl = `${
          process.env.REACT_APP_BASE_URL
        }/users/login-email-finished/${encodeURI(data.email)}`;
        await loginEmail(data.email);
        setSubmitted(true);
      } catch (e: any) {
        console.error(e);
        setError(t("noResultsFound"));
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Login</title>
        <meta name="description" content="Login" />
      </Helmet>

      <div className="background-frame-login"></div>
      <img className="circles-frame-login" src={CirclesFrame} alt="" />
      <div className="tw-pt-24 tw-relative">
        <TwoColumnLayout img={LoginImg}>
          <div className="login-content">
            <h1 className={classes.pageTitle}>{t("login")}</h1>
            <div className={classes.pageDescription}>
              <p>
                <Trans
                  i18nKey="areYouAlreadyHosting<a>JoinAnExistingLoop"
                  components={{
                    a: (
                      <Link className={classes.a} to="../../loops/find"></Link>
                    ),
                  }}
                ></Trans>
              </p>
            </div>

            <Formik
              initialValues={{
                email: "",
              }}
              validationSchema={validate}
              onSubmit={async (v) => onSubmit(v)}
            >
              {(formik) => (
                <Form className="tw-flex tw-flex-col">
                  <TextField
                    className={classes.textField}
                    {...formik.getFieldProps("email")}
                    label={t("email")}
                    variant="standard"
                    type="email"
                    required
                    fullWidth
                  />
                  {formik.submitCount > 0 && formik.errors.email && (
                    <Alert severity="error">{formik.errors.email}</Alert>
                  )}
                  <div className="tw-flex tw-justify-end tw-mx-0 tw-my-5">
                    <button
                      type="submit"
                      className="tw-btn tw-btn-primary tw-w-full"
                    >
                      {t("submit")}
                      <span className="feather feather-arrow-right tw-ml-4"></span>
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
            {error && (
              <Alert className={classes.errorAlert} severity="error">
                {error}
              </Alert>
            )}
            {submitted && (
              <Alert className={classes.infoAlert} severity="info">
                {t("loginEmailSent")}
              </Alert>
            )}
          </div>
        </TwoColumnLayout>
      </div>
    </>
  );
};

export default Login;
