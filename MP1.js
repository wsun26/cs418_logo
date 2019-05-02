var gl;
var canvas;
var shaderProgram;
var vertexPositionBuffer;


// Create a place to store vertex colors
var vertexColorBuffer;

var mvMatrix = mat4.create();
var rotAngle = 0;
var lastTime = 0;
var sinscalar = 0;
var x = 0.5; 
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function degToRad(degrees) {
	return degrees * Math.PI / 180;
}
/**
 * Creates a context for WebGL
 * @param {element} canvas WebGL canvas
 * @return {Object} WebGL context
 */
function createGLContext(canvas) {
	var names = ["webgl", "experimental-webgl"];
	var context = null;
	for (var i=0; i < names.length; i++) {
		try {
		  context = canvas.getContext(names[i]);
		} catch(e) {}
		if (context) {
		  break;
		}
	}
	if (context) {
	context.viewportWidth = canvas.width;
	context.viewportHeight = canvas.height;
	} else {
	alert("Failed to create WebGL context!");
	}
	return context;
}

/**
 * Loads Shaders
 * @param {string} id ID string for shader to load. Either vertex shader/fragment shader
 */
function loadShaderFromDOM(id) {
	var shaderScript = document.getElementById(id);

	// If we don't find an element with the specified id
	// we do an early exit 
	if (!shaderScript) {
	return null;
	}

	// Loop through the children for the found DOM element and
	// build up the shader source code as a string
	var shaderSource = "";
	var currentChild = shaderScript.firstChild;
	while (currentChild) {
	if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
	  shaderSource += currentChild.textContent;
	}
	currentChild = currentChild.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
	shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
	shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
	return null;
	}

	gl.shaderSource(shader, shaderSource);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	alert(gl.getShaderInfoLog(shader));
	return null;
	} 
	return shader;
}

/**
 * Setup the fragment and vertex shaders
 */
function setupShaders() {
	vertexShader = loadShaderFromDOM("shader-vs");
	fragmentShader = loadShaderFromDOM("shader-fs");

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
	alert("Failed to setup shaders");
	}

	gl.useProgram(shaderProgram);
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
	gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix"); 
}

/**
 * Populate buffers with data
 */
