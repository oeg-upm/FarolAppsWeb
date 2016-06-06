/* Settings panel */
var rowCounter = 0;
var currentRowSelected;
var currentOptionSelected = {};
var currentLampInfo;
var currentlamppostID;
var currentlamppostZoom;
var currentFormMarker;
var firstLoad = true;


function loadPostForm(id, lat, lng, callback) {
    currentlamppostID = id;
    // TODO get zoom by param
    currentlamppostZoom = 14;
    if(firstLoad) {
        //initFormMap();
        setTimeout(buildMap.bind(null, lat, lng),300);
        setTimeout(loadStreetView.bind(null, lat, lng, 0, 0),300);
        firstLoad = false;

    } else {
        updateMaps(lat, lng, currentlamppostZoom, 0, 0, true);
    }
    
    $.ajax
    ({
        type: "GET",
        url: 'http://localhost:5555/lampposts/' + id ,
        dataType: 'json',
        success: function (d) {
            console.log("success");
            var nd = normalizeData(d);
            updateInfo(d);
        },
        error: function (xhr, textStatus, errorThrown) {
            if (textStatus == 'timeout') {
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                }            
                return;
            }
            if (xhr.status == 500) {
                //handle error
                console.log("error 500 getting " + id + " lamppost");
            } else {
                //handle error
                console.log("error getting " + id + " lamppost");
            }
        }
    });
    // cargando form
    openEmptyForm(id, lat, lng, currentlamppostZoom);
    callback();
}

function normalizeData(lampData) {
    return lampData;
};

var formTemplate = {
    "wattage": {
        "value": null,
        "range": [
            "low",
            "medium",
            "high"
        ]
    },
    "lamp": {
        "value": null,
        "range": [
            "VSAP",
            "VMCC",
            "VMAP",
            "PAR",
            "MC",
            "LED",
            "I",
            "H",
            "VSBP",
            "FCBC",
            "HM",
            "F"
        ]
    },
    "height": {
        "value": null,
        "range": [
            "low",
            "medium",
            "high"
        ]
    },
    "light": {
        "value": null,
        "range": [
            "P",
            "F",
            "E",
            "AA",
            "AC",
            "ER",
            "O"
        ]
    },
    "color": {
        "value": null,
        "range": [
            "red",
            "orange",
            "yellow",
            "white",
            "green",
            "blue"
        ]
    },
    "covered": {
        "value": null,
        "range": [
            "true",
            "false"
        ]
    },
    "status": {
        "value": null,
        "range": [
            "blown",
            "damaged",
            "works"
        ]
    }
};

