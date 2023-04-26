//SUCCESS CASES
//randomize objects when adding them

class solarSystem{
  //takes an array of interstellar bodies as input
  constructor(G,c,rocket, target, interstellarBodies){
    this.G=G;
    this.c=c;
    this.rocket=rocket;
    this.target=target;
    this.bodies=interstellarBodies;
    //this.bodies=this.bodies.push(rocket);
    //this.bodies=this.bodies.push(target);
  }

  addInterstellarBody(interstellarBody){
    if (interstellarBody){  //checks if the interstellarbody exists
      this.bodies.push(interstellarBody);
    }
    
  }

  //updates velocities of rocket, stars, clouds, and planets in the solar system. Returns null.
  //use to just act on this.bodies on the for loop
  updateVelocitys(){   
    let tempbodies;
    tempbodies = this.bodies.concat([this.rocket,this.target])
    tempbodies.forEach(mover => {                                                                                               //for all bodies
      if ((mover instanceof rocket)||(mover instanceof star) || (mover instanceof cloud)|| (mover instanceof planet)){      // if type is of type mover
        tempbodies.forEach(mass =>{                                                                                             // for all bodies with mass
          if (((mass instanceof blackhole)||(mass instanceof star) || (mass instanceof planet)) && !(mass===mover)){                             //calculate a and add it to the velocity
            let n;
            let r;
            let a;
            let newvelocityx;
            let newvelocityy;
            //n=mass.position.sub(mover.position);
            n = p5.Vector.sub(mass.position, mover.position)
            r=n.mag();
            n=n.div(r**3);                                                                                                  // n is the vector divided by 3 times its magnitude giving rhat/r^2
            
            a=n.mult(this.G*mass.mass);
            //mover.velocity=p5.Vector.add(mover.velocity,a);
            newvelocityx=mover.velocity.x+a.x;
            newvelocityy=mover.velocity.y-a.y;
            if(newvelocityx**2+newvelocityy**2<this.c**2){
              mover.velocity.x=mover.velocity.x+a.x;
              mover.velocity.y=mover.velocity.y-a.y;
            }
          }
        })
      }
      });

  }
  //updates position of rocket, stars, clouds, planets, and solarFlares
  updatePositions(){
    let tempbodies;
    tempbodies = this.bodies.concat([this.rocket,this.target])
    tempbodies.forEach(mover => {
      if ((mover instanceof rocket)||(mover instanceof star) || (mover instanceof cloud)|| (mover instanceof planet) || (mover instanceof solarFlare)){
        //mover.position = p5.Vector.add(mover.position,mover.velocity);
        mover.position.x=mover.position.x+mover.velocity.x
        //Y coordinate system points downwards
        mover.position.y=mover.position.y-mover.velocity.y
      }
    });
  }

  simulateStars(){
    this.bodies.forEach(sun => {
      if (sun instanceof star) {
        this.addInterstellarBody(sun.emitFlare())
      }
    });
  }

  simulateClouds(){
    this.bodies.forEach(dustcloud => {
      if (dustcloud instanceof cloud) {
        if (dustcloud.collision(this.rocket)){
          this.rocket.health-=dustcloud.damage(this.rocket);
        }
      }
    });

  }

  simulateSolarFlares(){
    this.bodies.forEach(flare => {
      if (flare instanceof solarFlare) {
        if (flare.collision(this.rocket)){
          this.rocket.reduceHealth(flare.damage())
        }
      }
    });
  }

  simulateCollisions(){
    //Rocket Case with resets
    let tempbodies;
    let tempindex
    tempbodies = this.bodies.concat([this.target])
    tempbodies.forEach(mass => {
      if ((mass instanceof blackhole)||(mass instanceof star)){
        if(mass.collision(this.rocket)){
          //change status to failure crash landing
          changeStatus("Crash Landing... Preparing to Launch")
          Reset()
        }
        
        
        /*
        tempbodies.forEach(mover => {
          if (((mass instanceof star)||(mass instanceof cloud))&&!(mass===mover)){
            if(mass.collision(mover)){
              tempindex=this.bodies.indexOf(mass)
              this.bodies.splice(tempindex,tempindex+1)
            }
          }
        })
        */
        
      }
    });

    //everything else just update radius of blackhole and remove the object

    //Sun Case with gammaburst make a function for this
  }