function setupBuffers() {
  	badgePositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, badgePositionBuffer);
  	var badgeVertices = [
	  	//top bar
		-0.9, 0.95, 0.0, 
		-0.9, 0.65, 0.0, 
		0.9, 0.95, 0.0, 

		-0.9, 0.65, 0.0, 
		0.9, 0.95, 0.0, 
		0.9, 0.65, 0.0, 

		//l bar
		-0.7, 0.65, 0.0, 
		-0.325, 0.65, 0.0, 
		-0.7, -0.3, 0.0, 

		-0.325, 0.65, 0.0, 
		-0.7, -0.3, 0.0, 
		-0.325, -0.3, 0.0, 

		//l I bar
		-0.325, 0.4, 0.0, 
		-0.2, 0.4, 0.0, 
		-0.325, -0.05, 0.0, 

		-0.2, 0.4, 0.0, 
		-0.2, -0.05, 0.0, 
		-0.325, -0.05, 0.0, 

		//r bar
		0.7, 0.65, 0.0, 
		0.325, 0.65, 0.0, 
		0.7, -0.3, 0.0, 

		0.325, 0.65, 0.0, 
		0.7, -0.3, 0.0, 
		0.325, -0.3, 0.0, 

		//r I bar
		0.325, 0.4, 0.0, 
		0.2, 0.4, 0.0, 
		0.325, -0.05, 0.0, 

		0.2, 0.4, 0.0, 
		0.2, -0.05, 0.0, 
		0.325, -0.05, 0.0
  	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(badgeVertices), gl.STATIC_DRAW);
  	badgePositionBuffer.itemSize = 3;
  	badgePositionBuffer.numberOfItems = 30;
	
  	badgeColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, badgeColorBuffer);
	var badgeColors = [
		// blue color for I border
		0.0196, 0.1254, 0.298, 1.0,
		0.0196, 0.1254, 0.298, 1.0,
		0.0196, 0.1254, 0.298, 1.0,  

		0.0196, 0.1254, 0.298, 1.0,
		0.0196, 0.1254, 0.298, 1.0,
		0.0196, 0.1254, 0.298, 1.0, 

		0.0196, 0.1254, 0.298, 1.0,
		0.0196, 0.1254, 0.298, 1.0,
		0.0196, 0.1254, 0.298, 1.0, 

		0.0196, 0.1254, 0.298, 1.0,
		0.0196, 0.1254, 0.298, 1.0,
		0.0196, 0.1254, 0.298, 1.0, 

		0.0196, 0.1254, 0.298, 1.0,
		0.0196, 0.1254, 0.298, 1.0,
		0.0196, 0.1254, 0.298, 1.0, 

		0.0196, 0.1254, 0.298, 1.0,
		0.0196, 0.1254, 0.298, 1.0,
		0.0196, 0.1254, 0.298, 1.0, 

		0.0196, 0.1254, 0.298, 1.0,
		0.0196, 0.1254, 0.298, 1.0,
		0.0196, 0.1254, 0.298, 1.0, 

		0.0196, 0.1254, 0.298, 1.0,
		0.0196, 0.1254, 0.298, 1.0,
		0.0196, 0.1254, 0.298, 1.0, 

		0.0196, 0.1254, 0.298, 1.0,
		0.0196, 0.1254, 0.298, 1.0,
		0.0196, 0.1254, 0.298, 1.0, 

		0.0196, 0.1254, 0.298, 1.0,
		0.0196, 0.1254, 0.298, 1.0,
		0.0196, 0.1254, 0.298, 1.0 
 	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(badgeColors), gl.STATIC_DRAW);
	badgeColorBuffer.itemSize = 4;
	badgeColorBuffer.numItems = 30;  

  	ribbonPositionBuffer = gl.createBuffer(); 
  	gl.bindBuffer(gl.ARRAY_BUFFER, ribbonPositionBuffer);
	var ribbonVertices = [
		//far l ribbon
		-0.7, -0.4, 0.0, 
		-0.575, -0.4, 0.0, 
		-0.575, -0.525, 0.0, 

		-0.7, -0.4, 0.0, 
		-0.575, -0.525, 0.0, 
		-0.7, -0.425, 0.0, 
		//mid l ribbom
		-0.45, -0.4, 0.0, 
		-0.325, -0.4, 0.0, 
		-0.325, -0.7, 0.0, 

		-0.45, -0.4, 0.0, 
		-0.325, -0.7, 0.0, 
		-0.45, -0.6, 0.0, 
		//center l ribbon
		-0.2, -0.4, 0.0, 
		-0.075, -0.4, 0.0, 
		-0.075, -0.9, 0.0, 

		-0.2, -0.4, 0.0, 
		-0.075, -0.9, 0.0, 
		-0.2, -0.8, 0.0, 
		//far r ribbon
		0.7, -0.4, 0.0, 
		0.575, -0.4, 0.0, 
		0.575, -0.525, 0.0, 

		0.7, -0.4, 0.0, 
		0.575, -0.525, 0.0, 
		0.7, -0.425, 0.0, 
		//mid r ribbom
		0.45, -0.4, 0.0, 
		0.325, -0.4, 0.0, 
		0.325, -0.7, 0.0, 

		0.45, -0.4, 0.0, 
		0.325, -0.7, 0.0, 
		0.45, -0.6, 0.0, 
		//center r ribbon
		0.2, -0.4, 0.0, 
		0.075, -0.4, 0.0, 
		0.075, -0.9, 0.0, 

		0.2, -0.4, 0.0, 
		0.075, -0.9, 0.0, 
		0.2, -0.8, 0.0
  	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ribbonVertices), gl.STATIC_DRAW);
	ribbonPositionBuffer.itemSize = 3;
	ribbonPositionBuffer.numberOfItems = 36;

	ribbonColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, ribbonColorBuffer);
  	var ribbonColors = [
		//orange color for ribbons
		0.8, 0.3, 0.0, 1.0,
		0.8, 0.3, 0.0, 1.0,
		0.8, 0.3, 0.0, 1.0,

		0.8, 0.3, 0.0, 1.0,
		0.8, 0.3, 0.0, 1.0,
		0.8, 0.3, 0.0, 1.0,

		0.8, 0.3, 0.0, 1.0,
		0.8, 0.3, 0.0, 1.0,
		0.8, 0.3, 0.0, 1.0,

		0.8, 0.3, 0.0, 1.0,
		0.8, 0.3, 0.0, 1.0,
		0.8, 0.3, 0.0, 1.0,

		0.8, 0.3, 0.0, 1.0,
		0.8, 0.3, 0.0, 1.0,
		0.8, 0.3, 0.0, 1.0,

		0.8, 0.3, 0.0, 1.0,
		0.8, 0.3, 0.0, 1.0,
		0.8, 0.3, 0.0, 1.0, 

		0.8, 0.3, 0.0, 1.0,
		0.8, 0.3, 0.0, 1.0,
		0.8, 0.3, 0.0, 1.0,

		0.8, 0.3, 0.0, 1.0,
		0.8, 0.3, 0.0, 1.0,
		0.8, 0.3, 0.0, 1.0,

		0.8, 0.3, 0.0, 1.0,
		0.8, 0.3, 0.0, 1.0,
		0.8, 0.3, 0.0, 1.0,

		0.8, 0.3, 0.0, 1.0,
		0.8, 0.3, 0.0, 1.0,
		0.8, 0.3, 0.0, 1.0,

		0.8, 0.3, 0.0, 1.0,
		0.8, 0.3, 0.0, 1.0,
		0.8, 0.3, 0.0, 1.0,

		0.8, 0.3, 0.0, 1.0,
		0.8, 0.3, 0.0, 1.0,
		0.8, 0.3, 0.0, 1.0
  	]; 
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ribbonColors), gl.STATIC_DRAW);
	ribbonColorBuffer.itemSize = 4;
	ribbonColorBuffer.numItems = 36;  
}

