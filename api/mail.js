const LOGO_URL = "https://yourdomain.com/logo.jpg";

/* ======================================================
   EMAIL TEMPLATES
====================================================== */
const getTemplate = ({
  template,
  username = "User",
}) => {

  /* ======================================================
     TEMPLATE 1 - VERIFICATION SUCCESS
  ====================================================== */
  if (template === "1") {

    return {
      subject: "Verification Successful",
      html: `
        <div style="
          background:#0f0f0f;
          padding:40px;
          font-family:Arial;
          color:white;
          text-align:center;
        ">

          <img src="${LOGO_URL}"
            width="110"
            style="
              border-radius:20px;
              margin-bottom:20px;
            "
          />

          <h1>Verification Successful ✅</h1>

          <p style="
            color:#bdbdbd;
            line-height:1.7;
            font-size:16px;
          ">
            Hey <b>${username}</b>,
            <br /><br />
            Your account has been verified successfully.
          </p>

          <div style="
            background:#1b1b1b;
            padding:20px;
            border-radius:20px;
            margin-top:30px;
          ">
            You now have full access to Aro services.
          </div>

        </div>
      `,
    };
  }

  /* ======================================================
     TEMPLATE 2 - REGISTRATION SUCCESS
  ====================================================== */
  if (template === "2") {

    return {
      subject: "Registration Successful",
      html: `
        <div style="
          background:#0f0f0f;
          padding:40px;
          font-family:Arial;
          color:white;
          text-align:center;
        ">

          <img src="${LOGO_URL}"
            width="110"
            style="
              border-radius:20px;
              margin-bottom:20px;
            "
          />

          <h1>Welcome to Aro 🚀</h1>

          <p style="
            color:#bdbdbd;
            line-height:1.7;
            font-size:16px;
          ">
            Hey <b>${username}</b>,
            <br /><br />
            Your registration was completed successfully.
          </p>

          <div style="
            background:#1b1b1b;
            padding:20px;
            border-radius:20px;
            margin-top:30px;
          ">
            Start exploring features and services inside Aro.
          </div>

        </div>
      `,
    };
  }

  /* ======================================================
     TEMPLATE 3 - SELLER FIRST LOGIN
  ====================================================== */
  if (template === "3") {

    return {
      subject: "Seller Dashboard Activated",
      html: `
        <div style="
          background:#0f0f0f;
          padding:40px;
          font-family:Arial;
          color:white;
          text-align:center;
        ">

          <img src="${LOGO_URL}"
            width="110"
            style="
              border-radius:20px;
              margin-bottom:20px;
            "
          />

          <h1>Seller Login Successful ⚡</h1>

          <p style="
            color:#bdbdbd;
            line-height:1.7;
            font-size:16px;
          ">
            Hey <b>${username}</b>,
            <br /><br />
            Your seller dashboard is now active.
          </p>

          <div style="
            background:#1b1b1b;
            padding:20px;
            border-radius:20px;
            margin-top:30px;
          ">
            Manage products, orders, and grow your business with Aro.
          </div>

        </div>
      `,
    };
  }

  /* ======================================================
     TEMPLATE 4 - USER FIRST LOGIN
  ====================================================== */
  if (template === "4") {

    return {
      subject: "Welcome Back",
      html: `
        <div style="
          background:#0f0f0f;
          padding:40px;
          font-family:Arial;
          color:white;
          text-align:center;
        ">

          <img src="${LOGO_URL}"
            width="110"
            style="
              border-radius:20px;
              margin-bottom:20px;
            "
          />

          <h1>Welcome 👋</h1>

          <p style="
            color:#bdbdbd;
            line-height:1.7;
            font-size:16px;
          ">
            Hey <b>${username}</b>,
            <br /><br />
            Thanks for logging into Aro.
          </p>

          <div style="
            background:#1b1b1b;
            padding:20px;
            border-radius:20px;
            margin-top:30px;
          ">
            Your personalized experience is ready.
          </div>

        </div>
      `,
    };
  }

  /* ======================================================
     DEFAULT TEMPLATE
  ====================================================== */
  return {
    subject: "Aro Notification",
    html: `
      <div style="
        background:#0f0f0f;
        padding:40px;
        color:white;
        font-family:Arial;
      ">
        Hello ${username}
      </div>
    `,
  };
};
