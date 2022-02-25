// For Game Script from Feb 19, 2022.

fn NumberArray() {
	return [];
}

fn meshConvertToIndexMesh(mesh) { // Number
	meshClearIndices(mesh);
	for (var i = 0; i < meshGetVerticesCount(mesh) / 3; i += 1) {
		meshAddTriangle(mesh, i * 3 + 0, i * 3 + 1, i * 3 + 2);
	}
}

printDraw("Frame: " + numberToString(getCurrentFrame()));

{
	let cameraVector = defaultCameraGetVector();
	let cameraVersor = defaultCameraGetVersor();
	if (cameraVector[0] == 0 && cameraVector[1] == 0 && cameraVector[2] == 10 &&
	    cameraVersor[0] == 0 && cameraVersor[1] == 0 && cameraVersor[2] == 0  && cameraVersor[3] == 1)
	{
		defaultCameraSetVector(-3.359291, 0.254475,-3.232193);
		defaultCameraSetVersor( 0.003961, 0.978337, 0.018788, -0.206169);
	}
}

if (false) {
	printDraw(
		numberToString(defaultCameraGetVector()[0]) + " " +
		numberToString(defaultCameraGetVector()[1]) + " " +
		numberToString(defaultCameraGetVector()[2]) + " " +
		numberToString(defaultCameraGetVersor()[0]) + " " +
		numberToString(defaultCameraGetVersor()[1]) + " " +
		numberToString(defaultCameraGetVersor()[2]) + " " +
		numberToString(defaultCameraGetVersor()[3])
	);
}

defaultCameraSetMoveSpeed(0.025);

//setCurrentFrame(0);

let suzanne = meshNew("suzanne");
let verticesString = stringReadFromFile("data/suzanne.txt");
var verticesComponentsCount = (strlenWithNullChar(verticesString)-1) / 10;

let trianglesNormal = globalArrayPersistentNew8Bit("trianglesNormal", (verticesComponentsCount / 9) * 3 * 4);
let verticesNormal = globalArrayPersistentNew8Bit("verticesNormal", verticesComponentsCount * 4);

