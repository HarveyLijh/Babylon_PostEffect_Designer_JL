var canvas = document.getElementById("renderCanvas");

var currentSceneMesh = null;
var startRenderLoop = function (engine, canvas) {
    engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
        }
    });
};
var checkLocalStorage = function (name, initalValue) {
    return localStorage.getItem(name) == null ? initalValue : localStorage.getItem(name)
};
var defaultColor = "RoyalBlue";
var warningColor = "FireBrick";
var thirdColor = "CornflowerBlue";
var fetchNApplyJSON = function (data, reload = true) {
    fetch(data)
        .then(response => {
            return response.json();
        })
        .then(jsonData => {
            localStorage.clear();
            localStorage.setItem("clear", true);
            Object.assign(localStorage, jsonData);
            if (reload) location.reload();
        });
};

var getLocalStorageColor = function (varName) {
    if (checkLocalStorage(varName + "r", null) == null) {
        return null;
    }
    return new BABYLON.Color3(checkLocalStorage(varName + "r", 0),
        checkLocalStorage(varName + "g", 0), checkLocalStorage(varName + "b", 0));
};

var cleanSceneMeshes = function (skybox, mesh) {
    skybox.dispose();
    currentSceneMesh.forEach(function (mesh) {
        mesh.dispose();
    });
};

var loadMesh = async function (scene, modelAddress, scale = 1, procedureAfterLoadModel) {
    await BABYLON.SceneLoader.ImportMesh("", modelAddress, "", scene, async function (newMeshes) {
        procedureAfterLoadModel(newMeshes, scale);
        currentSceneMesh = newMeshes;
        return currentSceneMesh;
    }, undefined, function () {
        alert("Cannot load file, please check file address！");
    });
};


var postProcessData = {};
var engine = null;
var scene = null;
var sceneToRender = null;

var setLightPositionByAngle = function (light, angle, distance, height) {
    const x = Math.cos(angle * Math.PI / 180) * distance;
    const z = Math.sin(angle * Math.PI / 180) * distance;
    light.position = new BABYLON.Vector3(x, height, z);
    light.setDirectionToTarget(BABYLON.Vector3.Zero());
};

