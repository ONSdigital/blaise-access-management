import React from "react";

export default function PageNotFound() {
    return (<>
        <div className="ons-page__container ons-container">
            <div className="ons-grid">
                <div className="ons-grid__col ons-col-12@m ">
                    <main id="main-content" className="ons-page__main ">
                        <h1>Page not found</h1>
                        <p>If you entered a web address, check it is correct.</p>
                        <p>If you pasted the web address, check you copied the whole address.</p>
                        <p>If the web address is correct, or you selected a link or button, <a href="#0">contact us</a>.</p>
                    </main>
                </div>
            </div>
        </div>
    </>);
}