if (getCurrentFrame() == 0) {
	//verticesComponentsCount = 3 * 9; // Debug N triangles
	//printDraw(numberToString(verticesCount));
	let stringNumber = globalArrayNew8Bit("stringNumber", 11);
	var vertex = NumberArray();
	append(vertex, 0);
	append(vertex, 0);
	append(vertex, 0);
	for (var i = 0; i < verticesComponentsCount; i += 1) {
		pointerSetSubstring(stringNumber, 0, verticesString, i*10, 10);
		vertex[i % 3] = interpretStringToFloat(pointerGetString(stringNumber));
		if (i % 3 == 2) {
			meshAddVertex(suzanne, vertex[0], vertex[1], vertex[2]);
			meshAddColor(suzanne, i / verticesComponentsCount, i / verticesComponentsCount, i / verticesComponentsCount, 1);
		}
	}
	// Generate array of triangle per-vertex normals
	{
		let v = meshGetVerticesPointer(suzanne);
		for (var i = 0; i < verticesComponentsCount / 9; i += 1) {
			let x0 = pointerGetNumber(v, i * 9 + 0);
			let y0 = pointerGetNumber(v, i * 9 + 1);
			let z0 = pointerGetNumber(v, i * 9 + 2);

			let x1 = pointerGetNumber(v, i * 9 + 3);
			let y1 = pointerGetNumber(v, i * 9 + 4);
			let z1 = pointerGetNumber(v, i * 9 + 5);

			let x2 = pointerGetNumber(v, i * 9 + 6);
			let y2 = pointerGetNumber(v, i * 9 + 7);
			let z2 = pointerGetNumber(v, i * 9 + 8);

			let pointSize = 0.5;

			drawPoint("", x0, y0, z0, pointSize, 255,0,255,255);
			drawPoint("", x1, y1, z1, pointSize, 0,255,0,255);
			drawPoint("", x2, y2, z2, pointSize, 0,0,255,255);

			// 0 --- 1
			//   \ /
			//    2
			// 
			// d10 = 1 - 0
			// d20 = 2 - 0
			// normal = d10 cross d20

			let d10x = x1 - x0;
			let d10y = y1 - y0;
			let d10z = z1 - z0;

			let d20x = x2 - x0;
			let d20y = y2 - y0;
			let d20z = z2 - z0;

			var nx = d20y*d10z - d10y*d20z;
			var ny = d20z*d10x - d10z*d20x;
			var nz = d20x*d10y - d10x*d20y;

			let l = sqrt(nx*nx + ny*ny + nz*nz);

			nx /= l;
			ny /= l;
			nz /= l;

			pointerSetNumber(trianglesNormal, i * 3 + 0, nx);
			pointerSetNumber(trianglesNormal, i * 3 + 1, ny);
			pointerSetNumber(trianglesNormal, i * 3 + 2, nz);

			let normalDrawLength = 0.04;

			nx *= normalDrawLength;
			ny *= normalDrawLength;
			nz *= normalDrawLength;

			let drawOffset = 0.02;

			var x0o = x0 - ((x0-x1)*drawOffset) - ((x0-x2)*drawOffset);
			var y0o = y0 - ((y0-y1)*drawOffset) - ((y0-y2)*drawOffset);
			var z0o = z0 - ((z0-z1)*drawOffset) - ((z0-z2)*drawOffset);
 
			var x1o = x1 - ((x1-x2)*drawOffset) - ((x1-x0)*drawOffset);
			var y1o = y1 - ((y1-y2)*drawOffset) - ((y1-y0)*drawOffset);
			var z1o = z1 - ((z1-z2)*drawOffset) - ((z1-z0)*drawOffset);

			var x2o = x2 - ((x2-x0)*drawOffset) - ((x2-x1)*drawOffset);
			var y2o = y2 - ((y2-y0)*drawOffset) - ((y2-y1)*drawOffset);
			var z2o = z2 - ((z2-z0)*drawOffset) - ((z2-z1)*drawOffset);

			drawLine("", x0o,y0o,z0o, nx+x0o,ny+y0o,nz+z0o, 2, 255,0,255,255);
			drawLine("", x1o,y1o,z1o, nx+x1o,ny+y1o,nz+z1o, 2, 0,255,0,255);
			drawLine("", x2o,y2o,z2o, nx+x2o,ny+y2o,nz+z2o, 2, 0,0,255,255);
		}
	}
}

{
	let v = meshGetVerticesPointer(suzanne);
	for (var i = 0; i < verticesComponentsCount / 9; i += 1) {
		let x0 = pointerGetNumber(v, i * 9 + 0);
		let y0 = pointerGetNumber(v, i * 9 + 1);
		let z0 = pointerGetNumber(v, i * 9 + 2);

		let x1 = pointerGetNumber(v, i * 9 + 3);
		let y1 = pointerGetNumber(v, i * 9 + 4);
		let z1 = pointerGetNumber(v, i * 9 + 5);

		let x2 = pointerGetNumber(v, i * 9 + 6);
		let y2 = pointerGetNumber(v, i * 9 + 7);
		let z2 = pointerGetNumber(v, i * 9 + 8);

		var nx = pointerGetNumber(trianglesNormal, i * 3 + 0);
		var ny = pointerGetNumber(trianglesNormal, i * 3 + 1);
		var nz = pointerGetNumber(trianglesNormal, i * 3 + 2);

		pointerSetNumber(verticesNormal, i * 9 + 0, nx);
		pointerSetNumber(verticesNormal, i * 9 + 1, ny);
		pointerSetNumber(verticesNormal, i * 9 + 2, nz);

		pointerSetNumber(verticesNormal, i * 9 + 3, nx);
		pointerSetNumber(verticesNormal, i * 9 + 4, ny);
		pointerSetNumber(verticesNormal, i * 9 + 5, nz);

		pointerSetNumber(verticesNormal, i * 9 + 6, nx);
		pointerSetNumber(verticesNormal, i * 9 + 7, ny);
		pointerSetNumber(verticesNormal, i * 9 + 8, nz);

		// https://blender.stackexchange.com/questions/187129/eevee-normal-pass-remap-negative-values/
		if (nx < 0) { nx *= -1; }
		if (ny < 0) { ny *= -1; }
		if (nz < 0) { nz *= -1; }

		//drawTriangle("", x0, y0, z0, x1, y1, z1, x2, y2, z2, nx*255,ny*255,nz*255,255);
	}
}