function openEmptyForm(id, lat, lng, zoom) {
    var formTemplate = {
        "wattage": {
            "value": null,
            "range": [
                "low",
                "medium",
                "high"
            ]
        },
        "lamp": {
            "value": null,
            "range": [
                "VSAP",
                "VMCC",
                "VMAP",
                "PAR",
                "MC",
                "LED",
                "I",
                "H",
                "VSBP",
                "FCBC",
                "HM",
                "F"
            ]
        },
        "height": {
            "value": null,
            "range": [
                "low",
                "medium",
                "high"
            ]
        },
        "light": {
            "value": null,
            "range": [
                "P",
                "F",
                "E",
                "AA",
                "AC",
                "ER",
                "O"
            ]
        },
        "color": {
            "value": null,
            "range": [
                "red",
                "orange",
                "yellow",
                "white",
                "green",
                "blue"
            ]
        },
        "covered": {
            "value": null,
            "range": [
                "true",
                "false"
            ]
        },
        "status": {
            "value": null,
            "range": [
                "blown",
                "damaged",
                "works"
            ]
        }
    };
    formTemplate['id'] = id;
    formTemplate['latitude'] = lat;
    formTemplate['longitude'] = lng;
    formTemplate['streetViewPov'] = {"heading": 0, "pitch": 0};
    updateForm(formTemplate);
};
function updateMaps(lat, lng, zoom, heading, pitch, isNew) {
    console.log("updating Maps");
    updateStreetView(lat, lng, heading, pitch);
    updateFormMap(lat, lng, zoom, isNew);
};
function updateStreetView(lat, lng, heading, pitch) {
    console.log("updating Street View");
    var place = {lat: lat, lng: lng};
    panorama.setPosition(place);
    if (!heading) {
        heading = 0;
    }
    if (!pitch) {
        pitch = 0;
    }
    panorama.setPov({
        heading: heading,
        pitch: pitch
    });
};
function updateFormMap(lat, lng, zoom, isNew) {
    console.log("updating Form Map");
    moveMapToLocation(formMap.map, lat, lng);
    if (!isNew) {
        moveMarkerToLocation(currentFormMarker, lat, lng)
    }
};
function moveMapToLocation(map, lat, lng){
    var center = new google.maps.LatLng(lat, lng);
    // using global variable:
    map.panTo(center);
}
function moveMarkerToLocation(marker, lat, lng){
    var pos = new google.maps.LatLng(lat, lng);
    marker.setPosition(pos);
}
function updateInfo(data) {
    var heading, pitch;
    updateForm(d)
    if (data.latitude && data.longitude) {
        if (d.streetViewPov) {
            if (!d.streetViewPov.heading) {
                heading = 0;
            }
            if (!d.streetViewPov.pitch) {
                pitch = 0;
            }
        } else {
            heading = 0;
            pitch = 0;
        }
        updateMaps(data.latitude, data.longitude, currentlamppostZoom, heading, pitch, false);
    }
};
function updateForm(data) {
    $('#myList').empty();
    /*data example*/
    if (!data) {
            var data = {
                "id": "c0",
                "latitude": 39.46876033608727,
                "longitude": -6.381243637382942,
                "wattage": {
                    "value": "high",
                    "range": [
                        "low",
                        "medium",
                        "high"
                    ]
                },
                "lamp": {
                    "value": "VSAP",
                    "range": [
                        "VSAP",
                        "VMCC",
                        "VMAP",
                        "PAR",
                        "MC",
                        "LED",
                        "I",
                        "H",
                        "VSBP",
                        "FCBC",
                        "HM",
                        "F"
                    ]
                },
                "height": {
                    "value": "hight",
                    "range": [
                        "low",
                        "medium",
                        "high"
                    ]
                },
                "light": {
                    "value": null,
                    "range": [
                        "P",
                        "F",
                        "E",
                        "AA",
                        "AC",
                        "ER",
                        "O"
                    ]
                },
                "color": {
                    "value": "white",
                    "range": [
                        "red",
                        "orange",
                        "yellow",
                        "white",
                        "green",
                        "blue"
                    ]
                },
                "covered": {
                    "value": null,
                    "range": [
                        "true",
                        "false"
                    ]
                },
                "status": {
                    "value": null,
                    "range": [
                        "blown",
                        "damaged",
                        "works"
                    ]
                },
                "streetViewPov": {
                    "heading": null,
                    "pitch": null
                }
            };
    }
    currentLampInfo = data;
    console.log(data)
    // Generate Dynamic Form
    jQuery.each(data,function(key,value){
        console.log(key);
        console.log(value);
        if (key == "latitude" || key == "longitude" || key == "id") {
        
        } else {
            if (key == "streetViewPov") {
                currentStreetViewData = {
                    'heading': data[key].heading,
                    'pitch': data[key].pitch
                }
                //updateMaps();
            } else {
                var imageOptions = {};
                data[key].range.map(function(option) {
                    imageOptions[option] = optionImageMapping[key][option];
                });
                newRow({
                    title: tradSpanish[key],
                    items: imageOptions,
                    selected: data[key].value
                });
            }
        }
    });
    // Load StreetView
    //loadStreetView(data.latitude, data.longitude, data.streetViewPov.heading, data.streetViewPov.pitch);
};

