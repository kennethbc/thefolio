
import { Link } from "react-router-dom";

function Nav(){
return(
<nav>
<ul>
<li><Link to="/home">Home</Link></li>
<li><Link to="/about">About</Link></li>
<li><Link to="/contact">Contact</Link></li>
<li><Link to="/register">Register</Link></li>
<li><button id="darkModeToggle">Dark Mode</button></li>
</ul>
</nav>
);
}

export default Nav;
