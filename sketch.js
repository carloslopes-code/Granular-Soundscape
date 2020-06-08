let c; //cor do background

let snd = []; // array de sons do freesound
let img; // imagem da waveform (ainda obsoleto)
let fetchedSound; // last fetched freesound (obsoleto)

let grainSize = 0.75; //criar representação gráfica
let myEnvelope;
let sliderTime, sliderPitch;
let time, pitch;

let lastGrain = 0;
let grainInterval = 100;

let recState = 0; //ainda não está bem implementado
let recordButton;

let recorder, soundFile;

freesound.setToken("k0trCxU8nQfUM1UiXhai3m4ooewj1JE8XcsPuEiA");

function preload() {
  getFreeSound("521014", 0);
  getFreeSound("521015", 1);
}

function setup() {
  createCanvas(700, 525);
  cor = color(225);
  getAudioContext().suspend();
  recorder = new p5.SoundRecorder();
  soundFile = new p5.SoundFile();

  // criar interface para estes parametros!
  let t1 = 0.001; // attack time in seconds
  let l1 = 1.0; // attack level 0.0 to 1.0
  let t2 = grainSize; // decay time in seconds
  let l2 = 0.0; // decay level  0.0 to 1.0
  myEnvelope = new p5.Envelope(t1, l1, t2, l2);

  sliderPitch = createSlider(0, 150, 0, 1);
  sliderPitch.position(20, 425);
  sliderPitch.style('width', '600px');

  sliderTime = createSlider(0, 200, 0, 1);
  sliderTime.position(20, 475);
  sliderTime.style('width', '600px');

  //botão para iniciar a gravação
  recordButton = createButton('Record Sound');
  recordButton.position(19, 19);
  recordButton.mousePressed(changeState);
}

function changeState() {
  switch (recState) {
    case 0:
      cor = color(240, 0, 0);

      recorder.record(soundFile);

      recState++;
      break;

    case 1:
      cor = color(225);

      recorder.stop();

      recState++;
      break;

    case 2:

      saveSound(soundFile, 'Granular.wav');
      recState = 0;
      break;
  }
}


function draw() {
  background(cor);
  textSize(24);
  fill(0, 125, 200);
  text('Granular Soundscapes', 440, 30);
  fill(0, 125, 170);
  text('Granular Soundscapes', 440, 60);
  fill(0, 102, 153, 100);
  text('Granular Soundscapes', 440, 90);
  
  switch (recState) {
    case 0:
      noStroke();
      textSize(12);
      fill(200,0,0);
      text('Press button to record', 20, 15);
      break;

    case 1:
      noStroke();
      textSize(20);
      fill(255);
      text('Recording!', width / 2, 200);

      break;

    case 2:
      noStroke();
      textSize(20);
      fill(255);
      text('Done! Click again to download', width / 2, 200);
      break;
  }

  //para já, ignorei a representação gráfica

  let pressing = false;

  if (mouseIsPressed && mouseY <= 400) {
    pressing = true;
  }

  let time = sliderTime.value();
  let pitch = sliderPitch.value();
  randX = constrain(mouseX + random(-time, time), 0, 700 - 1);
  randY = constrain(mouseY + random(-pitch, pitch), 0, 400);

  noStroke();
  textSize(12);
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