// For Game Script C from Feb 27, 2022.

#ifdef _WIN32
#include "C:/github/procedural/gamescript_c_header/gamescriptc.h"
#else
#include "/opt/github/procedural/gamescript_c_header/gamescriptc.h"
#endif

void meshConvertToIndexMesh(Number mesh) { // Number
	meshClearIndices(mesh);
	for (Number i = 0; i < meshGetVerticesCount(mesh) / 3; i += 1) {
		meshAddTriangle(mesh, i * 3 + 0, i * 3 + 1, i * 3 + 2);
	}
}

cfn frame() {

framestart();

printDraw(strjoin("Frame: ", numberToString(getCurrentFrame())));

{
	NumberArray cameraVector = defaultCameraGetVector();
	NumberArray cameraVersor = defaultCameraGetVersor();
	if (cameraVector[0] == 0 && cameraVector[1] == 0 && cameraVector[2] == 10 &&
	    cameraVersor[0] == 0 && cameraVersor[1] == 0 && cameraVersor[2] == 0  && cameraVersor[3] == 1)
	{
		defaultCameraSetVector(-3.359291, 0.254475,-3.232193);
		defaultCameraSetVersor( 0.003961, 0.978337, 0.018788, -0.206169);
	}
}

if (false) {
	String strings[] = {
		numberToString(defaultCameraGetVector()[0]), " ",
		numberToString(defaultCameraGetVector()[1]), " ",
		numberToString(defaultCameraGetVector()[2]), " ",
		numberToString(defaultCameraGetVersor()[0]), " ",
		numberToString(defaultCameraGetVersor()[1]), " ",
		numberToString(defaultCameraGetVersor()[2]), " ",
		numberToString(defaultCameraGetVersor()[3])
	};
	printDraw(
		strjoins(_len(strings), strings)
	);
}

defaultCameraSetMoveSpeed(0.025);

//setCurrentFrame(0);

Number suzanne = meshNew("suzanne");
String verticesString = stringReadFromFile(strjoin(getExeDirectoryPath(), "data/suzanne.txt"));
Number verticesComponentsCount = (strlenWithNullChar(verticesString)-1) / 10;

Number trianglesNormal = globalArrayPersistentNew8Bit("trianglesNormal", (verticesComponentsCount / 9) * 3 * 4);
Number verticesNormal = globalArrayPersistentNew8Bit("verticesNormal", verticesComponentsCount * 4);

if (getCurrentFrame() == 0) {
	//verticesComponentsCount = 3 * 9; // Debug N triangles
	//printDraw(numberToString(verticesCount));
	Number stringNumber = globalArrayNew8Bit("stringNumber", 11);
	Number vertex[3] = {0, 0, 0};
	for (Number i = 0; i < verticesComponentsCount; i += 1) {
		pointerSetSubstring(stringNumber, 0, verticesString, i*10, 10);
		vertex[(uint64_t)i % 3] = interpretStringToFloat(pointerGetString(stringNumber));
		if ((uint64_t)i % 3 == 2) {
			meshAddVertex(suzanne, vertex[0], vertex[1], vertex[2]);
			meshAddColor(suzanne, i / verticesComponentsCount, i / verticesComponentsCount, i / verticesComponentsCount, 1);
		}
	}
	// Generate array of triangle per-vertex normals
	{
		Number v = meshGetVerticesPointer(suzanne);
		for (Number i = 0; i < verticesComponentsCount / 9; i += 1) {
			Number x0 = pointerGetNumber(v, i * 9 + 0);
			Number y0 = pointerGetNumber(v, i * 9 + 1);
			Number z0 = pointerGetNumber(v, i * 9 + 2);

			Number x1 = pointerGetNumber(v, i * 9 + 3);
			Number y1 = pointerGetNumber(v, i * 9 + 4);
			Number z1 = pointerGetNumber(v, i * 9 + 5);

			Number x2 = pointerGetNumber(v, i * 9 + 6);
			Number y2 = pointerGetNumber(v, i * 9 + 7);
			Number z2 = pointerGetNumber(v, i * 9 + 8);

			Number pointSize = 0.5;

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

			Number d10x = x1 - x0;
			Number d10y = y1 - y0;
			Number d10z = z1 - z0;

			Number d20x = x2 - x0;
			Number d20y = y2 - y0;
			Number d20z = z2 - z0;

			Number nx = d20y*d10z - d10y*d20z;
			Number ny = d20z*d10x - d10z*d20x;
			Number nz = d20x*d10y - d10x*d20y;

			Number l = sqrt(nx*nx + ny*ny + nz*nz);

			nx /= l;
			ny /= l;
			nz /= l;

			pointerSetNumber(trianglesNormal, i * 3 + 0, nx);
			pointerSetNumber(trianglesNormal, i * 3 + 1, ny);
			pointerSetNumber(trianglesNormal, i * 3 + 2, nz);

			Number normalDrawLength = 0.04;

			nx *= normalDrawLength;
			ny *= normalDrawLength;
			nz *= normalDrawLength;

			Number drawOffset = 0.02;

			Number x0o = x0 - ((x0-x1)*drawOffset) - ((x0-x2)*drawOffset);
			Number y0o = y0 - ((y0-y1)*drawOffset) - ((y0-y2)*drawOffset);
			Number z0o = z0 - ((z0-z1)*drawOffset) - ((z0-z2)*drawOffset);
 
			Number x1o = x1 - ((x1-x2)*drawOffset) - ((x1-x0)*drawOffset);
			Number y1o = y1 - ((y1-y2)*drawOffset) - ((y1-y0)*drawOffset);
			Number z1o = z1 - ((z1-z2)*drawOffset) - ((z1-z0)*drawOffset);

			Number x2o = x2 - ((x2-x0)*drawOffset) - ((x2-x1)*drawOffset);
			Number y2o = y2 - ((y2-y0)*drawOffset) - ((y2-y1)*drawOffset);
			Number z2o = z2 - ((z2-z0)*drawOffset) - ((z2-z1)*drawOffset);

			drawLine("", x0o,y0o,z0o, nx+x0o,ny+y0o,nz+z0o, 2, 255,0,255,255);
			drawLine("", x1o,y1o,z1o, nx+x1o,ny+y1o,nz+z1o, 2, 0,255,0,255);
			drawLine("", x2o,y2o,z2o, nx+x2o,ny+y2o,nz+z2o, 2, 0,0,255,255);
		}
	}
}

{
	Number v = meshGetVerticesPointer(suzanne);
	for (Number i = 0; i < verticesComponentsCount / 9; i += 1) {
		Number x0 = pointerGetNumber(v, i * 9 + 0);
		Number y0 = pointerGetNumber(v, i * 9 + 1);
		Number z0 = pointerGetNumber(v, i * 9 + 2);

		Number x1 = pointerGetNumber(v, i * 9 + 3);
		Number y1 = pointerGetNumber(v, i * 9 + 4);
		Number z1 = pointerGetNumber(v, i * 9 + 5);

		Number x2 = pointerGetNumber(v, i * 9 + 6);
		Number y2 = pointerGetNumber(v, i * 9 + 7);
		Number z2 = pointerGetNumber(v, i * 9 + 8);

		Number nx = pointerGetNumber(trianglesNormal, i * 3 + 0);
		Number ny = pointerGetNumber(trianglesNormal, i * 3 + 1);
		Number nz = pointerGetNumber(trianglesNormal, i * 3 + 2);

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

Number currentMode = globalArrayPersistentNew8Bit("currentRenderMode", 1 * 4);
if (mouseGetButtonIsPressed(2)) { // Change current render mode: right mouse button
	Number v = pointerGetUnsignedInteger(currentMode, 0);
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
		Number handles[] = {
			pointerGetRaw64Bit(globalArrayPersistentGetPointer("rendererp"), 0),
			pointerGetRaw64Bit(globalArrayPersistentGetPointer("tonemapperp"), 0),
			pointerGetRaw64Bit(globalArrayPersistentGetPointer("framebufferp"), 0),
			pointerGetRaw64Bit(globalArrayPersistentGetPointer("camerap"), 0),
			pointerGetRaw64Bit(globalArrayPersistentGetPointer("hdrimagep"), 0),
			pointerGetRaw64Bit(globalArrayPersistentGetPointer("hdrilightp"), 0),
			pointerGetRaw64Bit(globalArrayPersistentGetPointer("hdrilightprimp"), 0),
			pointerGetRaw64Bit(globalArrayPersistentGetPointer("light0p"), 0),
			pointerGetRaw64Bit(globalArrayPersistentGetPointer("light1p"), 0),
			pointerGetRaw64Bit(globalArrayPersistentGetPointer("light0primp"), 0),
			pointerGetRaw64Bit(globalArrayPersistentGetPointer("light1primp"), 0),
			pointerGetRaw64Bit(globalArrayPersistentGetPointer("groundmaterialp"), 0),
			pointerGetRaw64Bit(globalArrayPersistentGetPointer("materialp"), 0),
			pointerGetRaw64Bit(globalArrayPersistentGetPointer("glassmaterialp"), 0),
			pointerGetRaw64Bit(globalArrayPersistentGetPointer("groundshapep"), 0),
			pointerGetRaw64Bit(globalArrayPersistentGetPointer("shapep"), 0),
			pointerGetRaw64Bit(globalArrayPersistentGetPointer("groundshapeprimp"), 0),
			pointerGetRaw64Bit(globalArrayPersistentGetPointer("shape0primp"), 0),
			pointerGetRaw64Bit(globalArrayPersistentGetPointer("shape1primp"), 0),
			pointerGetRaw64Bit(globalArrayPersistentGetPointer("scenep"), 0)
		};
		globalArrayPersistentDelete("rendererp");
		globalArrayPersistentDelete("tonemapperp");
		globalArrayPersistentDelete("framebufferp");
		globalArrayPersistentDelete("camerap");
		globalArrayPersistentDelete("hdrimagep");
		globalArrayPersistentDelete("hdrilightp");
		globalArrayPersistentDelete("hdrilightprimp");
		globalArrayPersistentDelete("light0p");
		globalArrayPersistentDelete("light1p");
		globalArrayPersistentDelete("light0primp");
		globalArrayPersistentDelete("light1primp");
		globalArrayPersistentDelete("groundmaterialp");
		globalArrayPersistentDelete("materialp");
		globalArrayPersistentDelete("glassmaterialp");
		globalArrayPersistentDelete("groundshapep");
		globalArrayPersistentDelete("shapep");
		globalArrayPersistentDelete("groundshapeprimp");
		globalArrayPersistentDelete("shape0primp");
		globalArrayPersistentDelete("shape1primp");
		globalArrayPersistentDelete("scenep");

		Number device = pointerGetRaw64Bit(globalArrayPersistentGetPointer("devicep"), 0);
		globalArrayPersistentDelete("devicep");

		if (pointerIsNull(device) == false) {
			for (Number i = 0; i < _len(handles); i += 1) {
				if (pointerIsNull(handles[(uint64_t)i]) == false) {
					ertDecRef(device, handles[(uint64_t)i]);
				}
			}
			ertDestroyDevice(device);
		}
	}
}
Number devicep = globalArrayPersistentNew8Bit("devicep", 8);
Number device = pointerGetRaw64Bit(devicep, 0);
if (pointerIsNull(device) == true) {
	device = ertCreateDevice("default", 0);
	pointerSetRaw64Bit(devicep, 0, device);
}
Number rendererp = globalArrayPersistentNew8Bit("rendererp", 8);
Number renderer = pointerGetRaw64Bit(rendererp, 0);
if (pointerIsNull(renderer) == true) {
	renderer = ertNewRenderer(device, "pathtracer");
	pointerSetRaw64Bit(rendererp, 0, renderer);
	ertSetInt1(device, renderer, "maxDepth", 20);
	ertSetInt1(device, renderer, "sampler.spp", 1);
	ertSetFloat1(device, renderer, "clampRadianceIfMoreThan", 10.0);
	ertSetFloat1(device, renderer, "clampRadianceTo", 5.0);
	ertCommit(device, renderer);
}
Number tonemapperp = globalArrayPersistentNew8Bit("tonemapperp", 8);
Number tonemapper = pointerGetRaw64Bit(tonemapperp, 0);
if (pointerIsNull(tonemapper) == true) {
	tonemapper = ertNewToneMapper(device, "default");
	pointerSetRaw64Bit(tonemapperp, 0, tonemapper);
	ertSetFloat1(device, tonemapper, "gamma", 1.0);
	ertCommit(device, tonemapper);
}
Number framebufferp = globalArrayPersistentNew8Bit("framebufferp", 8);
Number framebuffer = pointerGetRaw64Bit(framebufferp, 0);
if (pointerIsNull(framebuffer) == true) {
	framebuffer = ertNewFrameBuffer(device, "RGB_FLOAT32", 1800, 900, 1);
	pointerSetRaw64Bit(framebufferp, 0, framebuffer);
}
Number camerap = globalArrayPersistentNew8Bit("camerap", 8);
Number camera = pointerGetRaw64Bit(camerap, 0);
if (pointerIsNull(camera) == true) {
	camera = ertNewCamera(device, "depthoffield");
	pointerSetRaw64Bit(camerap, 0, camera);
}
Number hdrimagep = globalArrayPersistentNew8Bit("hdrimagep", 8);
Number hdrimage = pointerGetRaw64Bit(hdrimagep, 0);
if (pointerIsNull(hdrimage) == true) {
	hdrimage = ertNewImageFromFile(device, strjoin(getExeDirectoryPath(), "data/lines.ppm"));
	pointerSetRaw64Bit(hdrimagep, 0, hdrimage);
}
Number hdrilightp = globalArrayPersistentNew8Bit("hdrilightp", 8);
Number hdrilight = pointerGetRaw64Bit(hdrilightp, 0);
if (pointerIsNull(hdrilight) == true) {
	hdrilight = ertNewLight(device, "hdrilight");
	pointerSetRaw64Bit(hdrilightp, 0, hdrilight);
	ertSetImage(device, hdrilight, "image", hdrimage);
}
ertSetFloat3(device, hdrilight, "L", 0.005, 0.005, 0.005);
ertCommit(device, hdrilight);
Number hdrilightprimp = globalArrayPersistentNew8Bit("hdrilightprimp", 8);
Number hdrilightprim = pointerGetRaw64Bit(hdrilightprimp, 0);
if (pointerIsNull(hdrilightprim) == true) {
	hdrilightprim = ertNewLightPrimitive(device, hdrilight, pointerGetNull(), 0);
	pointerSetRaw64Bit(hdrilightprimp, 0, hdrilightprim);
}
Number light0p = globalArrayPersistentNew8Bit("light0p", 8);
Number light0 = pointerGetRaw64Bit(light0p, 0);
if (pointerIsNull(light0) == true) {
	light0 = ertNewLight(device, "trianglelight");
	pointerSetRaw64Bit(light0p, 0, light0);
}
Number l00x =  1.0;
Number l00y = -1.0;
Number l00z =  1.5;
Number l01x = -2.0;
Number l01y =  5.0;
Number l01z =  1.5;
Number l02x = -5.0;
Number l02y =  5.0;
Number l02z =  1.5;
ertSetFloat3(device, light0, "v0", l00x, l00y, l00z);
ertSetFloat3(device, light0, "v1", l01x, l01y, l01z);
ertSetFloat3(device, light0, "v2", l02x, l02y, l02z);
ertSetFloat3(device, light0, "L", 2.0, 2.0, 0.8);
ertCommit(device, light0);
Number light1p = globalArrayPersistentNew8Bit("light1p", 8);
Number light1 = pointerGetRaw64Bit(light1p, 0);
if (pointerIsNull(light1) == true) {
	light1 = ertNewLight(device, "trianglelight");
	pointerSetRaw64Bit(light1p, 0, light1);
}
Number l10x =  1.0;
Number l10y = -1.0;
Number l10z =  1.5;
Number l11x = -5.0;
Number l11y =  5.0;
Number l11z =  1.5;
Number l12x = -2.0;
Number l12y = -1.0;
Number l12z =  1.5;
ertSetFloat3(device, light1, "v0", l10x, l10y, l10z);
ertSetFloat3(device, light1, "v1", l11x, l11y, l11z);
ertSetFloat3(device, light1, "v2", l12x, l12y, l12z);
ertSetFloat3(device, light1, "L", 2.0, 2.0, 0.8);
ertCommit(device, light1);
Number light0primp = globalArrayPersistentNew8Bit("light0primp", 8);
Number light0prim = pointerGetRaw64Bit(light0primp, 0);
if (pointerIsNull(light0prim) == true) {
	light0prim = ertNewLightPrimitive(device, light0, pointerGetNull(), 0);
	pointerSetRaw64Bit(light0primp, 0, light0prim);
}
Number light1primp = globalArrayPersistentNew8Bit("light1primp", 8);
Number light1prim = pointerGetRaw64Bit(light1primp, 0);
if (pointerIsNull(light1prim) == true) {
	light1prim = ertNewLightPrimitive(device, light1, pointerGetNull(), 0);
	pointerSetRaw64Bit(light1primp, 0, light1prim);
}
Number groundmaterialp = globalArrayPersistentNew8Bit("groundmaterialp", 8);
Number groundmaterial = pointerGetRaw64Bit(groundmaterialp, 0);
if (pointerIsNull(groundmaterial) == true) {
	groundmaterial = ertNewMaterial(device, "Matte");
	pointerSetRaw64Bit(groundmaterialp, 0, groundmaterial);
	ertSetFloat3(device, groundmaterial, "reflectance", 1.0, 0.15, 0.15);
	ertCommit(device, groundmaterial);
}
Number materialp = globalArrayPersistentNew8Bit("materialp", 8);
Number material = pointerGetRaw64Bit(materialp, 0);
if (pointerIsNull(material) == true) {
	material = ertNewMaterial(device, "Matte");
	pointerSetRaw64Bit(materialp, 0, material);
	ertSetFloat3(device, material, "reflectance", 1.0, 1.0, 1.0);
	ertCommit(device, material);
}
Number glassmaterialp = globalArrayPersistentNew8Bit("glassmaterialp", 8);
Number glassmaterial = pointerGetRaw64Bit(glassmaterialp, 0);
if (pointerIsNull(glassmaterial) == true) {
	glassmaterial = ertNewMaterial(device, "Glass");
	pointerSetRaw64Bit(glassmaterialp, 0, glassmaterial);
}
ertSetFloat3(device, glassmaterial, "transmission", 1.0, 1.0, 1.0);
ertSetFloat1(device, glassmaterial, "etaOutside", 1.0);
ertSetFloat1(device, glassmaterial, "etaInside", 1.15);
ertCommit(device, glassmaterial);
Number groundshapep = globalArrayPersistentNew8Bit("groundshapep", 8);
Number groundshape = pointerGetRaw64Bit(groundshapep, 0);
if (pointerIsNull(groundshape) == true) {
	groundshape = ertNewShape(device, "trianglemesh");
	pointerSetRaw64Bit(groundshapep, 0, groundshape);
	Number groundPositions = globalArrayNew8Bit("groundPositions", 4 * (3 * 4));
	Number groundNormals = globalArrayNew8Bit("groundNormals", 4 * (3 * 4));
	Number groundIndices = globalArrayNew8Bit("groundIndices", 6 * 4);
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
	Number positions = ertNewData(device, "immutable_managed", 4 * (3 * 4), groundPositions, 0);
	Number normals = ertNewData(device, "immutable_managed", 4 * (3 * 4), groundNormals, 0);
	Number indices = ertNewData(device, "immutable_managed", 6 * 4, groundIndices, 0);
	ertSetArray(device, groundshape, "positions", "float3", positions, 4, 3 * 4, 0);
	ertSetArray(device, groundshape, "normals", "float3", normals, 4, 3 * 4, 0);
	ertSetArray(device, groundshape, "indices", "int3", indices, 6 / 3, 3 * 4, 0);
	ertCommit(device, groundshape);
	ertClear(device, groundshape);
}
Number shapep = globalArrayPersistentNew8Bit("shapep", 8);
Number shape = pointerGetRaw64Bit(shapep, 0);
if (pointerIsNull(shape) == true) {
	shape = ertNewShape(device, "trianglemesh");
	pointerSetRaw64Bit(shapep, 0, shape);
	Number positions = ertNewData(device, "immutable_managed", meshGetVerticesCount(suzanne) * (3 * 4), meshGetVerticesPointer(suzanne), 0);
	Number normals = ertNewData(device, "immutable_managed", meshGetVerticesCount(suzanne) * (3 * 4), verticesNormal, 0);
	Number indices = ertNewData(device, "immutable_managed", meshGetIndicesCount(suzanne) * 4, meshGetIndicesPointer(suzanne), 0);
	ertSetArray(device, shape, "positions", "float3", positions, meshGetVerticesCount(suzanne), 3 * 4, 0);
	ertSetArray(device, shape, "normals", "float3", normals, meshGetVerticesCount(suzanne), 3 * 4, 0);
	ertSetArray(device, shape, "indices", "int3", indices, meshGetIndicesCount(suzanne) / 3, 3 * 4, 0);
	ertCommit(device, shape);
	ertClear(device, shape);
}
Number groundshapeprimp = globalArrayPersistentNew8Bit("groundshapeprimp", 8);
Number groundshapeprim = pointerGetRaw64Bit(groundshapeprimp, 0);
if (pointerIsNull(groundshapeprim) == true) {
	groundshapeprim = ertNewShapePrimitive(device, groundshape, groundmaterial, pointerGetNull(), 0);
	pointerSetRaw64Bit(groundshapeprimp, 0, groundshapeprim);
}
Number shape0primp = globalArrayPersistentNew8Bit("shape0primp", 8);
Number shape0prim = pointerGetRaw64Bit(shape0primp, 0);
if (pointerIsNull(shape0prim) == true) {
	shape0prim = ertNewShapePrimitive(device, shape, material, pointerGetNull(), 0);
	pointerSetRaw64Bit(shape0primp, 0, shape0prim);
}
Number shape1primp = globalArrayPersistentNew8Bit("shape1primp", 8);
Number shape1prim = pointerGetRaw64Bit(shape1primp, 0);
if (pointerIsNull(shape1prim) == true) {
	Number shape1Matrix = globalArrayNew8Bit("shape1Matrix", ertAffineSpace3fGetSizeOfInBytes());
	ertAffineSpace3fSetDefaultInitialize(shape1Matrix, 0);
	ertAffineSpace3fTranslate(shape1Matrix, 0, -3, 0, 0);
	Number shape1MatrixArray = globalArrayNew8Bit("shape1MatrixArray", 12 * 4);
	ertAffineSpace3fCopyToArray(shape1Matrix, 0, shape1MatrixArray, 0);
	shape1prim = ertNewShapePrimitive(device, shape, glassmaterial, shape1MatrixArray, 0);
	pointerSetRaw64Bit(shape1primp, 0, shape1prim);
}
Number primitivesCount = 6.0;
Number primitives = globalArrayNew8Bit("primitives", primitivesCount * 8);
pointerSetRaw64Bit(primitives, 0 * 8, groundshapeprim);
pointerSetRaw64Bit(primitives, 1 * 8, shape0prim);
pointerSetRaw64Bit(primitives, 2 * 8, shape1prim);
pointerSetRaw64Bit(primitives, 3 * 8, hdrilightprim);
pointerSetRaw64Bit(primitives, 4 * 8, light0prim);
pointerSetRaw64Bit(primitives, 5 * 8, light1prim);
Number scenep = globalArrayPersistentNew8Bit("scenep", 8);
Number scene = pointerGetRaw64Bit(scenep, 0);
if (pointerIsNull(scene) == true) {
	scene = ertNewScene(device, "default default", primitives, 0, primitivesCount);
	pointerSetRaw64Bit(scenep, 0, scene);
}
Number cameraMatrix = globalArrayNew8Bit("cameraMatrix", ertAffineSpace3fGetSizeOfInBytes());
NumberArray p = defaultCameraGetVector();
NumberArray t = defaultCameraGetLookAtVector();
NumberArray u = defaultCameraGetUpVector();
ertAffineSpace3fSetLookAtPoint(cameraMatrix, 0, p[0], p[1], p[2], p[0]+t[0], p[1]+t[1], p[2]+t[2], -u[0], -u[1], -u[2]); // NOTE(Constantine): Intentionally inverted up vector to GL draw upside down.
Number cameraMatrixArray = globalArrayNew8Bit("cameraMatrixArray", 12 * 4);
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
	Number groundPositions = globalArrayGetPointer("groundPositions");
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
	Number fbp = ertMapFrameBuffer(device, framebuffer);
	//pointerDrawPixels(fbp, 0, 1800, 900, 6408, 5126); // GL_RGBA, GL_FLOAT
	Number pixels = imageNew("pixels", 1800, 900);
	for (Number y = 0; y < 900; y += 1) {
		for (Number x = 0; x < 1800; x += 1) {
			Number r = 0.0;
			Number g = 0.0;
			Number b = 0.0;
			Number offset = ((y * 1800.0) + x) * 4.0;
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

}
