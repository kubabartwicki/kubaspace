/*

kuba.space

a lot of the web audio api taken from michael bromley's soundcloud visualiser - https://github.com/michaelbromley/soundcloud-visualizer
georgios kaleadis' safari audio fix has been a lifesaver as well - http://www.2vc.org/audio-bug/
piotr mierzejewski the js saviour also figured out this chrome bug - https://github.com/soundcloud/soundcloud-javascript/issues/39#issuecomment-189675794

THANK YOU
ENJOY AND COME AGAIN

*/

var SoundCloudAudioSource = function(player) {
    var self = this;
    var analyser;

    function audioCtxFix(ctx) {
    	if(ctx.state == 'running') { return; }
    	setTimeout(function(){
    		if(ctx.state == 'suspended') {
	    		if(ctx.resume) { ctx.resume(); }
	    		return ctx.state == 'running';
	    	} else { return true; }
    	}, 2000);
    }
    var audioCtx = new (window.AudioContext || window.webkitAudioContext);
    audioCtxFix(audioCtx);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    player.crossOrigin = "anonymous";
    var source = audioCtx.createMediaElementSource(player);
    source.connect(analyser);
    source.mediaElement.play();
    analyser.connect(audioCtx.destination);
    var sampleAudioStream = function() {
        analyser.getByteFrequencyData(self.streamData);
        var total = 0;
        for (var i = 0; i < 80; i++) {
            total += self.streamData[i];
        }
        self.volume = total;
    };

    setInterval(sampleAudioStream, 20);
    this.volume = 0;
    this.streamData = new Uint8Array(128);
    this.playStream = function(streamUrl) {
    	player.src = streamUrl;
        player.play();
    }
};

var Visualiser = function() {
    var audioSource;

    var findPeaks = function() {
        var volumeArray = [];
        var counter = 0;
        var i = setInterval(function(){
            var volume = Math.ceil(audioSource.volume);
            volumeArray.push(volume);
            var volumeArrayLastTen = volumeArray.slice(Math.max(volumeArray.length - 5, 1));
            var volumePeak = Math.max.apply(Math, volumeArrayLastTen);

            if ( volumeArray[counter] == volumePeak ) {
                $('.box:nth-child(1)').show().delay(250).fadeOut(0);
                if ( volumePeak > 6000) {
                	$('.box:nth-child(2)').show().delay(250).fadeOut(0);
                }
                if ( volumePeak > 8000) {
                	$('.box:nth-child(3)').show().delay(250).fadeOut(0);
                }
                if ( volumePeak > 10000) {
                	$('.box:nth-child(4)').show().delay(250).fadeOut(0);
                }
                if ( volumePeak > 13000) {
                	$('.box:nth-child(5)').show().delay(250).fadeOut(0);
                	$('.box:nth-child(6)').show().delay(250).fadeOut(0);
                }
            }
            counter++;
        }, 100);
    }

    var generateColors = function() {
        var streamArray = [].slice.call(audioSource.streamData);

        var calculateAverage = function(array) {
            var sum = 0;
            for( var i = 0; i < array.length; i++ ){ sum += parseInt( array[i], 10 ); }
            var average = Math.ceil(sum / array.length);
            return average;
        }

        var size = Math.floor(streamArray.length/3);
        var streamArrayRandom = new Array();
        var streamArraySmaller = new Array();

        for (var i=0; i<3; i++) {
            for (var n=0; n<size; n++) {
                    var index = 3*n + i;
                    streamArrayRandom.push( streamArray[index] );
            }
            streamArraySmaller.push( streamArrayRandom.slice(i*size,i*size+size) );
        }
        
        var streamArrayR = calculateAverage(streamArraySmaller[0]);
        var streamArrayG = calculateAverage(streamArraySmaller[1]);
        var streamArrayB = calculateAverage(streamArraySmaller[2]);
        var rgbColor = 'rgb(' + Math.floor(streamArrayR*0.5) + ', ' + Math.floor(streamArrayG*1.4) + ', ' + Math.floor(streamArrayB*1.4) + ')';
        var rgbColorAlternative = 'rgb(' + Math.floor(streamArrayB/2) + ', ' + Math.floor(streamArrayG/3) + ', ' + Math.floor(streamArrayR/2) + ')';

        if ( document.getElementById('player').currentTime > 298.5 ) {
        	var rgbColor = 'rgb(' + Math.floor(streamArrayR*1.5) + ', ' + Math.floor(streamArrayG*0.6) + ', ' + Math.floor(streamArrayB*0.6) + ')';
        }
        if ( document.getElementById('player').currentTime > 1801 ) {
        	var rgbColor = 'rgb(' + Math.floor(streamArrayR*0.5) + ', ' + Math.floor(streamArrayG*0.5) + ', ' + Math.floor(streamArrayB*1.3) + ')';
        }
        
        $('body').css('background', rgbColor);
        $('#visualiser span').css('background', rgbColorAlternative);
       
    };

    this.init = function(options) {
        audioSource = options.audioSource;
        var container = document.getElementById(options.containerId);
        findPeaks();
        setInterval(generateColors, 100);
    };
};

var Soundcloud = function() {

	var trackUrl = '/tracks/254826327';
	var playerElement = document.getElementById('player');

	SC.initialize({ client_id: "523eb1fe14a651e4313c193c7c64c964" });
	SC.get(trackUrl, function(track) {
		SC.stream(track.uri, function(player) {
			var streamUrl = player.url;
			var visualiser = new Visualiser();
			var audioSource = new SoundCloudAudioSource(playerElement);

			audioSource.playStream(streamUrl);
			visualiser.init({
				containerId: 'visualiser',
				audioSource: audioSource
			});
		});
	});

	this.directStream = function(){
		if (playerElement.paused) {
			playerElement.play();
		} else {
			playerElement.pause();
        }
	};

};

$(document).ready(function() {

	var newPlayer = document.createElement('audio');
	newPlayer.setAttribute('id', 'player');
	newPlayer.setAttribute('preload', 'auto');
	newPlayer.setAttribute('controls', '');
	document.getElementById('content').appendChild(newPlayer);

	var soundcloud = new Soundcloud();
	window.addEventListener("keydown", keyControls, false);
	function keyControls(e) {
	    switch(e.keyCode) {
	        case 32:
	            soundcloud.directStream();
	    }
	}
});