/* Param Dynamic table methods */
function newRow(data) {
    rowCounter ++;
    if (!data) {
        // example data
        data = {
            title: "--> default" + rowCounter,
            paramId: 'p' + rowCounter,
            items: {
                1: "http://image005.flaticon.com/teams/1-freepik.jpg",
                2: "resources/img/optionForm/farola.png",
                3: "http://vignette1.wikia.nocookie.net/fantendo/images/4/47/Lightning_Flower.png/revision/latest?cb=20100326012751"
            },
            selected: 1
      }
    } else {
        data['paramId'] = 'p' + rowCounter;
        currentLampInfo[data.title]['paramId'] = 'p' + rowCounter;
    }
    var container = document.getElementById('myList');
    // Main row
    var row = document.createElement('a');
    row.innerHTML = '<a '+
                    'href="#" class="list-group-item"><h4 class="list-group-item-heading">'+data.title+'</h4>'+
                    '<div class="rowData flex-container"></div>'+
                    '</a>';
    container.appendChild(row);
    $(row).find('.list-group-item-heading').on("click",  switchRow);
    var rowData = $(row).find('.rowData');
    currentOptionSelected[data.paramId] = data.selected;
    for (var key in data.items) {
        var optID = data.paramId + '_' + key;
        var mc = data.selected == key ? "selected": "";
        rowData.append('<div class="form_flex-item ' + mc + '"><div><i class="checkIco fa fa-check-circle" aria-hidden="true"></i><img title="' + key + '"id="' + optID + '" class="optImage" src="' + data.items[key] + '"></img></div></div>');
        $("#" + optID).on("click",  switchOption.bind(null, data.paramId, key));
    }
};

function switchOption(paramId, optionId, e) {
    var objectId = paramId + "_" + optionId;
    var optFlex = $("#" + objectId).get(0).parentElement.parentElement;
    var oldSelectedFlex;
    if (currentOptionSelected[paramId] != null) {
        oldSelectedFlex = $("#" + paramId + "_" + currentOptionSelected[paramId]).get(0).parentElement.parentElement;
    }
    if (currentOptionSelected[paramId] == optionId) {
        $(optFlex).removeClass('selected');
        currentOptionSelected[paramId] = null;
    } else {
        $(optFlex).addClass('selected');
        $(oldSelectedFlex).removeClass('selected');
        currentOptionSelected[paramId] = optionId;
    }
};

function switchRow(e) {
    var el = $(e.target).get(0).parentElement;
    if (currentRowSelected) {
        currentRowSelected.removeClass('active');
        if (currentRowSelected.get(0) == el) {
            currentRowSelected = null;
            return;
        }
    }
    console.log(e);
    $(el).addClass('active');
    currentRowSelected = $(el);
};

/* StreetView Methods*/
function loadStreetView(latitude, lng, heading, pitch) {
    console.log("loading Street View");
    initStreetMap(latitude, lng, heading, pitch);
};
var panorama;

function initStreetMap(lat, lng, heading, pitch) {
    var place = {lat: lat, lng: lng};

    // Set up the map
    var map = new google.maps.Map(document.getElementById('streetMap'), {
        center: place,
        zoom: 18,
        streetViewControl: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        rotateControl: false
    });

    // Set up the markers on the map
    var lamppostMarker = new google.maps.Marker({
        position: {lat: lat, lng: lng},
        map: map,
        title: 'Lamppost'
    });

    // We get the map's default panorama and set up some defaults.
    // Note that we don't yet set it visible.
    panorama = map.getStreetView();
    panorama.setPosition(lamppostMarker.position);
    if (!heading) {
        heading = 0;
    }
    if (!pitch) {
        pitch = 0;
    }
    panorama.setPov({
        heading: heading,
        pitch: pitch
    });
    panorama.setVisible(true);
    panorama.setEnableCloseButton(false);
    panorama.setOptions({
        linksControl: false,
        panControl: false,
        enableCloseButton: false
    })
    panorama.addListener('pov_changed', function() {
        currentStreetViewData = {
            'heading': panorama.getPov().heading,
            'pitch': panorama.getPov().pitch
        }
    });
};

/* Control Handlers */
function submitLampInfo() {
    var formInfo = {
        //'timestamp': new Date
    };
    for (var key in currentLampInfo) {
        if (key == "latitude") {
            formInfo['latitude'] = currentLampInfo[key];
            continue;
        }
        if (key == "longitude") {
            formInfo['longitude'] = currentLampInfo[key];
            continue;
        }
        if (key == "streetViewPov") {
            formInfo[key] = currentStreetViewData;
            continue;
        }
        formInfo[key] = currentOptionSelected[currentLampInfo[key].paramId];
    }
    console.log(JSON.stringify(formInfo));
    $.ajax
    ({
        type: "POST",
        url: 'http://localhost:5555/lampposts/' + currentlamppostID + '/annotations',
        dataType: 'json',
        async: false,
        data: JSON.stringify(formInfo),
        success: function () {
            console.log("success");
        },
        error: function () {
            console.log("error");
        }
    });
};

