
var serverURL = 'http://infra3.dia.fi.upm.es/api/';

var lastWarning = '';

var isLoading=false;

var drewGeometries={};
var drewGeometriesPending={};
var geometriesLimitOnZoomHigh=3000;
var geometriesLimitOnZoomLow=300;
var geometriesChangeOnZoom=19;
var geometriesClusterZoom=16;
var changeFillColors={
	"red":"#D80027",
	"orange":"#E38F22",
	"green":"#91DC5A",
	"blue":"#3289C7",
	"white":"#FFFFFF",
	"yellow":"#FFDA44",
	"default":"#FFFFFF"
};
var changeStrokeColors={
	"red":"#D80027",
	"orange":"#E38F22",
	"green":"#91DC5A",
	"blue":"#3289C7",
	"white":"#FFFFFF",
	"yellow":"#FFDA44",
	"default":"#FFFFFF"
};
var getImageColors={
	"red":"resources/img/markers/red.png",
	"orange":"resources/img/markers/orange.png",
	"green":"resources/img/markers/green.png",
	"blue":"resources/img/markers/blue.png",
	"white":"resources/img/markers/white.png",
	"yellow":"resources/img/markers/yellow.png",
	"default":"resources/img/markers/white.png"
};
var changeWeight={
	"high":20,
	"medium":10,
	"low":5
};
var changeRadius={
	"high":3.5,
	"medium":2.5,
	"low":1.5,
	"default":1.5
}
var translatePollution={
	"high":"Alto",
	"medium":"Medio",
	"low":"Bajo",
	"default":"&lt;Desconocido&gt;"
};
var translateLampColors={
	"red":"Rojo",
	"orange":"Naranja",
	"green":"Verde",
	"blue":"Azul",
	"white":"Blanco",
	"yellow":"Amarillo",
	"default":"&lt;Desconocido&gt;"
};
var translateRadius={
	"high":changeRadius["high"]+" metros",
	"medium":changeRadius["medium"]+" metros",
	"low":changeRadius["low"]+" metros",
	"default":"&lt;Desconocido&gt;"
}

var heatmapLayer = null;
var markerCluster = null;

