import React from "react";

export default function UserSignInErrorPanel() {
    return (<div className="ons-page__container ons-container">
        <div className="ons-grid">
            <div className="ons-grid__col ons-col-12@m ">
                <main id="main-content" className="ons-page__main ">
                    <h1>Sorry, there is a problem</h1>
                    <p>User details cannot be found. <br/> Please try again and ensure you are signed in.</p>
                </main>
            </div>
        </div>
    </div>);
}