import '../AboutPage.css'
import '../script.js'
import xin from '../images/xin.jpeg';
import try2 from '../images/try.jpeg';
import frontimg from '../images/frontimg.jpg';

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


        <main id = "main">
            <section id="section1" class="section">
                <img src={frontimg} alt = "Somepic" />
                <h2>Who We Are</h2>
                <p>Your Company is [a brief description of yourself or your organization]. [Provide some background, such as when it was founded, the mission, and the values.]</p>
            </section>

            <section id= "section3" class="section">
                <h2>What We Offer</h2>
                <p>[Highlight the key products, services, or content that you provide. Describe how you add value or solve problems for your audience.]</p>
                <img src={try2}  width="600" height="800" alt = "Somepic" />
            </section>

            <section id="section4" class="section">
                <img src={xin} width="600" height="800" alt = "Somepic" />
                <h2>Join Our Community</h2>
                <p>[If applicable, invite visitors to join your community, subscribe to newsletters, or follow your updates on social media.]</p>
            </section>
        </main>
    </body>
    )
}

export default AboutPage;