if (getCurrentFrame() == 0) {
	meshConvertToIndexMesh(suzanne);
}

let currentMode = globalArrayPersistentNew8Bit("currentRenderMode", 1 * 4);
if (mouseGetButtonIsPressed(2)) { // Change current render mode: right mouse button
	var v = pointerGetUnsignedInteger(currentMode, 0);
	v = v == 0 ? 1 : 0;
	pointerSetUnsignedInteger(currentMode, 0, v);
	if (v == 1) {
		setCurrentFrame(0);
	}
}
if (pointerGetUnsignedInteger(currentMode, 0) == 0) {
	// https://discord.gg/D7pKPw4kFf, https://discord.com/channels/908452801678561291/908452802165112885/918489067543466054
	if (windowIsFocused() && windowIsHovered()) {
		if (mouseGetMoveEvent() == 2) {
			defaultCameraDefaultControlEnable();
		}
	} else {
		defaultCameraDefaultControlDisable();
	}
} else {
	defaultCameraDefaultControlDisable();
}

if (isRerun() == true) {
	if (pointerIsNull(globalArrayPersistentGetPointer("devicep")) == false) {
		var handles = NumberArray();

		append(handles, pointerGetRaw64Bit(globalArrayPersistentGetPointer("rendererp"), 0)); globalArrayPersistentDelete("rendererp");
		append(handles, pointerGetRaw64Bit(globalArrayPersistentGetPointer("tonemapperp"), 0)); globalArrayPersistentDelete("tonemapperp");
		append(handles, pointerGetRaw64Bit(globalArrayPersistentGetPointer("framebufferp"), 0)); globalArrayPersistentDelete("framebufferp");
		append(handles, pointerGetRaw64Bit(globalArrayPersistentGetPointer("camerap"), 0)); globalArrayPersistentDelete("camerap");
		append(handles, pointerGetRaw64Bit(globalArrayPersistentGetPointer("hdrimagep"), 0)); globalArrayPersistentDelete("hdrimagep");
		append(handles, pointerGetRaw64Bit(globalArrayPersistentGetPointer("hdrilightp"), 0)); globalArrayPersistentDelete("hdrilightp");
		append(handles, pointerGetRaw64Bit(globalArrayPersistentGetPointer("hdrilightprimp"), 0)); globalArrayPersistentDelete("hdrilightprimp");
		append(handles, pointerGetRaw64Bit(globalArrayPersistentGetPointer("light0p"), 0)); globalArrayPersistentDelete("light0p");
		append(handles, pointerGetRaw64Bit(globalArrayPersistentGetPointer("light1p"), 0)); globalArrayPersistentDelete("light1p");
		append(handles, pointerGetRaw64Bit(globalArrayPersistentGetPointer("light0primp"), 0)); globalArrayPersistentDelete("light0primp");
		append(handles, pointerGetRaw64Bit(globalArrayPersistentGetPointer("light1primp"), 0)); globalArrayPersistentDelete("light1primp");
		append(handles, pointerGetRaw64Bit(globalArrayPersistentGetPointer("groundmaterialp"), 0)); globalArrayPersistentDelete("groundmaterialp");
		append(handles, pointerGetRaw64Bit(globalArrayPersistentGetPointer("materialp"), 0)); globalArrayPersistentDelete("materialp");
		append(handles, pointerGetRaw64Bit(globalArrayPersistentGetPointer("glassmaterialp"), 0)); globalArrayPersistentDelete("glassmaterialp");
		append(handles, pointerGetRaw64Bit(globalArrayPersistentGetPointer("groundshapep"), 0)); globalArrayPersistentDelete("groundshapep");
		append(handles, pointerGetRaw64Bit(globalArrayPersistentGetPointer("shapep"), 0)); globalArrayPersistentDelete("shapep");
		append(handles, pointerGetRaw64Bit(globalArrayPersistentGetPointer("groundshapeprimp"), 0)); globalArrayPersistentDelete("groundshapeprimp");
		append(handles, pointerGetRaw64Bit(globalArrayPersistentGetPointer("shape0primp"), 0)); globalArrayPersistentDelete("shape0primp");
		append(handles, pointerGetRaw64Bit(globalArrayPersistentGetPointer("shape1primp"), 0)); globalArrayPersistentDelete("shape1primp");
		append(handles, pointerGetRaw64Bit(globalArrayPersistentGetPointer("scenep"), 0)); globalArrayPersistentDelete("scenep");

		let device = pointerGetRaw64Bit(globalArrayPersistentGetPointer("devicep"), 0); globalArrayPersistentDelete("devicep");

		if (pointerIsNull(device) == false) {
			for (var i = 0; i < len(handles); i += 1) {
				if (pointerIsNull(handles[i]) == false) {
					ertDecRef(device, handles[i]);
				}
			}
			ertDestroyDevice(device);
		}
	}
}
let devicep = globalArrayPersistentNew8Bit("devicep", 8);
var device = pointerGetRaw64Bit(devicep, 0);
if (pointerIsNull(device) == true) {
	device = ertCreateDevice("default", 0);
	pointerSetRaw64Bit(devicep, 0, device);
}
let rendererp = globalArrayPersistentNew8Bit("rendererp", 8);
var renderer = pointerGetRaw64Bit(rendererp, 0);
if (pointerIsNull(renderer) == true) {
	renderer = ertNewRenderer(device, "pathtracer");
	pointerSetRaw64Bit(rendererp, 0, renderer);
	ertSetInt1(device, renderer, "maxDepth", 20);
	ertSetInt1(device, renderer, "sampler.spp", 1);
	ertSetFloat1(device, renderer, "clampRadianceIfMoreThan", 10.0);
	ertSetFloat1(device, renderer, "clampRadianceTo", 5.0);
	ertCommit(device, renderer);
}
let tonemapperp = globalArrayPersistentNew8Bit("tonemapperp", 8);
var tonemapper = pointerGetRaw64Bit(tonemapperp, 0);
if (pointerIsNull(tonemapper) == true) {
	tonemapper = ertNewToneMapper(device, "default");
	pointerSetRaw64Bit(tonemapperp, 0, tonemapper);
	ertSetFloat1(device, tonemapper, "gamma", 1.0);
	ertCommit(device, tonemapper);
}
let framebufferp = globalArrayPersistentNew8Bit("framebufferp", 8);
var framebuffer = pointerGetRaw64Bit(framebufferp, 0);
if (pointerIsNull(framebuffer) == true) {
	framebuffer = ertNewFrameBuffer(device, "RGB_FLOAT32", 1800, 900, 1);
	pointerSetRaw64Bit(framebufferp, 0, framebuffer);
}
let camerap = globalArrayPersistentNew8Bit("camerap", 8);
var camera = pointerGetRaw64Bit(camerap, 0);
if (pointerIsNull(camera) == true) {
	camera = ertNewCamera(device, "depthoffield");
	pointerSetRaw64Bit(camerap, 0, camera);
}
let hdrimagep = globalArrayPersistentNew8Bit("hdrimagep", 8);
var hdrimage = pointerGetRaw64Bit(hdrimagep, 0);
if (pointerIsNull(hdrimage) == true) {
	hdrimage = ertNewImageFromFile(device, "data/lines.ppm");
	pointerSetRaw64Bit(hdrimagep, 0, hdrimage);
}
let hdrilightp = globalArrayPersistentNew8Bit("hdrilightp", 8);
var hdrilight = pointerGetRaw64Bit(hdrilightp, 0);
if (pointerIsNull(hdrilight) == true) {
	hdrilight = ertNewLight(device, "hdrilight");
	pointerSetRaw64Bit(hdrilightp, 0, hdrilight);
	ertSetImage(device, hdrilight, "image", hdrimage);
}
ertSetFloat3(device, hdrilight, "L", 0.005, 0.005, 0.005);
ertCommit(device, hdrilight);
let hdrilightprimp = globalArrayPersistentNew8Bit("hdrilightprimp", 8);
var hdrilightprim = pointerGetRaw64Bit(hdrilightprimp, 0);
if (pointerIsNull(hdrilightprim) == true) {
	hdrilightprim = ertNewLightPrimitive(device, hdrilight, pointerGetNull(), 0);
	pointerSetRaw64Bit(hdrilightprimp, 0, hdrilightprim);
}
let light0p = globalArrayPersistentNew8Bit("light0p", 8);
var light0 = pointerGetRaw64Bit(light0p, 0);
if (pointerIsNull(light0) == true) {
	light0 = ertNewLight(device, "trianglelight");
	pointerSetRaw64Bit(light0p, 0, light0);
}
let l00x =  1.0;
let l00y = -1.0;
let l00z =  1.5;
let l01x = -2.0;
let l01y =  5.0;
let l01z =  1.5;
let l02x = -5.0;
let l02y =  5.0;
let l02z =  1.5;
ertSetFloat3(device, light0, "v0", l00x, l00y, l00z);
ertSetFloat3(device, light0, "v1", l01x, l01y, l01z);
ertSetFloat3(device, light0, "v2", l02x, l02y, l02z);
ertSetFloat3(device, light0, "L", 2.0, 2.0, 0.8);
ertCommit(device, light0);
let light1p = globalArrayPersistentNew8Bit("light1p", 8);
var light1 = pointerGetRaw64Bit(light1p, 0);
if (pointerIsNull(light1) == true) {
	light1 = ertNewLight(device, "trianglelight");
	pointerSetRaw64Bit(light1p, 0, light1);
}
let l10x =  1.0;
let l10y = -1.0;
let l10z =  1.5;
let l11x = -5.0;
let l11y =  5.0;
let l11z =  1.5;
let l12x = -2.0;
let l12y = -1.0;
let l12z =  1.5;
ertSetFloat3(device, light1, "v0", l10x, l10y, l10z);
ertSetFloat3(device, light1, "v1", l11x, l11y, l11z);
ertSetFloat3(device, light1, "v2", l12x, l12y, l12z);
ertSetFloat3(device, light1, "L", 2.0, 2.0, 0.8);
ertCommit(device, light1);
let light0primp = globalArrayPersistentNew8Bit("light0primp", 8);
var light0prim = pointerGetRaw64Bit(light0primp, 0);
if (pointerIsNull(light0prim) == true) {
	light0prim = ertNewLightPrimitive(device, light0, pointerGetNull(), 0);
	pointerSetRaw64Bit(light0primp, 0, light0prim);
}
let light1primp = globalArrayPersistentNew8Bit("light1primp", 8);
var light1prim = pointerGetRaw64Bit(light1primp, 0);
if (pointerIsNull(light1prim) == true) {
	light1prim = ertNewLightPrimitive(device, light1, pointerGetNull(), 0);
	pointerSetRaw64Bit(light1primp, 0, light1prim);
}
let groundmaterialp = globalArrayPersistentNew8Bit("groundmaterialp", 8);
var groundmaterial = pointerGetRaw64Bit(groundmaterialp, 0);
if (pointerIsNull(groundmaterial) == true) {
	groundmaterial = ertNewMaterial(device, "Matte");
	pointerSetRaw64Bit(groundmaterialp, 0, groundmaterial);
	ertSetFloat3(device, groundmaterial, "reflectance", 1.0, 0.15, 0.15);
	ertCommit(device, groundmaterial);
}
let materialp = globalArrayPersistentNew8Bit("materialp", 8);
var material = pointerGetRaw64Bit(materialp, 0);
if (pointerIsNull(material) == true) {
	material = ertNewMaterial(device, "Matte");
	pointerSetRaw64Bit(materialp, 0, material);
	ertSetFloat3(device, material, "reflectance", 1.0, 1.0, 1.0);
	ertCommit(device, material);
}
let glassmaterialp = globalArrayPersistentNew8Bit("glassmaterialp", 8);
var glassmaterial = pointerGetRaw64Bit(glassmaterialp, 0);
if (pointerIsNull(glassmaterial) == true) {
	glassmaterial = ertNewMaterial(device, "Glass");
	pointerSetRaw64Bit(glassmaterialp, 0, glassmaterial);
}
ertSetFloat3(device, glassmaterial, "transmission", 1.0, 1.0, 1.0);
ertSetFloat1(device, glassmaterial, "etaOutside", 1.0);
ertSetFloat1(device, glassmaterial, "etaInside", 1.15);
ertCommit(device, glassmaterial);
let groundshapep = globalArrayPersistentNew8Bit("groundshapep", 8);
var groundshape = pointerGetRaw64Bit(groundshapep, 0);
if (pointerIsNull(groundshape) == true) {
	groundshape = ertNewShape(device, "trianglemesh");
	pointerSetRaw64Bit(groundshapep, 0, groundshape);
	let groundPositions = globalArrayNew8Bit("groundPositions", 4 * (3 * 4));
	let groundNormals = globalArrayNew8Bit("groundNormals", 4 * (3 * 4));
	let groundIndices = globalArrayNew8Bit("groundIndices", 6 * 4);
	pointerSetNumber(groundPositions, 0 * 3 + 0,-100.0);
	pointerSetNumber(groundPositions, 0 * 3 + 1,-1.0);
	pointerSetNumber(groundPositions, 0 * 3 + 2,-100.0);
	pointerSetNumber(groundPositions, 1 * 3 + 0, 100.0);
	pointerSetNumber(groundPositions, 1 * 3 + 1,-1.0);
	pointerSetNumber(groundPositions, 1 * 3 + 2,-100.0);
	pointerSetNumber(groundPositions, 2 * 3 + 0,-100.0);
	pointerSetNumber(groundPositions, 2 * 3 + 1,-1.0);
	pointerSetNumber(groundPositions, 2 * 3 + 2, 100.0);
	pointerSetNumber(groundPositions, 3 * 3 + 0, 100.0);
	pointerSetNumber(groundPositions, 3 * 3 + 1,-1.0);
	pointerSetNumber(groundPositions, 3 * 3 + 2, 100.0);
	pointerSetNumber(groundNormals, 0 * 3 + 0, 0.0);
	pointerSetNumber(groundNormals, 0 * 3 + 1, 1.0);
	pointerSetNumber(groundNormals, 0 * 3 + 2, 0.0);
	pointerSetNumber(groundNormals, 1 * 3 + 0, 0.0);
	pointerSetNumber(groundNormals, 1 * 3 + 1, 1.0);
	pointerSetNumber(groundNormals, 1 * 3 + 2, 0.0);
	pointerSetNumber(groundNormals, 2 * 3 + 0, 0.0);
	pointerSetNumber(groundNormals, 2 * 3 + 1, 1.0);
	pointerSetNumber(groundNormals, 2 * 3 + 2, 0.0);
	pointerSetNumber(groundNormals, 3 * 3 + 0, 0.0);
	pointerSetNumber(groundNormals, 3 * 3 + 1, 1.0);
	pointerSetNumber(groundNormals, 3 * 3 + 2, 0.0);
	pointerSetUnsignedInteger(groundIndices, 0, 0);
	pointerSetUnsignedInteger(groundIndices, 1, 1);
	pointerSetUnsignedInteger(groundIndices, 2, 2);
	pointerSetUnsignedInteger(groundIndices, 3, 1);
	pointerSetUnsignedInteger(groundIndices, 4, 3);
	pointerSetUnsignedInteger(groundIndices, 5, 2);
	let positions = ertNewData(device, "immutable_managed", 4 * (3 * 4), groundPositions, 0);
	let normals = ertNewData(device, "immutable_managed", 4 * (3 * 4), groundNormals, 0);
	let indices = ertNewData(device, "immutable_managed", 6 * 4, groundIndices, 0);
	ertSetArray(device, groundshape, "positions", "float3", positions, 4, 3 * 4, 0);
	ertSetArray(device, groundshape, "normals", "float3", normals, 4, 3 * 4, 0);
	ertSetArray(device, groundshape, "indices", "int3", indices, 6 / 3, 3 * 4, 0);
	ertCommit(device, groundshape);
	ertClear(device, groundshape);
}
let shapep = globalArrayPersistentNew8Bit("shapep", 8);
var shape = pointerGetRaw64Bit(shapep, 0);
if (pointerIsNull(shape) == true) {
	shape = ertNewShape(device, "trianglemesh");
	pointerSetRaw64Bit(shapep, 0, shape);
	let positions = ertNewData(device, "immutable_managed", meshGetVerticesCount(suzanne) * (3 * 4), meshGetVerticesPointer(suzanne), 0);
	let normals = ertNewData(device, "immutable_managed", meshGetVerticesCount(suzanne) * (3 * 4), verticesNormal, 0);
	let indices = ertNewData(device, "immutable_managed", meshGetIndicesCount(suzanne) * 4, meshGetIndicesPointer(suzanne), 0);
	ertSetArray(device, shape, "positions", "float3", positions, meshGetVerticesCount(suzanne), 3 * 4, 0);
	ertSetArray(device, shape, "normals", "float3", normals, meshGetVerticesCount(suzanne), 3 * 4, 0);
	ertSetArray(device, shape, "indices", "int3", indices, meshGetIndicesCount(suzanne) / 3, 3 * 4, 0);
	ertCommit(device, shape);
	ertClear(device, shape);
}
let groundshapeprimp = globalArrayPersistentNew8Bit("groundshapeprimp", 8);
var groundshapeprim = pointerGetRaw64Bit(groundshapeprimp, 0);
if (pointerIsNull(groundshapeprim) == true) {
	groundshapeprim = ertNewShapePrimitive(device, groundshape, groundmaterial, pointerGetNull(), 0);
	pointerSetRaw64Bit(groundshapeprimp, 0, groundshapeprim);
}
let shape0primp = globalArrayPersistentNew8Bit("shape0primp", 8);
var shape0prim = pointerGetRaw64Bit(shape0primp, 0);
if (pointerIsNull(shape0prim) == true) {
	shape0prim = ertNewShapePrimitive(device, shape, material, pointerGetNull(), 0);
	pointerSetRaw64Bit(shape0primp, 0, shape0prim);
}
let shape1primp = globalArrayPersistentNew8Bit("shape1primp", 8);
var shape1prim = pointerGetRaw64Bit(shape1primp, 0);
if (pointerIsNull(shape1prim) == true) {
	let shape1Matrix = globalArrayNew8Bit("shape1Matrix", ertAffineSpace3fGetSizeOfInBytes());
	ertAffineSpace3fSetDefaultInitialize(shape1Matrix, 0);
	ertAffineSpace3fTranslate(shape1Matrix, 0, -3, 0, 0);
	let shape1MatrixArray = globalArrayNew8Bit("shape1MatrixArray", 12 * 4);
	ertAffineSpace3fCopyToArray(shape1Matrix, 0, shape1MatrixArray, 0);
	shape1prim = ertNewShapePrimitive(device, shape, glassmaterial, shape1MatrixArray, 0);
	pointerSetRaw64Bit(shape1primp, 0, shape1prim);
}
let primitivesCount = 6.0;
let primitives = globalArrayNew8Bit("primitives", primitivesCount * 8);
pointerSetRaw64Bit(primitives, 0 * 8, groundshapeprim);
pointerSetRaw64Bit(primitives, 1 * 8, shape0prim);
pointerSetRaw64Bit(primitives, 2 * 8, shape1prim);
pointerSetRaw64Bit(primitives, 3 * 8, hdrilightprim);
pointerSetRaw64Bit(primitives, 4 * 8, light0prim);
pointerSetRaw64Bit(primitives, 5 * 8, light1prim);
let scenep = globalArrayPersistentNew8Bit("scenep", 8);
var scene = pointerGetRaw64Bit(scenep, 0);
if (pointerIsNull(scene) == true) {
	scene = ertNewScene(device, "default default", primitives, 0, primitivesCount);
	pointerSetRaw64Bit(scenep, 0, scene);
}
let cameraMatrix = globalArrayNew8Bit("cameraMatrix", ertAffineSpace3fGetSizeOfInBytes());
var p = defaultCameraGetVector();
var t = defaultCameraGetLookAtVector();
var u = defaultCameraGetUpVector();
ertAffineSpace3fSetLookAtPoint(cameraMatrix, 0, p[0], p[1], p[2], p[0]+t[0], p[1]+t[1], p[2]+t[2], -u[0], -u[1], -u[2]); // NOTE(Constantine): Intentionally inverted up vector to GL draw upside down.
let cameraMatrixArray = globalArrayNew8Bit("cameraMatrixArray", 12 * 4);
ertAffineSpace3fCopyToArray(cameraMatrix, 0, cameraMatrixArray, 0);
ertSetTransform(device, camera, "local2world", cameraMatrixArray, 0);
ertSetFloat1(device, camera, "angle", 60);
ertSetFloat1(device, camera, "aspectRatio", 1800.0 / 900.0);
ertSetFloat1(device, camera, "focalDistance", 10);
ertSetFloat1(device, camera, "lensRadius", 0.001);
ertCommit(device, camera);

