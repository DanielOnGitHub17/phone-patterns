let patterns = [];
class Pattern {
    constructor(gallery=userDefinedPatterns) {
        this.gallery = gallery;
        this.isDefault = gallery!=userDefinedPatterns;
        this.phone=make(); this.phone.className='phone'; //base for everything
        this.phone.pattern=this; //so that this can be accessed through events
        this.domize(); //for easier addition to dom;
        patterns.push(this); //for tracking;
        this.path=[]; //for easy joining
        this.points=[];//for easy drawing
    }
    domize(){
        //make makables
        ['input,Pin', 'div,Control','button,Redraw',
         'button,Animate', 'button,Save', 'button,Delete'].forEach(c=>{
             let x = c.split(',');
             (this[x[1]]=make(x[0])).className='pattern'+x[1];
         });
        //and specifically make unmakables
        (this.Box=baseSVG.cloneNode()).removeAttribute('id'); //svg element and children cannot be made generically
        this.Box.className.baseVal='patternBox';
        //add points and line...
        (this.pattern=baseLine.cloneNode()).removeAttribute('id');
        this.pattern.className.baseVal='pattern';
        this.Box.append(this.pattern);
        drawPoints(this.Box); //to add circles;
        //add children to phone
        this.phone.append(...['Pin', 'Box', 'Control'].map(i=>this[i]));
        ['Redraw', 'Animate', 'Save', 'Delete']
            .forEach(e=>this.Control.appendChild(this[e]).textContent=e[0]);
        this.gallery.append(this.phone); this.event();
    }
    event(){
        //for drawing by Pin
        //setting the Pin for the pattern to copy;
        this.Pin.onbeforeinput=()=>{
            if(!event.data)return;
            if(event.data.length>1)return event.preventDefault();
            event.preventDefault();
            // console.log(event.data)
            let d = event.data;
            if(isNaN(d)||d>8||this.path.includes(d)) return;
            this.Pin.value+=d; this.allPoints=this.pathh;
            this.Redraw.clicked=false;
        }
        this.Pin.oninput=()=>{
            if(!event.data||event.data.length>1) this.allPoints=this.pathh
        }
        //for drawing by click (improve later)
        this.Box.onclick=()=>{
            // console.log(event)
            let p = event.target, i = this.cindex(p);
            if (!this.circles.includes(event.target)||this.Pin.value.includes(`${i}`)) return;
            this.Pin.value+=i;
            this.Pin.onbeforeinput({data: i, preventDefault: ()=>{}});
            this.Pin.oninput({data: i, preventDefault: ()=>{}});
        }
        this.Box.ondblclick=()=>{
            // console.log(event)
            let p = event.target, i = this.cindex(p);
            if (!this.circles.includes(event.target)||!this.Pin.value.includes(`${i}`)) return;
            this.Pin.value = [...this.Pin.value].filter(v=>v!=i).join('');
            this.Pin.onbeforeinput({data: i, preventDefault: ()=>{}});
            this.Pin.oninput({data: i, preventDefault: ()=>{}});
        }
        //for working on the drawn pattern
        //for clearing
        this.Redraw.onclick=()=>{
            let b = this.Redraw
                , toCutThingsShort = (what)=>{
                what.Box.style.filter='';
                what.allPoints=what.pathh;
                setTimeout(()=>{
                    b.disabled=0;
                    if(this.shouldanimate){
                        this.animation();
                        b.clicked=false;
                    }
                    this.shouldanimate=false;
                }, 700)
            };
            b.disabled=1;
            if (b.clicked) {
                b.clicked = false;
                this.Box.style.filter='blur(20px)'
                setTimeout(()=>{
                    this.Pin.value=b.hold;
                    toCutThingsShort(this);
                }, 500);
            }else{
                b.clicked=true;
                b.hold = this.Pin.value; //save the Pin
                //and clear
                this.Box.style.filter='blur(20px)';
                setTimeout(()=>{
                    this.Pin.value='';
                    toCutThingsShort(this);
                }, 500)
                // this.Pin.value = '';
            }
        }
        //for animation
        this.Animate.onclick=()=>{
            if(this.pathh.length<2) return;
            this.Animate.disabled=1;
            this.Redraw.clicked=false;
            this.shouldanimate=true;
            this.pathhold = this.pathh;
            this.Redraw.click();
        }
        this.animation=()=>{
            let i=0, anim = setInterval(()=>{
                this.Pin.value+=this.pathhold[i++];
                this.allPoints=this.pathh;
                if (i>=this.pathhold.length) {
                    clearInterval(anim);
                    this.Animate.disabled=0;
                    this.pathhold.length=0;
                }
            }, 200)
        }
        //for saving
        this.Save.onclick=()=>{
            if (!confirm('Are you sure you want to save?')) return
            this.Save.disabled=1;
            fetch('pattern.css').then(resp=>{
                let styleText = resp.text().then(text=>{
                    let a = make('a');
                    a.download = 'pattern'+this.Pin.value+'.svg';
                    a.href = URL.createObjectURL(new Blob([
                        `<svg class='patternBox' viewbox='0 0 240 240' version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        ${this.Box.innerHTML}
                        <style>
                        ${text}
                        </style>
                        </svg>`
                    ]))
                    a.click(); this.Save.disabled=0
                })
            }).catch(error=>{
                alert(error); this.Save.disabled=0
            })
        }
        //for deletion
        this.Delete.onclick=()=>confirm('Are you sure you want to remove this pattern?')&&this.delete();
        this.isDefault&&this.cut();
    }
    draw(){
        this.pattern.setAttribute('d', ''); let x;
        this.path.forEach((v, i)=>{
            let p = POINTS[v];
            this.pattern.setAttribute('d', this.pattern.getAttribute('d')+((i==0?'M':'L')+`${p.x} ${p.y}`));
            x=v;
        })
        // console.log(this.path);
        x&&this.blink(this.circles[x])
    }
    get pathh(){
        return this.Pin.value.split('').map(i=>i);
    }
    set pathh(v){
        this.path[v[0]]=v[1];
        this.Pin.value=this.path.join('');
        this.allPoints=this.pathh;
    }
    set floatingPoint(v){
        //rem (ha ha ha) this will have generate a "last added"
        // point from the x,y and will add it to the path
        //it will save the original path. only the "last added will change"
        // to be called onmousemove/onsomespecialcasesofonmouseover
        let lastPoint = POINTS[this.path[this.path.length-1]];
        this.pattern.setAttribute('d',
            this.hold+`L${lastPoint.x+v.x} ${lastPoint.y+v.y}`);
    }
    set morePoint(v){
        this.pathh = [this.path.length, v];
    }
    set allPoints(v){
        this.path.length=0; this.path=v; this.draw();
    }
    get allPoints(){
        return this.path;
    }
    get circles(){
        return [...this.Box.querySelectorAll('circle')];
    }
    cindex(c){
        return this.circles.indexOf(c);
    }
    blink(circle){
        circle.setAttribute('grow', '');
        setTimeout(()=>circle.removeAttribute('grow'), 100)        
    }
    cut(){
        this.Redraw.remove();
        this.Delete.remove();
        this.Pin.disabled = !(this.Box.ondblclick=this.Box.onclick=null)
    }
    delete(){
        delete (patterns.splice(patterns.indexOf(this), 1).length=0);
        this.Box.style.transitionDuration='1s';
        this.Box.style.filter='blur(300px)';
        setTimeout(()=>this.phone.remove(), 1000)
    }
}
const POINTS = [
    {x: 20, y: 20}, {x: 120, y: 20}, {x: 220, y: 20},
    {x: 20, y: 120}, {x: 120, y: 120}, {x: 220, y: 120},
    {x: 20, y: 220}, {x: 120, y: 220}, {x: 220, y: 220},
]
function drawPoints(on) {
    POINTS.forEach(p=>{
        let c = baseCircle.cloneNode(); c.removeAttribute('id');
        c.setAttribute('cx', p.x); c.setAttribute('cy', p.y);
        // c.setAttribute('fill', 'blue'); c.setAttribute('r', '5')
        on.append(c);
    })
    
}
let p = new Pattern;