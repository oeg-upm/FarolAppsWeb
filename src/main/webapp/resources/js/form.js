/* Settings panel */
var rowCounter = 0;
var currentRowSelected;
var currentOptionSelected = {};
var currentLampInfo;
var currentStreetViewData = {};
var currentlamppostID;
var currentlamppostZoom;
var currentFormMarker;
var firstLoad = true;
var isNewLamppost;
var isTempLamppost;
var panorama;
var formCallback;
var farolaMarker = "resources/img/markers/farola_ico2.png";


function loadPostForm(id, lat, lng, theZoom, callback) {
    formCallback = callback;
    if (id == null) {
        // New Lampost
        isNewLamppost = true;
        isTempLamppost = false;
        showDraggableLamppost();
        setTimeout(openMapContainer, 1000);
    } else {
        if (id.slice(0,3).toLowerCase() == "tmp") {
            isTempLamppost = true;
        } else {
            isTempLamppost = false;
        }
        isNewLamppost = false;
        hideDraggableLamppost();
        setTimeout(closeMapContainer, 1000);
    }
    setTimeout(openStreetContainer, 500);
    currentlamppostID = id;
    currentlamppostZoom = theZoom;
    if(firstLoad) {
        setTimeout(buildMap.bind(null, lat, lng),200);
        setTimeout(loadStreetView.bind(null, lat, lng, 0, 0),200);
        openEmptyForm(id, lat, lng, currentlamppostZoom);
        if (!isNewLamppost && !isTempLamppost) {
            setTimeout(getLampInfo(),400);
        }
        firstLoad = false;
        callback();
    } else {
        if (!isNewLamppost && !isTempLamppost) {
            getLampInfo();
            // Optimization... maybe unnecessary. true indicates that no new marker is needed in form map
            updateMaps(lat, lng, currentlamppostZoom, null, null, true);
        } 
        else {
            if (isNewLamppost) {
                updateMaps(lat, lng, currentlamppostZoom, null, null, true);
            } else {
                // Temp lamppost load marker using lat lng parameters 
                updateMaps(lat, lng, currentlamppostZoom, null, null, false);
            }
            
        }
        openEmptyForm(id, lat, lng, currentlamppostZoom);
        callback();
    }
    setTimeout(function() {
        $("#specialForm").scrollTop(0);
    },600);
    function getLampInfo() {
        $.ajax({
            type: "GET",
            url: FarolApp_API_URL + 'lampposts/' + id ,
            dataType: 'json',
            success: function (d) {
                //console.log("success");
                var nd = normalizeData(d);
                function autoWait() {
                    if (!panorama || !formMap) {
                        //console.log("waiting for maps")
                        setTimeout(autoWait, 200);
                    } else {
                        updateInfo(d);
                    }
                };
                autoWait();
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
                    console.log("API broken getting " + id + " lamppost");
                }
                else if (xhr.status == 404){
                    //handle error
                    console.log("Unknown Lamppost. " + xhr.status);
                }
                else {
                    //handle error
                    console.log("error getting " + id + " lamppost." + xhr.status);
                }
            }
        });
    };
};

function normalizeData(lampData) {
    return lampData;
};

