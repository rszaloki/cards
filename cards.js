require(["RTree.js"],function(RTree){
    "use strict"

    var deck = {},
        deckLayout = new RTree(),
        portrait = { w:120, h:180, css:"portrait" },
        landscape = { w:180, h:120, css:"landscape" },
        deckView = document.getElementById('deck'),
        cardNumber = 0,
        css,
        canTransform,
        transformProp=['transform','webkitTransform','mozTransform'],
        deckRect=deckView.getBoundingClientRect(),
        deckWidth=deckRect.width,
        deckHeight=deckRect.height;


    // ugly extend from https://github.com/JSFixed/JSFixed/issues/16
    function extend(target) {
        Array.prototype.slice.call(arguments, 1).forEach(function(source) {
            Object.getOwnPropertyNames(source).forEach(function (name) {
                target[name] = source[name];
            });
        });
        return target;
    }

    // --- cross browser
    canTransform = transformProp.some(function(item){
        css = item;
        return deckView.style[css] !== undefined;
    });



    function generateId() {
        return [0,0,0,0].map(function(item){ return Math.floor(Math.random()*10000).toString(24)}).join('-');
    }

    function renderCard(card) {
        var cardE = document.createElement('li');
        cardE.id = card.id;
        cardE.innerHTML = '<b>'+card.title+'</b><button data-flip-id="'+card.id+'">flip</button>';
        refreshCardCss(card,cardE);
        deckView.appendChild(cardE);
    }

    function refreshCardCss(card, cardE) {
        cardE = cardE || document.getElementById(card.id);
        cardE.className = card.css;
        cardE.style.width=card.w+"px";
        cardE.style.height=card.h+"px";
    }


    function refreshCard(card) {
        var cardE = document.getElementById(card.id);
        if(canTransform) {
            cardE.style[css]="translate3d("+card.x+"px,"+card.y+"px,0)";
        } else {
            cardE.style.left = card.x+'px';
            cardE.style.top = card.y+'px';
        }

    }

    function createCard(x,y,type, title) {
        var id = "card_"+generateId(),
            card = extend({ x:x,
                            y:y,
                            id:id,
                            title:title
                        },type);

        deck[id] = card;

        // --- view
        renderCard(card);

        return card;
    }

    function addCard(card) {
        var removed = deckLayout.remove(card),
            current;
        deckLayout.insert(card,card);
        for( var i=0; i < removed.length; i++ ) {
            current = removed[i].leaf;
            moveCard(current,card);
            addCard(current);
        }


        // --- view
        refreshCard(card);
        updateDeckView(card);        
    }

    function updateCard(card) {
        var removed = deckLayout.remove(card,card);
        console.log("Removed "+removed.length);
        addCard(card);
        // --- view
        refreshCardCss(card);
        updateDeckView(card);
    }

    function moveCard(card, anchor) {
        var mx, my;

        if(card.y < anchor.y) {
            my = anchor.y - card.h -1;
        } else {
            my = anchor.y + anchor.h +1;
        }

        if(card.x < anchor.x) {
            mx = anchor.x - card.w -1;
        } else {
            mx = anchor.x + anchor.w +1;
        }

        if(Math.abs(card.x - mx) < Math.abs(card.y - my)) {
            card.x = Math.max(0,mx);
        } else {
            card.y = Math.max(0,my);
        }

        updateDeckView(card);


        console.log("Card: "+card.id+" moved to: "+card.x+":"+card.y);
    }

    function updateDeckView(card){
        deckWidth=Math.max(deckWidth,card.x+card.w+30);
        deckHeight=Math.max(deckHeight,card.y+card.h+30);
        deckView.style.width=deckWidth+'px';
        deckView.style.height=deckHeight+'px';        
    }


    deckView.addEventListener('click',function(e){
        if(e.target && e.target.nodeName === "BUTTON") {
            if(e.target.dataset.flipId) {
                var card=deck[e.target.dataset.flipId];
                if(card.css === "landscape") {
                    extend(card,portrait);
                } else {
                    extend(card,landscape);
                }
                updateCard(card);
            }
        } else if(e.currentTarget.id==='deck'){
            var type = landscape;
            addCard(createCard(Math.max(e.offsetX-Math.floor(type.w/2),0),Math.max(e.offsetY-Math.floor(type.h/2),0),type,"Card "+(++cardNumber)));
        }
    });

    document.getElementById('zoomlevel').addEventListener('change',function(e){
        if(canTransform) {
            deckView.style[css] = "scale("+this.value+")";
        }
    });

});