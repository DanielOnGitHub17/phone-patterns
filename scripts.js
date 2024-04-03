//from funcs.js
class Vec {
    constructor(x, y) {
        this.x = x;
        (y == undefined) ? this.y = x : this.y = y;
    }
    plus(another) {
        this.x = this.x + another.x;
        this.y = this.y + another.y;
    }
    factor(n) {
        return new Vec(this.x * n,this.y * n)
    }
}

let make = (name='div')=>document.createElement(name)
  , get = (id)=>document.getElementById(id)
  , getE = (selector,value)=>document.querySelector(`[${selector}=${value}]`)
  , getS = (query)=>document.querySelector(query)
  , getAll = (query)=>[...document.querySelectorAll(query)];
let identify = ()=>getAll('[id]').forEach(i=>window[i.id] = i)
  , add = (what,to=document.body)=>to.appendChild(what)
  , bx = (who)=>who.getBoundingClientRect();
// end from funcs

identify();
let alreadyDrawn = [];
uPatternAdd.onclick = ()=>(new Pattern).Pin.focus();

let containers = [userDefinedPatterns, allPatterns];
[SOHU, SOHA].forEach((s,i)=>{
    s.onclick = ()=>{
        if (s.textContent == '\\/') {
            s.textContent = '/\\';
            containers[i].style.left = '110%';
            setTimeout(()=>containers[i].style.display = 'none', 1000)
        } else {
            s.textContent = '\\/';
            containers[i].style.display = '';
            setTimeout(()=>containers[i].style.left = '');
        }
    }
})
function loaded(event) {
     (event.target.points<9) && (new Phone(event.target.points+1)).fetcher.addEventListener('load', loaded)
}
onload=()=>(new Phone(4)).fetcher.addEventListener('load', loaded)