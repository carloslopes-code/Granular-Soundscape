let cor; //cor do background
let loaded = false;

let snd = []; // array de sons do freesound
let img = []; // imagem da waveform
let fetchedSound; // last fetched freesound (obsoleto)

let grainSize = 1; //criar representação gráfica
let myEnvelope;
let sliderTime, sliderPitch;
let time, pitch;

let lastGrain = 0;
let grainInterval = 50;

let recState = 0;
let recordButton;

let recorder, soundFile;

freesound.setToken("k0trCxU8nQfUM1UiXhai3m4ooewj1JE8XcsPuEiA");

function setup() {
  
  createCanvas(windowWidth, windowHeight); //700, 525
  cor = color(0);
  getAudioContext().suspend();

  getFreeSound("521014", 0);
  getFreeSound("415103", 1);
  getFreeSound("521015", 2);

  recorder = new p5.SoundRecorder();
  soundFile = new p5.SoundFile();

  // criar interface para estes parametros
  let t1 = 0.01; // attack time in seconds
  let l1 = 1.0; // attack level 0.0 to 1.0
  let t2 = grainSize; // decay time in seconds
  let l2 = 0.0; // decay level  0.0 to 1.0
  let t3 = 0.5; // Duration of the release portion of the envelope.
  let l3 = 0.0; // Level at the end of the release.
  myEnvelope = new p5.Envelope(t1, l1, t2, l2, t3, l3);

  sliderPitch = createSlider(0, 150, 0, 1);
  sliderPitch.position(20, 420);
  sliderPitch.style('width', '500px');

  sliderTime = createSlider(0, 200, 0, 1);
  sliderTime.position(20, 460);
  sliderTime.style('width', '500px');

  //botão para iniciar a gravação
  recordButton = createButton('Record');
  recordButton.position(25, 490);
  recordButton.style('width', '100px');
  recordButton.mousePressed(changeState);
}

function changeState() {
  switch (recState) {
    case 0:

      recorder.record(soundFile);

      recState++;
      break;

    case 1:

      recorder.stop();

      recState++;
      break;

    case 2:

      saveSound(soundFile, 'GranularToys.wav');
      recState = 0;
      break;
  }
}

function mouseWheel(event) {

  grainSize += event.delta/-1250;

}

function draw() {

  background(cor);
  
    if (snd.length == 3) {
      loaded = true;
    }

  switch (loaded) {

    case false:
      noStroke();
      textSize(20);
      fill(255);
      text('Loading...', 300, 225);
      break;

    case true:
      
       for (i = 0; i < snd.length; i++) {
        if (snd[i] != null && snd[i].isLoaded()) {
          image(img[i], 0, i * (400 / 3), width, i + 1 * (400 / 3));
        } else {
          background(cor);
        }
  }

      let pressing = false;

      if (mouseIsPressed && mouseY <= 400) {
        pressing = true;
      }

      let time = sliderTime.value();
      let pitch = sliderPitch.value();
      randX = constrain(mouseX + random(-time, time), 0, windowWidth - 1);
      randY = constrain(mouseY + random(-pitch, pitch), 0, 400);
      grainSize = constrain(grainSize, 0.01, 3);
      

      noStroke();
      fill(255);
      rect(0, 400, windowWidth, windowHeight);
      
      noStroke();
      textSize(20);
      fill(60);
      text(grainSize, windowWidth-250, 425);
      noStroke();
      textSize(12);
      fill(60);
      text('Grain Size', windowWidth-250, 445);
      noStroke();
      textSize(12);
      fill(60);
      text('Time-Point Randomizer', sliderTime.x, sliderTime.y);
      noStroke();
      fill(60);
      text('Pitch Randomizer', sliderPitch.x, sliderPitch.y);
      
      
      noStroke();
      fill(240);
      rect(windowWidth-150, 400, windowWidth, windowHeight);
      textSize(20);
      fill(0, 110, 180);
      text('Granular Toys', windowWidth-140, 425);
      fill(0, 125, 170);
      text('Granular Toys', windowWidth-140, 455);
      fill(0, 110, 153, 150);
      text('Granular Toys', windowWidth-140, 485);
      fill(0, 110, 153, 75);
      text('Granular Toys', windowWidth-140, 515);
      fill(100);
      textSize(14);
      text('Carlos Lopes', windowWidth-115, 545);

      switch (recState) {
        case 0:
          noStroke();
          textSize(12);
          fill(60);
          text('Press this button to record what you are doing', 140, 505);
          break;

        case 1:
          noStroke();
          textSize(14);
          fill(240, 0, 0);
          text('Recording...', 140, 505);
          textSize(10);
          fill(60);
          text('(Click again to stop)', 140, 520);

          break;

        case 2:
          noStroke();
          textSize(12);
          fill(60);
          text('Done! Click again to download.', 140, 505);
          break;
      }

      switch (pressing) {

        case false:

          noStroke();
          push();
          textAlign(CENTER);
          textSize(20);
          fill(230, 190, 0);
          text('Press your mouse to create sound!', width / 2, 150);

          pop();
          ellipseMode(CENTER);
          noStroke();
          fill(100);
          ellipse(mouseX, mouseY, 10*grainSize, 10*grainSize);
          break;

        case true:

          userStartAudio();

          ellipseMode(CENTER);
          noStroke();
          fill(255, 0, 0);
          ellipse(randX, randY, 15*grainSize, 15*grainSize);

          granularPlay();

      }

      break;
  }
}

function granularPlay() {

  if (millis() > lastGrain + grainInterval) {
    let midiNote = 69 + (((randY - (400 * 0.33)) / (400 * 0.33)) * -12);
    let rate = midiToFreq(midiNote) / 440.;
    for (i = 0; i < snd.length; i++) {
      let panning = map(i, 0, snd.length - 1, -0.9, 0.9); //fake stereo
      snd[i].pan(panning);
      snd[i].play(0, rate, 0.0, (randX / windowWidth) * snd[i].duration(), grainSize);
      myEnvelope.play(snd[i]);
      snd[i].onended(stopAudio);
    }
    lastGrain = millis();
  }
}

function stopAudio() {
  //snd.splice();
}

function getFreeSound(soundID, num) {

  freesound.getSound(soundID,
    function(sound) {


      fetchedSound = sound;
      img[num] = loadImage(fetchedSound.images.waveform_l);
      snd[num] = loadSound(fetchedSound.previews['preview-hq-mp3']);


    },
    function() {
      print("Sound could not be retrieved.")
    }
  );
}

function keyPressed() { //ainda obsoleto
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
