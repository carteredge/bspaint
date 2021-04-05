const UNDO_COUNT = 10;

class BSPaint {
    static colorNames = [
        "black", 
        "white", 
        "red", 
        "yellow", 
        "green", 
        "cyan", 
        "blue", 
        "magenta", 
        "transparent"
    ];
    
    static offCanvas = [
        "Let's try to keep it on the fucking canvas.",
        "Now look what you fucking did.",
        "You made a fucking mess is what you did.",
        "Stop it.",
        "Fucking stop.",
        "Seriously stop.",
        "Fucking seriously.",
        "WTF",
        "No.",
        "Fuck off.",
        "Go fuck yourself.",
        "Alright. You know what? Fuck it. Go fuckin' nuts."
    ];
    
    static toolNames = [
        "circle",
        "line",
        "pen",
        "rectangle"
    ];
    
    static toolPlurals = {
        "circle": "circles",
        "line": "lines",
        "pen": "squiggles",
        "rectangle": "boxes"
    }

    static isInBox(x, y, element) {
        const rect = element.getBoundingClientRect();
        return x > rect.left &&
            x < rect.right &&
            y > rect.top &&
            y < rect.bottom;
    }

    static isInToolBox(x, y) {
        return ["controlBox", "toolBox", "colorMenus", "smolMenus", "about"
            ].some(id => BSPaint.isInBox(x, y, document.getElementById(id)));
    }


    static randomInt(n) {
        return Math.floor(Math.random() * n);
    }    
    
    constructor(
            animationCanvas,
            canvas,
            canvasBox,
            smartAssery,
            allTheTools,
            fillColorButtons,
            lineColorButtons,
            toolBox) {
        this.allTheTools = allTheTools
        this.animationCanvas = animationCanvas;
        this.canvas = canvas;
        this.canvasBox = canvasBox;
        this.fillColor = fillColorButtons;
        this.lineColor = lineColorButtons;
        this.smartAssery = smartAssery;
        this.toolBox = toolBox;

        this.animation = undefined;
        this.currentMouse = {x: undefined, y: undefined};
        this.currentTool = "pen";
        this.fillColorName = "black";
        this.firstDraw = true;
        this.fuckIt = false;
        this.lastInBox = true;
        this.lineColorName = "black";
        this.mousedown = {x: undefined, y: undefined};
        this.noButtons = false;
        this.offCanvasCount = 0;
        this.penInterval = undefined;
        this.previousMouse = {x: undefined, y: undefined};
        this.startedInBox = true;
        this.undoings = [];
        this.undids = [];

        this.resizeCanvas();

        this.animateDrawing = this.animateDrawing.bind(this);
        this.draw = this.draw.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.penDraw = this.penDraw.bind(this);
        this.resizeCanvas = this.resizeCanvas.bind(this);
        this.useTool = this.useTool.bind(this);

        document.addEventListener("mousedown", this.draw);
        document.addEventListener("mouseup", this.draw);
        document.addEventListener("mousemove", (event) => {
            this.currentMouse = this.convertCoordinates(event.clientX, event.clientY);
        });
        document.addEventListener("touchstart", this.draw);
        document.addEventListener("touchend", this.draw);
        document.addEventListener("touchmove", (event) =>
            this.currentMouse = this.convertCoordinates(event.touches?.[0]?.clientX, event.touches?.[0]?.clientY));


        document.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("resize", this.resizeCanvas);
    }
    
    set allTheTools(e) {
        if (typeof e === "string")
            e = document.getElementById(e);
        this._allTheTools = e;
    }

    get allTheTools() {
        return this._allTheTools;
    }

    set animationCanvas(c) {
        if (typeof c === "string")
            c = document.getElementById(c);
        this._animationCanvas = c;
        this.animationCanvasContext = c?.getContext("2d");
		if (this.animationCanvasContext)
            this.animationCanvasContext.lineWidth = 2;
    }

    get animationCanvas() {
        return this._animationCanvas;
    }

    set animationCanvasContext(c) {
        this._animationCanvasContext = c;
        this._animationCanvasContext.lineWidth = 2;
    }

    get animationCanvasContext() {
        if (!this._animationCanvasContext) {
            this._animationCanvasContext = this.animationCanvas.getContext("2d");
            this._animationCanvasContext.lineWidth = 2;
        }
        return this._animationCanvasContext;
    }