  simulatePlanet(){
    this.target.updateTimer(this.rocket)
  }

  simulateAll(){
    this.simulateCollisions();
    this.simulateStars();
    this.simulateClouds();
    this.simulateSolarFlares();

  }

  isDamaged(){
    return (this.rocket.health<=0)
  }
}

class interstellarBody{
  constructor(width,height,radius=1){
    this.position=createVector(width,height);
    this.radius=radius;
  }
  //returns boolean true or false based on if object has collided with interstellarBody
  collision(object){
    return (this.position.dist(object.position)<this.radius)
  }
}

class rocket extends interstellarBody{
  //takes an array of interstellar bodies as input
  constructor(width,height,radius,speedx,speedy,initialfuel=10, initialhealth=1000){
    super(width,height,radius);
    this.velocity=createVector(speedx,speedy);
    this.fuel=initialfuel;
    this.health=initialhealth;
  }
  accelerateRocket(){
    if(this.fuel>0){
      this.velocity=p5.Vector.add(this.velocity,p5.Vector.normalize(this.velocity));
      this.fuel-=1
    }
    
  }
  deccelerateRocket(){
    if(this.fuel>0){
      this.velocity=p5.Vector.sub(this.velocity,p5.Vector.normalize(this.velocity));
      this.fuel-=1
    }
  }
  reduceHealth(damage){
    this.health-=damage
  }
}

class blackhole extends interstellarBody {
  constructor(width,height,radius,mass){
    super(width,height,radius);
    this.mass=mass;
  }
}

class star extends interstellarBody {
  constructor(width,height,radius,speedx,speedy,mass){
    super(width,height,radius);
    this.velocity=createVector(speedx,speedy);
    this.mass=mass;
    this.probability=0.1
  }
  //returns a solar flare object to be pushed to solar system interstellar body list with a certain probability
  emitFlare(){
    let output;
    let rand1;
    let rand2;
    let rand3;
    let v;
    output=null
    rand1=Math.random();
    if (rand1<this.probability){
      rand2=2*Math.random();
      rand3=360*Math.random();
      v=createVector(5,0);
      v.rotate(rand3);
      output = new solarFlare(this.position.x,this.position.y,radius=50,speedx=v.x,speedy=v.y,rand2);
    }
    return output
    


  }
}

class planet extends interstellarBody {
  constructor(width,height,radius,speedx,speedy,mass){
    super(width,height,radius);
    this.velocity=createVector(speedx,speedy);
    this.mass=mass;
    this.time=0;
  }
  updateTimer(rocket){
    if (this.position.dist(rocket.position)<2*this.radius){
      this.time+=1
    }else{
      this.time=0
    }
  }
  successCheck(){
    return (this.time>=5)
  }
}

class solarFlare extends interstellarBody{
  constructor(width,height,radius,speedx,speedy,energy){
    super(width,height,radius);
    this.velocity=createVector(speedx,speedy);
    this.energy=energy;
  }
  damage(){
    return this.energy
  }
}

class cloud extends interstellarBody {
  constructor(width,height,radius,speedx,speedy,damageParameter){
    super(width,height,radius)
    this.velocity=createVector(speedx,speedy);
    this.damageParameter=damageParameter;
  }
  //returns relative-velocity dependent damage done to  
  damage(object){
    return this.damageParameter*this.velocity.dist(object.velocity)
  }
}


function preload(){
  //loading images
  rocketimg = loadImage('rocketimg.png');
  earthimg = loadImage('earthimg.png');
  //cloudimg = loadImage('cloudimg.png');
  cloudimg = loadImage('cloudimg2.png');
  flareimg = loadImage('flareimg.png');
}

function setup() {
  windowW = 2*1080;
  windowH = 2*600;
  createCanvas(windowW, windowH);
  noStroke();
  imageMode(CENTER);
  angleMode(DEGREES);
  textSize(16);
  
  rocketimgsize=100

  paused=true
  reset=true
  Status="Prepared to Launch"

  Reset();
  
}

