import { Link } from "react-router-dom";

export default function PageNotFound() {
  return (
    <main
      id="main-content"
      className="ons-page__main ons-u-mt-l"
    >
      <div className="ons-grid">
        <div className="ons-grid__col ons-col-8@m">
          <h1>Page not found</h1>
          <p>If you entered a web address, check it is correct.</p>
          <p>If you pasted the web address, check you copied the whole address.</p>
          <p>
            Go back <Link to={"/"}>home</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}