    set canvasBox(e) {
        if (typeof e === "string")
            e = document.getElementById(e);
        this._canvasBox = e;
    }

    get canvasBox() {
        return this._canvasBox;
    }

    set canvas(c) {
        if (typeof c === "string")
            c = document.getElementById(c);
        this._canvas = c;
        this.canvasContext = c?.getContext("2d");
		if (this.canvasContext)
            this.canvasContext.lineWidth = 2;
    }

    get canvas() {
        return this._canvas;
    }

    set canvasContext(c) {
        this._canvasContext = c;
        this._canvasContext.lineWidth = 2;
    }

    get canvasContext() {
        if (!this._canvasContext) {
            this._canvasContext = this.canvas.getContext("2d");
            this._canvasContext.lineWidth = 2;
        }
        return this._canvasContext;
    }

    set fillColor(e) {
        if (typeof e === "string")
            e = document.getElementById(e);
        this._fillColor = e;
    }

    get fillColor() {
        return this._fillColor;
    }

    set lineColor(e) {
        if (typeof e === "string")
            e = document.getElementById(e);
        this._lineColor = e;
    }

    get lineColor() {
        return this._lineColor;
    }

    set smartAssery(ass) {
        if (typeof ass === "string")
            ass = document.getElementById(ass);
        this._smartAssery = ass;
    }

    get smartAssery() {
        return this._smartAssery;
    }

    set toolBox(e) {
        if (typeof e === "string")
            e = document.getElementById(e);
        this._toolBox = e;
    }

    get toolBox() {
        return this._toolBox;
    }

    animateDrawing() {
        this.animationCanvasContext.clearRect(0, 0,
            this.animationCanvas.width, this.animationCanvas.height);
        if (this.currentTool !== "pen")
            this.useTool(
                this.currentTool,
                this.animationCanvasContext,
                this.mousedown.x,
                this.mousedown.y,
                this.currentMouse.x,
                this.currentMouse.y);
    }

    clearCanvas(diddle) {
        if (diddle === undefined || diddle) {
            if (this.noButtons) {
                this.smartAssery.innerText = "You think you're so fuckin' smart trying to use the keyboard or some shit.";
            } else if (this.fuckIt) {
                this.smartAssery.innerText = "You want buttons? Maybe you should have fucking listened to me.";
                this.noButtons = true;
            } else {
                this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.did();
                this.smartAssery.innerText = "Starting fresh. Fuck the whole thing.";
            }
        } else this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.closeMenus();
    }

    closeMenus() {
        document.querySelectorAll(".hideWhenSmol").forEach(e => e.classList.remove("visible"));
    }
    
    convertCoordinates(x, y, element) {
        element = element || this.canvas;
        const rect = element.getBoundingClientRect();
        return {
            x: x - rect.left,
            y: y - rect.top
        }
    }
    
