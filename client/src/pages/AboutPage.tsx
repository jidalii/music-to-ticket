import '../AboutPage.css'
import '../script.js'
import xin from '../images/xin.jpeg';
import try2 from '../images/try.jpeg';
import pll from '../images/playlist.jpg';
import ticket from '../images/ticket.jpg';
import frontimg from '../images/frontimg.jpg';
import Mayday from '../images/Mayday.jpg';

function AboutPage() {
    return (
    <body>
        <header>
            <div class="logo">
                <h1 id="h1">
                    Our mission is to link <span class="colored-text1">musician</span> to <span class="colored-text2">concert</span>,
                    <p>providing best experiences for you by <span class="colored-text3">just one click</span>.</p>
                </h1>
                <img src = {frontimg} width="1000" height="800" alt="Google Logo" />
                <h1 id="h2">
                    Who's your favorite artest?
                    <p id="h2p">Learn more about what we have</p>
                    <a id="a" href ="#section3" title="click here to learn more">click here to learn more</a>
                </h1>
            </div>
        </header>

        <h1 id = "h11">
            <p>Create A Easier Way to</p>
            <p>Link you and the One you Love</p>
        </h1>

        <main id = "main">
            <section id="section1" class="section">
                <img src={ticket} width="600" height="400" alt = "Somepic" />
                <section class="textsection">
                    <h2>Who We Are</h2>
                    <p>We are four student from boston university, providing website for you to find recent concert of you favorite artest by just one click.</p>
                </section>
            </section>

            <h1 id = "h12">
                <p id ="unreal">Sounds unrealiable?</p>
                <p id = "new">Even NO need to create new account</p>
            </h1>

            <section id= "section3" class="section">
                <section class="textsection">
                    <h2>What We Offer</h2>
                    <p>
                    <ol>
                        <li>1. Login with your spotify</li>
                        <li>2. Get information about singers and artest you like and Link to ticketmaster</li>
                        <li>3. Check if your love have concert recently</li>
                        <li>4. directly link to ticketmaster and by your ticket!</li>
                    </ol>
                    </p>
                </section>
                <img id ="rightimg" src={pll}  width="600" height="800" alt = "Somepic"/>
            </section>

            <section id="section4" class="section">
                <img src={Mayday} width="600" height="800" alt = "Somepic" />
                <section>
                    <h2>Join Our Community</h2>
                    <p id = "login">Login in with your spotify Now!</p>
                    <p id = "blogin">Try what I've mentioned above, and Enjoy your time.</p>
                    <button id="loginbutton-about"
                        className="bg-spotify-green text-white px-5 py-2.5 inline-block text-lg m-1 cursor-pointer rounded-full font-bold"
                        onClick={() => window.location.href='http://localhost:8000/auth/spotify'}
                         >
                        Login with Spotify
                     </button>
                </section>
            </section>
        </main>
    </body>
    )
}

export default AboutPage;