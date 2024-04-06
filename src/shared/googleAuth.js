
import { OAuth2Client } from "google-auth-library";

function authClient() {
  // const redirectURL = "http://localhost:8000/auth/google" //same url also mentioned in redirect url of google developer console
  const redirectURL = `${process.env.BACKEND_URL}/auth/google`;
  const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectURL
  );
  return oAuth2Client;
}

async function authConsent(req, res) {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL); //to by pass google csrf
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Referrer-Policy", "no-referrer-when-downgrade");

  const client = await authClient();

  // Generate the url that will be used for the consent dialog.
  const authorizeUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: "https://www.googleapis.com/auth/userinfo.email profile openid ",
    prompt: "consent",
  });

  //url for consent dialogue
  res.json({ url: authorizeUrl });
}

async function getUserData(access_token) {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
  );

  //console.log('response',response);
  const data = await response.json();

  return data;
}

export { authClient, authConsent, getUserData };
