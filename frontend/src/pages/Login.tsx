import { FormEvent, useContext, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, Redirect, useHistory, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";

import { TwoColumnLayout } from "../components/Layouts";
import { loginEmail, loginEmailAndAddToChain } from "../api/login";
import { ToastContext } from "../providers/ToastProvider";
import FormJup from "../util/form-jup";
import { AuthContext } from "../providers/AuthProvider";
import { GinParseErrors } from "../util/gin-errors";
import type { Response } from "redaxios";
import { useQueryParam } from "use-query-params";

//media
const CirclesFrame = "https://images.clothingloop.org/0x0/circles.png";

interface Params {
  chainUID: string;
}

export default function Login() {
  const history = useHistory();
  const { authUser } = useContext(AuthContext);
  const { addToast, addToastError } = useContext(ToastContext);
  const { t } = useTranslation();

  const { chainUID } = useParams<Params>();
  const [defaultEmail = ""] = useQueryParam<string>("email");

  const [error, setError] = useState("");
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (active) return;
    setError("");
    const values = FormJup<{ email: string }>(e);

    const email = values.email;

    if (email === "") {
      setError("email");
      return;
    }

    setLoading(true);
    setActive(true);

    (async () => {
      let apiKey: string | undefined;
      try {
        let res: Response<unknown>;
        if (chainUID) {
          res = await loginEmailAndAddToChain(email, chainUID);
        } else {
          res = await loginEmail(email);
        }

        if (res.data && (res.data + "").length) {
          apiKey = res.data + "";
        } else {
          addToast({
            type: "success",
            message: t("loginEmailSent"),
          });
          setLoading(false);
          setTimeout(() => {
            setActive(false);
          }, 1000 * 60 * 2 /* 2 min */);
        }
      } catch (err: any) {
        console.info("Unable to send login email", err);
        setActive(false);
        setLoading(false);
        setError("email");
        addToastError(GinParseErrors(t, err), err?.status);
      }

      if (apiKey) {
        history.replace("/users/login/validate?apiKey=" + apiKey);
      }
    })();
  }

  if (authUser) {
    addToast({
      type: "success",
      message: t("userIsLoggedIn"),
    });

    return <Redirect push={false} to="/admin/dashboard" />;
  }

  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Login</title>
        <meta name="description" content="Login" />
      </Helmet>

      <main className="pt-10">
        <TwoColumnLayout
          t={t}
          img="https://images.clothingloop.org/x600/login.jpg"
          alt="Nichon wearing a red jacket and holding an Ikea bag full of clothes"
          credit="Anke Teunissen"
        >
          <div className="relative sm:p-10 -mx-4 sm:mx-0">
            <div className="p-10 bg-teal-light">
              <img
                className="absolute bottom-[-12px] left-[-12px] -z-10"
                src={CirclesFrame}
                alt=""
              />
              <h1 className="font-serif font-bold text-5xl text-secondary mb-7">
                {t("login")}
              </h1>

              <form onSubmit={onSubmit} className="flex flex-col">
                <input
                  className={`input w-full invalid:input-warning ${
                    error ? "input-error" : "input-secondary"
                  }`}
                  placeholder={t("email")}
                  type="email"
                  name="email"
                  defaultValue={defaultEmail}
                  required
                />
                {active ? (
                  <div className="text-white bg-green border-green w-full flex items-center justify-center font-semibold h-12 px-3 mt-6">
                    {t("submit")}
                    {loading ? (
                      <span className="feather feather-loader animate-spin ml-4 rtl:ml-0 rtl:mr-4"></span>
                    ) : (
                      <span className="feather feather-check ml-4 rtl:ml-0 rtl:mr-4"></span>
                    )}
                  </div>
                ) : (
                  <button type="submit" className="btn btn-primary w-full mt-6">
                    {t("submit")}
                    <span className="feather feather-arrow-right ml-4 rtl:hidden"></span>
                    <span className="feather feather-arrow-left mr-4 ltr:hidden"></span>
                  </button>
                )}
                <div className="mt-4 prose">
                  {t("newToTheClothingLoop") + " "}
                  <Trans
                    i18nKey="clickHereToRegister"
                    components={{
                      "1": (
                        <Link
                          className="font-medium"
                          to={
                            chainUID
                              ? `/loops/${chainUID}/users/signup`
                              : "/users/signup"
                          }
                        />
                      ),
                    }}
                  />
                </div>
              </form>
            </div>
          </div>
        </TwoColumnLayout>
      </main>
    </>
  );
}