var mapStyles=[{"elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"lightness":-56}]},{"elementType":"labels.text","stylers":[{"visibility":"off"}]},{"elementType":"geometry.fill","stylers":[{"invert_lightness":true},{"lightness":-49}]},{featureType:"poi",stylers:[{visibility:"off"}]},{featureType:"transit",stylers:[{visibility:"off"}]}];
var lamppostMap;
var pollutionMap;
var refreshTimeout=null;
var refreshLoadingTimeout=null;
var poolingTimeout=null;
var firtsStart=true;
var lastZoom = 15;

function showLoading(){
	/*var imageHtml = "<img src='resources/img/loading.gif'></img>";//Necesitamos generar imagen de un loading (Esto seria el tag <img src="URL"></img>)
	//var imageHtml = "";
	swal({   title: "Cargando", text:imageHtml,showConfirmButton:false, allowEscapeKey:false,html:true,   type: null,   showCancelButton: false,   closeOnConfirm: false,   showLoaderOnConfirm: false, });*/
	jQuery('#mapLoading ').css('display','');
}

function closeLoading(){
	/*swal.close();*/
	jQuery('#mapLoading ').css('display','none');
}

function showAboutUs(){
	var html = "<p>Web design/javascript by:</p><br>";
    html += "<p style='margin-left:6px;'>Francisco Siles</p><br>";
    html += "<p style='margin-left:6px;'>Carlos Blanco</p><br>";
    html += "<br>";
    html += "<p>Developed by:</p><br>";
    html += "<p style='margin-left:6px;'>Carlos Badenes</p><br>";
    html += "<p style='margin-left:6px;'>Fernando Serena</p><br>";
    html += "<p style='margin-left:6px;'>Esteban Gonz&iacutelez</p><br>";
    html += "<p style='margin-left:6px;'>Nandana</p><br>";
    html += "<br>";
    html += "<p>Ontology Engineering Group</p><br>";
    html += "<p style='margin-left:6px;'>oeg-upm.net</p><br>";
    swal({   title: "Acerca De", text:html,showConfirmButton:true, allowEscapeKey:false,html:true,   type: null,   showCancelButton: false,   closeOnConfirm: false,   showLoaderOnConfirm: false, });
}

/*Funcion que registra los eventos del menu superior y del menu lateral izquierdo*/
function bindEvents(){
	//Menu Superior
	jQuery(".navDropDownContainer .navDropDownClick").bind("tap click",function(event){
		if(jQuery(this).closest(".navDropDownContainer").hasClass("notActivateResponsive")){
			jQuery(this).closest(".navDropDownContainer").removeClass("notActivateResponsive");
			jQuery(this).closest(".navDropDownContainer").addClass("activateResponsive");
		}else if(jQuery(this).closest(".navDropDownContainer").hasClass("activateResponsive")){
			jQuery(this).closest(".navDropDownContainer").removeClass("activateResponsive");
			jQuery(this).closest(".navDropDownContainer").addClass("notActivateResponsive");
		}else{
			jQuery(this).closest(".navDropDownContainer").addClass("notActivateResponsive");
		}
	});
	/* This code is for click out and touch out, if occurs them close the menu.
	 * jQuery("body").bind("click touchend",function(event){
		if(jQuery("nav").hasClass("activateResponsive") && !jQuery(".imgMenu").is(event.target) 
				&& !jQuery(".navDropDownContainer .navDropDownClick").is(jQuery(event.target).closest(".navDropDownClick").get(0))
				&& jQuery(".navDropDownItem").is(jQuery(event.target).closest(".navDropDownItem").get(0))){
			if(jQuery(".navDropDownItem").is(jQuery(event.target).closest(".navDropDownItem").get(0))
					&& event.type == "touchend"){
				jQuery(event.target).trigger("click");
			}
			jQuery("nav").removeClass("activateResponsive");
			jQuery("nav").addClass("notActivateResponsive");
		}
	});*/
	//Menu Superior
	jQuery("div.imgMenu").bind("tap click",function(event){
		if(jQuery("nav").hasClass("notActivateResponsive")){
			jQuery("nav").removeClass("notActivateResponsive");
			jQuery("nav").addClass("activateResponsive");
		}else if(jQuery("nav").hasClass("activateResponsive")){
			jQuery("nav").removeClass("activateResponsive");
			jQuery("nav").addClass("notActivateResponsive");
		}else{
			jQuery("nav").addClass("notActivateResponsive");
		}
	});
	//Button añadir farola
	jQuery("#addLamppost").bind("touchstart mousedown",function(event){
		jQuery("#addLamppost").addClass("effect");
	});
	jQuery("#addLamppost").bind("touchend mouseup",function(event){
		jQuery("#addLamppost").removeClass("effect");
		loadPostForm(null,lamppostMap.getCenter().lat(),lamppostMap.getCenter().lng(),lamppostMap.getZoom(),toggleFormContainer);
	});
	//Button warning
	jQuery("#warningLamppost").bind("touchstart mousedown",function(event){
		jQuery("#warningLamppost").addClass("effect");
	});
	jQuery("#warningLamppost").bind("touchend mouseup",function(event){
		jQuery("#warningLamppost").removeClass("effect");
		swal("Advertencia:",lastWarning,"warning");
	});
	//Form for lamppost
	jQuery("#specialForm").bind("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd",function(event){
		if(jQuery("#specialForm").hasClass('notDisplay')){
			jQuery("#specialForm").css("display","none");
		}
	});
	//Button warning and addLampost
	jQuery("nav > div.button").bind("touchstart mousedown",function(event){
		jQuery(this).addClass("effect");
	});
	jQuery("nav > div.button").bind("touchend mouseup",function(event){
		jQuery(this).removeClass("effect");
	});
	
}

function isArray(object){
	if(object === null){
		return false;
	}
	return object.constructor === [].constructor;
}

function isObject(object){
	if(object === null){
		return false;
	}
	return object.constructor === {}.constructor;
}

function isString(object){
	if(object === null){
		return false;
	}
	return object.constructor === "".constructor;
}

//Un POST sencillo
function ajaxPost(urlString,data,funcionDone,funcionError){
	jQuery.ajax({
		url: urlString,
	    type: "POST",
	    data : data,
	    contentType: 'application/x-www-form-urlencoded'
	}).done(funcionDone).error(funcionError);
}
//Un get sencillo
function ajaxGet(urlString,data,funcionDone,funcionError){
	if(data){
		urlString+='?';
		jQuery.each(data,function(key,val){
			urlString+=key+'='+val+'&';
		});
		urlString = urlString.substring(0,urlString.length-1);
	}
	urlString = encodeURI(urlString);
	jQuery.ajax({
		url: urlString,
	    type: "GET",
	    //contentType: 'application/x-www-form-urlencoded',
	}).done(funcionDone).error(funcionError);
}

function startWebPage(){
	if(window.mobileAndTabletcheck()){
		geometriesLimitOnZoomHigh=300;
		geometriesLimitOnZoomLow=50;
		geometriesChangeOnZoom=20;
	}
	lamppostMap = new google.maps.Map(document.getElementById('lamppostMapContainer'), {
		//center: {lat: 40.4171, lng: -3.7031},
		center: {lat:39.475121,lng:-6.371480},
		mapTypeControl: false,
		streetViewControl: false,
		styles: mapStyles,
		zoom: 17
		//zoom:6
	});
	lastZoom = lamppostMap.getZoom();
	pollutionMap = new google.maps.Map(document.getElementById('pollutionMapContainer'), {
		center: {lat: 40.4171, lng: -3.7031},
		mapTypeControl: false,
		streetViewControl: false,
		styles: mapStyles,
		zoom: 6
	});
	lamppostMap.addListener('bounds_changed', function() {
		if(jQuery('#specialForm').hasClass('notDisplay')){
		if(!firtsStart){
			jQuery("#warningLamppost").css("display","none");
			pollutionMap.setCenter(lamppostMap.getCenter());
			var newZoom = lamppostMap.getZoom();
			if(newZoom>=1){
				newZoom--;
			}
			pollutionMap.setZoom(newZoom);
			if(lamppostMap.getZoom()>=19){
				jQuery('#addLamppost').css('display','')
			}else{
				jQuery('#addLamppost').css('display','none')
			}
			if(refreshTimeout){
    			window.clearTimeout(refreshTimeout);
    			refreshTimeout = null;
    		}
			if(refreshLoadingTimeout){
				window.clearTimeout(refreshLoadingTimeout);
				refreshLoadingTimeout=null;
			}
			if(lamppostMap.getZoom()>geometriesClusterZoom 
					|| (lastZoom>geometriesClusterZoom && lamppostMap.getZoom()<=geometriesClusterZoom)){
				refreshLoadingTimeout = window.setTimeout(function(){
					showLoading();
					isLoading=true;
				},1450);
		    	refreshTimeout = window.setTimeout(function() {
		    		if(refreshTimeout){
		    			window.clearTimeout(refreshTimeout);
		    			refreshTimeout = null;
		    		}
		    		if(poolingTimeout){
		    			window.clearTimeout(poolingTimeout);
		    			poolingTimeout = null;
		    		}
		    		getAndDrawLampposts();
		    	}, 1500);
			}
		}else{
			pollutionMap.setCenter(lamppostMap.getCenter());
			var newZoom = lamppostMap.getZoom();
			if(newZoom>=1){
				newZoom--;
			}
			pollutionMap.setZoom(newZoom);
			showLoading();
			isLoading=true;
			getAndDrawLampposts();
			firtsStart=false;
		}
		}
	  });
	//getAndDrawLampposts();
}

function existsTheIdInArray(id,array){
	var toReturn = false;
	jQuery.each(array,function(i,lamppost){
		if(lamppost['id'] == id){
			toReturn = true;
			return;
		}
	});
	return toReturn;
}

function getSizeOfObject(object){
	var size=0;
	jQuery.each(object,function(key,value){
		size++;
	});
	return size;
}

function removeNotVisibleGeometries(all,data){
	if(!all && data){
		if(drewGeometries){
			var toRemove = [];
			jQuery.each(drewGeometries,function(id,marker){
				if(!existsTheIdInArray(id,data['lampposts'])){
					marker.setMap(null);
					toRemove.push(id);
				}
			});
			var count = 0;
			jQuery.each(toRemove,function(i,id){
				delete drewGeometries[id];
				count ++;
			});
		}
	}else{
		jQuery.each(drewGeometries,function(id,marker){
			marker.setMap(null);
		});
		drewGeometries = {};
	}
}

function getAndDrawLampposts(){
	var lat1=lamppostMap.getBounds().getSouthWest().lat();
	var long1=lamppostMap.getBounds().getSouthWest().lng();
	var lat2=lamppostMap.getBounds().getNorthEast().lat();
	var long2=lamppostMap.getBounds().getNorthEast().lng();
	if(lamppostMap.getZoom()<=geometriesClusterZoom){
		lat1=-90;
		long1=-180;
		lat2=90;
		long2=180;
	}
	ajaxGet(serverURL+"lampposts",{"lat1":lat1,"long1":long1,"lat2":lat2,"long2":long2},
			function(data){
				console.log(data['lampposts'].length);
				if(lamppostMap.getZoom()<=geometriesClusterZoom){
					removeNotVisibleGeometries(true,data);
				}else if(lamppostMap.getZoom()<geometriesChangeOnZoom && lastZoom<geometriesChangeOnZoom){
					removeNotVisibleGeometries(false,data);
				}else if(lamppostMap.getZoom()>=geometriesChangeOnZoom &&  lastZoom>=geometriesChangeOnZoom){
					removeNotVisibleGeometries(false,data);
				}else{
					removeNotVisibleGeometries(true,data);
				}
				if(markerCluster){
			    	markerCluster.clearMarkers();
			    	markerCluster = null;
			    }
				lastZoom = lamppostMap.getZoom();
				if(lamppostMap.getZoom()>geometriesClusterZoom){
					drawGeometries(data['lampposts']);
				}else{
					drawClusterGeometries(data['lampposts']);
				}
				poolingNewData(true);
	    		if(isLoading){
	    			closeLoading();
	    		}
	    		isLoading=false
			},
			function(error){
				console.log("ERROR");
				console.log(error);
				removeNotVisibleGeometries(true);
				drawGeometries(randomGeometries.randomGeometries(lamppostMap.getBounds()));
				poolingNewData(true);
	    		if(isLoading){
	    			closeLoading();
	    		}
	    		isLoading=false
			});
	if(drewGeometriesPending){
		jQuery.each(drewGeometriesPending,function(id,marker){
			marker.setMap(null);
		});
	}
	drewGeometriesPending = {};
	if(lamppostMap.getZoom()>=geometriesChangeOnZoom){
		ajaxGet(serverURL+"lampposts",{"lat1":lat1,"long1":long1,"lat2":lat2,"long2":long2,"verified":"FALSE"},
				function(data){
					drawGeometriesPending(data['lampposts']);
				},
				function(error){
					console.log("ERROR");
					console.log(error);
					drawGeometriesPending(randomGeometries.randomConsensusGeometries(lamppostMap.getBounds()));
				});
	}
}

function poolingNewData(start){
	/*poolingTimeout = window.setTimeout(poolingNewData,2000);
	if(!start){
		var lat1=lamppostMap.getBounds().getSouthWest().lat();
		var long1=lamppostMap.getBounds().getSouthWest().lng();
		var lat2=lamppostMap.getBounds().getNorthEast().lat();
		var long2=lamppostMap.getBounds().getNorthEast().lng();
		ajaxGet(serverURL+"lampposts",{"lat1":lat1,"long1":long1,"lat2":lat2,"long2":long2,"time":"2s"},
			function(data){
			changeData(data['lampposts']);
		},
		function(error){
			changeData(randomGeometries.modifyRandomGeometry(drewGeometries));
			//console.log(error);
		});
	}*/
}

function changeData(data){
	jQuery.each(data,function(i,geo){
		if(drewGeometries[geo["id"]]){
			drewGeometries[geo["id"]].setMap(null);
			delete drewGeometries[geo["id"]];
		}
	});
	drawGeometries(data,true);
}

function showLamppostMap(){
	/*jQuery("#lamppostMapContainer").removeClass("notDisplay");
	jQuery("#pollutionMapContainer").addClass("notDisplay");
	jQuery("#specialForm").addClass("notDisplay");*/
	jQuery("#lamppostMapContainer").removeClass("animationOut");
	jQuery("#lamppostMapContainer").addClass("animationEnter");
	jQuery("#pollutionMapContainer").removeClass("animationEnter");
	jQuery("#pollutionMapContainer").addClass("animationOut");
	jQuery("#specialForm").removeClass("display");
	jQuery("#specialForm").addClass("notDisplay");
}

function showPollutionMap(){
	/*jQuery("#pollutionMapContainer").removeClass("notDisplay");
	jQuery("#lamppostMapContainer").addClass("notDisplay");
	jQuery("#specialForm").addClass("notDisplay");*/
	if(jQuery("#pollutionMapContainer").hasClass("notAnimationOnLoad")){
		jQuery("#pollutionMapContainer").removeClass("notAnimationOnLoad");
	}
	if(jQuery("#lamppostMapContainer").hasClass("notAnimationOnLoad")){
		jQuery("#lamppostMapContainer").removeClass("notAnimationOnLoad");
	}
	jQuery("#pollutionMapContainer").removeClass("animationOut");
	jQuery("#pollutionMapContainer").addClass("animationEnter");
	jQuery("#lamppostMapContainer").removeClass("animationEnter");
	jQuery("#lamppostMapContainer").addClass("animationOut");
	jQuery("#specialForm").removeClass("display");
	jQuery("#specialForm").addClass("notDisplay");
}
function toggleFormContainer(){
	jQuery("#specialForm").toggleClass("notDisplay");
	jQuery("#specialForm").toggleClass("display");
	jQuery("#specialForm").css("display","");
}



function drawGeometry(geo){
	var strokeColorVar = changeStrokeColors["default"];
	var fillColorVar =  changeFillColors["default"];
	if(geo["color"]!=null){
		strokeColorVar = changeStrokeColors[geo["color"]];
		fillColorVar =  changeFillColors[geo["color"]];
	}
	var radius =  changeRadius["default"];
	if(geo["radius"]!=null){
		radius =  changeRadius[geo["radius"]];
	}
	if(lamppostMap.getZoom()>=geometriesChangeOnZoom){
		var farolCircle = new google.maps.Circle({
	      strokeColor: strokeColorVar,
	      strokeOpacity: 0.55,
	      strokeWeight: 2,
	      fillColor:fillColorVar,
	      fillOpacity: 0.35,
	      map: lamppostMap,
	      center: {lat: geo["latitude"], lng: geo["longitude"]},
	      radius: radius 
	    });
		addInfoWindow(farolCircle, geo,lamppostMap);
		drewGeometries[geo["id"]] = farolCircle;
	}else{
		var url = getImageColors['default']; 
		if(geo["color"]!=null && getImageColors[geo["color"]]){
			url = getImageColors[geo["color"]];
		}
		var image = {
			    url: url,
			    // This marker is 10 pixels wide by 10 pixels high.
			    scaledSize: new google.maps.Size(10, 10),
			    // The origin for this image is (0, 0).
			    origin: new google.maps.Point(0, 0),
			    // The anchor for this image is the base of the flagpole at (0, 32).
			    anchor: new google.maps.Point(5, 5)
			  };
		var marker = new google.maps.Marker({
			  position: {lat: geo["latitude"], lng: geo["longitude"]},
			  map: lamppostMap,
			  icon: image,
			  opacity:0.35
		});
		addInfoWindow(marker, geo,lamppostMap);
		drewGeometries[geo["id"]] = marker;
	}
}

function drawGeometries(geometries,onlyLamppostUpdate){
	var heatMapData = [];
	var overLimitHigh = false;
	var overLimitLow = false;
	var count=0;
	jQuery.each(drewGeometries,function(id,lamppost){
		count++;
	});
	var timeNumber = 0;
	jQuery.each(geometries,function(i,geo){
		if(!onlyLamppostUpdate){
			if(geo['id'] && !drewGeometries[geo['id']]){
				if(lamppostMap.getZoom()>=geometriesChangeOnZoom){
					if(count<geometriesLimitOnZoomLow){
						window.setTimeout(function() {
							drawGeometry(geo);
						}, timeNumber);
						timeNumber++;
					}else{
						overLimitLow = true;
					}
				}else{
					if(count<geometriesLimitOnZoomHigh){
						window.setTimeout(function() {
							drawGeometry(geo);
						}, timeNumber);
						timeNumber++;
					}else{
						overLimitHigh = true;
					}
				}
				count++;
			}
		}else{
			window.setTimeout(function() {
				drawGeometry(geo);
			}, timeNumber);
			timeNumber++;
		}
		if(geo['pollution'] != null && !onlyLamppostUpdate){
				heatMapData.push({location: new google.maps.LatLng(geo["latitude"], geo["longitude"]), weight: changeWeight[geo["pollution"]]});
		}
	});
	if(heatmapLayer && !onlyLamppostUpdate){
		heatmapLayer.setMap(null);
	}
	if(!onlyLamppostUpdate){
		heatmapLayer = new google.maps.visualization.HeatmapLayer({
		  	data: heatMapData
			});
		heatmapLayer.setMap(pollutionMap);
	}
	if(overLimitHigh){		
		lastWarning = "El límite de:"+geometriesLimitOnZoomHigh+" farolas ha sido excedido. Se han quedado farolas sin dibujar.";
		jQuery("#warningLamppost img").attr("alt",lastWarning);
		jQuery("#warningLamppost").css("display","");
	}
	if(overLimitLow){
		lastWarning = "El límite de:"+geometriesLimitOnZoomLow+" farolas ha sido excedido. Se han quedado farolas sin dibujar.";
		jQuery("#warningLamppost img").attr("alt",lastWarning);
		jQuery("#warningLamppost").css("display","");
	}
}

function drawGeometriesPending(geometries){
	jQuery.each(geometries,function(i,geo){
		var url = 'resources/img/markers/questionMark.png'; 
		var image = {
				url: url,
				scaledSize: new google.maps.Size(32, 32),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(16, 0)
		  	};
		var marker = new google.maps.Marker({
			position: {lat: geo["latitude"], lng: geo["longitude"]},
			map: lamppostMap,
			icon: image,
			opacity:0.35
		});
		addInfoWindow(marker, geo,lamppostMap);
		drewGeometriesPending[geo["id"]] = marker;
	});
}

function drawClusterGeometries(geometries){
	var markers = [];
	jQuery.each(geometries,function(i,geo){
		var url = getImageColors['default']; 
		if(geo["color"]!=null && getImageColors[geo["color"]]){
			url = getImageColors[geo["color"]];
		}
		var image = {
		    url: url,
		    // This marker is 10 pixels wide by 10 pixels high.
		    scaledSize: new google.maps.Size(10, 10),
		    // The origin for this image is (0, 0).
		    origin: new google.maps.Point(0, 0),
		    // The anchor for this image is the base of the flagpole at (0, 32).
		    anchor: new google.maps.Point(5, 5)
		};
		var marker = new google.maps.Marker({
		  	position: {lat: geo["latitude"], lng: geo["longitude"]},
		  	map: null,
		  	icon: image,
		  	opacity:0.35
		});
		markers.push(marker);
	});
	var options = {imagePath: 'resources/img/cluster/cluster',maxZoom:geometriesClusterZoom};
	var newMarkerCluster = new MarkerClusterer(lamppostMap, markers, options);
	if(markerCluster){
    	markerCluster.clearMarkers();
    	markerCluster = null;
    }
	markerCluster = newMarkerCluster;
}

function addInfoWindow(marker,geo,map){
	var color = translateLampColors['default'];
	var pollution = translatePollution['default'];
	var radius = translateRadius['default'];
	if(geo['color']!=null){
		color = translateLampColors[geo['color']];
	}
	if(geo['pollution']!=null){
		pollution = translatePollution[geo['pollution']];
	}
	if(geo['radius']!=null){
		radius = translateRadius[geo['radius']];
	}
  var contentString = '<div style="color:black;"<span>Latitud: '+geo['latitude']+'</span><br>'+
'<span>Longitud: '+geo['longitude']+'</span><br>'+
'<span>Radio de luz: '+radius+'</span><br>'+
'<span>Color de bombilla: '+color+'</span><br>'+
'<span>Contaminación lumínica: '+pollution+'</span><br>'+
'<a style="color:blue;cursor:pointer" onclick="loadPostForm(\''+geo['id']+'\','+geo['latitude']+','+geo['longitude']+','+lamppostMap.getZoom()+',toggleFormContainer)">Anotar cambios</a>';

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
}

//Cuando termina la carga de la pagina se comprueba si es compatible
function loadWebPage(){
	if( window.jQuery && window.google) {
		//CHECK IS BROWSER IS GOOD
		/*boxsizing: true
		cookies: true
		cssanimations: true
		flexbox: true
		flexboxlegacy: true
		svg: true
		json: true
		xhrresponsetypejson: true*/
		if(Modernizr && Modernizr.boxsizing && Modernizr.cookies && Modernizr.flexbox 
				&& Modernizr.flexboxlegacy && Modernizr.svg
				&& Modernizr.json && Modernizr.xhrresponsetypejson){
			bindEvents();
			startWebPage();
		}else{
			swal({title: "Incompatible browser",   text:"Your browser is not currently supported by Farolapp4All. By pressing OK you accept that this site may not work properly. Sorry for that ;)"
			,   type: "error",closeOnConfirm: false,   closeOnCancel: false}
			,function(){
				bindEvents();
				startWebPage();
			});
		}		
	}else{
		setTimeout(loadWebPage,300);
	}
}
window.onload = function(){
	loadWebPage();
};
window.mobileAndTabletcheck = function() {
	 var check = false;
	 (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
	 return check;
};