    did() {
        this.undids = []
        this.undoings.push(this.canvasContext.getImageData(0, 0, this.canvas.width, this.canvas.height));
        this.undoings = this.undoings.slice(Math.max(this.undoings.length - UNDO_COUNT, 0));
        if (!this.fuckIt && !this.startedInBox && this.offCanvasCount < BSPaint.offCanvas.length) {
            this.smartAssery.innerText = BSPaint.offCanvas[this.offCanvasCount];
            this.offCanvasCount++;
            if (this.offCanvasCount === BSPaint.offCanvas.length) {
                this.fuckIt = true;
                this.canvas.style.pointerEvents = "auto";
                document.querySelectorAll("canvas").forEach(e => e.classList.add("fucked"));
            }
        } else if (!this.fuckIt && this.lineColorName === "transparent" && this.fillColorName === "transparent") {
            this.smartAssery.innerText = "See? There's nothing there. What did I fucking tell you?";
        } else if (this.fuckIt && 
                BSPaint.isInToolBox(this.mousedown.x, this.mousedown.y) && 
                BSPaint.isInToolBox(this.currentMouse.x, this.currentMouse.y)) {
            if (this.noButtons) {
                switch(BSPaint.randomInt(2)) {
                    case 0:
                        let randomColor = BSPaint.colorNames[BSPaint.randomInt(BSPaint.colorNames.length)];
                        if (this.lineColorName === randomColor && this.fillColorName === randomColor)
                            this.smartAssery.innerText = "Nope.";
                        else {
                            this.smartAssery.innerText = "Guess what?  Everything's fucking " + randomColor + " now.";
                            this.setAllColors(randomColor);
                        }
                        break;
                    case 1:
                        const randomTool = BSPaint.toolNames[BSPaint.randomInt(BSPaint.toolNames.length)];
                        if (this.currentTool === randomTool)
                            this.smartAssery.innerText = "Fuck off.";
                        else {
                            this.currentTool = randomTool;
                            [...this.toolBox.getElementsByTagName("button")]
                                    .forEach((button) => {
                                button.classList.remove("active")});
                            document.getElementById(this.currentTool).classList.add("active");
                            this.smartAssery.innerText = "I hope you like fucking " + 
                                BSPaint.toolPlurals[this.currentTool] + ".";
                        }
                        break;
                }
            } else {
                this.smartAssery.innerText = "You want buttons? Maybe you should have fucking listened to me.";
                this.noButtons = true;
            }
        } else if (!this.fuckIt && !this.lastInBox) {
            if (this.offCanvasCount > 3)
            this.smartAssery.innerText = "Thank fuck.";
            else this.smartAssery.innerText = "That's better.";
            this.offCanvasCount = Math.max(this.offCanvasCount - 1, 0);
        } else if (this.firstDraw || this.undoings.length === 1) {
            this.smartAssery.innerText = "Good job. You drew some shit" + (this.firstDraw ? "." : " again.");
            this.firstDraw = false;
        } else if (this.noButtons)
            this.smartAssery.innerText = "There. There's your fucking " + this.currentTool + ".";
        else switch(this.currentTool) {
            case "circle":
                this.smartAssery.innerText = "That's a fine fuckin' circle there.";
                break;
            case "line":
                this.smartAssery.innerText = "A line.  How fucking interesting.";
                break;
            case "pen":
                this.smartAssery.innerText = "Scribbling all over the fucking place.";
                break;
            case "rectangle":
                this.smartAssery.innerText = "So fuckin' boxy.";
                break;
        }
        this.lastInBox = this.startedInBox;
    }

    draw(event) {
        let x, y;
        switch (event.type) {
            case "mousedown":
            case "mouseup":
                x = event.clientX;
                y = event.clientY;
                break;
            case "touchstart":
                x = event.touches?.[0]?.clientX;
                y = event.touches?.[0]?.clientY;
                break;
            case "touchend":
                x = this.currentMouse.x;
                y = this.currentMouse.y;
                break;
        }
        if (event.type === "mousedown" || event.type === "touchstart") {
            if (!BSPaint.isInToolBox(x, y) || this.fuckIt) {
                this.mousedown = {x, y};
                clearInterval(this.animation);
                this.animation = setInterval(this.animateDrawing, 50);
                if (this.currentTool === "pen") {
                    this.previousMouse = {x, y};
                    this.currentMouse = {x, y};
                    clearInterval(this.penInterval);
                    this.penInterval = setInterval(this.penDraw, 10);
                }
                else if(this.penInterval) {
                    clearInterval(this.penInterval);
                    this.penInterval = undefined;
                }
                this.startedInBox = BSPaint.isInBox(this.mousedown.x, this.mousedown.y, this.canvasBox);
            } else {
                this.mousedown = {x: undefined, y: undefined};
            }
        } else {
            clearInterval(this.animation);
            this.animationCanvasContext.clearRect(0, 0, this.animationCanvas.width, this.animationCanvas.height);
            if (this.mousedown.x !== undefined) {
                if (!this.fuckIt || 
                        !this.noButtons ||
                        !BSPaint.isInToolBox(this.mousedown.x, this.mousedown.y) ||
                        !BSPaint.isInToolBox(x, y) ||
                        Math.random() < 0.75) {
                    this.useTool(this.currentTool, this.canvasContext, this.mousedown.x, this.mousedown.y, x, y);
                    this.did();
                } else {
                    clearInterval(this.penInterval);
                    this.penInterval = undefined;
                    this.undo(true);
                }
            }
        }
        event.stopPropagation();
    }

    eraseOutsideBox(context) {
        // TODO: getBoundingClientRect()
        context.clearRect(0, 0, this.canvasBox.offsetLeft, this.canvas.height);
        context.clearRect(0, 0, this.canvas.width, this.canvasBox.offsetTop);
        context.clearRect(this.canvasBox.offsetLeft + this.canvasBox.offsetWidth, 0, 
            this.canvas.width - (this.canvasBox.offsetLeft + this.canvasBox.offsetWidth), this.canvas.height);
        context.clearRect(0, this.canvasBox.offsetTop + this.canvasBox.offsetHeight, this.canvas.width,
            this.canvas.height - (this.canvasBox.offsetTop + this.canvasBox.offsetHeight));
    }