function draw() {
  background(240, 240, 240);
  renderLabels()
  if (!paused){
    System.simulateAll();
    if(frameCount % 60 == 0){
      System.simulatePlanet()
      if(System.target.successCheck()){
        Status="Successfully in Orbit"
      }
    }
    if (System.isDamaged()){
      Status="Rocket Damaged... Preparing to Launch"
      Reset()
    }
    System.updateVelocitys();
    System.updatePositions();
    renderSystem();
  } else {
    updateInitialSliders();
    if (reset){
      Reset();
      reset=!reset
    }
    renderSystem();
  }
  
}

//RENDERING FUNCTIONS

function renderSystem(){
  renderRocket();
  renderTarget();
  System.bodies.forEach(body => {
    if (body instanceof star){
      renderStar(body);
    }
    if (body instanceof cloud){
      renderCloud(body);
    }
    if (body instanceof blackhole){
      renderBlackhole(body);
    }
    if (body instanceof solarFlare){
      renderSolarFlare(body);
    }
  });
}

function renderRocket(){
  temp_position=System.rocket.position
  temp_velocity=System.rocket.velocity
  temp_radius=System.rocket.radius
  rocketAngle=atan(temp_velocity.y/temp_velocity.x)
  
  if(temp_velocity.x<0){
    rocketAngle=atan(temp_velocity.y/temp_velocity.x)+180
  }else{
    rocketAngle=atan(temp_velocity.y/temp_velocity.x)
  }
  translate(temp_position.x,temp_position.y);
  rotate(-rocketAngle);
  image(rocketimg, 0, 0, rocketimgsize,rocketimgsize);
  rotate(rocketAngle);
  translate(-temp_position.x,-temp_position.y);
}

function renderTarget(){
  temp_position=System.target.position
  image(earthimg, temp_position.x, temp_position.y, System.target.radius,System.target.radius);
}

function renderStar(sun){
  temp_position=sun.position
  fill(255,0,0);
  ellipse(temp_position.x, temp_position.y, sun.radius,sun.radius);
  //image(sunimg, temp_position.x, temp_position.y, rocketimgsize,rocketimgsize);
}

function renderCloud(cloud){
  //make size dependent on cloud size
  temp_position=cloud.position
  image(cloudimg, temp_position.x, temp_position.y, 2*cloud.radius,2*cloud.radius);
}

function renderBlackhole(hole){
  temp_position=hole.position
  fill(0);
  ellipse(temp_position.x, temp_position.y, hole.radius,hole.radius);
}

function renderSolarFlare(flare){
  temp_position=flare.position
  temp_velocity=flare.velocity
  if(temp_velocity.x<0){
    temp_angle=atan(temp_velocity.y/temp_velocity.x)+180
  }else{
    temp_angle=atan(temp_velocity.y/temp_velocity.x)
  }
  translate(temp_position.x,temp_position.y);
  rotate(-temp_angle);
  image(flareimg, 0, 0, rocketimgsize,rocketimgsize);
  rotate(temp_angle);
  translate(-temp_position.x,-temp_position.y);
}

function Reset(){
  G=30
  c=10
  initialTarget = new planet(windowW-500,200,radius=50,speedx=-1.5,speedy=0,mass=10);
  initialRocket = new rocket(100,windowH-100,radius=100,1,1,initialfuel=10, initialhealth=1000);
  initialBlackhole = new blackhole(windowW-500,450,25,25);
  System = new solarSystem(G,c,initialRocket, initialTarget, [initialBlackhole]);
  addStatus=0       //this is used to tell the program which interstellar body to add during set up 0 means nothing, 1 means sun, 2 means cloud, 3 means blackhole
  setSlidersButtons();
  paused=true
}