/* Image Mapping */
var optionImageMapping = {
    "wattage": {
        "low": "resources/img/optionForm/wattage_low.png",
        "medium": "resources/img/optionForm/wattage_medium.png",
        "high": "resources/img/optionForm/wattage_hight.png",
    },
    "lamp": {
        "VSAP": "resources/img/optionForm/farola.png",
        "VMCC": "resources/img/optionForm/farola.png",
        "VMAP": "resources/img/optionForm/farola.png",
        "PAR": "resources/img/optionForm/farola.png",
        "MC": "resources/img/optionForm/farola.png",
        "LED": "resources/img/optionForm/farola.png",
        "I": "resources/img/optionForm/farola.png",
        "H": "resources/img/optionForm/farola.png",
        "VSBP": "resources/img/optionForm/farola.png",
        "FCBC": "resources/img/optionForm/farola.png",
        "HM": "resources/img/optionForm/farola.png",
        "F": "resources/img/optionForm/farola.png"
    },
    "height": {
        "low": "resources/img/optionForm/height_low.png",
        "medium": "resources/img/optionForm/height_medium.png",
        "high":  "resources/img/optionForm/height_hight.png",
    },
    "light": {
        "P": "resources/img/optionForm/light_p.png",
        "F": "resources/img/optionForm/light_f.png",
        "E": "resources/img/optionForm/light_e.png",
        "AA": "resources/img/optionForm/light_aa.png",
        "AC": "resources/img/optionForm/light_ac.png",
        "ER": "resources/img/optionForm/light_er.png",
        "O": "resources/img/optionForm/light_o.png",
    },
    "color": {
        "red": "resources/img/optionForm/color_red.png",
        "orange": "resources/img/optionForm/color_orange.png",
        "yellow": "resources/img/optionForm/color_yellow.png",
        "white": "resources/img/optionForm/color_white.png",
        "green": "resources/img/optionForm/color_green.png",
        "blue": "resources/img/optionForm/color_blue.png",
    },
    "covered": {
        "true": "resources/img/optionForm/covered_true.png",
        "false": "resources/img/optionForm/covered_false.png",
    },
    "status": {
        "blown": "resources/img/optionForm/status_blown.png",
        "damaged": "resources/img/optionForm/status_damaged.png",
        "works": "resources/img/optionForm/status_works.png",
    }
};


/* Form Map */
var map, iw, drag_area, actual, obj;
var dummy, z_index = 0;

function fillMarker(a) {
    var m = document.createElement("div");
    m.style.backgroundImage = "url(" + a + ")";
    var b;
    if (obj.id == "m1") {
        b = "0px"
    } else if (obj.id == "m2") {
        b = "50px"
    } else if (obj.id == "m3") {
        b = "100px"
    }
    m.style.left = b;
    m.id = obj.id;
    m.className = "drag";
    m.onmousedown = m.ontouchstart = initDrag;
    drag_area.replaceChild(m, obj);
    obj = null
}

function highestOrder() {
    return z_index
}

function createDraggedMarker(d, e) {
    var g = google.maps;
    var f = {
        url: e,
        size: new g.Size(32, 32),
        anchor: new g.Point(15, 32)
    };
    var h = new g.Marker({
        position: d,
        map: map,
        clickable: true,
        draggable: true,
        crossOnDrag: false,
        optimized: false,
        icon: f,
        zIndex: highestOrder()
    });
    g.event.addListener(h, "click", function() {
        actual = h;
        var a = actual.getPosition().lat();
        var b = actual.getPosition().lng();
        var c = "<div class='infowindow'>" + a.toFixed(6) + ", " + b.toFixed(6) + "<\/div>";
        iw.setContent(c);
        iw.open(map, this)
    });
    g.event.addListener(h, "dragstart", function() {
        if (actual == h) iw.close();
        z_index += 1;
        h.setZIndex(highestOrder())
    })
    currentFormMarker = h;
}