function openMapContainer() {
    $('#formMapContainer').addClass('open');
    $('#mapttogleico').addClass('fa-angle-double-up');
    $('#mapttogleico').removeClass('fa-angle-double-down');
};
function closeMapContainer() {
    $('#formMapContainer').removeClass('open');
    $('#mapttogleico').addClass('fa-angle-double-down');
    $('#mapttogleico').removeClass('fa-angle-double-up');
};
function toogleMapContainer() {
    if ($('#formMapContainer').attr('class') == "open") {
        closeMapContainer();
    } else {
        openMapContainer();
    }
};
function openStreetContainer() {
    $('#streetViewContainer').addClass('open');
    $('#streettogleico').addClass('fa-angle-double-up');
    $('#streettogleico').removeClass('fa-angle-double-down');
};
function closeStreetContainer() {
    $('#streetViewContainer').removeClass('open');
    $('#streettogleico').addClass('fa-angle-double-down');
    $('#streettogleico').removeClass('fa-angle-double-up');
};
function toogleStreetContainer() {
    if ($('#streetViewContainer').attr('class') == "open") {
        closeStreetContainer();
    } else {
        openStreetContainer();
    }
};
function showDraggableLamppost() {
    $('#markerContainer').removeClass('hidden');
    $('#markers').removeClass('hidden');
};
function hideDraggableLamppost() {
    $('#markerContainer').addClass('hidden');
    $('#markers').addClass('hidden');
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
    //console.log("updating Maps");
    if (currentFormMarker) {
        currentFormMarker.setMap(null);
        google.maps.event.clearListeners(currentFormMarker, 'drag');
        currentFormMarker = null;
    }
    updateStreetView(lat, lng, heading, pitch);
    updateFormMap(lat, lng, zoom, isNew);
};
function updateStreetView(lat, lng, heading, pitch) {
    //console.log("updating Street View. lat" + lat + "; lng:" + lng + "; lng:" + lat + "; heading:" + heading + "; pitch:" + pitch);
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
    //console.log("updating Form Map");
    moveMapToLocation(formMap.map, lat, lng);
    formMap.map.setZoom(zoom);
    if (!isNew) {
        if (!currentFormMarker) {
            var pos = new google.maps.LatLng(lat, lng);
            createDraggedMarker(pos, farolaMarker, true); // true is for not draggable marker
        } else {
            moveMarkerToLocation(currentFormMarker, lat, lng);
        }
        
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
    updateForm(data)
    if (data.latitude && data.longitude) {
        if (data.streetViewPov) {
            if (!data.streetViewPov.heading) {
                heading = 0;
            } else {
                heading = parseFloat(data.streetViewPov.heading);
            }
            if (!data.streetViewPov.pitch) {
                pitch = 0;
            } else {
                pitch = parseFloat(data.streetViewPov.pitch);
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
                    "value": "high",
                    "range": [
                        "low",
                        "medium",
                        "high"
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
        if (key == "latitude" || key == "longitude" || key == "id" || key == "pollution" || key == "light") {
        
        } else {
            if (key == "streetViewPov") {
                currentStreetViewData = {
                    'heading': data[key].heading,
                    'pitch': data[key].pitch
                }
            } else {
                var imageOptions = {};
                data[key].range.map(function(option) {
                    imageOptions[option] = optionImageMapping[key][option];
                });
                newRow({
                    title: key,
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
                    'href="#" class="list-group-item"><h4 class="list-group-item-heading">'+tradSpanish[data.title]+'</h4>'+
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
    $(el).addClass('active');
    currentRowSelected = $(el);
};

/* StreetView Methods*/
function loadStreetView(latitude, lng, heading, pitch) {
    //console.log("loading Street View");
    initStreetMap(latitude, lng, heading, pitch);
};

function initStreetMap(lat, lng, heading, pitch) {
    /* Add StreetMap header event */
    $("#streetheader").on("click", toogleStreetContainer);
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
    // TODO make global for clean and repaint in update street map
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
        enableCloseButton: false,
        clickToGo: false,
        scrollwheel: false,
        disableDoubleClickZoom: true
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
    if (!currentFormMarker) {
        console.log("No position defined for the new lamppost. drag the POI into the map");
        if (!isNewLamppost) {
            console.log("ERROR. Lamppost without ID???");
        }
        return;
    }
    var formInfo = {
        //'timestamp': new Date
    };
    for (var key in currentLampInfo) {
        if (key == "latitude") {
            formInfo['latitude'] = currentFormMarker.getPosition().lat();
            continue;
        }
        if (key == "longitude") {
            formInfo['longitude'] = currentFormMarker.getPosition().lng();
            continue;
        }
        if (key == "streetViewPov") {
            formInfo[key] = currentStreetViewData;
            continue;
        }
        if (key == 'light') {
            continue;
        }
        if (key == "id") {
            if (currentLampInfo[key] !== null && isNewLamppost) {
                console.log("error new Lamppost with id???: " + currentLampInfo[key]);
                return;
            }
            if (currentLampInfo[key] == null && !isNewLamppost) {
                console.log("Lamppost without id???");
                return;
            }
            continue;
        }
        formInfo[key] = currentOptionSelected[currentLampInfo[key].paramId];
    }
    console.log(JSON.stringify(formInfo));
    if (isNewLamppost) {
        regNewLamp(formInfo['latitude'], formInfo['longitude'], function(err, data) {
            if (err) return;
            currentlamppostID = data.id;
            annotate(currentlamppostID, formInfo, formCallback);
        });
    } else {
        annotate(currentlamppostID, formInfo, formCallback);
    }
    function regNewLamp(lat, lng, cbk) {
        $.ajax
        ({
            type: "POST",
            url: FarolApp_API_URL + 'lampposts/',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({"latitude": lat, "longitude": lng}),
            success: function (data) {
                //console.log("success");
                cbk(null, data);
            },
            error: function (e) {
                console.log("error");
                cbk(e)
            }
        });
    };
    function annotate(id, data, cbk) {
        $.ajax
        ({
            type: "POST",
            url: FarolApp_API_URL + '/lampposts/' + currentlamppostID + '/annotations',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(formInfo),
            success: function () {
                //console.log("success");
                cbk();
            },
            error: function (e) {
                console.log("error");
                cbk(e);
            }
        });
    };
};

/* Image Mapping */
var optionImageMapping = {
    "wattage": {
        "low": "resources/img/optionForm/wattage_low.png",
        "medium": "resources/img/optionForm/wattage_medium.png",
        "high": "resources/img/optionForm/wattage_hight.png",
    },
    "lamp": {
        "VSAP": "resources/img/optionForm/lamps/lamps.001.png",
        "VMCC": "resources/img/optionForm/lamps/lamps.002.png",
        "VMAP": "resources/img/optionForm/lamps/lamps.003.png",
        "PAR": "resources/img/optionForm/lamps/lamps.004.png",
        "MC": "resources/img/optionForm/lamps/lamps.005.png",
        "LED": "resources/img/optionForm/lamps/lamps.006.png",
        "I": "resources/img/optionForm/lamps/lamps.007.png",
        "H": "resources/img/optionForm/lamps/lamps.008.png",
        "VSBP": "resources/img/optionForm/lamps/lamps.009.png",
        "FCBC": "resources/img/optionForm/lamps/lamps.010.png",
        "HM": "resources/img/optionForm/lamps/lamps.011.png",
        "F": "resources/img/optionForm/lamps/lamps.012.png",
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

function createDraggedMarker(d, e, notDrag) {
    if (currentFormMarker) {
        return;
    }
    var dragVal = true;
    if (notDrag) {
        dragVal = false;
    }
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
        draggable: dragVal,
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
        //iw.setContent(c);
        //iw.open(map, this)
    });
    g.event.addListener(h, "dragstart", function() {
        if (actual == h) //iw.close();
        z_index += 1;
        h.setZIndex(highestOrder())
    })
    currentFormMarker = h;
    addFormInfoWindow(currentFormMarker, currentLampInfo, formMap);
    // Updating panorama view with the new marker
    if (panorama) {
        var heading = 0;
        var pitch = 0;
        if (currentLampInfo.streetViewPov != null && currentLampInfo.streetViewPov.heading != null && currentLampInfo.streetViewPov.pitch != null) {
            heading = parseFloat(currentLampInfo.streetViewPov.heading);
            pitch = parseFloat(currentLampInfo.streetViewPov.pitch);
        }
        updateStreetView(currentFormMarker.getPosition().lat(), currentFormMarker.getPosition().lng(), heading, pitch);
    }
    google.maps.event.addListener(currentFormMarker,'dragend',function(event) {
        //console.log('Drag end');
        updateStreetView(this.position.lat(), this.position.lng(), 0, 0);
    });
}
function addFormInfoWindow(marker,geo,map){
    var tipoDeBombilla = translateLampType['default'];
    var pollution = translatePollution['default'];
    var radius = translateRadius['default'];
    if(geo['lamp'].value!=null){
        tipoDeBombilla = translateLampType[geo['lamp'].value.toLowerCase()];
    }
    if(geo['status'].value!=null){
        status = translateStatus[geo['status'].value];
    }
    var contentString = '<div style="color:black;"<span>Latitud: '+geo['latitude']+'</span><br>'+
    '<span>Longitud: '+geo['longitude']+'</span><br>'+
    '<span>Id: '+geo['id']+'</span><br>'+
    '<span>Tipo de bombilla: '+tipoDeBombilla+'</span><br>';
    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });
    marker.addListener('click', function(ev){
        if(marker.getCenter){
            infowindow.setPosition(marker.getCenter());
        }else if(marker.getPosition){
            infowindow.setPosition(marker.getPosition());
        }
        infowindow.open(map, marker);
    });
};
var translateStatus={
    "blown": "Fundida",
    "damaged":"Dañada",
    "works":"Funcionando",
    "default":"&lt;Desconocido&gt;"
};
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
                } else {
                    var h = obj.style.backgroundImage.slice(4, -1).replace(/"/g, "");
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

var mapStyles=[{"elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"lightness":-56}]},{"elementType":"labels.text","stylers":[{"visibility":"off"}]},{"elementType":"geometry.fill","stylers":[{"invert_lightness":true},{"lightness":-49}]},{featureType:"poi",stylers:[{visibility:"off"}]},{featureType:"transit",stylers:[{visibility:"off"}]}];

function buildMap(lat, lng) {
    /* Add map header event */
    $("#mapheader").on("click", toogleMapContainer);
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
        zoom: currentlamppostZoom,
        streetViewControl: false,
        panControl: false,
        zoomControlOptions: {
            style: g.ZoomControlStyle.SMALL
        },
        //mapTypeId: google.maps.MapTypeId.HYBRID
        styles: mapStyles,
    };
    map = new g.Map(document.getElementById("formMap"), a);
    //iw = new g.InfoWindow();
    /*g.event.addListener(map, "click", function() {
        if (iw) iw.close()
    });*/
    drag_area = document.getElementById("markers");
    var b = drag_area.getElementsByTagName("div");
    for (var i = 0; i < b.length; i++) {
        var c = b[i];
        c.onmousedown = c.ontouchstart = initDrag;
    }
    dummy = new DummyOView();
    formMap = dummy;

    var pos = new google.maps.LatLng(lat, lng);
    if (!isNewLamppost) {
        createDraggedMarker(pos, farolaMarker, true); // true is for not draggable marker
    }
    
}

/* Traducción */
var tradSpanish = {
    "wattage": "Potencia",
    "lamp": "Bombilla",
    "height": "Altura",
    "color": "Color",
    "covered": "Protección",
    "status": "Estado"
};