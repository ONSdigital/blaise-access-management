export default function UserSignInErrorPanel() {
  return (
    <main
      id="main-content"
      className="ons-page__main ons-u-mt-l"
    >
      <div className="ons-grid">
        <div className="ons-grid__col ons-col-8@m">
          <h1>Sorry, there is a problem</h1>
          <p>
            User details cannot be found. <br /> Please try again and ensure you are signed in.
          </p>
        </div>
      </div>
    </main>
  );
}
