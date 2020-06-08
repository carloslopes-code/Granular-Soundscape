let snd = []; // a variavel em que vou guardar o som
let img; // imagem da waveform (ainda obsoleto)
let fetchedSound; // last fetched freesound (obsoleto)

let myEnvelope;
let grainSize = 0.75; //criar representação gráfica
let sliderTime, sliderPitch;
let time, pitch;

let lastGrain = 0;
let grainInterval = 50;

let recState = false; //ainda não está bem implementado
let recordButton;

let soundRecorder, soundFile;

freesound.setToken("k0trCxU8nQfUM1UiXhai3m4ooewj1JE8XcsPuEiA");

function preload() {
  getFreeSound("521014", 0);
  getFreeSound("521015", 1);
}

function setup() {
  createCanvas(700, 525);
  getAudioContext().suspend();
  soundRecorder = new p5.SoundRecorder();
  soundFile = new p5.SoundFile();
  
  // criar interface para estes parametros!
  let t1 = 0.001; // attack time in seconds
  let l1 = 1.0; // attack level 0.0 to 1.0
  let t2 = grainSize; // decay time in seconds
  let l2 = 0.0; // decay level  0.0 to 1.0
  myEnvelope = new p5.Envelope(t1, l1, t2, l2);

  sliderPitch = createSlider(0, 150, 0, 1);
  sliderPitch.position(20, 425);
  sliderPitch.style('width', '500px');

  sliderTime = createSlider(0, 200, 0, 1);
  sliderTime.position(20, 475);
  sliderTime.style('width', '500px');

  //botão para iniciar a gravação
  recordButton = createButton('click to record 10sec');
  recordButton.position(19, 19);
  recordButton.mousePressed(changeState);
}

function changeState() {
  switch (recState) {
    case false:
      recState = true;
      record(10000); //grava 10seg
      break;

    case true:
      recState = false;
      break;
  }
}

function record(length) {

  soundRecorder.record(soundFile);
  setTimeout(function() {
    console.log("Recording Complete");
    soundRecorder.stop();
    saveSound(soundFile, "output.wav");
  }, length);
}

function draw() {
  background(255);
  //para já, ignorei a representação gráfica
  
  let pressing = false;

  if (mouseIsPressed && mouseY <= 400) {
    pressing = true;
  }

  let time = sliderTime.value();
  let pitch = sliderPitch.value();
  randX = constrain(mouseX + random(-time, time), 0, 700 - 1);
  randY = constrain(mouseY + random(-pitch, pitch), 0, 400);

  stroke(0);
  fill(100);
  rect(0, 400, width, height);
  noStroke();
  fill(255);
  text('Time-Point Randomizer', sliderTime.x, sliderTime.y);
  noStroke();
  fill(255);
  text('Pitch Randomizer', sliderPitch.x, sliderPitch.y);

  switch (pressing) {

    case false:
      ellipseMode(CENTER);
      noStroke();
      fill(100);
      ellipse(mouseX, mouseY, 10, 10);
      break;

    case true:

      userStartAudio();
      ellipseMode(CENTER);
      noStroke();
      fill(255, 0, 0);
      ellipse(randX, randY, 10, 10);

      if (millis() > lastGrain + grainInterval) {
        let midiNote = 69 + (((randY - (400 * 0.33)) / (400 * 0.33)) * -12);
        let rate = midiToFreq(midiNote) / 440.;
        for (i = 0; i < snd.length; i++) {
          let panning = map(i, 0, snd.length - 1, -0.8, 0.8); //stereo
          snd[i].pan(panning);
          snd[i].play(0, rate, 0.0, (randX / 700) * snd[i].duration(), grainSize);
          myEnvelope.play(snd[i]);
        }
        lastGrain = millis();
      }
  }
}

function keyPressed() { //ainda não funciona
  switch (key) {
    case ' ':
      for (i = 0; i < snd.length; i++) {
        if (snd[i] != null && snd[i].isLoaded()) {
          if (snd[i].isPlaying()) {
            snd.stop();
          }
          snd[i] = null;
          getRandomSimilar();
        }
        break;
      }
  }
}

function getFreeSound(soundID, num) {

  freesound.getSound(soundID,
    function(sound) {


      fetchedSound = sound;
      img = loadImage(fetchedSound.images.waveform_l);
      snd[num] = loadSound(fetchedSound.previews['preview-hq-mp3']);


    },
    function() {
      print("Sound could not be retrieved.")
    }
  );
}

function searchFreeSound(query) {
  freesound.textSearch(query, {
      sort: "rating_desc"
    },
    function(sounds) {


      print("found: " + sounds.count + " sounds");
      getFreeSound(sounds.getSound(0).id);


    },
    function() {
      print("Error while searching...")
    }
  );
}

function getRandomSimilar() {
  fetchedSound.getSimilar(function(sounds) {


    print("found: " + sounds.count + " sounds");
    let rnd = int(random(min(10, sounds.count)));
    getFreeSound(sounds.getSound(rnd).id);


  }, function() {
    print("Similar sounds could not be retrieved.")
  }, {
    fields: 'id'
  });
}