//SETTING UP BUTTONS AND SLIDERS
function setSlidersButtons(){
    // Reset Button
    buttonR = createButton('Reset');
    buttonR.position(0, windowH - 30)
    buttonR.mousePressed(Reset);
  
    // Initializing the Rocket Angle
    sliderA = createSlider(0, 90, 45);
    sliderA.position(100, windowH - 30);
    
    // Initializing the Rocket Initial Velocity
    sliderV = createSlider(0, 5, 1);
    sliderV.position(270, windowH - 30);
  
    //Creating button to play and pause the game
    buttonA = createButton('Accelerate');
    buttonA.position(420, windowH - 30);
    buttonA.mousePressed(Accelerate);
  
    //Creating button to play and pause the game
    buttonD = createButton('Deccelerate');
    buttonD.position(500, windowH - 30);
    buttonD.mousePressed(Deccelerate);
  
    //Creating button to play and pause the game
    buttonT = createButton('Takeoff');
    buttonT.position(590, windowH - 30);
    buttonT.mousePressed(Takeoff);

    //Creating button to toggle add sun
    buttonS = createButton('Add Sun');
    buttonS.position(650, windowH - 30)
    buttonS.mousePressed(function() { changeAddStatus(1);});

    

    //Creating button to toggle add cloud
    buttonC = createButton('Add Cloud');
    buttonC.position(720, windowH - 30)
    buttonC.mousePressed(function() { changeAddStatus(2);});

    //Creating button to toggle add blackhole
    buttonB = createButton('Add Blackhole')
    buttonB.position(800, windowH - 30)
    buttonB.mousePressed(function() { changeAddStatus(3);});
    
    // Creating Gravitational Constant Slider
    sliderG = createSlider(0, 50, 30);
    sliderG.position(windowW-200, windowH - 30);
    
    
    // Creating speed of light slider
    sliderC = createSlider(1, 25, 10);
    sliderC.position(windowW-370, windowH - 30);
}


//HELPER FUNCTIONS

//THIS HAS BOUNDS ON MOUSECLICKED
//STILL NEED TO FILL IN RADIUS AND STUFF
//ADD NOTE IN WRITE UP ABOUT MAKING PROBABILISITIC RADIUS AND MASS
function mouseClicked() {
  let rand1;
  let rand2;
  rand1=2*Math.random();
  rand2=2*Math.random();
  if (mouseX > 60 && mouseX < windowW - 60 && mouseY > 60 && mouseY < windowH - 60){
    if(addStatus==1){
      tempbody = new star(mouseX,mouseY,radius=25,rand1,rand2,mass=10)
      System.addInterstellarBody(tempbody);
    }
    if(addStatus==2){
      tempbody = new cloud(mouseX,mouseY,radius=150,rand1,rand2,damageParameter=0.5)
      System.addInterstellarBody(tempbody);
    }
    if(addStatus==3){
      tempbody = new blackhole(mouseX,mouseY,radius=25,mass=20)
      System.addInterstellarBody(tempbody);
    }
  }
}

function changeAddStatus(num){
  addStatus=num;
}

function Accelerate(){
  System.rocket.accelerateRocket();
}

function Deccelerate(){
  System.rocket.deccelerateRocket();
}

function Takeoff(){
  paused =!paused
  if (!(paused)){
    changeStatus("In Flight")
  }else{
    changeStatus("Paused")
  }
}

function updateInitialSliders(){
  //update rocket velocity and angle
  temp_velocity=sliderV.value();
  temp_angle=sliderA.value();
  //console.log(temp_velocity)
  //console.log(temp_angle)
  //console.log(sin(temp_angle));
  System.rocket.velocity.x = temp_velocity * cos(temp_angle);
  System.rocket.velocity.y = temp_velocity * sin(temp_angle);
  System.G = sliderG.value();
  System.c = sliderC.value();
}

function renderLabels(){
  //Displaying values and labels for Rocket initial angle and velocity
  fill(0)
  textSize(16)
  if (paused){
    text("Initial Rocket Angle: " + String(sliderA.value()), 100, windowH - 40);
    text("Initial Rocket Speed: " +String(sliderV.value()), 270, windowH - 40);
  }else{
    text("Initial Rocket Angle", 100, windowH - 40);
    text("Initial Rocket Speed", 270, windowH - 40);
  }
  text("Gravitational Constant", windowW-200, windowH - 40);
  text("Light Speed", windowW-370, windowH - 40);

  textSize(24)
  text("Fuel: " + String(System.rocket.fuel), 950, windowH - 20);
  text("Damage: " + String(round(System.rocket.health)), 1050, windowH - 20);
  textSize(30)
  text("Status: " + Status, 100, 100);
  text("Time in Orbit : " + String(System.target.time), windowW/2, 100);
}

function changeStatus(string1){
  Status=string1
}