/**
 * Draw call that applies matrix transformations to badge model and draws model in frame
 */
function badgeDraw() { 
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT);
	//rotate the badge in both the Y and Z direction
	mat4.identity(mvMatrix);
	mat4.rotateY(mvMatrix, mvMatrix, degToRad(rotAngle)); 
    mat4.rotateZ(mvMatrix, mvMatrix, degToRad(rotAngle)); 
	gl.bindBuffer(gl.ARRAY_BUFFER, badgePositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
						 badgePositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, badgeColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
							badgeColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	setMatrixUniforms();   
	gl.drawArrays(gl.TRIANGLES, 0, badgePositionBuffer.numberOfItems);
}

/**
 * Draw call that applies matrix transformations to ribbon model and draws model in frame
 */
function ribbonDraw() { 
	//gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	mat4.identity(mvMatrix);
	mat4.rotateY(mvMatrix, mvMatrix, degToRad(rotAngle)); 
    mat4.rotateZ(mvMatrix, mvMatrix, degToRad(rotAngle)); 
	gl.bindBuffer(gl.ARRAY_BUFFER, ribbonPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
						 ribbonPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, ribbonColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
							ribbonColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
	setMatrixUniforms();                  
	gl.drawArrays(gl.TRIANGLES, 0, ribbonPositionBuffer.numberOfItems);
}

/**
 * Animate call that applies matrix and vertex transformations to the badge mesh
 */
function animate() {
	sinscalar += 0.1;
	gl.bindBuffer(gl.ARRAY_BUFFER, ribbonPositionBuffer);
	//dynamic draw some of the ribbon vertices (non-uniform transformation)
	var ribbonVertices = [
		//far l ribbon
		-0.7, -0.4, 0.0, 
		-0.575, -0.4, 0.0, 
		-0.575+0.02*Math.sin(sinscalar-0.5), -0.525+0.05*Math.sin(sinscalar+1.5), 0.0, 

		-0.7, -0.4, 0.0, 
		-0.575+0.02*Math.sin(sinscalar-0.5), -0.525+0.05*Math.sin(sinscalar+1.5), 0.0, 
		-0.7+0.01*Math.cos(sinscalar-1.5), -0.425, 0.0, 
		//mid l ribbom
		-0.45, -0.4, 0.0, 
		-0.325, -0.4, 0.0, 
		-0.325+0.02*Math.cos(sinscalar-1.5), -0.7+0.05*Math.cos(sinscalar-0.5), 0.0, 

		-0.45, -0.4, 0.0, 
		-0.325+0.02*Math.cos(sinscalar-1.5), -0.7+0.05*Math.cos(sinscalar-0.5), 0.0, 
		-0.45+0.01*Math.sin(sinscalar+0.5), -0.6+0.03*Math.sin(sinscalar+1.5), 0.0, 
		//center l ribbon
		-0.2, -0.4, 0.0, 
		-0.075, -0.4, 0.0, 
		-0.075+0.04*Math.sin(sinscalar-0.5), -0.9+0.09*Math.sin(sinscalar+0.5), 0.0, 

		-0.2, -0.4, 0.0, 
		-0.075+0.04*Math.sin(sinscalar-0.5), -0.9+0.09*Math.sin(sinscalar+0.5), 0.0, 
		-0.2+0.01*Math.cos(sinscalar-0.5), -0.8+0.06*Math.cos(sinscalar-0.5), 0.0, 
		//far r ribbon
		0.7, -0.4, 0.0, 
		0.575, -0.4, 0.0, 
		0.575+0.02*Math.cos(sinscalar-0.5), -0.525+0.05*Math.cos(sinscalar+1.5), 0.0, 

		0.7, -0.4, 0.0, 
		0.575+0.02*Math.cos(sinscalar-0.5), -0.525+0.05*Math.cos(sinscalar+1.5), 0.0, 
		0.7+0.01*Math.sin(sinscalar-1.5), -0.425, 0.0, 
		//mid r ribbom
		0.45, -0.4, 0.0, 
		0.325, -0.4, 0.0, 
		0.325+0.02*Math.sin(sinscalar-1.5), -0.7+0.05*Math.sin(sinscalar-0.5), 0.0, 

		0.45, -0.4, 0.0, 
		0.325+0.02*Math.sin(sinscalar-1.5), -0.7+0.05*Math.sin(sinscalar-0.5), 0.0, 
		0.45+0.01*Math.cos(sinscalar+0.5), -0.6+0.03*Math.cos(sinscalar+1.5), 0.0, 
		//center r ribbon
		0.2, -0.4, 0.0, 
		0.075, -0.4, 0.0, 
		0.075+0.04*Math.cos(sinscalar-0.5), -0.9+0.08*Math.cos(sinscalar+0.5), 0.0, 

		0.2, -0.4, 0.0, 
		0.075+0.04*Math.cos(sinscalar-0.5), -0.9+0.08*Math.cos(sinscalar+0.5), 0.0, 
		0.2+0.02*Math.sin(sinscalar+0.5), -0.8+0.03*Math.sin(sinscalar+0.5), 0.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ribbonVertices), gl.DYNAMIC_DRAW);
	ribbonPositionBuffer.itemSize = 3;
	ribbonPositionBuffer.numberOfItems = 36;
	//rotate the badge in the Y and Z direction between -40 degrees and 40 degrees
	var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime; 
        if(rotAngle==40){ 
            x = 0.5; 
        }
        if(rotAngle==-40){
            x = -0.5; 
        }
        rotAngle= (rotAngle+x);// % 360;
    }
    lastTime = timeNow;
}

/**
 * Startup function called from html code to start program.
 */
 function startup() {
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders(); 
  setupBuffers();
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  //badgeDraw();  
  //ribbonDraw(); 
  tick(); 
}

function tick() {
    requestAnimFrame(tick);
    badgeDraw(); 
    ribbonDraw();
    animate();
}