    handleKeyDown(event) {
        if (event.keyCode == 90 && event.ctrlKey)
            if (event.shiftKey)
                this.redo();
            else this.undo();
        else if (event.keyCode == 89 && event.ctrlKey)
            this.redo();
    }

    penDraw() {
        this.useTool(
            "line", 
            this.canvasContext, 
            this.previousMouse.x, 
            this.previousMouse.y, 
            this.currentMouse.x, 
            this.currentMouse.y);
        this.previousMouse = {
            x: this.currentMouse.x,
            y: this.currentMouse.y
        };
    }

    redo() {
        if (this.noButtons) {
            this.smartAssery.innerText = "You think you're so fuckin' smart trying to use the keyboard or some shit.";
        } else if (this.fuckIt) {
            this.smartAssery.innerText = "You want buttons? Maybe you should have fucking listened to me.";
            this.noButtons = true;
        } else {
            if(this.undids.length) {
                const imageData = this.undids.pop();
                this.canvasContext.putImageData(imageData, 0, 0);
                this.undoings.push(imageData);
                this.smartAssery.innerText = "I guess we should put that back.";
            } else this.smartAssery.innerText = "There's nothing left to redoodle.";
        }
    }

    resizeCanvas() {
        this.canvas.height = window.innerHeight;
        this.canvas.width = window.innerWidth;
        this.animationCanvas.height = window.innerHeight;
        this.animationCanvas.width = window.innerWidth;
        this.animationCanvasContext.lineWidth = 2;
        this.canvasContext.lineWidth = 2;

        if (this.undoings.length)
        this.canvasContext.putImageData(this.undoings[this.undoings.length - 1], 0, 0);
        this.eraseOutsideBox(this.canvasContext);
    }
    
    setAllColors(colorName) {
        const fillButton = this.fillColor.querySelector("button[key='" + colorName + "']");
        const lineButton = this.lineColor.querySelector("button[key='" + colorName + "']");
        this.fillColorName = colorName;
        this.lineColorName = colorName;
        [...this.fillColor.getElementsByTagName("button")].forEach((button) => {
            button.classList.remove("active");
        });
        [...this.lineColor.getElementsByTagName("button")].forEach((button) => {
            button.classList.remove("active");
        });
        fillButton.classList.add("active");
        lineButton.classList.add("active");
        const color = fillButton.style.backgroundColor;
        this.canvasContext.fillStyle = color;
        this.canvasContext.strokeStyle = color;
        this.animationCanvasContext.fillStyle = color;
        this.animationCanvasContext.strokeStyle = color;
    }
    
    setFillColor(color, colorName) {
        if (this.noButtons) {
            this.smartAssery.innerText = "You think you're so fuckin' smart trying to use the keyboard or some shit.";
        } else if (this.fuckIt) {
            this.smartAssery.innerText = "You want buttons? Maybe you should have fucking listened to me.";
            this.noButtons = true;
        } else {
            this.canvasContext.fillStyle = color;
            this.animationCanvasContext.fillStyle = color;
            [...this.fillColor.getElementsByTagName("button")]
                    .forEach((button) => {
                if (button.style.backgroundColor === color)
                    button.classList.add("active");
                else
                    button.classList.remove("active");
            });
            
            this.fillColorName = colorName;
            if (this.fillColorName === this.lineColorName) {
                if (this.fillColorName === "transparent")
                    this.smartAssery.innerText = "If you make everything transparent, you can't draw anything, dumbass.";
                else this.smartAssery.innerText = "You must really fucking like " + colorName;
            } else this.smartAssery.innerText = "Ah, yiss. Let's make some shit " + colorName + " now.";
        }
    }