function initDrag(e) {
    var j = function(e) {
        var a = {};
        if (e && e.touches && e.touches.length) {
            a.x = e.touches[0].clientX;
            a.y = e.touches[0].clientY
        } else {
            if (!e) var e = window.event;
            a.x = e.clientX;
            a.y = e.clientY
        }
        return a
    };
    var k = function(e) {
        if (obj && obj.className == "drag") {
            var i = j(e),
                deltaX = i.x - l.x,
                deltaY = i.y - l.y;
            obj.style.left = (obj.x + deltaX) + "px";
            obj.style.top = (obj.y + deltaY) + "px";
            obj.onmouseup = obj.ontouchend = function() {
                var a = map.getDiv(),
                    mLeft = a.offsetLeft,
                    mTop = a.offsetTop,
                    mWidth = a.offsetWidth,
                    mHeight = a.offsetHeight;
                var b = drag_area.offsetLeft,
                    areaTop = drag_area.offsetTop,
                    oWidth = obj.offsetWidth,
                    oHeight = obj.offsetHeight;
                var x = obj.offsetLeft + b + oWidth / 2;
                var y = obj.offsetTop + areaTop + oHeight / 2;
                if (x > mLeft && x < (mLeft + mWidth) && y > mTop && y < (mTop + mHeight)) {
                    var c = 1;
                    var g = google.maps;
                    var d = new g.Point(x - mLeft - c, y - mTop + (oHeight / 2));
                    var e = dummy.getProjection();
                    var f = e.fromContainerPixelToLatLng(d);
                    var h = obj.style.backgroundImage.slice(4, -1).replace(/"/g, "");
                    createDraggedMarker(f, h);
                    fillMarker(h)
                }
            }
        }
        return false
    };
    if (!e) var e = window.event;
    obj = e.target ? e.target : e.srcElement ? e.srcElement : e.touches ? e.touches[0].target : null;
    if (obj.className != "drag") {
        if (e.cancelable) e.preventDefault();
        obj = null;
        return
    } else {
        z_index += 1;
        obj.style.zIndex = z_index.toString();
        obj.x = obj.offsetLeft;
        obj.y = obj.offsetTop;
        var l = j(e);
        if (e.type === "touchstart") {
            obj.onmousedown = null;
            obj.ontouchmove = k;
            obj.ontouchend = function() {
                obj.ontouchmove = null;
                obj.ontouchend = null;
                obj.ontouchstart = initDrag
            }
        } else {
            document.onmousemove = k;
            document.onmouseup = function() {
                document.onmousemove = null;
                document.onmouseup = null;
                if (obj) obj = null
            }
        }
    }
    return false
}

function buildMap(lat, lng) {
    function DummyOView() {
        this.setMap(map);
        this.draw = function() {}
    }
    DummyOView.prototype = new google.maps.OverlayView();
    var g = google.maps;
    var place;
    if (lat && lng) {
        place = new google.maps.LatLng(lat, lng);
    } else {
       place = new google.maps.LatLng(39.475153, -6.371441);
    } 
    var a = {
        //center: new g.LatLng(39.475153, -6.371441),
        center: place,
        zoom: 18,
        streetViewControl: false,
        panControl: false,
        zoomControlOptions: {
            style: g.ZoomControlStyle.SMALL
        }
    };
    map = new g.Map(document.getElementById("formMap"), a);
    iw = new g.InfoWindow();
    g.event.addListener(map, "click", function() {
        if (iw) iw.close()
    });
    drag_area = document.getElementById("markers");
    var b = drag_area.getElementsByTagName("div");
    for (var i = 0; i < b.length; i++) {
        var c = b[i];
        c.onmousedown = c.ontouchstart = initDrag
    }
    dummy = new DummyOView()
    formMap = dummy;
}

/* Traducción */
var tradSpanish = {
    "lamp": "bombilla",
    "height": "altura",
    "light": "luz",
    "color": "color",
    "covered": "protección",
    "status": "estado"
};