meshDraw(suzanne, 0, 1,1,1, 0,0,0, 0,0,0,0);
meshDraw(suzanne, 0, 1,1,1,-3,0,0, 0,0,0,0);
{
	let groundPositions = globalArrayGetPointer("groundPositions");
	drawTriangle("",
		pointerGetNumber(groundPositions, 0 * 3 + 0),
		pointerGetNumber(groundPositions, 0 * 3 + 1),
		pointerGetNumber(groundPositions, 0 * 3 + 2),
		pointerGetNumber(groundPositions, 1 * 3 + 0),
		pointerGetNumber(groundPositions, 1 * 3 + 1),
		pointerGetNumber(groundPositions, 1 * 3 + 2),
		pointerGetNumber(groundPositions, 2 * 3 + 0),
		pointerGetNumber(groundPositions, 2 * 3 + 1),
		pointerGetNumber(groundPositions, 2 * 3 + 2),
		255, 255 * 0.15, 255 * 0.15, 255
	);
	drawTriangle("",
		pointerGetNumber(groundPositions, 1 * 3 + 0),
		pointerGetNumber(groundPositions, 1 * 3 + 1),
		pointerGetNumber(groundPositions, 1 * 3 + 2),
		pointerGetNumber(groundPositions, 3 * 3 + 0),
		pointerGetNumber(groundPositions, 3 * 3 + 1),
		pointerGetNumber(groundPositions, 3 * 3 + 2),
		pointerGetNumber(groundPositions, 2 * 3 + 0),
		pointerGetNumber(groundPositions, 2 * 3 + 1),
		pointerGetNumber(groundPositions, 2 * 3 + 2),
		255, 255 * 0.15, 255 * 0.15, 255
	);
	drawTriangle("",
		pointerGetNumber(groundPositions, 0 * 3 + 0),
		pointerGetNumber(groundPositions, 0 * 3 + 1),
		pointerGetNumber(groundPositions, 0 * 3 + 2),
		pointerGetNumber(groundPositions, 1 * 3 + 0),
		pointerGetNumber(groundPositions, 1 * 3 + 1),
		pointerGetNumber(groundPositions, 1 * 3 + 2),
		pointerGetNumber(groundPositions, 2 * 3 + 0),
		pointerGetNumber(groundPositions, 2 * 3 + 1),
		pointerGetNumber(groundPositions, 2 * 3 + 2),
		255, 255 * 0.15, 255 * 0.15, 255
	);
	drawTriangle("", l00x, l00y, l00z, l01x, l01y, l01z, l02x, l02y, l02z, 255, 255, 255 * 0.8, 255);
	drawTriangle("", l10x, l10y, l10z, l11x, l11y, l11z, l12x, l12y, l12z, 255, 255, 255 * 0.8, 255);
}

