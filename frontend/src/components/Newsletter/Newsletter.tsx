import React from "react";
import { Button, TextField, Typography, Grid } from "@mui/material";
import { makeStyles } from "@mui/styles";

import ArrowRight from "./arrow-right.svg";

import { useTranslation } from "react-i18next";
import { contactNewsletterSet } from "../../api/contact";

const useStyles = makeStyles({
  headingTypographyRoot: {
    fontFamily: "Playfair Display",
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: "48px",
    lineHeight: "64px",
    color: "#48808B",
  },
  subheadingTypographyRoot: {
    marginTop: "16px",
    fontFamily: "Avenir", // Not a free font. Available by default in MacOS
    fontWeight: "normal",
    fontSize: "18px",
    lineHeight: "25px",
    color: "#3C3C3B",
  },
  textFieldGridRoot: {
    marginTop: "-8px",
  },
  muiInputLabelRootTextFieldRoot: {
    "& label.MuiInputLabel-root": { color: "#48808B" },
    "& .MuiInputBase-input": { color: "#48808B" },
    "& .MuiInput-underline": {
      "&:after": { borderBottom: "none" },
    },
  },
  buttonRoot: {
    marginTop: "24px",
    fontFamily: "Avenir", // Not a free font. Available by default in MacOS
    fontSize: "16px",
    fontWeight: 500,
    padding: "12px 32px",
    borderRadius: "0px",
    background: "#f7C86f",
    color: "#ffffff",
    textTransform: "capitalize",
    "&:hover": {
      background: "#f7a00f", // Change color, not part of Figma
    },
  },
  gridItemsNoPadding: {
    padding: 0,
  },
});

export const Newsletter = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmitClick = async () => {
    try {
      await contactNewsletterSet(name, email, true);
    } catch (error) {
      setIsError(true);
      setTimeout(() => setIsError(false), 3000);

      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="newsletter">
      {submitted ? (
        <div>
          <p className={classes.headingTypographyRoot}>
            {t("thankYouForSigningUp")}
          </p>
          <p className={classes.subheadingTypographyRoot}>
            {t("youAreNowSubscribedToOurMonthlyNewsletter")}
          </p>
        </div>
      ) : isError ? (
        <div>
          <p className={classes.headingTypographyRoot}>
            {t("somethingIsWrong")}
          </p>
          <p className={classes.subheadingTypographyRoot}>
            {t("pleaseTryAgainInSeconds")}
          </p>
        </div>
      ) : (
        <div>
          <p className={classes.headingTypographyRoot}>
            {t("keepUpWithOurLatestNews")}
          </p>
          <p className={classes.subheadingTypographyRoot}>
            {t("subscribeToRecieveOurLatestNews")}
          </p>
          <Grid
            container
            classes={{ root: classes.textFieldGridRoot }}
            spacing={4}
            wrap="nowrap"
          >
            <Grid
              item
              id="mobile-textfield"
              classes={{ root: classes.gridItemsNoPadding }}
            >
              <TextField
                classes={{
                  root: classes.muiInputLabelRootTextFieldRoot,
                }}
                label={t("name")}
                value={name}
                onChange={handleNameChange}
                variant="standard"
              />
            </Grid>
            <Grid
              item
              id="mobile-textfield"
              classes={{ root: classes.gridItemsNoPadding }}
            >
              <TextField
                classes={{
                  root: classes.muiInputLabelRootTextFieldRoot,
                }}
                type="email"
                label={t("emailAddress")}
                value={email}
                onChange={handleEmailChange}
                variant="standard"
              />
            </Grid>
          </Grid>
          <button
            className="tw-btn tw-btn-primary tw-btn-outline"
            onClick={handleSubmitClick}
            id="mobile-submit-bt"
          >
            {t("submit")}
            <span className="feather feather-arrow-right tw-ml-3"></span>
          </button>
        </div>
      )}
    </div>
  );
};