var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false }); };
var createScene = function (address = "./models/spaceship.glb") {
    // localStorage.setItem("address", address);
    
    var isMobile = false;
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
        isMobile = true;
    }

    // Create basic scene
    var scene = new BABYLON.Scene(engine);

    var sunLight = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0, -1, 0), scene);
    setLightPositionByAngle(sunLight, 120, 50, 100);
    sunLight.autoUpdateExtends = true; // to REFRESHRATE_RENDER_ONCE
    sunLight.diffuse = BABYLON.Color3.White;
    sunLight.intensity = 1;
    sunLight.setEnabled(false);
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(0, 0, 0), scene);
    camera.setPosition(new BABYLON.Vector3(-3, 1, -5));
    camera.wheelPrecision = 50;
    camera.attachControl(canvas, true);
    camera.radius = 10.4;
    camera.alpha = -1.56;
    camera.beta = 1.05;


    // GUI initialization and helper functions
    var bgCamera = new BABYLON.ArcRotateCamera("BGCamera", Math.PI / 2 + Math.PI / 7, Math.PI / 2, 100,
        new BABYLON.Vector3(0, 20, 0),
        scene);
    bgCamera.layerMask = 0x10000000;

    // var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
    // var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    // skyboxMaterial.backFaceCulling = false;
    // skyboxMaterial.emissiveColor = new BABYLON.Color3(0, 0, 1);
    // skybox.material = skyboxMaterial;

    // window.setTimeout(() => {
    //     const reflectionTexture = new BABYLON.CubeTexture("textures/skybox", scene);
    //     reflectionTexture.onLoadObservable.addOnce(() => {
    //         skyboxMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
    //         skyboxMaterial.reflectionTexture = reflectionTexture;
    //         skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    //     });
    // }, 1000);
    var shadowGenerator = new BABYLON.ShadowGenerator(1024, sunLight);
    shadowGenerator.bias = 0.0001;
    shadowGenerator.getShadowMap().refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE; // to save performance
    shadowGenerator.filteringQuality = BABYLON.ShadowGenerator.QUALITY_LOW;
    shadowGenerator.useExponentialShadowMap = true; // default true
    shadowGenerator.setDarkness = 0.9;
    shadowGenerator.usePercentageCloserFiltering = true; // webgl2 only, fallback -> usePoissonSampling 
    shadowGenerator.forceBackFacesOnly = false;

    var environmentHelper = null;
    // Import model
    var procedureAfterLoadModel = function (newMeshes, scale) {
        newMeshes.forEach(function (mesh) {
            mesh.scaling.multiplyInPlace(new BABYLON.Vector3(scale, scale, scale));
            //if (mesh.material != null) {
            //check if mesh is emissive, cancel its shadow
            //if (mesh.material._emissiveColor.r == 0 && mesh.material._emissiveColor.g == 0 &&
            //    mesh.material._emissiveColor.b == 0) {

            mesh.receiveShadows = true;
            shadowGenerator.addShadowCaster(mesh);
            shadowGenerator.getShadowMap().renderList.push(mesh);
            //}
            //}
        });
        environmentHelper = scene.createDefaultEnvironment();
        environmentHelper.ground.isVisible = false;
        let bgColor = getLocalStorageColor("Skybox Color");
        if (bgColor != null) {
            environmentHelper.setMainColor(bgColor);
        }
        sunLight.shadowMaxZ = 200;
        shadowGenerator.getShadowMap().refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE; // to save performance
        // Creating default environment enables tone mapping so disable for demo
        defaultPipeline.imageProcessing.toneMappingEnabled = false;

    };
    // load inital model
    //https://models.babylonjs.com/aerobatic_plane.glb
    //Tongji_island
    //./models/Tongji_island.glb
    //Metacube_island
    loadMesh(scene, address, 0.4, procedureAfterLoadModel);
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    advancedTexture.layer.layerMask = 0x10000000;
    advancedTexture.renderScale = 1.5;
    var lsv = new BABYLON.GUI.ScrollViewer();
    lsv.width = "330px";
    lsv.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    lsv.onPointerEnterObservable.add((eventData, eventState) => {
        camera.inputs.attached.mousewheel.detachControl();

    });
    lsv.onPointerOutObservable.add((eventData, eventState) => {
        camera.inputs.attachInput(camera.inputs.attached.mousewheel);
    });
    advancedTexture.addControl(lsv);
    var rsv = new BABYLON.GUI.ScrollViewer();
    if (!isMobile) {
        rsv.width = "330px";
        rsv.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;


        rsv.onPointerEnterObservable.add((eventData, eventState) => {
            camera.inputs.attached.mousewheel.detachControl();

        });
        rsv.onPointerOutObservable.add((eventData, eventState) => {
            camera.inputs.attachInput(camera.inputs.attached.mousewheel);
        });
        advancedTexture.addControl(rsv);
    }
    var rightPanel = new BABYLON.GUI.StackPanel();
    var clearDataPanel = new BABYLON.GUI.StackPanel();
    if (!isMobile) {
        rightPanel.width = "300px";
        rightPanel.isVertical = true;
        rightPanel.paddingRight = "20px";
        rightPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        rightPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        rsv.addControl(rightPanel);

        clearDataPanel.isVertical = true;
        clearDataPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        clearDataPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        rightPanel.addControl(clearDataPanel);
    }

    var leftPanel = new BABYLON.GUI.StackPanel();
    leftPanel.width = "300px";
    leftPanel.isVertical = true;
    leftPanel.paddingLeft = "20px";
    leftPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    leftPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    lsv.addControl(leftPanel);

    var addCheckbox = function (text, func, initialValue, left, panel, defaultToIni = false) {
        if (!panel) {
            panel = leftPanel;
        }
        if (!defaultToIni) {
            initialValue = (checkLocalStorage(text, initialValue) === 'true');
        }
        var checkbox = new BABYLON.GUI.Checkbox();
        checkbox.width = "20px";
        checkbox.height = "20px";
        checkbox.isChecked = initialValue;
        checkbox.background = "white";
        checkbox.color = defaultColor;
        checkbox.onIsCheckedChangedObservable.add(function (value) {
            func(value);
            localStorage.setItem(text, value);
        });
        func(initialValue);

        var header = BABYLON.GUI.Control.AddHeader(checkbox, text, "280px", { isHorizontal: true, controlFirst: true });
        header.height = "30px";
        header.color = "white";
        header.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

        if (left) {
            header.left = left;
        }
        if (!isMobile)
            panel.addControl(header);
    };

    var addInput = function (text, panel, width = 0.25, height = "20px", mustNumber = false, fontSize = 20, paddingTop = "0px") {
        var input = new BABYLON.GUI.InputText();
        input.text = text;
        input.width = width;
        input.height = height;
        input.fontSize = fontSize;
        input.paddingTop = paddingTop;
        input.color = "white";
        input.onFocusSelectAll = true;

        if (mustNumber) {
            input.onBeforeKeyAddObservable.add((input) => {
                let key = input.currentKey;
                if (key != "-" && key != "." && key < "0" || key > "9") {
                    intput.addKey = false;
                }
            });
        } if (!isMobile)
            panel.addControl(input);

        return input;
    };

    var addTextBlock = function (text, panel, color = "white", fontSize = 22, height = "30px", fontStyle = "normal", paddingTop = "10px", alignBottom = true) {
        var textBlock = new BABYLON.GUI.TextBlock();
        textBlock.text = text;
        textBlock.fontSize = fontSize;
        textBlock.height = height;
        textBlock.color = color;
        textBlock.fontStyle = fontStyle;
        textBlock.paddingTop = paddingTop;
        textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        if (alignBottom) {
            textBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        }
        panel.addControl(textBlock);
        return textBlock;
    };
    var addSlider = function (text, func, initialValue, min, max, left, panel, color = defaultColor) {
        if (!panel) {
            panel = leftPanel;
        }
        initialValue = parseFloat(checkLocalStorage(text, initialValue));
        var header = new BABYLON.GUI.TextBlock();
        header.text = text;
        header.height = "30px";
        header.color = "white";
        header.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

        if (!isMobile)
            panel.addControl(header);
        if (left) {
            header.left = left;
        }

        var slider = new BABYLON.GUI.Slider();
        var input = addInput(initialValue, panel, undefined, undefined, true);
        input.max = max;
        input.min = min;
        input.onBlurObservable.add((input1) => {

            if (input1.text != "") {

                value = parseFloat(input1.text);
                if (value > max) {
                    value = max;
                }
                if (value < min) {
                    value = min;
                }
                value = parseFloat(value.toFixed(2));
                input.text = value;
                slider.value = value;
                localStorage.setItem(text, value);
            }
        });

        slider.minimum = min;
        slider.maximum = max;
        slider.value = initialValue;
        slider.height = "20px";
        slider.background = "white";
        slider.color = color;
        slider.onValueChangedObservable.add(function (value) {
            value = parseFloat(value.toFixed(2));
            func(value);
            input.text = value;
            localStorage.setItem(text, value);
        });
        func(parseFloat(initialValue));

        if (left) {
            slider.paddingLeft = left;
        }

        if (!isMobile)
            panel.addControl(slider);
        return slider;
    };
    var rgbToHex = function (value) {
        return "#" + ((1 << 24) + (value.r << 16) + (value.g << 8) + value.b).toString(16).slice(1);
    };

    var addColorPicker = function (text, func, initialValue, left, panel) {
        if (!panel) {
            panel = leftPanel;
        }
        initialValue = new BABYLON.Color3(checkLocalStorage(text + "r", initialValue),
            checkLocalStorage(text + "g", initialValue), checkLocalStorage(text + "b", initialValue));
        var header = new BABYLON.GUI.TextBlock();
        header.text = text;
        header.height = "30px";
        header.color = "white";
        header.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

        if (!isMobile)
            panel.addControl(header);

        if (left) {
            header.left = left;
        }

        var colorPicker = new BABYLON.GUI.ColorPicker();
        colorPicker.value = (initialValue);
        colorPicker.size = "100px";
        colorPicker.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        colorPicker.onValueChangedObservable.add(function (value) {
            func(value);
            localStorage.setItem(text + "r", value.r);
            localStorage.setItem(text + "g", value.g);
            localStorage.setItem(text + "b", value.b);
        });
        func(initialValue);

        if (left) {
            colorPicker.left = left;
        }

        if (!isMobile)
            panel.addControl(colorPicker);
    };
    var addButton = function (name, text, func, color = "white", bgColor, fontSize = 24, panel, isVisible = true, width = 0.6, height = "40px", paddingTop = "10px") {
        if (!panel) {
            panel = leftPanel;
        }
        var button = BABYLON.GUI.Button.CreateSimpleButton(name, text);
        button.width = width;
        button.height = height;
        button.color = "transparent";

        button.textBlock.color = color;
        button.fontSize = fontSize;
        button.background = bgColor;
        button.paddingTop = paddingTop;
        button.isVisible = isVisible;
        button.onPointerClickObservable.add(function (value) {
            func(value);
        });
        panel.addControl(button);
        return button;
    };
    var readFile = function (file) {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function () {
            data = reader.result;
            localStorage.clear();
            Object.assign(localStorage, JSON.parse(data));
            location.reload();
        };
    };
    var handleFileSelect = function (id) {
        const fileSelector = document.getElementById(id);
        fileSelector.addEventListener('change', (event) => {
            file = event.target.files[0];

            readFile(file)

        });

    };

    let showdebug = false;
    addButton("DebugButton", "Debug Menu", function () {
        // console.log(camera.radius, camera.beta, camera.alpha);
        if (!showdebug) {
            showdebug = true;
            scene.debugLayer.show({
                embedMode: true,
            })
        } else {
            showdebug = false;
            scene.debugLayer.hide();
        }

    }, undefined, "MediumSlateBlue", !isMobile ? undefined : 50, leftPanel, undefined, !isMobile ? undefined : 1, !isMobile ? undefined : "120px", !isMobile ? undefined : "30px");
    var export_button = addButton("ExportButton", "Export Data", function () {
        if (window.localStorage.length == 0)
            alert("Local data is still empty!");
        else {
            const filename = 'data.json';
            const jsonStr = JSON.stringify(localStorage);

            let element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonStr));
            element.setAttribute('download', filename);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        }

    }, undefined, defaultColor, !isMobile ? undefined : 50, leftPanel, undefined, !isMobile ? undefined : 1, !isMobile ? undefined : "120px", !isMobile ? undefined : "30px");
    addButton("ImportJsonButton", "Load Data", function (data) {
        document.getElementById('json-selector').click();
        handleFileSelect('json-selector');

    }, undefined, "MediumSlateBlue", !isMobile ? undefined : 50, leftPanel, undefined, !isMobile ? undefined : 1, !isMobile ? undefined : "120px", !isMobile ? undefined : "30px");
    var input = null;
    var inputScale = null;

    if (!isMobile)
        addButton("ImportGlbButton", "Load Model", function (data) {
            let scale = 1;
            if (inputScale.text != "Enter Model Scale Factor") {
                scale = parseFloat(inputScale.text);
            }
            let modelAddress = input.text;
            cleanSceneMeshes(environmentHelper.skybox, currentSceneMesh);
            loadMesh(scene, modelAddress, scale, procedureAfterLoadModel);

        }, undefined, thirdColor, !isMobile ? undefined : 50, leftPanel, undefined, !isMobile ? undefined : 1, !isMobile ? undefined : "120px", !isMobile ? undefined : "30px");

    inputScale = addInput('Enter Model Scale Factor', leftPanel, 1, !isMobile ? "30px" : "120px", undefined, !isMobile ? undefined : 40, !isMobile ? undefined : "30px");
    input = addInput('Enter Model Address', leftPanel, 1, !isMobile ? "30px" : "120px", undefined, !isMobile ? undefined : 40, !isMobile ? undefined : "30px");

    var p = BABYLON.Vector3.Project(new BABYLON.Vector3(0, 0, 0),
        BABYLON.Matrix.Identity(),
        camera.getViewMatrix().multiply(camera.getProjectionMatrix()),
        camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight()));
    // Create default pipeline
    var defaultPipeline = new BABYLON.DefaultRenderingPipeline("default", true, scene, [camera]);
    var curve = new BABYLON.ColorCurves();
    curve.globalHue = 200;
    curve.globalDensity = 80;
    curve.globalSaturation = 80;
    curve.highlightsHue = 20;
    curve.highlightsDensity = 80;
    curve.highlightsSaturation = -80;
    curve.shadowsHue = 2;
    curve.shadowsDensity = 80;
    curve.shadowsSaturation = 40;
    defaultPipeline.imageProcessing.colorCurves = curve;
    defaultPipeline.depthOfField.focalLength = 150;

    // Add gui for default pipeline effects
    addCheckbox("Multisample Anti-Aliasing", function (value) {
        defaultPipeline.samples = defaultPipeline.samples == 1 ? 4 : 1;
    }, defaultPipeline.samples == 4);

    addCheckbox("Fast Approximate Anti-Aliasing", function (value) {
        defaultPipeline.fxaaEnabled = value;

    }, defaultPipeline.fxaaEnabled);


    addCheckbox("Tone Mapping", function (value) {
        defaultPipeline.imageProcessing.toneMappingEnabled = value;
    }, defaultPipeline.imageProcessing.toneMappingEnabled);
    var gl = new BABYLON.GlowLayer("glow", scene);
    addCheckbox("Enable Glow Layer", function (value) { gl.isEnabled = value }, gl.isEnabled);
    addSlider("Glow Intensity", function (value) {
        gl.intensity = value
    }, gl.intensity, 0, 1.5, "30px");

    addSlider("Contrast (reset when refresh)", function (value) {
        defaultPipeline.imageProcessing.contrast = value;
    }, defaultPipeline.imageProcessing.contrast, 0, 4, undefined, undefined, warningColor);

    addSlider("Exposure (reset when refresh)", function (value) {
        defaultPipeline.imageProcessing.exposure = value;
    }, defaultPipeline.imageProcessing.exposure, 0, 4, undefined, undefined, warningColor);

    //skybox color
    addColorPicker("Skybox Color", function (value) {
        if (environmentHelper != null)
            environmentHelper.setMainColor(value);
    }, getLocalStorageColor("Skybox Color"));


    // sun
    var sunAutoShiftToggle = false;
    addCheckbox("Enable Sun", function (value) {
        sunLight.setEnabled(value);
    }, sunLight.setEnabled);

    addSlider("Sun Intensity", function (value) {
        sunLight.intensity = value
    }, sunLight.intensity, 0, 10, "30px");

    addColorPicker("Sun Color", function (value) {
        sunLight.diffuse = value;
    }, getLocalStorageColor("Sun Color"), "30px");

    var sunDirecSlider = addSlider("Sun Direction", function (value) {
        setLightPositionByAngle(scene.lights[0], parseInt(value), 80,
            parseInt(localStorage.getItem("Sun Height") == null ? 50 : localStorage.getItem("Sun Height")));
        shadowGenerator.getShadowMap().refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
    }, localStorage.getItem("Sun Direction") == null ? 0 : localStorage.getItem("Sun Direction"), 0, 359, "30px");

    addSlider("Sun Height", function (value) {
        setLightPositionByAngle(scene.lights[0],
            localStorage.getItem("Sun Direction") == null ? 0 : localStorage.getItem("Sun Direction")
            , 80, parseInt(value));
        shadowGenerator.getShadowMap().refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
    }, localStorage.getItem("Sun Height") == null ? 50 : localStorage.getItem("Sun Height"), -1, 200, "30px");

    addCheckbox("Auto Sun Shift", function (value) {
        sunAutoShiftToggle = value;
    }, false, "30px", undefined, true);

    const refreshRate = 1000 / 30;

    window.setInterval(() => {
        if (sunAutoShiftToggle) {
            sunDirecSlider.value += 1;
            if (sunDirecSlider.value == 359) {
                sunDirecSlider.value = 0;
            }
        }
    }, refreshRate);
    addCheckbox("Color curves", function (value) {
        defaultPipeline.imageProcessing.colorCurvesEnabled = value;
    }, defaultPipeline.imageProcessing.colorCurvesEnabled);

    addSlider("globalSaturation", function (value) {
        curve.globalSaturation = value;
    }, curve.globalSaturation, -100, 100, "30px");
    addSlider("globalHue", function (value) {
        curve.globalHue = value;
    }, curve.globalHue, 0, 360, "30px");
    addSlider("globalDensity", function (value) {
        curve.globalDensity = value;
    }, curve.globalDensity, -100, 100, "30px");
    addSlider("highlightsHue", function (value) {
        curve.highlightsHue = value;
    }, curve.highlightsHue, 0, 360, "30px");
    addSlider("highlightsDensity", function (value) {
        curve.highlightsDensity = value;
    }, curve.highlightsDensity, -100, 100, "30px");
    addSlider("highlightsSaturation", function (value) {
        curve.highlightsSaturation = value;
    }, curve.highlightsSaturation, -100, 100, "30px");
    addSlider("shadowsHue", function (value) {
        curve.shadowsHue = value;
    }, curve.shadowsHue, 0, 360, "30px");
    addSlider("shadowsDensity", function (value) {
        curve.shadowsDensity = value;
    }, curve.shadowsDensity, -100, 100, "30px");
    addSlider("shadowsSaturation", function (value) {
        curve.shadowsSaturation = value;
    }, curve.shadowsSaturation, -100, 100, "30px");



    addCheckbox("Bloom", function (value) {
        defaultPipeline.bloomEnabled = value;
    }, defaultPipeline.bloomEnabled);
    addSlider("Kernel", function (value) {
        defaultPipeline.bloomKernel = value;
    }, defaultPipeline.bloomKernel, 1, 500, "30px");
    addSlider("Weight", function (value) {
        defaultPipeline.bloomWeight = value;
    }, defaultPipeline.bloomWeight, 0, 5, "30px");
    addSlider("Threshold", function (value) {
        defaultPipeline.bloomThreshold = value;
    }, defaultPipeline.bloomThreshold, 0, 1, "30px");
    addSlider("Scale", function (value) {
        defaultPipeline.bloomScale = value;
    }, defaultPipeline.bloomScale, 0.0, 1, "30px");


    // right panel starts here
    if (!isMobile)
        leftPanel = rightPanel;

    // confirm clear button
    var ok_button = addButton("okClearButton", "Are you sure?", function () {
        localStorage.clear();
        location.reload();
        localStorage.setItem("clear", true);
    }, undefined, warningColor, undefined, clearDataPanel, false);

    ok_button.onPointerEnterObservable.add(function () {
        ok_button.textBlock.text = "Confirm!";
    });
    ok_button.onPointerOutObservable.add(function () {
        ok_button.textBlock.text = "Are you sure？";
    });

    // clear button
    var clearButton = addButton("clearDataButton", "CLEAR DATA！", function () {
        ok_button.isVisible = true;
    }, undefined, warningColor, undefined, clearDataPanel, undefined, .8);

    // preset buttons
    var preset0 = addButton("PresetButton1", "preset0", function () {

        let scale = 0.4;
        cleanSceneMeshes(environmentHelper.skybox, currentSceneMesh);
        fetchNApplyJSON("./data/data7.json");

    }, undefined, thirdColor, !isMobile ? undefined : 50, leftPanel, undefined, !isMobile ? undefined : 1, !isMobile ? undefined : "120px", !isMobile ? undefined : "30px");
    addButton("PresetButton1", "preset1", function () {

        let scale = 0.4;
        cleanSceneMeshes(environmentHelper.skybox, currentSceneMesh);
        fetchNApplyJSON("./data/data6.json");

    }, undefined, thirdColor, !isMobile ? undefined : 50, leftPanel, undefined, !isMobile ? undefined : 1, !isMobile ? undefined : "120px", !isMobile ? undefined : "30px");
    addButton("PresetButton1", "preset2", function () {

        let scale = 0.4;
        cleanSceneMeshes(environmentHelper.skybox, currentSceneMesh);
        fetchNApplyJSON("./data/data4.json");

    }, undefined, thirdColor, !isMobile ? undefined : 50, leftPanel, undefined, !isMobile ? undefined : 1, !isMobile ? undefined : "120px", !isMobile ? undefined : "30px");


    addCheckbox("Depth Of Field", function (value) {
        defaultPipeline.depthOfFieldEnabled = value;
    }, defaultPipeline.depthOfFieldEnabled);

    addSlider("Blur Level", function (value) {
        if (value < 1) {
            defaultPipeline.depthOfFieldBlurLevel = BABYLON.DepthOfFieldEffectBlurLevel.Low;
        } else if (value < 2) {
            defaultPipeline.depthOfFieldBlurLevel = BABYLON.DepthOfFieldEffectBlurLevel.Medium;
        } else if (value < 3) {
            defaultPipeline.depthOfFieldBlurLevel = BABYLON.DepthOfFieldEffectBlurLevel.High;
        }
    }, 1, 0, 3, "30px");

    addSlider("Focus Distance", function (value) {
        defaultPipeline.depthOfField.focusDistance = value;
    }, defaultPipeline.depthOfField.focusDistance, 1, 50000, "30px");

    addSlider("F-Stop", function (value) {
        defaultPipeline.depthOfField.fStop = value;
    }, defaultPipeline.depthOfField.fStop, 1.0, 10, "30px");

    addSlider("Focal Length", function (value) {
        defaultPipeline.depthOfField.focalLength = value;
    }, defaultPipeline.depthOfField.focalLength, 1.0, 300, "30px");


    addCheckbox("Chromatic Aberration", function (value) {
        defaultPipeline.chromaticAberrationEnabled = value;
    }, defaultPipeline.chromaticAberrationEnabled);

    addSlider("Amount", function (value) {
        defaultPipeline.chromaticAberration.aberrationAmount = value;
    }, 0, -1000, 1000, "30px");
    addSlider("Radial Intensity", function (value) {
        defaultPipeline.chromaticAberration.radialIntensity = value;
    }, 0, 0.1, 5, "30px");
    addSlider("Direction", function (value) {
        if (value == 0) {
            defaultPipeline.chromaticAberration.direction.x = 0;
            defaultPipeline.chromaticAberration.direction.y = 0;
        } else {
            defaultPipeline.chromaticAberration.direction.x = Math.sin(value);
            defaultPipeline.chromaticAberration.direction.y = Math.cos(value);
        }

    }, 0, 0, Math.PI * 2, "30px");

    addCheckbox("Sharpen", function (value) {
        defaultPipeline.sharpenEnabled = value;
    }, defaultPipeline.sharpenEnabled);

    addSlider("Edge Amount", function (value) {
        defaultPipeline.sharpen.edgeAmount = value;
    }, defaultPipeline.sharpen.edgeAmount, 0, 2, "30px");

    addSlider("Color Amount", function (value) {
        defaultPipeline.sharpen.colorAmount = value;
    }, defaultPipeline.sharpen.colorAmount, 0, 1, "30px");

    addCheckbox("Vignette", function (value) {
        defaultPipeline.imageProcessing.vignetteEnabled = value;
    }, defaultPipeline.imageProcessing.vignetteEnabled);

    addCheckbox("Multiply", function (value) {
        var blendMode = value ? BABYLON.ImageProcessingPostProcess.VIGNETTEMODE_MULTIPLY : BABYLON.ImageProcessingPostProcess.VIGNETTEMODE_OPAQUE;
        defaultPipeline.imageProcessing.vignetteBlendMode = blendMode;
    }, defaultPipeline.imageProcessing.vignetteBlendMode === BABYLON.ImageProcessingPostProcess.VIGNETTEMODE_MULTIPLY, "40px");

    addColorPicker("Color", function (value) {
        defaultPipeline.imageProcessing.vignetteColor = value;
    }, defaultPipeline.imageProcessing.vignetteColor, "30px");

    addSlider("Weight", function (value) {
        defaultPipeline.imageProcessing.vignetteWeight = value;
    }, defaultPipeline.imageProcessing.vignetteWeight, 0, 10, "30px");

    addCheckbox("Grain", function (value) {
        defaultPipeline.grainEnabled = value;
    }, defaultPipeline.grainEnabled);

    addSlider("Intensity", function (value) {
        defaultPipeline.grain.intensity = value;
    }, defaultPipeline.grain.intensity, 0, 100, "30px");

    addCheckbox("Animated", function (value) {
        defaultPipeline.grain.animated = value;
    }, defaultPipeline.grain.animated, "30px");



    var babylonImg = new BABYLON.GUI.Image("BabylonIcon", "./images/babylon-js-logo.png");
    babylonImg.width = "225px";
    babylonImg.height = "55px";
    babylonImg.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;

    addTextBlock(isMobile ? "Post Effect Mobile Viewer" : "Post Effect Designer", leftPanel, undefined, !isMobile ? undefined : 30, "70px", "bold", "30px");
    addTextBlock("Made with", leftPanel, "grey", !isMobile ? 18 : 30, !isMobile ? undefined : "60px");
    leftPanel.addControl(babylonImg);

    addButton("link", "©2022 Jiahong Li.", function (data) {
        window.open("https://github.com/HarveyLijh");

    }, undefined, "transparent", !isMobile ? 18 : 30, leftPanel, undefined, undefined, !isMobile ? undefined : "80px");
    addTextBlock("Version: 0.8.8", leftPanel, "grey", !isMobile ? 18 : 30, !isMobile ? undefined : "60px");

    if (isMobile) {

        addTextBlock("Please edit in desktop or laptop", leftPanel, "white", !isMobile ? 18 : 30, !isMobile ? undefined : "60px");
    }
    scene.activeCameras = [camera, bgCamera];

    return scene;
};
window.initFunction = async function () {
    var asyncEngineCreation = async function () {
        try {
            return createDefaultEngine();
        } catch (e) {
            console.log("the available createEngine function failed. Creating the default engine instead");
            return createDefaultEngine();
        }
    };

    window.engine = await asyncEngineCreation();
    if (!engine) throw 'engine should not be null.';
    startRenderLoop(engine, canvas);
    if (localStorage.getItem("clear") == null || localStorage.getItem("clear") == false) {

        
        await fetchNApplyJSON("./data/data7.json", true);
        console.log("data7.json");
        window.scene = createScene();
    }else{
        
    window.scene = createScene();
    }
};
initFunction().then(() => {
    sceneToRender = scene;
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});