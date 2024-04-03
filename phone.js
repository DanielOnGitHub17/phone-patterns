let phones = [];
class Phone {
    constructor(points) {
        phones.push(this);
        this.points = points;
        //in future... maybe calls to the pin file will occur 
        // when the user wants to move (in order to manage memory)
        // it might slow down performance, but instead of having all
        // array, it will only have two at a time;
        (this.fetcher = new XMLHttpRequest).open('get', `pins/pin_${points}.json`)//added so as to make the loading sequential (sometimes, phones with higher points would be loaded before those with lower points, so the phone object should have a "loaded" event);
        this.fetcher.points=points;
        this.fetcher.send();
        this.fetcher.onload=()=>{
            if(this.fetcher.status!=200) return {a: alert(this.fetcher.response), b: console.log(this.fetcher.response)};
            this.pins = JSON.parse(this.fetcher.responseText);
            this.index=0; this.lastindex=this.pins.length-1; this.domize();
        }
    }
    domize(){
        (this.phone=make()).className='bphone';
        ['desc,h2', 'incr,input', 'prev', 'box,div','next'].forEach((p, t)=>{
            let x = p.split(',');
            this.phone.appendChild(this[x[0]]=make(x[1]?x[1]:'button')).className='phone'+x[0];
            this[x[0]].textContent = [`Patterns having ${this.points} points`,'', '<', '', '>'][t];
            this[x[0]].style.setProperty('grid-area', x[0]);
        });
        this.incr.type='number'; this.incr.value=this.incr.min=0;
        this.incr.max=this.lastindex;
        this.patterns=[];
        for (let i = 0; i < 2; i++) {
            let p = new Pattern(this.box);
            p.Pin.value=this.pins[this.index][i];
            p.allPoints=p.pathh; this.patterns.push(p);
        };
        allPatterns.append(this.phone);
        this.event()
    }
    event(){
        this.prev.onclick=()=>{
            if(this.patterns.some(p=>p.Animate.disabled)) return;
            if (this.index>0) {
                this.index--; this.refresh();
            }
        }
        this.next.onclick=()=>{
            if(this.patterns.some(p=>p.Animate.disabled)) return;
            if (this.index<this.lastindex) {
                this.index++; this.refresh();
            }
        }
        this.incr.onchange=()=>{
            console.log(this.index);
            if(+this.incr.value>this.incr.max) this.incr.value=this.incr.max;
            if(+this.incr.value<0) this.incr.value=0;
            this.index=+event.target.value;
            this.refresh();
        }
    }
    refresh(){
        this.patterns.forEach((p, i)=>{
            p.Pin.value=this.pins[this.index][i];
            p.allPoints=p.pathh;
        });
        this.incr.value=this.index;
    }
}
// project finished July 4, 2023; 12:01/-04 happy independence day.

//add/remove remaining: next projects particles and PI