if (pointerGetUnsignedInteger(currentMode, 0) == 1) {
	ertRenderFrame(device, renderer, camera, scene, tonemapper, framebuffer, getCurrentFrame());
	ertSwapBuffers(device, framebuffer);
	let fbp = ertMapFrameBuffer(device, framebuffer);
	//pointerDrawPixels(fbp, 0, 1800, 900, 6408, 5126); // GL_RGBA, GL_FLOAT
	let pixels = imageNew("pixels", 1800, 900);
	for (var y = 0; y < 900; y += 1) {
		for (var x = 0; x < 1800; x += 1) {
			var r = 0.0;
			var g = 0.0;
			var b = 0.0;
			let offset = ((y * 1800.0) + x) * 4.0;
			r = pointerGetNumber(fbp, offset + 0.0);
			g = pointerGetNumber(fbp, offset + 1.0);
			b = pointerGetNumber(fbp, offset + 2.0);
			r = r > 1.0 ? 1.0 : r;
			g = g > 1.0 ? 1.0 : g;
			b = b > 1.0 ? 1.0 : b;
			imageSetColor(pixels, x, (900.0 - 1.0) - y, r * 255.0, g * 255.0, b * 255.0, 255);
		}
	}
	imageUpdate(pixels);
	ertUnmapFrameBuffer(device, framebuffer);
	imageDraw(pixels, 0, 0, 0, 1800, 900);
}