    setLineColor(color, colorName) {
        if (this.noButtons) {
            this.smartAssery.innerText = "You think you're so fuckin' smart trying to use the keyboard or some shit.";
        } else if (this.fuckIt) {
            this.smartAssery.innerText = "You want buttons? Maybe you should have fucking listened to me.";
            this.noButtons = true;
        } else {
            this.canvasContext.strokeStyle = color;
            this.animationCanvasContext.strokeStyle = color;
            [...this.lineColor.getElementsByTagName("button")]
                    .forEach((button) => {
                if (button.style.backgroundColor === color)
                    button.classList.add("active");
                else
                    button.classList.remove("active");
            });
            this.lineColorName = colorName;
            if (this.fillColorName === this.lineColorName) {
                if (this.fillColorName === "transparent")
                    this.smartAssery.innerText = "If you make everything transparent, you can't draw anything, dumbass.";
                else this.smartAssery.innerText = "You must really fucking like " + colorName;
            } else this.smartAssery.innerText = "Ah, yiss. Let's make some shit " + colorName + " now.";
        }
    }

    setTool(toolChoice) {
        if (this.noButtons) {
            this.smartAssery.innerText = "You think you're so fuckin' smart trying to use the keyboard or some shit.";
        } else if (this.fuckIt) {
            this.smartAssery.innerText = "You want buttons? Maybe you should have fucking listened to me.";
            this.noButtons = true;
        } else {
            this.currentTool = toolChoice;
            [...this.toolBox.getElementsByTagName("button")]
                    .forEach((button) => {
                button.classList.remove("active")});
            document.getElementById(this.currentTool).classList.add("active");
            
            switch(toolChoice) {
                case "circle":
                    this.smartAssery.innerText = "Doodlin' some bubbly bois.";
                    break;
                case "line":
                    this.smartAssery.innerText = "Gonna make some boring-ass straight lines now.";
                    break;
                case "rectangle":
                    this.smartAssery.innerText = "Gonna think inside the box.";
                    break;
                case "pen":
                    this.smartAssery.innerText = "Going fuckin' freestyle.";
                    break;
            }
        }
        this.closeMenus();
    }
    
    toggle(...ids) {
        if (this.noButtons) {
            this.smartAssery.innerText = "You think you're so fuckin' smart trying to use the keyboard or some shit.";
            this.closeMenus();
        } else if (this.fuckIt) {
            this.smartAssery.innerText = "You want buttons? Maybe you should have fucking listened to me.";
            this.noButtons = true;
            this.closeMenus();
        } else {
            for (let id of ids)
                document.getElementById(id)?.classList.toggle("visible");
        }
    }

    undo(force) {
        if (this.noButtons && !force) {
            this.smartAssery.innerText = "You think you're so fuckin' smart trying to use the keyboard or some shit.";
        } else if (this.fuckIt && !force) {
            this.smartAssery.innerText = "You want buttons? Maybe you should have fucking listened to me.";
            this.noButtons = true;
        } else {
            if (this.undoings.length) {
                this.undids.push(this.undoings.pop());
                if (this.noButtons)
                    this.smartAssery.innerText = "I hope you wanted me to undoodle because that's what I fucking diddled.";
                else this.smartAssery.innerText = "Yeah, you're right. That was kinda shitty.";
            } else this.smartAssery.innerText = "There's nothing else to undoodle. Settle the fuck down.";
            if (this.undoings.length)
                this.canvasContext.putImageData(this.undoings[this.undoings.length - 1], 0, 0);
            else this.clearCanvas(false);
        }
    }

    useTool(tool, context, xStart, yStart, xEnd, yEnd) {
        switch(tool) {
            case "circle":
                context.beginPath();
                context.arc(xStart, yStart, Math.sqrt((xEnd - xStart) ** 2 + (yEnd - yStart) ** 2), 0, 2 * Math.PI);
                context.fill();
                context.stroke();
                break;
            case "line":
                context.beginPath();
                context.moveTo(xStart, yStart);
                context.lineTo(xEnd, yEnd);
                context.stroke();
                break;
            case "rectangle":
                context.fillRect(xStart, yStart, xEnd - xStart, yEnd - yStart);
                context.strokeRect(xStart, yStart, xEnd - xStart, yEnd - yStart);
                break;
            case "pen":
            default:
                clearInterval(this.penInterval);
                break;
        }
        if (this.startedInBox && !this.fuckIt)
            this.eraseOutsideBox(context);
    }    
}

var bspaint;
window.onload = () => {
    bspaint = new BSPaint(
        "animationCanvas",
        "canvas",
        "canvasBox",
        "smartAssery",
        "allTheTools",
        "fillColor",
        "lineColor",
        "toolBox");
    console.log("Whatchya lookin' at the fuckin' console for?")
}